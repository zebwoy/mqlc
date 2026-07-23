/**
 * POST /api/webauthn/auth-verify
 *
 * Verifies a WebAuthn authentication assertion (signed by the device's biometric).
 * On success: issues a Supabase session for the user and returns it to the client.
 *
 * Security properties:
 *  - One-time challenge (replay attack prevention)
 *  - Challenge expires in 5 minutes
 *  - signCount monotonically increases (cloned credential detection)
 *  - ECDSA/RSA signature verified against stored public key
 */

const { verifyAuthenticationResponse } = require('@simplewebauthn/server');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RP_ID            = process.env.WEBAUTHN_RP_ID  || 'mqlc.vercel.app';
const EXPECTED_ORIGIN  = process.env.WEBAUTHN_ORIGIN || 'https://mqlc.vercel.app';

module.exports = async (req, res) => {
  // ── CORS ───────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', EXPECTED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, response: assertionResponse } = req.body;
    if (!email || !assertionResponse) {
      return res.status(400).json({ error: 'Missing email or authentication response' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 1. Find the user by email ─────────────────────────────────
    const { data: usersData, error: userErr } = await supabaseAdmin
      .auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (userErr) throw userErr;

    const user = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Authentication failed' });

    // ── 2. Find the credential being used ────────────────────────
    const credentialIdFromResponse = assertionResponse.id; // base64url credential ID

    const { data: credRows } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('credential_id', credentialIdFromResponse);

    if (!credRows?.length) return res.status(401).json({ error: 'Credential not found' });
    const credential = credRows[0];

    // ── 3. Find valid challenge ───────────────────────────────────
    const { data: challengeRows } = await supabaseAdmin
      .from('webauthn_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1);

    if (!challengeRows?.length) {
      return res.status(400).json({ error: 'No valid challenge found. Please try again.' });
    }

    const challengeRow = challengeRows[0];

    // ── 4. Verify the authentication response ────────────────────
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response:          assertionResponse,
        expectedChallenge: challengeRow.challenge,
        expectedOrigin:    EXPECTED_ORIGIN,
        expectedRPID:      RP_ID,
        authenticator: {
          credentialID:        Buffer.from(credential.credential_id, 'base64url'),
          credentialPublicKey: Buffer.from(credential.public_key, 'base64'),
          counter:             credential.sign_count,
        },
        requireUserVerification: true,
      });
    } catch (verifyErr) {
      await supabaseAdmin.from('webauthn_challenges').update({ used: true }).eq('id', challengeRow.id);
      return res.status(401).json({ error: `Verification failed: ${verifyErr.message}` });
    }

    if (!verification.verified) {
      await supabaseAdmin.from('webauthn_challenges').update({ used: true }).eq('id', challengeRow.id);
      return res.status(401).json({ error: 'Authentication not verified.' });
    }

    // ── 5. Mark challenge consumed & update credential metadata ─
    const { authenticationInfo } = verification;
    await Promise.all([
      supabaseAdmin.from('webauthn_challenges').update({ used: true }).eq('id', challengeRow.id),
      supabaseAdmin.from('webauthn_credentials').update({
        sign_count:   authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      }).eq('id', credential.id),
    ]);

    // ── 6. Issue a Supabase session via magic link ───────────────
    // Generate a magic link token, then return the hashed token
    // so the client can call supabase.auth.verifyOtp() to get a real session.
    const { data: linkData, error: linkErr } = await supabaseAdmin
      .auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: {
          redirectTo: `${EXPECTED_ORIGIN}/admin.html`,
        },
      });

    if (linkErr || !linkData) throw new Error(`Session generation failed: ${linkErr?.message}`);

    // Return the token hash — never the full link (prevents URL leakage)
    return res.status(200).json({
      verified: true,
      email: user.email,
      // Client will call: supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })
      token_hash: linkData.properties?.hashed_token,
    });
  } catch (err) {
    console.error('[webauthn/auth-verify]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
