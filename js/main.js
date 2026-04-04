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
    // 1. JS-Inferred Time Running (From Dec 2025)
    const startDate = new Date(2025, 11); // December 2025
    const currentDate = new Date();
    
    let monthsRunning = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    monthsRunning -= startDate.getMonth();
    monthsRunning += currentDate.getMonth();

    const yrEl = document.getElementById('stat-years');
    if (yrEl) {
      if (monthsRunning < 12) {
        yrEl.dataset.count = Math.max(1, monthsRunning).toString();
        yrEl.dataset.suffix = ' mos';
        
        // Dynamically update the label below to "Months"
        const labelEl = yrEl.nextElementSibling;
        if (labelEl && labelEl.classList.contains('stat-label')) {
          labelEl.dataset.en = "Months running";
          labelEl.dataset.mr = "महिने सुरू";
          labelEl.dataset.ur = "مہینے سے جاری";
          labelEl.dataset.hi = "महीने से चल रहे";
          
          const currentLang = localStorage.getItem('site_lang') || 'en';
          labelEl.textContent = labelEl.dataset[currentLang];
        }
      } else {
        const yearsRunning = Math.floor(monthsRunning / 12);
        yrEl.dataset.count = Math.max(1, yearsRunning).toString();
        yrEl.dataset.suffix = ' yrs';
      }
    }

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
            if (s.setting_key.startsWith('namaz_')) {
              const namePart = s.setting_key.split('_')[1]; // fajr, zuhr, asr, etc.
              const timeEl = document.getElementById(`time-${namePart}`);
              
              if (timeEl && s.setting_value) {
                // Strip garbage text
                const cleanStr = s.setting_value.replace(/[a-zA-Z\s]/g, '').trim(); 
                let [h, m] = cleanStr.split(':');
                
                // Force to native 12-hour clock bounds
                h = parseInt(h, 10);
                h = h % 12 || 12; 
                
                // Hardcode the suffix based on the exact prayer
                const suffix = namePart === 'fajr' ? 'AM' : 'PM';
                timeEl.textContent = `${h}:${m} ${suffix}`;
              }
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

  /* ── Cloudinary Bulletin Board ─────────────────────────────── */
  const bulletinCarousel = document.querySelector('.bulletin-carousel');
  const bulletinModal = document.getElementById('bulletin-modal');
  const modalBody = document.getElementById('modal-body');
  const modalDownloadBtn = document.getElementById('modal-download-btn');

  async function fetchBulletinCards() {
    if (!bulletinCarousel || !bulletinModal) return;

    try {
      const response = await fetch('/api/get-bulletin');
      if (!response.ok) throw new Error("API not reachable in this dev environment");
      const data = await response.json();
      
      if (data.success && data.resources) {
        data.resources.forEach(item => {
          const isPdf = item.format === 'pdf';
          
          // Cloudinary dynamically converts the 1st page of a PDF to JPG automatically!
          const previewUrl = isPdf ? item.secure_url.replace('.pdf', '.jpg') : item.secure_url;
          
          // Parse a clean title from the raw Cloudinary ID
          const rawId = item.public_id.split('/').pop();
          const safeTitle = rawId.replace(/[_-]/g, ' ');

          // Generate physical card
          const card = document.createElement('div');
          card.className = 'bulletin-card expandable';
          
          card.innerHTML = `
            <h4 class="bulletin-title" style="text-transform: capitalize;">${safeTitle}</h4>
            <div class="gold-divider" style="margin: 1rem 0;"></div>
            <img src="${previewUrl}" loading="lazy" style="width:100%; height:220px; border-radius:8px; object-fit:cover; margin-top: auto; background: #f8f9fa; border: 1px solid rgba(0,0,0,0.05);" alt="${safeTitle} Preview">
          `;

          // Wiring the Lightbox Modal trigger securely without layout shift!
          card.addEventListener('click', () => {
            modalBody.innerHTML = `<img src="${previewUrl}" alt="Full Announcement" style="width:100%; border-radius: 8px;">`;
            modalDownloadBtn.href = item.secure_url; // Direct raw file link
            modalDownloadBtn.download = `${rawId}.${item.format}`;
            bulletinModal.showModal();
          });

          bulletinCarousel.appendChild(card);
        });
      }
    } catch (err) {
      console.warn("Dynamic Bulletin Note:", err.message);
    }
  }

  fetchBulletinCards();

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
