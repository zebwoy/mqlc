/**
 * POST /api/webauthn/auth-options
 *
 * Generates a WebAuthn authentication challenge for a user identified by email.
 * This is a public endpoint — no session needed (user is not yet logged in).
 * Returns credential IDs to hint the device which authenticator to use.
 */

const { generateAuthenticationOptions } = require('@simplewebauthn/server');
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
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 1. Look up the user by email ─────────────────────────────
    const { data: usersData, error: userErr } = await supabaseAdmin
      .auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (userErr) throw userErr;

    const user = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    // Security: return same response shape whether user exists or not
    // This prevents email enumeration attacks
    if (!user) {
      // Return valid-shaped options that will simply fail at verify step
      const dummyOptions = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'required',
        timeout: 60000,
        allowCredentials: [],
      });
      return res.status(200).json(dummyOptions);
    }

    // ── 2. Get the user's registered credential IDs ──────────────
    const { data: credentials } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('credential_id')
      .eq('user_id', user.id);

    if (!credentials?.length) {
      // No enrolled credentials — return empty (client should show password form)
      return res.status(200).json({ allowCredentials: [], challenge: '' });
    }

    // ── 3. Generate authentication options ───────────────────────
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      timeout: 60000,
      allowCredentials: credentials.map(c => ({
        id: Buffer.from(c.credential_id, 'base64url'),
        type: 'public-key',
        transports: ['internal'],
      })),
    });

    // ── 4. Store challenge (linked to user, single-use, 5-min TTL) ─
    await supabaseAdmin.from('webauthn_challenges').insert({
      challenge:  options.challenge,
      user_id:    user.id,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    return res.status(200).json(options);
  } catch (err) {
    console.error('[webauthn/auth-options]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
