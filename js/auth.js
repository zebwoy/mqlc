/* ─── js/auth.js ─────────────────────────────────────────────── */

// ⚠️ REQUIRED: Paste your active Supabase URL and Anon Key here from Vercel/Supabase
const SUPABASE_URL = 'https://xtgpgavrptueujndvduv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Z3BnYXZycHR1ZXVqbmR2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzEzNTUsImV4cCI6MjA5MDMwNzM1NX0.Jn5sLJIAY9UsfLR7X7CREXg2ZRB3Vuc993kpxusNdaw';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
  document.getElementById('auth-error').innerHTML = "<b>Configuration Missing:</b><br/>Please open <code>js/auth.js</code> and add your SUPABASE_URL and SUPABASE_ANON_KEY.";
  document.getElementById('auth-error').style.display = 'block';
  document.getElementById('btn-login').disabled = true;
}

// Initialize Supabase Client (via global CDN script in admin.html)
const _supabase = typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
window._supabase = _supabase; // export to global for admin.js

document.addEventListener("DOMContentLoaded", () => {
  if (!_supabase) return;

  const authView = document.getElementById('auth-view');
  const dashView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const authError = document.getElementById('auth-error');
  const btnLogout = document.getElementById('btn-logout');

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
