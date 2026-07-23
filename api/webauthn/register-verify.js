/**
 * POST /api/webauthn/register-verify
 *
 * Verifies a WebAuthn registration response and stores the credential (public key)
 * linked to the authenticated user's Supabase account.
 * Requires a valid Supabase JWT in the Authorization header.
 */

const { verifyRegistrationResponse } = require('@simplewebauthn/server');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RP_ID             = process.env.WEBAUTHN_RP_ID   || 'mqlc.vercel.app';
const EXPECTED_ORIGIN   = process.env.WEBAUTHN_ORIGIN  || 'https://mqlc.vercel.app';

module.exports = async (req, res) => {
  // ── CORS ───────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', EXPECTED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { response: credentialResponse, deviceName } = req.body;
    if (!credentialResponse) return res.status(400).json({ error: 'Missing registration response' });

    // ── 1. Authenticate caller via Supabase JWT ─────────────────
    const jwt = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (!jwt) return res.status(401).json({ error: 'Missing Authorization token' });

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser(jwt);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid or expired session' });

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 2. Retrieve and validate the stored challenge ───────────
    const { data: challengeRows, error: challengeErr } = await supabaseAdmin
      .from('webauthn_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1);

    if (challengeErr || !challengeRows?.length) {
      return res.status(400).json({ error: 'No valid challenge found. Please try again.' });
    }

    const challengeRow = challengeRows[0];

    // ── 3. Verify the registration response ─────────────────────
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: credentialResponse,
        expectedChallenge: challengeRow.challenge,
        expectedOrigin: EXPECTED_ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      });
    } catch (verifyErr) {
      // Mark challenge as used even on failure (prevent brute-force)
      await supabaseAdmin.from('webauthn_challenges').update({ used: true }).eq('id', challengeRow.id);
      return res.status(400).json({ error: `Verification failed: ${verifyErr.message}` });
    }

    if (!verification.verified) {
      await supabaseAdmin.from('webauthn_challenges').update({ used: true }).eq('id', challengeRow.id);
      return res.status(400).json({ error: 'Registration not verified by authenticator.' });
    }

    // ── 4. Mark challenge as consumed ───────────────────────────
    await supabaseAdmin.from('webauthn_challenges').update({ used: true }).eq('id', challengeRow.id);

    // ── 5. Store the credential ─────────────────────────────────
    const { registrationInfo } = verification;
    const credentialIdBase64 = Buffer.from(registrationInfo.credentialID).toString('base64url');
    const publicKeyBase64    = Buffer.from(registrationInfo.credentialPublicKey).toString('base64');

    const { error: insertErr } = await supabaseAdmin
      .from('webauthn_credentials')
      .upsert({
        user_id:       user.id,
        credential_id: credentialIdBase64,
        public_key:    publicKeyBase64,
        sign_count:    registrationInfo.counter,
        device_name:   deviceName || 'Unknown Device',
      }, { onConflict: 'credential_id' });

    if (insertErr) throw new Error(`Credential save failed: ${insertErr.message}`);

    return res.status(200).json({
      verified: true,
      credentialId: credentialIdBase64,
    });
  } catch (err) {
    console.error('[webauthn/register-verify]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
