/* ─── js/auth.js ─────────────────────────────────────────────────────────── */
/* Handles admin authentication: email / password only                        */

const _supabase = window._supabase;

document.addEventListener('DOMContentLoaded', () => {
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

  // ── 1. Initial session check ─────────────────────────────────────────────
  _supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      showDashboard();
    } else {
      showAuthView();
    }
  });

  // ── 2. Auth state listener ────────────────────────────────────────────────
  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      showDashboard();
    } else if (event === 'SIGNED_OUT') {
      showAuthView();
    }
  });

  // ── 3. Email / password login form ────────────────────────────────────────
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
        success: 'Welcome back!',
        error: (err) => `Authentication failed: ${err.message}`,
      });
    });
  }

  // ── 4. Logout ─────────────────────────────────────────────────────────────
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await _supabase.auth.signOut();
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showDashboard() {
    const alreadyVisible = dashView && dashView.style.display === 'grid';
    if (authView) authView.style.display = 'none';
    if (dashView) dashView.style.display = 'grid';

    if (!alreadyVisible) {
      if (typeof window.hydrateActiveTab === 'function') {
        window.hydrateActiveTab();
      } else if (typeof window.hydrateDashboardAndAnalytics === 'function') {
        window.hydrateDashboardAndAnalytics();
      }
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
