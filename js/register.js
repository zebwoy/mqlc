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
  const stageForm = document.getElementById('stage-form');
  const stageSuccess = document.getElementById('stage-success');

  const inputPin = document.getElementById('input-pin');
  const btnVerify = document.getElementById('btn-verify-pin');
  const authStatus = document.getElementById('auth-status');

  const form = document.getElementById('parent-registration-form');
  const btnSubmit = document.getElementById('btn-submit');
  const submitStatus = document.getElementById('submit-status');

  let verifiedPinId = null;

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
        btnVerify.textContent = "Verifying...";
        authStatus.textContent = "";

        // Query database for this PIN
        const { data, error } = await window._supabase
          .from('otp_pins')
          .select('*')
          .eq('pin', pinVal)
          .eq('is_valid', true)
          .single();

        if (error || !data) {
          throw new Error("Invalid or expired PIN.");
        }

        // Valid pin found!
        verifiedPinId = data.id; // Store ID to invalidate it later
        
        // Transition Stages
        stageAuth.classList.remove('active');
        stageForm.classList.add('active');

      } catch (err) {
        authStatus.textContent = "Incorrect or Expired PIN. Please contact the administrator.";
        inputPin.value = "";
      } finally {
        btnVerify.disabled = false;
        btnVerify.textContent = "Establish Connection \u2192";
      }
    });
  }

  // Allow enter key
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

      // Collect Date of Joining (implicitly today)
      const today = new Date().toISOString().split('T')[0];

      // Auto-Generate smart Form No: MQLC-26-[XXXX]
      const yearStr = new Date().getFullYear().toString().substring(2);
      const randomAlphanumeric = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedFormNo = `MQLC-${yearStr}-${randomAlphanumeric}`;

      // Collect Form Data
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
        school_name: fd.get('school_name'),
        school_days: Array.from(form.querySelectorAll('input[name="school_days_arr"]:checked')).map(cb => cb.value).join(', '),
        school_time: `${fd.get('school_time_from')} - ${fd.get('school_time_to')}`,
        status: 'pending' // explicitly set queue state
      };

      try {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Submitting Application...";
        submitStatus.textContent = "";

        // 1. Insert Registration
        const { error: regError } = await window._supabase
          .from('student_registrations')
          .insert([payload]);

        if (regError) throw regError;

        // 2. Invalidate PIN so it can't be reused!
        const { error: pinError } = await window._supabase
          .from('otp_pins')
          .update({ is_valid: false })
          .eq('id', verifiedPinId);

        if (pinError) console.error("Warning: Failed to invalidate PIN.", pinError);

        // 3. Move to Success Screen
        stageForm.classList.remove('active');
        stageSuccess.classList.add('active');

      } catch (err) {
        console.error(err);
        submitStatus.textContent = "An error occurred while submitting: " + err.message;
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Submit Application &rarr;";
      }
    });
  }
});
