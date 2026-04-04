/* ─── js/supabase-config.js ──────────────────────────────────── */

const SUPABASE_URL = 'https://xtgpgavrptueujndvduv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Z3BnYXZycHR1ZXVqbmR2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzEzNTUsImV4cCI6MjA5MDMwNzM1NX0.Jn5sLJIAY9UsfLR7X7CREXg2ZRB3Vuc993kpxusNdaw';

if (typeof supabase !== 'undefined') {
  window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn("Supabase CDN not loaded.");
}
