document.addEventListener('DOMContentLoaded', () => {
  // Read quiz source from sessionStorage (primary) or URL param (fallback)
  const qParam = new URLSearchParams(window.location.search).get('q');
  let rawUrl = sessionStorage.getItem('mqlc_quiz_src');
  
  if (rawUrl) {
    sessionStorage.removeItem('mqlc_quiz_src'); // Clean up after reading
  } else if (qParam) {
    // Reconstruct Cloudinary URL using the clean filename ID
    rawUrl = `https://res.cloudinary.com/dlcowjk3q/raw/upload/home/mqlc/bulletin/${qParam}`;
    // Fallback to appending .json if the public_id from parameter doesn't already have it
    if (!rawUrl.endsWith('.json')) {
        rawUrl += '.json';
    }
  } else {
    // Legacy support for '?src='
    rawUrl = new URLSearchParams(window.location.search).get('src');
  }

  // ─── Numeral Localization Utility ─────────────────────────────
  const NUMERAL_MAP = {
    'ur': ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'],
    'hi': ['०','१','२','३','४','५','६','७','८','९'],
    'mr': ['०','१','२','३','४','५','६','७','८','९']
  };

  function localizeNum(num, lang) {
    if (!lang || lang === 'en' || !NUMERAL_MAP[lang]) return String(num);
    return String(num).replace(/[0-9]/g, d => NUMERAL_MAP[lang][parseInt(d)]);
  }

  // DOM Elements
  const stageStart = document.getElementById('stage-start');
  const stageActive = document.getElementById('stage-active');
  const stageResult = document.getElementById('stage-result');

  const loader = document.getElementById('loader');
  const instPanel = document.getElementById('instruction-panel');
  const btnBegin = document.getElementById('btn-begin');

  // State Variables
  let quizData = null;
  let questions = [];
  let currentQIndex = 0;
  let score = 0;
  let timerInterval = null;
  let timeRemaining = 20;
  let isAnswered = false;
  let quizStartTime = 0;
  let timeTaken = 0;

  // Supabase Configuration
  let supabaseClient = null;
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  // --- 1. BOOTSTRAP QUIZ DATA ---
  async function loadQuizData() {
    if (!rawUrl) {
      loader.innerText = "Error: Invalid Quiz URL Payload.";
      return;
    }

    try {
      const resp = await fetch(rawUrl);
      if (!resp.ok) throw new Error("Network response was not ok");
      quizData = await resp.json();
      questions = quizData.questions || [];

      if (questions.length === 0) throw new Error("No questions found in payload.");

      // Extract localized topic
      const currentLang = localStorage.getItem('mqlc_lang') || 'en';
      let titleText = quizData.topic && quizData.topic[currentLang] ? quizData.topic[currentLang] : "Pop Quiz";
      document.getElementById('inst-topic').innerText = titleText;
      
      document.getElementById('inst-no').innerHTML = quizData.quiz_no ? `Quiz #<bdi>${localizeNum(quizData.quiz_no, currentLang)}</bdi>` : 'Live Quiz';
      document.getElementById('inst-date').innerHTML = `<bdi>${quizData.lecture_date || new Date().toLocaleDateString()}</bdi>`;

      loader.style.display = 'none';
      instPanel.style.display = 'block';

    } catch (e) {
      console.error(e);
      loader.innerText = "Failed to load quiz metadata. Ensure the file is a valid JSON.";
      loader.style.color = "#EF4444";
    }
  }

  // --- 2. THE QUIZ ENGINE ---
  function startQuiz() {
    stageStart.classList.remove('active');
    stageActive.classList.add('active');
    currentQIndex = 0;
    score = 0;
    quizStartTime = Date.now();
    renderQuestion(currentQIndex);
  }

  function shuffleArray(array) {
    let curId = array.length;
    while (0 !== curId) {
      let randId = Math.floor(Math.random() * curId);
      curId -= 1;
      let tmp = array[curId];
      array[curId] = array[randId];
      array[randId] = tmp;
    }
    return array;
  }

  function renderQuestion(index) {
    // Reset state
    isAnswered = false;
    timeRemaining = 20;

    // UI state for buttons: Show Skip, Hide Next
    document.getElementById('action-row').style.display = 'flex';
    document.getElementById('btn-skip').style.display = 'inline-block';
    document.getElementById('btn-next').style.display = 'none';

    const q = questions[index];
    const currentLang = localStorage.getItem('mqlc_lang') || 'en';
    
    const qCounter = document.getElementById('q-counter');
    const qNum = localizeNum(index + 1, currentLang);
    const qTotal = localizeNum(questions.length, currentLang);
    if (currentLang === 'ur') {
      qCounter.innerHTML = `سوال ${qNum} از ${qTotal}`;
    } else if (currentLang === 'mr') {
      qCounter.innerHTML = `प्रश्न ${qNum} पैकी ${qTotal}`;
    } else if (currentLang === 'hi') {
      qCounter.innerHTML = `प्रश्न ${qNum} / ${qTotal}`;
    } else {
      qCounter.innerHTML = `Question ${qNum} of ${qTotal}`;
    }

    // Set dir="auto" on text to prevent LTR punctuation sliding in RTL language mode
    const qTextEl = document.getElementById('q-text');
    qTextEl.setAttribute('dir', 'auto');
    qTextEl.innerText = (q.question && q.question[currentLang]) ? q.question[currentLang] : q.question['en'];

    const optionsGrid = document.getElementById('q-options');
    optionsGrid.innerHTML = '';

    // Resolve localized options for the current language
    const rawOptions = (q.options && q.options[currentLang]) ? q.options[currentLang] : q.options['en'];

    // Shuffle options by index rather than raw texts to preserve correct identity through translations!
    const indices = Array.from({ length: rawOptions.length }, (_, i) => i);
    const shuffledIndices = shuffleArray(indices);

    shuffledIndices.forEach(idx => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.dataset.optIndex = idx;
      btn.setAttribute('dir', 'auto');
      btn.innerText = rawOptions[idx];
      btn.onclick = () => handleAnswer(idx, q.answer_index, btn);
      optionsGrid.appendChild(btn);
    });

    startTimer();
  }

  function startTimer() {
    const sMap = { 'en': 's', 'ur': ' سیکنڈ', 'mr': 'से', 'hi': 'से' };

    const timerText = document.getElementById('q-timer');
    const timerBar = document.getElementById('timer-bar');

    const initLang = localStorage.getItem('mqlc_lang') || 'en';
    timerText.innerHTML = `${localizeNum(timeRemaining, initLang)}${sMap[initLang] || 's'}`;
    timerText.style.color = "var(--gold)";
    timerBar.style.width = "100%";
    timerBar.style.background = "var(--gold)";

    // Force reflow for css transition
    void timerBar.offsetWidth;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (isAnswered) {
        clearInterval(timerInterval);
        return;
      }

      timeRemaining--;
      // Re-read language each tick so mid-countdown language switches update immediately
      const lang = localStorage.getItem('mqlc_lang') || 'en';
      timerText.innerHTML = `${localizeNum(timeRemaining, lang)}${sMap[lang] || 's'}`;

      const percentage = (timeRemaining / 20) * 100;
      timerBar.style.width = `${percentage}%`;

      if (timeRemaining <= 7) {
        timerText.style.color = "#EF4444";
        timerBar.style.background = "#EF4444";
      }

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function lockAllOptions() {
    isAnswered = true;
    const btns = document.querySelectorAll('.q-option');
    btns.forEach(b => b.disabled = true);

    // UI state for buttons: Hide Skip, Show Next
    document.getElementById('btn-skip').style.display = 'none';
    document.getElementById('btn-next').style.display = 'inline-block';
  }

  function handleTimeout() {
    lockAllOptions();
    
    const q = questions[currentQIndex];
    const btns = document.querySelectorAll('.q-option');
    btns.forEach(b => {
      if (parseInt(b.dataset.optIndex) === q.answer_index) b.classList.add('correct');
    });
  }

  function handleAnswer(selectedIdx, correctIdx, clickedBtn) {
    if (isAnswered) return;
    lockAllOptions();

    const btns = document.querySelectorAll('.q-option');

    if (selectedIdx === correctIdx) {
      score++;
      clickedBtn.classList.add('correct');
    } else {
      clickedBtn.classList.add('incorrect');
      // Highlight correct one
      btns.forEach(b => {
        if (parseInt(b.dataset.optIndex) === correctIdx) b.classList.add('correct');
      });
    }
  }

  // Next Button Logic
  document.getElementById('btn-next').addEventListener('click', () => {
    currentQIndex++;
    if (currentQIndex < questions.length) {
      renderQuestion(currentQIndex);
    } else {
      showResults();
    }
  });

  // Skip Button Logic
  document.getElementById('btn-skip').addEventListener('click', () => {
    if (isAnswered) return; // Prevent skip if already answered
    clearInterval(timerInterval);
    currentQIndex++;
    if (currentQIndex < questions.length) {
      renderQuestion(currentQIndex);
    } else {
      showResults();
    }
  });

  // --- 3. SHOW RESULTS ---
  function showResults() {
    stageActive.classList.remove('active');
    stageResult.classList.add('active');

    // Compute global time taken only once
    if (timeTaken === 0) {
      timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    }

    const currentLang = localStorage.getItem('mqlc_lang') || 'en';
    const lScore = localizeNum(score, currentLang);
    const lTotal = localizeNum(questions.length, currentLang);
    document.getElementById('final-score-num').innerText = lScore;
    
    const denMap = {
      'en': `out of ${lTotal} correct`,
      'ur': `${lTotal} میں سے درست`,
      'mr': `${lTotal} पैकी बरोबर`,
      'hi': `${lTotal} में से सही`
    };
    document.getElementById('final-score-den').innerHTML = denMap[currentLang] || denMap['en'];

    // Feedback Logic
    const percentage = score / questions.length;
    // Wrap the score fraction in a single <bdi dir="ltr"> to prevent RTL reordering of "score / total"
    const scoreFrac = `<bdi dir="ltr">${lScore} / ${lTotal}</bdi>`;
    let scoreMessage = "";
    if (percentage >= 0.75) {
      const msgMap = { 'en': "Well done! You got", 'ur': "بہت اچھے! آپ نے حاصل کیے", 'mr': "छान! तुम्हाला मिळाले", 'hi': "बहुत बढ़िया! आपको मिले" };
      scoreMessage = `${msgMap[currentLang]} ${scoreFrac}`;
    } else if (percentage >= 0.4) {
      const msgMap = { 'en': "You can do better! You got", 'ur': "آپ بہتر کر سکتے ہیں! آپ نے حاصل کیے", 'mr': "तुम्ही अधिक चांगले करू शकता! तुम्हाला मिळाले", 'hi': "आप बेहतर कर सकते हैं! आपको मिले" };
      scoreMessage = `${msgMap[currentLang]} ${scoreFrac}`;
    } else {
      const msgMap = { 'en': "You need improvement! You got only", 'ur': "آپ کو بہتری کی ضرورت ہے! آپ نے صرف حاصل کیے", 'mr': "तुम्हाला सुधारणे आवश्यक आहे! तुम्हाला फक्त मिळाले", 'hi': "आपको सुधार की आवश्यकता है! आपको केवल मिले" };
      scoreMessage = `${msgMap[currentLang]} ${scoreFrac}`;
    }
    document.getElementById('feedback-text').innerHTML = scoreMessage;
  }

  // --- 4. FORM SUBMISSION ---
  const fbForm = document.getElementById('leaderboard-form');
  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Native Form Validation Trigger
      if (!fbForm.checkValidity()) {
        fbForm.reportValidity();
        return;
      }

      const submitBtn = document.getElementById('btn-submit-score');
      const statusEl = document.getElementById('submit-status');
      submitBtn.disabled = true;
      submitBtn.innerText = "Sending data to Leaderboard...";
      statusEl.innerText = "";

      try {
        // Build a clean, deterministic quiz_id: seriesName_quizNo_DDMMYY
        const seriesRaw = (quizData.topic && quizData.topic.en)
          ? quizData.topic.en.split(':')[0].trim()
          : 'general';
        const seriesSlug = seriesRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const quizNum = quizData.quiz_no || '0';
        // Format lecture_date "05 April 2026" → "050426"
        let dateStamp = '000000';
        if (quizData.lecture_date) {
          const d = new Date(quizData.lecture_date);
          if (!isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yy = String(d.getFullYear()).slice(-2);
            dateStamp = `${dd}${mm}${yy}`;
          }
        }
        const payload = {
          quiz_id: `${seriesSlug}_${quizNum}_${dateStamp}`,
          player_name: document.getElementById('demo-name').value,
          age: document.getElementById('demo-age').value,
          gender: document.querySelector('input[name="demo-gender"]:checked').value,
          building: document.getElementById('demo-building').value,
          area: document.querySelector('input[name="demo-area"]:checked').value,
          score: score,
          time_taken: timeTaken
        };

        if (!supabaseClient) throw new Error("Supabase client is missing!");

        const { error } = await supabaseClient
          .from('quiz_leaderboard')
          .insert([payload]);

        if (error) throw error;

        statusEl.innerText = "Score securely saved!";
        statusEl.style.color = "#31C48D";

        // Generate Leaderboard
        await generateLeaderboard(payload.quiz_id, payload.player_name);

      } catch (err) {
        console.error(err);
        statusEl.innerText = "Error saving score. Please check your network.";
        statusEl.style.color = "#EF4444";
        submitBtn.disabled = false;
        submitBtn.innerText = "Try Again";
      }
    });
  }

  // --- 5. LEADERBOARD RENDERING ---
  async function generateLeaderboard(quizId, currentPlayerName) {
    try {
      // Hide form, show leaderboard
      document.querySelector('.demographics-panel').style.display = 'none';
      const lbPanel = document.getElementById('leaderboard-panel');
      lbPanel.style.display = 'block';
      lbPanel.scrollIntoView({ behavior: 'smooth' });

      // Identify quiz topic
      const currentLang = localStorage.getItem('mqlc_lang') || 'en';
      let titleText = quizData.topic && quizData.topic[currentLang] ? quizData.topic[currentLang] : "Quiz Leaderboard";
      document.getElementById('lb-quiz-title').innerText = titleText;

      const { data, error } = await supabaseClient
        .from('quiz_leaderboard')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(10);

      if (error) throw error;

      const tbody = document.getElementById('leaderboard-tbody');
      tbody.innerHTML = '';

      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No scores yet!</td></tr>';
        return;
      }

      const fromMap = { 'en': 'from', 'ur': 'از', 'mr': 'येथून', 'hi': 'से' };
      const fromWord = fromMap[currentLang] || 'from';

      data.forEach((row, index) => {
        const rank = index + 1;
        const lRank = localizeNum(rank, currentLang);
        const lRowScore = localizeNum(row.score, currentLang);
        // Obfuscate to preserve privacy: Name from Area
        const displayName = `${row.player_name.trim().split(' ')[0]} ${fromWord} ${row.area}`;
        const isCurrent = (row.player_name === currentPlayerName && row.score === score);
        
        const tr = document.createElement('tr');
        if (isCurrent) tr.classList.add('current-player');
        tr.classList.add(`rank-${rank}`);
        
        const lTimeTaken = row.time_taken ? localizeNum(row.time_taken, currentLang) : '';
        const sLabel = currentLang === 'ur' ? ' سیکنڈ' : 's';
        const tt = row.time_taken ? `<span class="lb-time">(${lTimeTaken}${sLabel})</span>` : '';
        tr.innerHTML = `
          <td><span class="rank-badge">${lRank}</span></td>
          <td dir="auto">${displayName}</td>
          <td style="color: var(--quiz-gold); font-weight: 700;"><bdi>${lRowScore}</bdi>${tt}</td>
        `;
        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error("Leaderboard fetch error", err);
    }
  }

  // --- 6. SHARING LOGIC (html2canvas) ---
  const btnShare = document.getElementById('btn-share');
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const originalText = btnShare.innerHTML;
      btnShare.innerText = "Generating Image...";
      btnShare.disabled = true;

      try {
        const captureArea = document.getElementById('leaderboard-capture-area');
        const canvas = await html2canvas(captureArea, {
          scale: 2, // High resolution
          backgroundColor: '#FFFFFF'
        });

        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error("Canvas Blob failed");
          
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'leaderboard.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'mqlc_leaderboard.png', { type: 'image/png' });
            await navigator.share({
              title: 'MQLC Quiz Result',
              text: 'Here is my standing on the MQLC Quiz! 🏆',
              files: [file]
            });
          } else {
            // Fallback: Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MQLC_Leaderboard_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          btnShare.innerHTML = originalText;
          btnShare.disabled = false;
        }, 'image/png');
      } catch (err) {
        console.error("Share error", err);
        btnShare.innerText = "Share Failed";
        setTimeout(() => {
          btnShare.innerHTML = originalText;
          btnShare.disabled = false;
        }, 2000);
      }
    });
  }

  // Run initialization
  btnBegin.addEventListener('click', startQuiz);
  loadQuizData();

  // --- 7. DYNAMIC TRANSLATION SUBSCRIPTION ---
  window.addEventListener('onLanguageChange', (e) => {
    if (!questions || questions.length === 0) return;
    const lang = e.detail.lang;
    
    // Update Stage 1 (Introduction)
    if (stageStart.classList.contains('active') && quizData) {
       let titleText = quizData.topic && quizData.topic[lang] ? quizData.topic[lang] : "Pop Quiz";
       document.getElementById('inst-topic').innerText = titleText;
    }
    
    // Update Active Stage (Timer, Question, Mutated Options)
    if (stageActive.classList.contains('active')) {
       const q = questions[currentQIndex];
       
       const qCounter = document.getElementById('q-counter');
       const qN = localizeNum(currentQIndex + 1, lang);
       const qT = localizeNum(questions.length, lang);
       if (lang === 'ur') {
         qCounter.innerHTML = `سوال ${qN} از ${qT}`;
       } else if (lang === 'mr') {
         qCounter.innerHTML = `प्रश्न ${qN} पैकी ${qT}`;
       } else if (lang === 'hi') {
         qCounter.innerHTML = `प्रश्न ${qN} / ${qT}`;
       } else {
         qCounter.innerHTML = `Question ${qN} of ${qT}`;
       }

       document.getElementById('q-text').innerText = (q.question && q.question[lang]) ? q.question[lang] : q.question['en'];
       
       const rawOpts = (q.options && q.options[lang]) ? q.options[lang] : q.options['en'];
       document.querySelectorAll('.q-option').forEach(btn => {
         const idx = btn.dataset.optIndex;
         if (idx !== undefined) btn.innerText = rawOpts[idx];
       });
       
       if (!isAnswered) {
         const sMap = { 'en': 's', 'ur': ' سیکنڈ', 'mr': 'से', 'hi': 'से' };
         document.getElementById('q-timer').innerHTML = `${localizeNum(timeRemaining, lang)}${sMap[lang] || 's'}`;
       }
    }
    
    // Update Stage 3 (Results Strings & Format Mapping)
    if (stageResult.classList.contains('active')) {
       showResults(); 
       
       if (document.getElementById('leaderboard-panel').style.display === 'block') {
         let titleText = quizData.topic && quizData.topic[lang] ? quizData.topic[lang] : "Quiz Leaderboard";
         document.getElementById('lb-quiz-title').innerText = titleText;
         // Retranslate leaderboard!
         const quizId = quizData.quiz_no ? `Quiz-${quizData.quiz_no}` : 'unknown';
         const currentPlayerName = document.getElementById('demo-name').value;
         generateLeaderboard(quizId, currentPlayerName);
       }
    }
  });

});
