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
  // App Lock UI elements
  const appLockView     = document.getElementById('app-lock-view');
  const appLockEmail    = document.getElementById('app-lock-email');
  const btnUnlockApp    = document.getElementById('btn-unlock-app');
  const btnLockUsePw    = document.getElementById('btn-lock-use-password');
  const appLockError    = document.getElementById('app-lock-error');

  // Settings Tab Biometric elements
  const btnSettingsEnroll = document.getElementById('btn-settings-enroll-biometric');
  const btnSettingsRemove = document.getElementById('btn-settings-remove-biometric');
  const settingsStatus    = document.getElementById('biometric-settings-status');

  function updateSettingsBiometricUI() {
    try {
      const el = document.getElementById('biometric-settings-status');
      if (!el) return;
      const enrolled = window.WebAuthnClient?.getEnrolledCredential();
      const appLockOn = window.WebAuthnClient?.isAppLockEnabled();

      if (enrolled || appLockOn) {
        el.innerHTML = `<span style="color: #2D6A4F;">🟢 Fingerprint App Lock Active</span> for <strong>${enrolled?.email || 'Admin'}</strong> on this device.`;
        const btnRem = document.getElementById('btn-settings-remove-biometric');
        const btnEnr = document.getElementById('btn-settings-enroll-biometric');
        if (btnRem) btnRem.style.display = 'inline-block';
        if (btnEnr) btnEnr.textContent = '🔄 Re-enroll Fingerprint';
      } else {
        el.innerHTML = `<span style="color: var(--admin-muted);">⚪ App Lock Inactive</span> on this device.`;
        const btnRem = document.getElementById('btn-settings-remove-biometric');
        const btnEnr = document.getElementById('btn-settings-enroll-biometric');
        if (btnRem) btnRem.style.display = 'none';
        if (btnEnr) btnEnr.textContent = '👆 Enable Fingerprint App Lock';
      }
    } catch (_) { /* ignore UI update error */ }
  }

  // ── Password toggle ──────────────────────────────────────────────────────
  if (btnTogglePw && passwordInp) {
    btnTogglePw.addEventListener('click', () => {
      const show = passwordInp.type === 'password';
      passwordInp.type        = show ? 'text' : 'password';
      iconEyeOpen.style.display  = show ? 'none' : 'block';
      iconEyeClose.style.display = show ? 'block' : 'none';
    });
  }

  // ── 1. Initial session check & App Lock ──────────────────────────────────
  _supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      if (shouldShowAppLock()) {
        showAppLockView(session.user.email);
      } else {
        showDashboard();
      }
    } else {
      initLoginScreen();
    }
  });

  function shouldShowAppLock() {
    return window.WebAuthnClient?.isAppLockEnabled() && !window.WebAuthnClient?.isUnlockedThisSession();
  }

  // Auto-lock when minimizing / leaving the app
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (window.WebAuthnClient?.isAppLockEnabled()) {
        window.WebAuthnClient.setUnlockedThisSession(false);
      }
    }
  });

  // ── 2. Auth state listener ────────────────────────────────────────────────
  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      window.WebAuthnClient?.setUnlockedThisSession(true);
      if (appLockView) appLockView.style.display = 'none';
      showDashboard();
    } else if (event === 'SIGNED_OUT') {
      window.WebAuthnClient?.setUnlockedThisSession(false);
      if (appLockView) appLockView.style.display = 'none';
      initLoginScreen();
    }
  });

  // ── 3. App Lock Unlock Handlers ──────────────────────────────────────────
  if (btnUnlockApp) {
    btnUnlockApp.addEventListener('click', handleAppUnlock);
  }

  if (btnLockUsePw) {
    btnLockUsePw.addEventListener('click', () => {
      if (appLockView) appLockView.style.display = 'none';
      initLoginScreen();
    });
  }

  async function handleAppUnlock() {
    setBiometricState('loading', btnUnlockApp);
    try {
      await handleBiometricLogin();
      window.WebAuthnClient?.setUnlockedThisSession(true);
      if (appLockView) appLockView.style.display = 'none';
      showDashboard();
    } catch (err) {
      setBiometricState('error', btnUnlockApp);
      if (appLockError) {
        appLockError.textContent = err.message || 'Fingerprint verification failed.';
        appLockError.style.display = 'block';
      }
    }
  }

  // ── 4. Login screen initialisation ───────────────────────────────────────
  async function initLoginScreen() {
    if (appLockView) appLockView.style.display = 'none';
    showAuthView();

    const enrolled = window.WebAuthnClient?.getEnrolledCredential();
    const biometricSupported = await window.WebAuthnClient?.isBiometricAvailable();

    if (enrolled && biometricSupported && biometricSection) {
      if (biometricEmail) biometricEmail.textContent = enrolled.email;
      biometricSection.style.display  = 'flex';
      if (passwordSection) passwordSection.style.display = 'none';
    } else {
      if (biometricSection) biometricSection.style.display = 'none';
      if (passwordSection) passwordSection.style.display = 'block';
    }
  }

  // ── 5. Biometric login button ─────────────────────────────────────────────
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

    // Already enrolled on this device?
    const alreadyEnrolled    = !!window.WebAuthnClient?.getEnrolledCredential();
    const biometricSupported = await window.WebAuthnClient?.isBiometricAvailable();

    if (alreadyEnrolled || !biometricSupported) return;

    // Show banner after dashboard renders
    setTimeout(() => {
      if (dashView && dashView.style.display !== 'none') {
        enrollBanner.classList.add('visible');
      }
    }, 800);
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

      // 10e. Save credential ID + email locally for next login & enable App Lock
      window.WebAuthnClient.saveEnrolledCredential(session.user.email, verData.credentialId);
      window.WebAuthnClient.setAppLockEnabled(true);
      window.WebAuthnClient.setUnlockedThisSession(true);

      toast.success('Fingerprint App Lock enabled! Your app is now protected. 🎉');
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

  // ── 11. Settings Tab Biometric Management ─────────────────────────────────
  if (btnSettingsEnroll) {
    btnSettingsEnroll.addEventListener('click', async () => {
      await handleBiometricEnrollment();
      updateSettingsBiometricUI();
    });
  }

  if (btnSettingsRemove) {
    btnSettingsRemove.addEventListener('click', () => {
      if (!confirm('Remove fingerprint app lock from this device?')) return;
      window.WebAuthnClient?.clearEnrolledCredential();
      updateSettingsBiometricUI();
      toast.info('Fingerprint app lock removed from this device.');
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showDashboard() {
    const alreadyVisible = dashView.style.display === 'grid';
    if (authView) authView.style.display = 'none';
    if (appLockView) appLockView.style.display = 'none';
    dashView.style.display = 'grid';

    updateSettingsBiometricUI();

    if (!alreadyVisible) {
      maybeShowEnrollBanner();
      if (typeof window.hydrateActiveTab === 'function') {
        window.hydrateActiveTab();
      } else if (typeof window.hydrateDashboardAndAnalytics === 'function') {
        window.hydrateDashboardAndAnalytics();
      }
    }
  }

  function showAppLockView(email) {
    if (authView) authView.style.display = 'none';
    if (dashView) dashView.style.display = 'none';
    if (appLockView) {
      if (appLockEmail) appLockEmail.textContent = email || 'Admin';
      appLockView.style.display = 'flex';
    }
  }

  function showAuthView() {
    if (appLockView) appLockView.style.display = 'none';
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
    if (appLockError) appLockError.style.display = 'none';
  }
});
