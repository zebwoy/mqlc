/* ─── js/auth.js ─────────────────────────────────────────────── */

// Supabase is now initialized globally via js/supabase-config.js
const _supabase = window._supabase;

document.addEventListener("DOMContentLoaded", () => {
  if (!_supabase) return;

  const authView = document.getElementById('auth-view');
  const dashView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const authError = document.getElementById('auth-error');
  const btnLogout = document.getElementById('btn-logout');

  // Password Visibility Toggle
  const btnTogglePassword = document.getElementById('btn-toggle-password');
  const passwordInput = document.getElementById('password');
  const iconEyeOpen = document.getElementById('icon-eye-open');
  const iconEyeClosed = document.getElementById('icon-eye-closed');

  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        iconEyeOpen.style.display = 'none';
        iconEyeClosed.style.display = 'block';
      } else {
        passwordInput.type = 'password';
        iconEyeOpen.style.display = 'block';
        iconEyeClosed.style.display = 'none';
      }
    });
  }

  // 1. Initial Session Check
  _supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      showDashboard();
    } else {
      showLogin();
    }
  });

  // 2. Auth State Listener (Triggered on login/logout automatically)
  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      showDashboard();
    } else if (event === 'SIGNED_OUT') {
      showLogin();
    }
  });

  // 3. Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    authError.style.display = 'none';

    const { data, error } = await _supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      authError.textContent = error.message;
      authError.style.display = 'block';
    }
  });

  // 4. Logout Action
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await _supabase.auth.signOut();
    });
  }

  // UI Handlers
  function showDashboard() {
    authView.style.display = 'none';
    dashView.style.display = 'grid'; // .app-layout is a grid
  }

  function showLogin() {
    authView.style.display = 'flex';
    dashView.style.display = 'none';
  }
});
