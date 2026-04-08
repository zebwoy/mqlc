document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Single source of truth
  const STORAGE_KEY = 'mqlc_lang';

  // 2. The core BIDI engine
  function setLanguage(lang) {
    // Translate text nodes
    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.dataset[lang] || el.dataset.en;
      if (text) el.innerHTML = text;
    });

    // Translate placeholder attributes specifically for quiz.html inputs
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
      const text = el.dataset[`placeholder-${lang}`] || el.dataset['placeholder-en'];
      if (text) el.placeholder = text;
    });

    // Update Arabic/Urdu document directionality
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ur') ? 'rtl' : 'ltr';
    
    // Persist choice for cross-page navigation
    localStorage.setItem(STORAGE_KEY, lang);

    // Broadcast globally so active modules (like quiz engine) can re-render instantly
    window.dispatchEvent(new CustomEvent('onLanguageChange', { detail: { lang } }));
  }

  // 3. Attach standard listeners to ALL language switchers across the DOM
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      const lang = btn.dataset.lang;
      
      // Auto-sync duplicated mobile/desktop variants
      document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
      
      setLanguage(lang);
    });
  });

  // 4. Initial Bootstrap
  const savedLang = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('site_lang') || 'en';
  setLanguage(savedLang);

  // Auto-sync initial UI visual state
  document.querySelectorAll(`.lang-btn`).forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.lang-btn[data-lang="${savedLang}"]`).forEach(b => b.classList.add('active'));

  // Export so dynamically generated nodes (like Quiz Engine) can trigger re-translation manually
  window.triggerTranslation = () => {
    setLanguage(localStorage.getItem(STORAGE_KEY) || 'en');
  };
});
