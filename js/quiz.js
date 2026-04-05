document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawUrl = urlParams.get('src');

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

  // Supabase Configuration
  const SUPABASE_URL = "https://xtgpgavrptueujndvduv.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Z3BnYXZycHR1ZXVqbmR2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzEzNTUsImV4cCI6MjA5MDMwNzM1NX0.Jn5sLJIAY9UsfLR7X7CREXg2ZRB3Vuc993kpxusNdaw";
  let supabaseClient = null;
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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

      // Mount into UI
      document.getElementById('inst-topic').innerText = quizData.topic || "Pop Quiz";
      document.getElementById('inst-no').innerText = quizData.quiz_no ? `Quiz #${quizData.quiz_no}` : 'Live Quiz';
      document.getElementById('inst-date').innerText = quizData.lecture_date || new Date().toLocaleDateString();

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
    document.getElementById('q-counter').innerText = `Question ${index + 1} of ${questions.length}`;
    document.getElementById('q-text').innerText = q.question;

    const optionsGrid = document.getElementById('q-options');
    optionsGrid.innerHTML = '';

    // Shuffle options so it's not A B C D every time!
    const shuffledOptions = shuffleArray([...q.options]);

    shuffledOptions.forEach(optText => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.innerText = optText;
      btn.onclick = () => handleAnswer(optText, q.answer, btn);
      optionsGrid.appendChild(btn);
    });

    startTimer();
  }

  function startTimer() {
    const timerText = document.getElementById('q-timer');
    const timerBar = document.getElementById('timer-bar');

    timerText.innerText = `${timeRemaining}s`;
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
      timerText.innerText = `${timeRemaining}s`;

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
    const correctAns = questions[currentQIndex].answer;
    const btns = document.querySelectorAll('.q-option');
    btns.forEach(b => {
      if (b.innerText === correctAns) b.classList.add('correct');
    });
  }

  function handleAnswer(selectedOpt, correctOpt, clickedBtn) {
    if (isAnswered) return;
    lockAllOptions();

    const btns = document.querySelectorAll('.q-option');

    if (selectedOpt === correctOpt) {
      score++;
      clickedBtn.classList.add('correct');
    } else {
      clickedBtn.classList.add('incorrect');
      // Highlight correct one
      btns.forEach(b => {
        if (b.innerText === correctOpt) b.classList.add('correct');
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

    document.getElementById('final-score-text').innerText = `You scored ${score} / ${questions.length}`;

    // Feedback Logic
    const percentage = score / questions.length;
    let scoreMessage = "";
    if (percentage >= 0.75) {
      scoreMessage = "Well done! You got " + score + " out of " + questions.length + " correct.";
    } else if (percentage >= 0.4) {
      scoreMessage = "You can do better! You got " + score + " out of " + questions.length + " correct.";
    } else {
      scoreMessage = "You need improvement! You got only " + score + " out of " + questions.length + " correct.";
    }
    document.getElementById('feedback-text').innerText = scoreMessage;
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
        const payload = {
          quiz_id: quizData.quiz_no ? `Quiz-${quizData.quiz_no}` : 'unknown',
          player_name: document.getElementById('demo-name').value,
          age: document.getElementById('demo-age').value,
          gender: document.querySelector('input[name="demo-gender"]:checked').value,
          building: document.getElementById('demo-building').value,
          area: document.querySelector('input[name="demo-area"]:checked').value,
          score: score
        };

        if (!supabaseClient) throw new Error("Supabase client is missing!");

        const { error } = await supabaseClient
          .from('quiz_leaderboard')
          .insert([payload]);

        if (error) throw error;

        statusEl.innerText = "Score securely saved!";
        statusEl.style.color = "#31C48D";

        setTimeout(() => {
          // Send them back to bulletin board
          window.location.href = "/";
        }, 1500);

      } catch (err) {
        console.error(err);
        statusEl.innerText = "Error saving score. Please check your network.";
        statusEl.style.color = "#EF4444";
        submitBtn.disabled = false;
        submitBtn.innerText = "Try Again";
      }
    });
  }

  // Run initialization
  btnBegin.addEventListener('click', startQuiz);
  loadQuizData();

});
