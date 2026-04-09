/* ─── MQLC Audio Player ─────────────────────────────────────── */
/* Surah Al-Alaq (Iqra) — Shaikh Maher Al Muaiqly              */

(function () {

  // Robust EveryAyah CDN for Surah Al-Alaq Verse 1 (Iqra) - Maher Al Muaiqly
  const AUDIO_SRC = 'https://everyayah.com/data/MaherAlMuaiqly128kbps/096001.mp3';
  const VOLUME    = 0.28;

  let audio     = null;
  let ready     = false;
  let initiated = false;

  const floatingBtn = document.querySelector('.audio-btn');
  const label       = document.querySelector('.audio-label');
  const ayahBtn     = document.querySelector('.ayah-playable');

  /* We allow missing floatingBtn if ayahBtn exists */
  if (!floatingBtn && !ayahBtn) return;

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
      if (floatingBtn) {
        floatingBtn.style.opacity = '0.4';
        floatingBtn.title = 'Audio unavailable';
      }
      if (ayahBtn) {
        ayahBtn.style.opacity = '0.4';
        ayahBtn.title = 'Audio unavailable';
      }
    });

    /* Wait for explicit user action to play */
  }

  /* Button click — toggle */
  function handlePlayToggle(e) {
    if (e) e.stopPropagation();

    if (!initiated) {
      initAudio();
      
      // On first launch, visually animate immediately, but wait for physical chunk to buffer
      setPlaying(true);
      
      const onCanPlay = () => {
        audio.play().catch((err) => {
          console.warn('MQLC audio play rejected during initial buffer:', err);
          setPlaying(false);
        });
      };
      
      audio.addEventListener('canplay', onCanPlay, { once: true });
      
      // Failsafe in case the MP3 totally 404s
      audio.addEventListener('error', () => {
         setPlaying(false);
      }, { once: true });
      
      return;
    }

    if (!audio) return; // Should not happen

    // For subsequent toggles, the audio is already buffered
    if (audio.paused) {
      setPlaying(true);
      audio.play().catch((err) => {
        console.warn('MQLC audio play rejected natively by browser:', err);
        setPlaying(false);
      });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  if (floatingBtn) floatingBtn.addEventListener('click', handlePlayToggle);
  if (ayahBtn) ayahBtn.addEventListener('click', handlePlayToggle);

  function setPlaying(playing) {
    if (floatingBtn) {
      floatingBtn.classList.toggle('playing', playing);
      floatingBtn.setAttribute('aria-label', playing ? 'Pause recitation' : 'Play Surah Al-Alaq');
    }
    
    if (ayahBtn) {
      ayahBtn.classList.toggle('playing', playing);
      ayahBtn.setAttribute('aria-label', playing ? 'Pause recitation' : 'Play Recitation');
      
      const inlineIcon = ayahBtn.querySelector('.inline-play-icon');
      if (inlineIcon) {
        if (playing) {
          inlineIcon.innerHTML = `
            <div class="audio-bars">
              <span style="height:4px"></span>
              <span style="height:8px"></span>
              <span style="height:6px"></span>
            </div>`;
        } else {
          inlineIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="var(--gold)" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg>`;
        }
      }
    }

    if (label) label.textContent = playing ? 'Playing' : 'Recitation';

    /* Swap icon for floating btn */
    if (floatingBtn) {
      const iconEl = floatingBtn.querySelector('.audio-icon');
      if (iconEl) {
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
    }
  }

  function playIcon() {
    return `<svg viewBox="0 0 24 24" fill="var(--gold)" width="16" height="16">
      <polygon points="5,3 19,12 5,21"/>
    </svg>`;
  }

})();
