/* ─── js/auth.js ─────────────────────────────────────────────────────────── */
/* Handles admin authentication: email / password only                        */
/* Demo Mode: login with demo@mqlc.app to enter a fully sandboxed demo.       */

const DEMO_EMAIL = 'demo@mqlc.app';

document.addEventListener('DOMContentLoaded', () => {
  const _supabase = window._supabase;
  if (!_supabase) return;

  // ── DOM References ──────────────────────────────────────────────────────
  const authView  = document.getElementById('auth-view');
  const dashView  = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const authError = document.getElementById('auth-error');
  const btnLogout = document.getElementById('btn-logout');

  // Password visibility toggle
  const btnTogglePw  = document.getElementById('btn-toggle-password');
  const passwordInp  = document.getElementById('password');
  const iconEyeOpen  = document.getElementById('icon-eye-open');
  const iconEyeClose = document.getElementById('icon-eye-closed');

  // ── Password toggle ──────────────────────────────────────────────────────
  if (btnTogglePw && passwordInp) {
    btnTogglePw.addEventListener('click', () => {
      const show = passwordInp.type === 'password';
      passwordInp.type           = show ? 'text' : 'password';
      iconEyeOpen.style.display  = show ? 'none'  : 'block';
      iconEyeClose.style.display = show ? 'block' : 'none';
    });
  }

  // ── Auth state listener (handles ALL events incl. INITIAL_SESSION) ────────
  // This is the single source of truth — we no longer use getSession() separately.
  // Supabase fires INITIAL_SESSION on every page load (with or without session),
  // SIGNED_IN on fresh login, TOKEN_REFRESHED on token renewal, SIGNED_OUT on logout.
  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session) {
        if (session.user.email === DEMO_EMAIL) activateDemoMode();
        showDashboard();
      } else {
        // INITIAL_SESSION with no session = not logged in
        showAuthView();
      }
    } else if (event === 'SIGNED_OUT') {
      window.DEMO_MODE = false;
      showAuthView();
    }
  });

  // ── Email / password login form ────────────────────────────────────────
  if (loginForm) {
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
        success: email === DEMO_EMAIL ? '👋 Welcome to the MQLC SIS Demo!' : 'Welcome back!',
        error: (err) => `Authentication failed: ${err.message}`,
      });
    });
  }

  // ── Logout ─────────────────────────────────────────────────────────────
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await _supabase.auth.signOut();
    });
  }

  // ── Demo Mode Activation ───────────────────────────────────────────────
  function activateDemoMode() {
    window.DEMO_MODE = true;

    // Show demo badge
    const badge = document.getElementById('demo-mode-badge');
    if (badge) badge.style.display = 'flex';

    // Hide Jamat Timings and Global Settings from sidebar + mobile nav
    document.querySelectorAll(
      '[data-target="tab-jamat"], [data-target="tab-settings"]'
    ).forEach(btn => btn.style.display = 'none');
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showDashboard() {
    const alreadyVisible = dashView && dashView.style.display === 'grid';
    if (authView) authView.style.display = 'none';
    if (dashView) dashView.style.display = 'grid';

    if (!alreadyVisible) {
      // Defer by one tick so admin.js's hydrateActiveTab and DEMO_MODE are both
      // fully set before hydration begins (avoids race with admin.js DOMContentLoaded).
      setTimeout(() => {
        if (typeof window.hydrateActiveTab === 'function') {
          window.hydrateActiveTab();
        } else if (typeof window.hydrateDashboardAndAnalytics === 'function') {
          window.hydrateDashboardAndAnalytics();
        }
      }, 0);
    }
  }

  function showAuthView() {
    if (authView) authView.style.display = 'flex';
    if (dashView) dashView.style.display = 'none';
  }

  function showAuthError(msg) {
    if (authError) {
      authError.textContent = msg || 'Authentication failed.';
      authError.style.display = 'block';
    }
  }

  function hideAuthError() {
    if (authError) authError.style.display = 'none';
  }
});
