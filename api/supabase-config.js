export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    window.SUPABASE_URL = '${process.env.SUPABASE_URL || ''}';
    window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ''}';
    if (typeof supabase !== 'undefined') {
      window._supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } else {
      console.warn("Supabase CDN not loaded before config.");
    }
  `);
}
