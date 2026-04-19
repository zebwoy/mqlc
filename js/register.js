document.addEventListener('DOMContentLoaded', () => {

  const SUPABASE_URL = "https://xtgpgavrptueujndvduv.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Z3BnYXZycHR1ZXVqbmR2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzEzNTUsImV4cCI6MjA5MDMwNzM1NX0.Jn5sLJIAY9UsfLR7X7CREXg2ZRB3Vuc993kpxusNdaw";

  if (!window._supabase) {
    if (typeof window.supabase !== 'undefined') {
      window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.warn("Supabase library not loaded natively yet.");
    }
  }

  // DOM Elements
  const stageAuth = document.getElementById('stage-auth');
  const stageSuccess = document.getElementById('stage-success');
  const form = document.getElementById('parent-registration-form');

  const inputPin = document.getElementById('input-pin');
  const btnVerify = document.getElementById('btn-verify-pin');
  const authStatus = document.getElementById('auth-status');

  const btnSubmit = document.getElementById('btn-submit');
  const submitStatus = document.getElementById('submit-status');

  // Wizard Elements
  const wizardSteps = ['step-course', 'step-identity', 'step-edu'];
  let currentStepIdx = 0;
  const progressContainer = document.getElementById('wizard-progress-container');
  const progressBar = document.getElementById('wizard-progress-bar');

  let verifiedPinId = null;

  function updateWizardUI() {
    // Hide all steps
    wizardSteps.forEach(id => {
      document.getElementById(id).classList.remove('active');
    });

    // Show current
    document.getElementById(wizardSteps[currentStepIdx]).classList.add('active');

    // Update Progress Bar
    const progressPercent = (currentStepIdx / (wizardSteps.length - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  // Next / Prev listeners
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentSection = document.getElementById(wizardSteps[currentStepIdx]);
      currentSection.querySelectorAll('.validation-msg').forEach(el => el.remove());
      currentSection.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

      const missingFields = Array.from(currentSection.querySelectorAll(':invalid'));

      if (missingFields.length > 0) {
        let firstMissing = true;

        missingFields.forEach(field => {
          let msg = document.createElement('span');
          msg.className = 'validation-msg';
          msg.textContent = field.validationMessage || "Please fill out this field.";

          if (field.classList.contains('visually-hidden') || field.type === 'radio' || field.type === 'checkbox') {
            // Append to the overall group for pill containers
            let container = field.closest('.reg-form-group');
            if (container && !container.querySelector('.validation-msg')) {
              container.appendChild(msg);
            }
          } else {
            field.classList.add('input-error');
            field.parentNode.insertBefore(msg, field.nextSibling);
            if (firstMissing) {
              field.focus();
              firstMissing = false;
            }
          }
        });

        // Shake animation for the window/container
        currentSection.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(0)' }
        ], { duration: 400, delay: 0 });

        return;
      }

      if (currentStepIdx < wizardSteps.length - 1) {
        currentStepIdx++;
        updateWizardUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Flatpickr Calendar Initialization
  const dobInput = document.querySelector('input[name="dob"]');
  if (dobInput && typeof flatpickr !== 'undefined') {
    flatpickr(dobInput, {
      dateFormat: "d-M-Y",
      maxDate: "today",
      allowInput: true,
      disableMobile: false // Rely on neat UI
    });
  }

  // Strict Phone Digit Enforcement (10 max)
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
    });
  });

  // Aadhar Box Syncing Logic
  const aadharParts = document.querySelectorAll('.aadhar-part');
  aadharParts.forEach((part, index) => {
    part.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, ''); // Ensure only digits
      if (e.target.value.length === 4 && index < aadharParts.length - 1) {
        aadharParts[index + 1].focus();
      }
    });
    part.addEventListener('keydown', (e) => {
      // Auto move back on backspace if empty
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
        aadharParts[index - 1].focus();
        // remove trailing char from previous
        let prev = aadharParts[index - 1];
        prev.value = prev.value.slice(0, -1);
        e.preventDefault();
      }
    });
  });

  // School Details Toggle Logic
  const regCurrentClassSelect = document.getElementById('reg_current_class');
  const regSchoolNameGroup = document.getElementById('reg_school_name_group');
  const regSchoolDaysGroup = document.getElementById('reg_school_days_group');
  const regSchoolTimeGroup = document.getElementById('reg_school_time_group');
  
  if (regCurrentClassSelect) {
    regCurrentClassSelect.addEventListener('change', (e) => {
      const isNotGoing = e.target.value === 'NA';
      
      if (regSchoolNameGroup) {
        regSchoolNameGroup.style.display = isNotGoing ? 'none' : '';
        const nameInput = regSchoolNameGroup.querySelector('input');
        if (nameInput) nameInput.required = !isNotGoing;
      }
      if (regSchoolDaysGroup) {
        regSchoolDaysGroup.style.display = isNotGoing ? 'none' : '';
      }
      if (regSchoolTimeGroup) {
        regSchoolTimeGroup.style.display = isNotGoing ? 'none' : '';
        const timeInputs = regSchoolTimeGroup.querySelectorAll('input');
        timeInputs.forEach(input => input.required = !isNotGoing);
      }
    });
  }

  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStepIdx > 0) {
        currentStepIdx--;
        updateWizardUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // 1. PIN Verification Logic
  if (btnVerify) {
    btnVerify.addEventListener('click', async () => {
      if (!window._supabase) {
        authStatus.textContent = "System offline. Cannot verify PIN.";
        return;
      }

      const pinVal = inputPin.value.trim();
      if (pinVal.length !== 6) {
        authStatus.textContent = "Please enter a valid 6-digit PIN.";
        return;
      }

      try {
        btnVerify.disabled = true;
        authStatus.textContent = "";

        const { data, error } = await window._supabase
          .from('otp_pins')
          .select('*')
          .eq('pin', pinVal)
          .eq('is_valid', true)
          .single();

        if (error || !data) {
          throw new Error("Invalid or expired PIN.");
        }

        verifiedPinId = data.id;

        // Transition Stages
        stageAuth.classList.remove('active');
        progressContainer.style.display = 'block';
        updateWizardUI(); // Start step 1

      } catch (err) {
        authStatus.textContent = "Incorrect or Expired PIN. Please contact the administrator.";
        inputPin.value = "";
      } finally {
        btnVerify.disabled = false;
      }
    });
  }

  if (inputPin) {
    inputPin.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') btnVerify.click();
    });
  }

  // 2. Form Submission Logic
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!window._supabase || !verifiedPinId) {
        submitStatus.textContent = "Session invalid. Please refresh the page.";
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const yearStr = new Date().getFullYear().toString().substring(2);
      const randomAlphanumeric = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedFormNo = `MQLC-${yearStr}-${randomAlphanumeric}`;

      // Combine Aadhar parts
      const aadharParts = document.querySelectorAll('.aadhar-part');
      if (aadharParts.length === 3) {
        const fullAadhar = Array.from(aadharParts).map(p => p.value).join('-');
        if (fullAadhar !== '--') {
          document.getElementById('aadhar_hidden').value = fullAadhar;
        }
      }

      const fd = new FormData(form);
      const payload = {
        doj: today,
        form_no: generatedFormNo,
        course_applying: fd.get('course_applying'),
        student_name: fd.get('student_name'),
        father_name: fd.get('father_name'),
        gender: fd.get('gender'),
        dob: fd.get('dob'),
        aadhar_no: fd.get('aadhar_no') || null,
        address: fd.get('address'),
        contact_father: fd.get('contact_father'),
        contact_mother: fd.get('contact_mother') || null,
        current_class: fd.get('current_class'),
        school_name: (fd.get('current_class') === 'Not going to school yet' || fd.get('current_class') === 'NA') ? 'N/A' : fd.get('school_name'),
        school_days: (fd.get('current_class') === 'Not going to school yet' || fd.get('current_class') === 'NA') ? 'N/A' : Array.from(form.querySelectorAll('input[name="school_days_arr"]:checked')).map(cb => cb.value).join(', '),
        school_time: (fd.get('current_class') === 'Not going to school yet' || fd.get('current_class') === 'NA') ? 'N/A' : `${fd.get('school_time_from')} - ${fd.get('school_time_to')}`,
        status: 'pending'
      };

      try {
        btnSubmit.disabled = true;
        submitStatus.textContent = "";

        const { error: regError } = await window._supabase
          .from('student_registrations')
          .insert([payload]);

        if (regError) throw regError;

        const { error: pinError } = await window._supabase
          .from('otp_pins')
          .update({ is_valid: false })
          .eq('id', verifiedPinId);

        if (pinError) console.error("Warning: Failed to invalidate PIN.", pinError);

        // Success Transition
        document.getElementById(wizardSteps[currentStepIdx]).classList.remove('active');
        progressContainer.style.display = 'none';
        stageSuccess.classList.add('active');

      } catch (err) {
        console.error(err);
        submitStatus.textContent = "An error occurred while submitting: " + err.message;
        btnSubmit.disabled = false;
      }
    });
  }

  // 3. Language Switcher Logic
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      const lang = btn.dataset.lang;
      document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
      setLanguage(lang);
      localStorage.setItem('mqlc_lang', lang);
    });
  });

  function setLanguage(lang) {
    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.dataset[lang] || el.dataset.en;
      if (text) {
        if (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'checkbox') {
          el.placeholder = text;
        } else if (el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    document.querySelectorAll('.premium-input[data-placeholder-en]').forEach(el => {
      const text = el.dataset[`placeholder-${lang}`] || el.dataset['placeholder-en'];
      if (text) el.placeholder = text;
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ur') ? 'rtl' : 'ltr';
  }

  // Initial Sync
  const savedLang = localStorage.getItem('mqlc_lang') || 'en';
  document.querySelectorAll(`.lang-btn`).forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.lang-btn[data-lang="${savedLang}"]`).forEach(b => b.classList.add('active'));
  setLanguage(savedLang);

});
