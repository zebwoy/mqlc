/* ─── MQLC Main JS ──────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll behaviour ──────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  const scrollTopBtn = document.querySelector('.scroll-top');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    if (navbar) {
      navbar.classList.toggle('scrolled', y > 60);
    }

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', y > 400);
    }

    parallaxTick();
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile nav toggle ────────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Language switcher ────────────────────────────────────── */
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      setLanguage(lang);
    });
  });

  function setLanguage(lang) {
    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.dataset[lang] || el.dataset.en;
      if (text) el.textContent = text;
    });
    document.documentElement.lang = lang;
  }

  /* ── Parallax ─────────────────────────────────────────────── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  function parallaxTick() {
    const y = window.scrollY;
    parallaxEls.forEach(el => {
      const speed  = parseFloat(el.dataset.parallax) || 0.3;
      const rect   = el.parentElement.getBoundingClientRect();
      const offset = (rect.top + y) * speed;
      el.style.transform = `translateY(${offset * 0.15}px)`;
    });
  }

  parallaxTick();

  /* ── Scroll reveal ────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Counter animation & Dynamic Fetch ─────────────────────── */
  async function setupDynamicStats() {
    // 1. JS-Inferred Years Running (From Dec 2025)
    // We floor the year diff, guaranteeing it scales into the future automatically.
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    const yearsRunning = Math.max(1, currentYear - startYear);
    const yrEl = document.getElementById('stat-years');
    if (yrEl) yrEl.dataset.count = yearsRunning.toString();

    // 2. Fetch Aggregations & Constant values from DB
    if (window._supabase) {
      try {
        // Fetch total children (aggregate row count)
        const { count } = await window._supabase
          .from('student_registrations')
          .select('*', { count: 'exact', head: true });
        
        if (count !== null) {
          const chEl = document.getElementById('stat-children');
          // Fallback to 120 offset if DB is empty, otherwise use DB count
          if (chEl) chEl.dataset.count = count > 0 ? count : 120;
        }

        // Fetch Global Settings
        const { data: settings } = await window._supabase
          .from('site_settings')
          .select('*');

        if (settings) {
          settings.forEach(s => {
            if (s.setting_key === 'monthly_fee') {
              const feeEl = document.getElementById('stat-fee');
              if (feeEl) feeEl.dataset.count = parseInt(s.setting_value, 10);
            }
            if (s.setting_key === 'active_programs') {
              const progEl = document.getElementById('stat-programs');
              if (progEl) progEl.dataset.count = parseInt(s.setting_value, 10);
            }
          });
        }
      } catch (err) {
        console.error('Silent fail on stats fetch:', err);
      }
    }

    // 3. Mount Observers After DB Setup
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }
  
  // Kick off the script immediately
  setupDynamicStats();

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10) || 0;
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* ── Smooth scroll for nav links ──────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const href   = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      const offset = navbar ? navbar.offsetHeight + 16 : 80;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  });

});
