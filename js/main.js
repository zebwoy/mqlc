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
  const navLinks = document.querySelector('.nav-links');

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
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.parentElement.getBoundingClientRect();
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
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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
        for (const item of data.resources) {
          const isPdf = item.format === 'pdf';
          const isJson = item.format === 'json';

          // Cloudinary dynamically converts the 1st page of a PDF to JPG automatically!
          const previewUrl = isPdf ? item.secure_url.replace('.pdf', '.jpg') : item.secure_url;

          // Parse a clean title from the raw Cloudinary ID as fallback
          const rawId = item.public_id.split('/').pop();
          const safeTitle = rawId.replace(/[_-]/g, ' ');

          if (isJson) {
            try {
              // Deeply fetch and parse the JSON payload dynamically to render native UI metadata
              const quizRes = await fetch(item.secure_url);
              const quizData = await quizRes.json();

              const qTopic = quizData.topic || safeTitle;
              const qDate = quizData.lecture_date || "Current Lecture";
              const qNo = quizData.quiz_no ? `#${quizData.quiz_no}` : "Live";

              // Check expiration (3 days after lecture_date or explicitly submission_deadline)
              const deadlineStr = quizData.submission_deadline || quizData.lecture_date;
              if (deadlineStr) {
                const deadline = new Date(deadlineStr);
                if (quizData.lecture_date && !quizData.submission_deadline) {
                  deadline.setDate(deadline.getDate() + 3);
                }
                // End of the day
                deadline.setHours(23, 59, 59, 999);
                if (new Date() > deadline) {
                  // Skip rendering because it is expired
                  continue;
                }
              }

              // Generate physical card safely without expandable
              const card = document.createElement('div');
              card.className = 'bulletin-card';

              // RENDER QUIZ TILE
              card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 class="bulletin-title" style="text-transform: capitalize; margin: 0; padding-right: 10px;">${qTopic}</h4>
                    <span style="background: var(--gold); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: bold; white-space: nowrap;">Quiz ${qNo}</span>
                </div>
                <div class="gold-divider" style="margin: 0.75rem 0;"></div>
                <div style="flex:1; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; background:var(--cream); border:1px solid rgba(212,160,23,0.3); border-left:4px solid var(--gold); border-radius:8px; margin-top: 1rem; padding: 1.5rem; height: auto; min-height: 190px; box-sizing: border-box; position: relative;">
                  <span style="color:var(--midnight); font-weight:700; font-size: 1.2rem; line-height: 1.2; margin-bottom: 0.5rem;">Interactive Live Quiz</span>
                  <div style="display:flex; flex-direction:column; gap:0.2rem; font-size: 0.85rem; color:var(--text-mid);">
                      <span><strong style="color:var(--gold);">Lecture:</strong> ${qDate}</span>
                      <span><strong style="color:var(--gold);">Closes:</strong> ${quizData.submission_deadline || '3 Days after Lecture'}</span>
                  </div>
                  <a href="/quiz.html?src=${encodeURIComponent(item.secure_url)}" target="_blank" class="btn-primary" style="display:inline-block; margin-top: 1.2rem; padding: 0.5rem 1.2rem; font-size: 0.85rem; z-index: 10; text-decoration: none; border-radius: 55%">
                      Begin Quiz &rarr;
                  </a>
                </div>
              `;

              bulletinCarousel.appendChild(card);
            } catch (e) {
              console.error("Failed to parse quiz JSON for bulletin board.", e);
            }
          } else {
            // Generate physical card expandable
            const card = document.createElement('div');
            card.className = 'bulletin-card expandable';

            // RENDER PDF/IMAGE TILE
            card.innerHTML = `
              <h4 class="bulletin-title" style="text-transform: capitalize;">${safeTitle}</h4>
              <div class="gold-divider" style="margin: 1rem 0;"></div>
              <img src="${previewUrl}" loading="lazy" style="width:100%; height:220px; border-radius:8px; object-fit:cover; margin-top: 1.5rem; background: #f8f9fa; border: 1px solid rgba(0,0,0,0.05);" alt="${safeTitle} Preview">
            `;
            // Wiring the Lightbox Modal trigger securely without layout shift!
            card.addEventListener('click', () => {
              modalBody.innerHTML = `<img src="${previewUrl}" alt="Full Announcement" style="width:100%; border-radius: 8px;">`;
              modalDownloadBtn.href = item.secure_url; // Direct raw file link
              modalDownloadBtn.download = `${rawId}.${item.format}`;
              bulletinModal.showModal();
            });
            bulletinCarousel.appendChild(card);
          }
        }
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
      const href = anchor.getAttribute('href');
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
