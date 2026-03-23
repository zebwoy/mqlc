/* ─── MQLC Audio Player ─────────────────────────────────────── */
/* Surah Al-Alaq (Iqra) — Shaikh Maher Al Muaiqly              */

(function () {

  const AUDIO_SRC = 'https://server8.mp3quran.net/maher/096.mp3';
  const VOLUME    = 0.28;

  let audio     = null;
  let ready     = false;
  let initiated = false;

  const btn     = document.querySelector('.audio-btn');
  const label   = document.querySelector('.audio-label');

  if (!btn) return;

  /* Build audio object lazily on first user interaction */
  function initAudio() {
    if (initiated) return;
    initiated = true;

    audio = new Audio(AUDIO_SRC);
    audio.volume  = VOLUME;
    audio.preload = 'auto';
    audio.loop    = false;

    audio.addEventListener('canplaythrough', () => { ready = true; });
    audio.addEventListener('ended',  () => setPlaying(false));
    audio.addEventListener('error',  () => {
      console.warn('MQLC audio: could not load recitation.');
      btn.style.opacity = '0.4';
      btn.title = 'Audio unavailable';
    });

    audio.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      /* Autoplay blocked — user must tap button */
    });
  }

  /* One-time trigger on first scroll or click anywhere */
  function onFirstInteraction() {
    initAudio();
    document.removeEventListener('scroll',   onFirstInteraction, { once: true });
    document.removeEventListener('click',    onFirstInteraction, { once: true });
    document.removeEventListener('touchend', onFirstInteraction, { once: true });
  }

  document.addEventListener('scroll',   onFirstInteraction, { once: true, passive: true });
  document.addEventListener('click',    onFirstInteraction, { once: true });
  document.addEventListener('touchend', onFirstInteraction, { once: true });

  /* Button click — toggle */
  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!initiated) {
      initAudio();
      return;
    }

    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  function setPlaying(playing) {
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-label', playing ? 'Pause recitation' : 'Play Surah Al-Alaq');
    if (label) label.textContent = playing ? 'Playing' : 'Recitation';

    /* Swap icon */
    const iconEl = btn.querySelector('.audio-icon');
    if (!iconEl) return;
    if (playing) {
      iconEl.innerHTML = `
        <div class="audio-bars">
          <span style="height:4px"></span>
          <span style="height:8px"></span>
          <span style="height:6px"></span>
        </div>`;
    } else {
      iconEl.innerHTML = playIcon();
    }
  }

  function playIcon() {
    return `<svg viewBox="0 0 24 24" fill="var(--gold)" width="16" height="16">
      <polygon points="5,3 19,12 5,21"/>
    </svg>`;
  }

})();
