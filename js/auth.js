/* ─── js/auth.js ─────────────────────────────────────────────────────────── */
/* Handles admin authentication: email/password + WebAuthn biometric login    */

const _supabase = window._supabase;

document.addEventListener('DOMContentLoaded', () => {
  if (!_supabase) return;

  // ── DOM References ──────────────────────────────────────────────────────
  const authView     = document.getElementById('auth-view');
  const dashView     = document.getElementById('dashboard-view');
  const loginForm    = document.getElementById('login-form');
  const authError    = document.getElementById('auth-error');
  const btnLogout    = document.getElementById('btn-logout');

  // Password visibility toggle
  const btnTogglePw  = document.getElementById('btn-toggle-password');
  const passwordInp  = document.getElementById('password');
  const iconEyeOpen  = document.getElementById('icon-eye-open');
  const iconEyeClose = document.getElementById('icon-eye-closed');

  // Biometric UI elements (added in admin.html)
  const biometricSection    = document.getElementById('biometric-section');
  const btnBiometric        = document.getElementById('btn-biometric-login');
  const biometricEmail      = document.getElementById('biometric-email');
  const btnShowPassword     = document.getElementById('btn-show-password-form');
  const btnRemoveBiometric  = document.getElementById('btn-remove-biometric');
  const passwordSection     = document.getElementById('password-section');
  const enrollBanner        = document.getElementById('biometric-enroll-banner');
  const btnEnrollNow        = document.getElementById('btn-enroll-biometric');
  const btnEnrollDismiss    = document.getElementById('btn-enroll-dismiss');

  // ── Password toggle ──────────────────────────────────────────────────────
  if (btnTogglePw && passwordInp) {
    btnTogglePw.addEventListener('click', () => {
      const show = passwordInp.type === 'password';
      passwordInp.type        = show ? 'text' : 'password';
      iconEyeOpen.style.display  = show ? 'none' : 'block';
      iconEyeClose.style.display = show ? 'block' : 'none';
    });
  }

  // ── 1. Initial session check ─────────────────────────────────────────────
  _supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      showDashboard();
    } else {
      initLoginScreen();
    }
  });

  // ── 2. Auth state listener ────────────────────────────────────────────────
  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      showDashboard();
    } else if (event === 'SIGNED_OUT') {
      initLoginScreen();
    }
  });

  // ── 3. Login screen initialisation ───────────────────────────────────────
  async function initLoginScreen() {
    showAuthView();

    const enrolled = window.WebAuthnClient?.getEnrolledCredential();
    const biometricSupported = await window.WebAuthnClient?.isBiometricAvailable();

    if (enrolled && biometricSupported && biometricSection) {
      // Show biometric-first screen
      if (biometricEmail) biometricEmail.textContent = enrolled.email;
      biometricSection.style.display  = 'flex';
      if (passwordSection) passwordSection.style.display = 'none';
    } else {
      // Show standard email/password form
      if (biometricSection) biometricSection.style.display = 'none';
      if (passwordSection) passwordSection.style.display = 'block';
    }
  }

  // ── 4. Biometric login button ─────────────────────────────────────────────
  if (btnBiometric) {
    btnBiometric.addEventListener('click', handleBiometricLogin);
  }

  async function handleBiometricLogin() {
    const enrolled = window.WebAuthnClient?.getEnrolledCredential();
    if (!enrolled) return;

    setBiometricState('loading');

    try {
      // 4a. Get authentication challenge from server
      const optRes = await fetch('/api/webauthn/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: enrolled.email }),
      });
      const options = await optRes.json();

      if (!options.challenge) {
        throw new Error('No challenge received from server.');
      }

      // 4b. Prompt fingerprint scanner
      const assertion = await window.WebAuthnClient.startAuthentication(options);

      // 4c. Verify on server — get back a magic link token
      const verRes = await fetch('/api/webauthn/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: enrolled.email, response: assertion }),
      });
      const verData = await verRes.json();

      if (!verRes.ok || !verData.verified) {
        throw new Error(verData.error || 'Authentication failed.');
      }

      // 4d. Exchange token for a real Supabase session
      const { data, error: otpErr } = await _supabase.auth.verifyOtp({
        token_hash: verData.token_hash,
        type: 'magiclink',
      });

      if (otpErr) throw otpErr;

      // Session established — onAuthStateChange will trigger showDashboard()
      setBiometricState('success');
    } catch (err) {
      setBiometricState('error');

      // User cancelled? (NotAllowedError) — don't show error, just reset
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setTimeout(() => setBiometricState('idle'), 800);
        return;
      }

      showAuthError(err.message || 'Biometric authentication failed. Please use your password.');
      // Graceful fallback — show password form after a moment
      setTimeout(() => {
        if (biometricSection) biometricSection.style.display = 'none';
        if (passwordSection) passwordSection.style.display = 'block';
      }, 1200);
    }
  }

  function setBiometricState(state) {
    if (!btnBiometric) return;
    const icon = btnBiometric.querySelector('.biometric-icon');
    const label = btnBiometric.querySelector('.biometric-label');
    btnBiometric.disabled = state !== 'idle';
    btnBiometric.setAttribute('data-state', state);
    if (icon && label) {
      const states = {
        idle:    { icon: '👆', label: 'Sign in with Fingerprint' },
        loading: { icon: '⏳', label: 'Waiting for fingerprint…' },
        success: { icon: '✅', label: 'Authenticated!' },
        error:   { icon: '❌', label: 'Try again or use password' },
      };
      icon.textContent  = states[state]?.icon  || '👆';
      label.textContent = states[state]?.label || 'Sign in with Fingerprint';
    }
  }

  // ── 5. "Use email/password instead" toggle ────────────────────────────────
  if (btnShowPassword) {
    btnShowPassword.addEventListener('click', () => {
      if (biometricSection) biometricSection.style.display = 'none';
      if (passwordSection) passwordSection.style.display = 'block';
    });
  }

  // ── 6. "Remove biometric" link ────────────────────────────────────────────
  if (btnRemoveBiometric) {
    btnRemoveBiometric.addEventListener('click', async () => {
      if (!confirm('Remove fingerprint login from this device? You can re-enable it after logging in.')) return;
      window.WebAuthnClient?.clearEnrolledCredential();
      if (biometricSection) biometricSection.style.display = 'none';
      if (passwordSection) passwordSection.style.display = 'block';
      toast.info('Fingerprint login removed from this device.');
    });
  }

  const biometricAuthError = document.getElementById('biometric-auth-error');

  // ── 7. Email/password login form ──────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    hideAuthError();

    const loginPromise = (async () => {
      const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showAuthError(error.message);
        throw error;
      }
      return data;
    })();

    toast.promise(loginPromise, {
      loading: 'Authenticating credentials…',
      success: 'Welcome back!',
      error: (err) => `Authentication failed: ${err.message}`,
    });
  });

  // ── 8. Logout ─────────────────────────────────────────────────────────────
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await _supabase.auth.signOut();
    });
  }

  // ── 9. Post-login biometric enrollment banner ─────────────────────────────
  async function maybeShowEnrollBanner() {
    if (!enrollBanner) return;

    // Already dismissed or enrolled on this device?
    const alreadyEnrolled  = !!window.WebAuthnClient?.getEnrolledCredential();
    const dismissed        = sessionStorage.getItem('biometric_banner_dismissed');
    const biometricSupported = await window.WebAuthnClient?.isBiometricAvailable();

    if (alreadyEnrolled || dismissed || !biometricSupported) return;

    // Slight delay so the dashboard has time to render first
    setTimeout(() => {
      enrollBanner.classList.add('visible');
    }, 1200);
  }

  if (btnEnrollNow) {
    btnEnrollNow.addEventListener('click', async () => {
      enrollBanner.classList.remove('visible');
      await handleBiometricEnrollment();
    });
  }

  if (btnEnrollDismiss) {
    btnEnrollDismiss.addEventListener('click', () => {
      sessionStorage.setItem('biometric_banner_dismissed', '1');
      enrollBanner.classList.remove('visible');
    });
  }

  // ── 10. Biometric enrollment (after password login) ───────────────────────
  async function handleBiometricEnrollment() {
    try {
      const { data: { session } } = await _supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated.');

      toast.loading('Preparing fingerprint enrollment…');

      // 10a. Get registration options from server (JWT required)
      const optRes = await fetch('/api/webauthn/register-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!optRes.ok) throw new Error('Could not start enrollment. Please try again.');
      const options = await optRes.json();

      // 10b. Collect device name for labelling
      const deviceName = navigator.userAgent.includes('Android')
        ? ((navigator.userAgent.match(/\(([^;]+)/) || [])[1] || 'Android Device')
        : 'Unknown Device';

      // 10c. Trigger the fingerprint scanner
      const credential = await window.WebAuthnClient.startRegistration(options);

      // 10d. Verify and store on server
      const verRes = await fetch('/api/webauthn/register-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ response: credential, deviceName }),
      });
      const verData = await verRes.json();

      if (!verRes.ok || !verData.verified) {
        throw new Error(verData.error || 'Enrollment verification failed.');
      }

      // 10e. Save credential ID + email locally for next login
      window.WebAuthnClient.saveEnrolledCredential(session.user.email, verData.credentialId);

      toast.success('Fingerprint login enabled! Next time, just tap your finger. 🎉');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        toast.info('Fingerprint enrollment cancelled.');
        return;
      }
      toast.error(`Enrollment failed: ${err.message}`);
    }
  }

  // Expose enrollment handler so the settings panel can also call it
  window.handleBiometricEnrollment = handleBiometricEnrollment;

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showDashboard() {
    const alreadyVisible = dashView.style.display === 'grid';
    authView.style.display = 'none';
    dashView.style.display = 'grid';

    if (!alreadyVisible) {
      maybeShowEnrollBanner();
      if (typeof window.hydrateActiveTab === 'function') {
        window.hydrateActiveTab();
      } else if (typeof window.hydrateDashboardAndAnalytics === 'function') {
        window.hydrateDashboardAndAnalytics();
      }
    }
  }

  function showAuthView() {
    authView.style.display = 'flex';
    dashView.style.display = 'none';
  }

  function showAuthError(msg, isBiometric = false) {
    const target = isBiometric ? biometricAuthError : authError;
    if (target) {
      target.textContent = msg || 'Authentication failed.';
      target.style.display = 'block';
    }
  }

  function hideAuthError() {
    if (authError) authError.style.display = 'none';
    if (biometricAuthError) biometricAuthError.style.display = 'none';
  }
});
