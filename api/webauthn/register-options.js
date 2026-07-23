/**
 * POST /api/webauthn/register-options
 *
 * Generates a WebAuthn registration challenge for the currently authenticated user.
 * Requires a valid Supabase JWT in the Authorization header.
 */

const { generateRegistrationOptions } = require('@simplewebauthn/server');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY   = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RP_ID               = process.env.WEBAUTHN_RP_ID   || 'mqlc.vercel.app';
const RP_NAME             = process.env.WEBAUTHN_RP_NAME || 'MQLC Admin Portal';
const EXPECTED_ORIGIN     = process.env.WEBAUTHN_ORIGIN  || 'https://mqlc.vercel.app';

module.exports = async (req, res) => {
  // ── CORS ───────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', EXPECTED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    // ── 1. Authenticate caller via Supabase JWT ─────────────────
    const jwt = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (!jwt) return res.status(401).json({ error: 'Missing Authorization token' });

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser(jwt);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid or expired session' });

    // ── 2. Get existing credentials (for excludeCredentials) ────
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: existingCreds } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('credential_id')
      .eq('user_id', user.id);

    // ── 3. Generate registration options ────────────────────────
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.email,
      // Prevent re-enrolling the same authenticator
      excludeCredentials: (existingCreds || []).map(c => ({
        id: Buffer.from(c.credential_id, 'base64url'),
        type: 'public-key',
        transports: ['internal'],
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Device sensor only (fingerprint / face)
        userVerification: 'required',        // Must pass biometric check
        residentKey: 'preferred',
      },
      attestation: 'none', // No certificate chain needed for our use case
      timeout: 60000,
    });

    // ── 4. Persist challenge (single-use, 5-min TTL) ───────────
    const { error: insertErr } = await supabaseAdmin
      .from('webauthn_challenges')
      .insert({
        challenge: options.challenge,
        user_id:   user.id,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    if (insertErr) throw new Error(`Challenge insert failed: ${insertErr.message}`);

    return res.status(200).json(options);
  } catch (err) {
    console.error('[webauthn/register-options]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
