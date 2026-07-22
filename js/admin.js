/* ─── js/admin.js ──────────────────────────────────────────────── */

// ⚠️ REQUIRED: Cloudinary Unsigned Upload Preset
// You must go to Cloudinary Settings -> Upload -> Add Upload Preset
// Set 'Signing Mode' to 'Unsigned' and set the Folder to `home/mqlc/updates`
const CLOUDINARY_CLOUD_NAME = 'dlcowjk3q';
const CLOUDINARY_UPLOAD_PRESET = 'wrye55gv'; // REPLACE THIS

document.addEventListener('DOMContentLoaded', () => {

  let exitDatePicker, paymentDatePicker, bulkPaymentDatePicker;

  // Initialize reusable custom date pickers
  exitDatePicker = new CustomDatePicker({
    container: '#exit-datepicker',
    input: '#edit-exit-date'
  });

  paymentDatePicker = new CustomDatePicker({
    container: '#pay-datepicker',
    input: '#pay-date'
  });

  bulkPaymentDatePicker = new CustomDatePicker({
    container: '#bulk-pay-datepicker',
    input: '#bulk-pay-date'
  });

  // Initialize reusable custom select dropdowns
  document.querySelectorAll('select').forEach(select => {
    new CustomSelect(select);
  });

  // ─── 0. DATE UI ENHANCEMENTS (FLATPICKR) ──────────────────────
  if (typeof flatpickr !== 'undefined') {
    flatpickr("input[type=date]", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "F j, Y",
    });
    flatpickr("input[type=time]", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "h:i K"
    });
  }

  // ─── 1. TAB ROUTING ───────────────────────────────────────────
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item, .mobile-bottom-nav .nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.style.display = 'none');

      // Activate target
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).style.display = 'block';

      // Keep both desktop and mobile buttons in sync
      document.querySelectorAll(`.nav-item[data-target="${targetId}"]`).forEach(
        matchingBtn => matchingBtn.classList.add('active')
      );
    });
  });
  // ─── 1B. MOBILE MORE MENU (Popover) ────────────────────────────────
  const btnMobileMore = document.getElementById('btn-mobile-more');
  const mobileMoreMenu = document.getElementById('mobile-more-menu');
  const btnMobileLogout = document.getElementById('btn-mobile-logout');

  if (btnMobileMore && mobileMoreMenu) {
    btnMobileMore.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMoreMenu.style.display = mobileMoreMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Dismiss on outside tap
    document.addEventListener('click', () => {
      mobileMoreMenu.style.display = 'none';
    });
    mobileMoreMenu.addEventListener('click', (e) => e.stopPropagation());

    // Settings button — navigate to tab and close popover
    const mobileSettingsBtn = mobileMoreMenu.querySelector('.nav-item[data-target="tab-settings"]');
    if (mobileSettingsBtn) {
      mobileSettingsBtn.addEventListener('click', () => {
        mobileMoreMenu.style.display = 'none';
      });
    }
  }

  // Mobile Sign Out
  if (btnMobileLogout && window._supabase) {
    btnMobileLogout.addEventListener('click', async () => {
      mobileMoreMenu.style.display = 'none';
      await window._supabase.auth.signOut();
    });
  }
  // ─── 2. CLOUDINARY MEDIA WIDGET ───────────────────────────────
  const cardUploadUpdates = document.getElementById('card-upload-updates');
  const cardUploadBulletin = document.getElementById('card-upload-bulletin');
  const cardUploadQuiz = document.getElementById('card-upload-quiz');
  const statusUpdates = document.getElementById('status-updates');
  const statusBulletin = document.getElementById('status-bulletin');
  const statusQuiz = document.getElementById('status-quiz');

  if (typeof cloudinary !== 'undefined') {
    if (CLOUDINARY_UPLOAD_PRESET === 'YOUR_UNSIGNED_PRESET_NAME') {
      console.warn("Action Required: Please add your Cloudinary Upload Preset to js/admin.js first!");
    } else {

      const configBase = {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url'],
        multiple: true,
        maxFiles: 10,
        showAdvancedOptions: false,
        cropping: false,
        styles: {
          palette: {
            window: "#FFFFFF", windowBorder: "#E2E8F0", tabIcon: "#2D6A4F", menuIcons: "#1E293B", textDark: "#1E293B", textLight: "#FFFFFF", link: "#2D6A4F", action: "#D4A017", inactiveTabIcon: "#64748B", error: "#EF4444", inProgress: "#2D6A4F", complete: "#31C48D", sourceBg: "#F5F7FA"
          }
        }
      };

      // Create two strict instances ahead of time so Cloudinary isolates the folders!
      // This also totally eliminates iframe loading latency when the admin clicks the UI.
      const widgetUpdates = cloudinary.createUploadWidget(
        { ...configBase, folder: 'home/mqlc/updates', tags: ['updates'] },
        (error, result) => {
          if (!error && result && result.event === "success") {
            toast.success('Upload Successful! The new media is now live on the Updates slider.');
          }
          if (result && (result.event === 'abort' || result.event === 'close' || result.event === 'success')) {
            if (statusUpdates) statusUpdates.innerHTML = 'Open Uploader &rarr;';
          }
        }
      );

      const widgetBulletin = cloudinary.createUploadWidget(
        { ...configBase, folder: 'home/mqlc/bulletin', tags: ['bulletin'] },
        (error, result) => {
          if (!error && result && result.event === "success") {
            toast.success('Upload Successful! The file is now live on the Bulletin Board.');
          }
          if (result && (result.event === 'abort' || result.event === 'close' || result.event === 'success')) {
            if (statusBulletin) statusBulletin.innerHTML = 'Open Uploader &rarr;';
          }
        }
      );

      const widgetQuiz = cloudinary.createUploadWidget(
        { ...configBase, folder: 'home/mqlc/bulletin', tags: ['bulletin', 'quiz'] },
        (error, result) => {
          if (!error && result && result.event === "success") {
            toast.success('Quiz Upload Successful! The new interactive quiz has been published to your bulletin board.');
          }
          if (result && (result.event === 'abort' || result.event === 'close' || result.event === 'success')) {
            if (statusQuiz) statusQuiz.innerHTML = 'Upload JSON &rarr;';
          }
        }
      );

      function hookWidget(cardEl, widget, statusEl) {
        if (!cardEl) return;
        const trigger = (e) => {
          if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
          if (e.type === 'keydown') e.preventDefault();

          if (statusEl) statusEl.innerHTML = 'Loading Uploader...';
          widget.open();
        };
        cardEl.addEventListener("click", trigger);
        cardEl.addEventListener("keydown", trigger);
      }

      hookWidget(cardUploadUpdates, widgetUpdates, statusUpdates);
      hookWidget(cardUploadBulletin, widgetBulletin, statusBulletin);
      hookWidget(cardUploadQuiz, widgetQuiz, statusQuiz);
    }
  }

  // ─── 3. STUDENT MANAGEMENT / OTP & VERIFICATION FLOW ────────

  // 3a. Horizontal Nav Switching
  const pillNavs = document.querySelectorAll('.pill-nav');
  const subPanes = document.querySelectorAll('.sub-pane');

  pillNavs.forEach(pill => {
    pill.addEventListener('click', () => {
      const activeTabId = pill.getAttribute('data-sub');

      // Save active tab state in localStorage
      localStorage.setItem('mqlc_active_tab', activeTabId);

      // Remove active classes
      pillNavs.forEach(p => {
        p.classList.remove('active');
        p.style.background = 'transparent';
        p.style.color = 'var(--admin-text)';
      });
      subPanes.forEach(s => s.style.display = 'none');

      // Add active state to clicked pill
      pill.classList.add('active');
      pill.style.background = 'var(--admin-accent)';
      pill.style.color = 'white';

      // Show Target Sub View
      const targetSub = document.getElementById(activeTabId);
      if (targetSub) targetSub.style.display = 'block';

      // Form number generation is handled by:
      //   • hydrateActiveTab() on page load (pre-generates for all tabs)
      //   • manualPillBtn click listener (inside if(manualForm) block, handles re-visits)
      // Calling initManualFormNumber here would crash — it's a let in TDZ when
      // activePill.click() fires during page restore (before its declaration at line ~466).
    });
  });

  // Restore active tab from localStorage on page load
  const savedTab = localStorage.getItem('mqlc_active_tab') || 'sub-dashboard';
  const activePill = document.querySelector(`[data-sub="${savedTab}"]`);
  if (activePill) {
    activePill.click();
  } else {
    const firstPill = document.querySelector('[data-sub]');
    if (firstPill) firstPill.click();
  }

  // 3b. Generate OTP PIN Logic
  const btnGenerateOtp = document.getElementById('btn-generate-otp');
  const otpDisplay = document.getElementById('otp-display');

  if (btnGenerateOtp) {
    btnGenerateOtp.addEventListener('click', async () => {
      if (!window._supabase) {
        toast.error("Supabase not initialized.");
        return;
      }
      btnGenerateOtp.disabled = true;
      btnGenerateOtp.textContent = "Generating...";

      // Generate 6 digit random pin
      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      const otpPromise = (async () => {
        const { error } = await window._supabase.from('otp_pins').insert([{ pin: pin }]);
        if (error) throw error;
        return pin;
      })();

      toast.promise(otpPromise, {
        loading: "Generating secure OTP PIN...",
        success: "OTP PIN generated successfully!",
        error: (err) => `Failed to generate PIN: ${err.message}`
      });

      try {
        await otpPromise;
        otpDisplay.textContent = pin;
        otpDisplay.style.color = 'var(--admin-accent)';
      } catch (err) {
        console.error("OTP Gen Error:", err);
      } finally {
        btnGenerateOtp.disabled = false;
        btnGenerateOtp.textContent = "Generate New PIN";
      }
    });
  }

  // 3c. Load & Render Pending Approvals
  const tbodyPending = document.getElementById('tbody-pending');
  let pendingApplications = [];

  async function loadPendingApprovals() {
    if (!tbodyPending || !window._supabase) return;
    try {
      // Fetch pendings
      const { data, error } = await window._supabase
        .from('student_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('id', { ascending: false });

      if (error) throw error;

      pendingApplications = data || [];
      tbodyPending.innerHTML = '';

      if (pendingApplications.length === 0) {
        tbodyPending.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--admin-muted); padding: 2rem;">No pending approvals found.</td></tr>';
        return;
      }

      pendingApplications.forEach(app => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);">${escapeHTML(app.form_no || 'N/A')}</td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border); font-weight: 500;">${escapeHTML(app.student_name)}</td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);">${escapeHTML(app.course_applying)}</td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);"><span style="background: rgba(212, 160, 23, 0.2); color: #B08200; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${escapeHTML(app.status.toUpperCase())}</span></td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);"><button class="btn-review" data-id="${app.id}" style="background: var(--admin-bg); border: 1px solid var(--admin-border); padding: 0.5rem 1rem; border-radius: 6px; cursor:pointer; font-weight: 600;">Review</button></td>
        `;
        tbodyPending.appendChild(tr);
      });

      // Hook up Review buttons
      document.querySelectorAll('.btn-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          openDecisionModal(id);
        });
      });

    } catch (err) {
      console.error('Error fetching pendings:', err);
      tbodyPending.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-danger); padding: 2rem;">Failed to load data.</td></tr>`;
    }
  }

  // Initial Fetch logic
  if (tbodyPending) {
    loadPendingApprovals();
  }

  // 3d. The Decision Modal Flow
  const modalDecision = document.getElementById('modal-decision');
  const modalStudentDetails = document.getElementById('modal-student-details');
  const modalHiddenId = document.getElementById('modal-hidden-id');
  const btnTriggerApprove = document.getElementById('btn-modal-trigger-approve');
  const btnTriggerReject = document.getElementById('btn-modal-trigger-reject');
  const promptApprove = document.getElementById('modal-prompt-approve');
  const promptReject = document.getElementById('modal-prompt-reject');
  const divFinalActions = document.getElementById('modal-final-actions');
  const triggerGroup = document.getElementById('modal-trigger-group');
  const btnConfirmDec = document.getElementById('btn-modal-confirm');
  const btnCancelDec = document.getElementById('btn-modal-cancel');
  let currentDecisionType = null;

  function resetModalState() {
    promptApprove.style.display = 'none';
    promptReject.style.display = 'none';
    divFinalActions.style.display = 'none';
    triggerGroup.style.display = 'flex';
    document.getElementById('modal-feedback').textContent = '';
    currentDecisionType = null;
  }

  function openDecisionModal(id) {
    if (!modalDecision || !pendingApplications) return;
    const app = pendingApplications.find(a => a.id.toString() === id.toString());
    if (!app) return;

    resetModalState();
    modalHiddenId.value = app.id;
    document.getElementById('modal-student-name').textContent = "Review: " + app.student_name;

    // Inject all metadata natively
    modalStudentDetails.innerHTML = `
      <strong>Form Info:</strong> ${escapeHTML(app.form_no || 'N/A')} | ${escapeHTML(app.course_applying || 'N/A')}<br>
      <strong>Father:</strong> ${escapeHTML(app.father_name)} (${escapeHTML(app.contact_father)})<br>
      <strong>Mother:</strong> ${escapeHTML(app.contact_mother || 'N/A')}<br>
      <strong>DOB:</strong> ${escapeHTML(app.dob)} | <strong>Gender:</strong> ${escapeHTML(app.gender)}<br>
      <strong>Address:</strong> ${escapeHTML(app.address)}<br>
      <hr style="border:0; border-top: 1px solid var(--admin-border); margin: 0.5rem 0;">
      <strong>School:</strong> ${escapeHTML(app.school_name)} (Class ${escapeHTML(app.current_class || 'N/A')})<br>
      <strong>School Days:</strong> ${escapeHTML(app.school_days || 'N/A')}<br>
      <strong>School Time:</strong> ${escapeHTML(app.school_time || 'N/A')}<br>
    `;

    modalDecision.showModal();
  }

  if (btnTriggerApprove && btnTriggerReject) {
    btnTriggerApprove.addEventListener('click', () => {
      triggerGroup.style.display = 'none';
      promptApprove.style.display = 'block';
      divFinalActions.style.display = 'flex';
      currentDecisionType = 'approve';
      btnConfirmDec.style.background = 'var(--admin-accent)';
      btnConfirmDec.textContent = "Confirm Approval";
    });

    btnTriggerReject.addEventListener('click', () => {
      triggerGroup.style.display = 'none';
      promptReject.style.display = 'block';
      divFinalActions.style.display = 'flex';
      currentDecisionType = 'reject';
      btnConfirmDec.style.background = 'var(--admin-danger)';
      btnConfirmDec.textContent = "Confirm Rejection";
    });

    btnCancelDec.addEventListener('click', () => {
      resetModalState();
    });

    btnConfirmDec.addEventListener('click', async () => {
      const id = modalHiddenId.value;
      const feedback = document.getElementById('modal-feedback');
      feedback.textContent = 'Processing request...';
      feedback.className = 'status-msg';

      if (currentDecisionType === 'approve') {
        const fee = parseInt(document.getElementById('input-assign-fee').value) || 0;
        if (!fee) {
          feedback.textContent = 'Please enter a valid monthly fee.';
          feedback.classList.add('error');
          return;
        }
        const isPrepaidOnApprove = document.getElementById('input-assign-is-prepaid')?.value === 'true';

        try {
          const { error } = await window._supabase
            .from('student_registrations')
            .update({ status: 'approved', monthly_fee: fee, is_prepaid: isPrepaidOnApprove })
            .eq('id', id);
          if (error) throw error;

          // Auto-record the admission payment against the smart month (DOJ slab)
          const pendingStudent = cachedStudents.find(s => s.id.toString() === id.toString());
          await recordAdmissionPayment(id, pendingStudent?.doj, fee);

          modalDecision.close();
          loadPendingApprovals();
        } catch (err) {
          feedback.textContent = "Failed to approve: " + err.message;
          feedback.classList.add('error');
        }

      } else if (currentDecisionType === 'reject') {
        const reason = document.getElementById('input-reject-reason').value;
        if (!reason) {
          feedback.textContent = 'Please provide a valid rejection reason.';
          feedback.classList.add('error');
          return;
        }

        try {
          const { error } = await window._supabase
            .from('student_registrations')
            .update({ status: 'rejected', rejection_reason: reason })
            .eq('id', id);
          if (error) throw error;

          modalDecision.close();
          loadPendingApprovals();
        } catch (err) {
          feedback.textContent = "Failed to reject: " + err.message;
          feedback.classList.add('error');
        }
      }
    });
  }

  const manualForm = document.getElementById('registration-form');
  const manualStatusMsg = document.getElementById('reg-status');
  // Pre-declared here so hydrateActiveTab (outside the if-block) can reference it.
  // async function declarations inside blocks are strictly block-scoped — they do NOT
  // get the legacy var-hoisting that plain function declarations get in sloppy mode.
  let initManualFormNumber = null;

  if (manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!window._supabase) {
        if (manualStatusMsg) {
          manualStatusMsg.textContent = 'Error: Supabase client is not initialized.';
          manualStatusMsg.className = 'status-msg error';
        }
        return;
      }

      // 1. Validation Logic: At least one contact number
      const fd = new FormData(manualForm);
      const contactFather = fd.get('contact_father');
      const contactMother = fd.get('contact_mother');

      if (!contactFather && !contactMother) {
        manualStatusMsg.textContent = 'Validation Error: Please provide at least one contact number (Father or Mother).';
        manualStatusMsg.className = 'status-msg error';
        manualStatusMsg.style.display = 'block';
        return;
      }

      // Fee from the form field — optional, defaults to ₹300 if not entered
      const feeVal = parseInt(fd.get('monthly_fee') || 0) || 300;

      try {
        const btn = document.getElementById('btn-submit-reg');
        btn.textContent = 'Saving Record...';
        btn.disabled = true;

        const dojVal = fd.get('doj') || null;

        const payload = {
          doj: dojVal,
          form_no: fd.get('form_no') || null,
          course_applying: fd.get('course_applying') || 'Unassigned',
          student_name: fd.get('student_name') || null,
          father_name: fd.get('father_name') || null,
          gender: fd.get('gender') || null,
          dob: fd.get('dob') || null,
          aadhar_no: fd.get('aadhar_no') || null,
          address: fd.get('address') || null,
          contact_father: contactFather || null,
          contact_mother: contactMother || null,
          current_class: fd.get('current_class') || null,
          school_name: 'N/A',
          school_days: 'N/A',
          school_time: 'N/A',
          batch: fd.get('batch') || null,
          monthly_fee: feeVal,
          is_prepaid: fd.get('is_prepaid') === 'true',
          status: 'approved' // explicitly bypass queue and auto-approve manual entries
        };

        const { data, error } = await window._supabase
          .from('student_registrations')
          .insert([payload])
          .select('id, doj');

        if (error) throw error;

        // Auto-record the admission payment against the smart month
        if (data && data[0]) {
          await recordAdmissionPayment(data[0].id, data[0].doj || dojVal, feeVal);
        }

        manualForm.reset();

        // Reset all form components to their defaults
        if (window._regGender) window._regGender.setValue('Male');
        if (window._regAadhar) window._regAadhar.reset();
        if (window._regDoj) window._regDoj.setValue(new Date().toISOString().split('T')[0]);
        if (window._regDob) window._regDob.reset();
        // Sync all CustomSelect wrappers inside the form back to their reset values
        manualForm.querySelectorAll('.custom-select-wrapper').forEach(w => {
          if (w._csInstance) w._csInstance.syncOptions();
        });

        manualStatusMsg.textContent = `✅ Student registered and ₹${feeVal.toLocaleString('en-IN')} admission fee recorded for ${feeMonthLabel ? feeMonthLabel(computeAdmissionFeeMonth(dojVal)) : computeAdmissionFeeMonth(dojVal)}.`;
        manualStatusMsg.className = 'status-msg success';
        manualStatusMsg.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
          manualStatusMsg.style.display = 'none';
          manualStatusMsg.textContent = '';
        }, 5000);

        // Regenerate a fresh form number for the next entry
        await initManualFormNumber();
      } catch (err) {
        console.error(err);
        manualStatusMsg.textContent = `Failed to save: ${err.message}`;
        manualStatusMsg.className = 'status-msg error';
        manualStatusMsg.style.display = 'block';
      } finally {
        const btn = document.getElementById('btn-submit-reg');
        btn.textContent = 'Submit Registration';
        btn.disabled = false;
      }
    });

    // ─── Initialise reusable components in the manual entry form ────────

    function initManualEntryComponents() {
      // RadioGroup for Gender
      const genderHost = document.getElementById('reg-gender-host');
      if (genderHost && typeof RadioGroup !== 'undefined' && !genderHost.dataset.init) {
        genderHost.dataset.init = '1';
        window._regGender = new RadioGroup(genderHost, {
          name: 'gender',
          options: [
            { value: 'Male', label: '👨 Male' },
            { value: 'Female', label: '👩 Female' }
          ],
          value: 'Male'
        });
      }

      // AadharInput — 3-box XXXX-XXXX-XXXX
      const aadharHost = document.getElementById('reg-aadhar-host');
      if (aadharHost && typeof AadharInput !== 'undefined' && !aadharHost.dataset.init) {
        aadharHost.dataset.init = '1';
        window._regAadhar = new AadharInput(aadharHost, { name: 'aadhar_no' });
      }

      // SmartDateInput — DOJ (defaults to today)
      const dojEl = document.getElementById('reg-doj');
      if (dojEl && typeof SmartDateInput !== 'undefined' && !dojEl.dataset.sdiInit) {
        dojEl.dataset.sdiInit = '1';
        window._regDoj = new SmartDateInput(dojEl);
        window._regDoj.setValue(new Date().toISOString().split('T')[0]);
      }

      // SmartDateInput — DOB (no default)
      const dobEl = document.getElementById('reg-dob');
      if (dobEl && typeof SmartDateInput !== 'undefined' && !dobEl.dataset.sdiInit) {
        dobEl.dataset.sdiInit = '1';
        window._regDob = new SmartDateInput(dobEl);
      }

      // CustomSelect for form dropdowns is handled globally at startup
      // (document.querySelectorAll('select') wraps all selects at line ~30).
      // Re-wrapping here would create a double-dropdown. Skip.
    }

    // Init once on first load
    initManualEntryComponents();

    // Auto-generate Form Number (MQLC-YYYY-XXXX)
    initManualFormNumber = async function initManualFormNumber() {
      const formNoInput = manualForm.querySelector('input[name="form_no"]');
      if (!formNoInput || !window._supabase) return;

      formNoInput.value = "";
      formNoInput.placeholder = "Auto-generating...";
      const currentYear = new Date().getFullYear();
      const prefix = `MQLC-${currentYear}-`;

      try {
        // Find the highest sequence number for the current year
        const { data, error } = await window._supabase
          .from('student_registrations')
          .select('form_no')
          .ilike('form_no', `${prefix}%`)
          .order('form_no', { ascending: false })
          .limit(1);

        if (error) throw error;

        let nextNum = 1;
        if (data && data.length > 0) {
          const lastFormNo = data[0].form_no;
          const parts = lastFormNo.split('-');
          const lastSeq = parseInt(parts[parts.length - 1]);
          if (!isNaN(lastSeq)) {
            nextNum = lastSeq + 1;
          }
        }

        formNoInput.value = `${prefix}${nextNum.toString().padStart(4, '0')}`;
        formNoInput.dataset.generated = 'true'; // Mark as auto-generated
      } catch (err) {
        console.error("Form No Gen Failure:", err);
        formNoInput.value = `${prefix}0001`; // Fallback to start
      }
    }

    // Generate form number only when Manual Entry tab is opened
    const manualPillBtn = document.querySelector('[data-sub="sub-manual"]');
    if (manualPillBtn) {
      manualPillBtn.addEventListener('click', () => {
        // Only regenerate if the field is empty or stale
        const fi = manualForm.querySelector('input[name="form_no"]');
        if (!fi || !fi.value) {
          initManualFormNumber();
        }
      });
    }

  } // end if (manualForm)

  let cachedStudents = [];
  let initialLoadDone = false;

  function renderStudentMatrix() {
    const feedContainer = document.getElementById('ds-activity-feed');
    if (!feedContainer) return;

    const searchTerm = (document.getElementById('ds-filter-search')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('ds-filter-status')?.value || 'all';
    const batchFilter = document.getElementById('ds-filter-batch')?.value || 'all';
    const courseFilter = document.getElementById('ds-filter-course')?.value || 'all';


    let filtered = [...(cachedStudents || [])].sort((a, b) => new Date(b.created_at || b.doj) - new Date(a.created_at || a.doj));

    // Handle Category Filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    } else {
      // Default array visualization (hides rejected unless explicitly requested or searched)
      if (!searchTerm) {
        filtered = filtered.filter(s => s.status !== 'rejected');
      }
    }

    // Handle Batch Filter
    if (batchFilter !== 'all') {
      if (batchFilter === 'unassigned') {
        filtered = filtered.filter(s => !s.batch || s.batch === '' || s.batch === 'null' || s.batch === 'undefined');
      } else {
        filtered = filtered.filter(s => s.batch === batchFilter);
      }
    }

    // Handle Course Filter
    if (courseFilter !== 'all') {
      if (courseFilter.toLowerCase() === 'unassigned') {
        filtered = filtered.filter(s => !s.course_applying || s.course_applying === '' || s.course_applying === 'null' || s.course_applying === 'undefined' || s.course_applying.toLowerCase() === 'unassigned');
      } else {
        filtered = filtered.filter(s => s.course_applying === courseFilter);
      }
    }

    // Handle Text Filter
    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.student_name || '').toLowerCase().includes(searchTerm) ||
        (s.form_no || '').toLowerCase().includes(searchTerm)
      );
    }

    feedContainer.innerHTML = '';

    // Update Counter
    const countEl = document.getElementById('ds-filter-count');
    if (countEl) countEl.textContent = `Showing ${filtered.length} student${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      feedContainer.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">No students found matching filter criteria.</p>';
      return;
    }

    // Sort: Group by batch, then alphabetically by name within each batch
    const batchOrder = ['Zuhr', 'Asr', 'Maghrib'];
    filtered.sort((a, b) => {
      const batchA = batchOrder.indexOf(a.batch) === -1 ? 99 : batchOrder.indexOf(a.batch);
      const batchB = batchOrder.indexOf(b.batch) === -1 ? 99 : batchOrder.indexOf(b.batch);
      if (batchA !== batchB) return batchA - batchB;
      return (a.student_name || '').localeCompare(b.student_name || '');
    });

    // Group students by batch for section headers
    const groups = {};
    filtered.forEach(app => {
      const key = app.batch || 'Unassigned';
      if (!groups[key]) groups[key] = [];
      groups[key].push(app);
    });

    // Render with batch section headers
    const orderedKeys = [...batchOrder.filter(b => groups[b]), ...(groups['Unassigned'] ? ['Unassigned'] : [])];

    orderedKeys.forEach(batchName => {
      const students = groups[batchName];
      // Batch section header
      feedContainer.innerHTML += `
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.5rem; margin-top: 0.75rem; border-bottom: 2px solid var(--admin-accent); margin-bottom: 2%;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--admin-accent); text-transform: uppercase; letter-spacing: 0.5px;">${batchName} Batch</span>
          <span style="font-size: 0.7rem; background: var(--admin-bg); color: var(--admin-muted); padding: 2px 8px; border-radius: 10px; font-weight: 500;">${students.length}</span>
        </div>`;

      students.forEach(app => {
        let stClass = app.status === 'approved' ? 'approved' :
          (app.status === 'rejected' ? 'rejected' :
            (app.status === 'left' ? 'rejected' : 'pending'));

        let relation = 'child';
        if (app.gender === 'Male') relation = 'son';
        else if (app.gender === 'Female') relation = 'daughter';
        let parentSubtext = '';
        if (app.father_name && app.father_name.trim() !== '' && app.father_name !== 'N/A') {
          parentSubtext = ` <span style="font-size: 0.8rem; font-weight: 500; color: var(--admin-muted);">(${escapeHTML(relation)} of ${escapeHTML(app.father_name)})</span>`;
        }

        feedContainer.innerHTML += `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="activity-detail">
            <h4 style="margin-bottom: 0.25rem;">${escapeHTML(app.student_name)}${app.is_prepaid ? `<span style="font-size:0.65rem;background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:4px;font-weight:600;margin-left:5px;vertical-align:middle;">Prepaid</span>` : ''}${parentSubtext}</h4>
            <p style="font-size: 0.8rem; margin-bottom: 0.25rem;">${escapeHTML(app.course_applying)} | Form: ${escapeHTML(app.form_no || 'N/A')}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${app.status === 'left' ? `
                <span style="font-size: 0.7rem; background: #fde8e8; color: #c53030; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">Inactive</span>
                ${app.exit_reason ? (() => {
                  const r = escapeHTML(app.exit_reason);
                  const displayReason = app.exit_reason.startsWith('Other: ')
                    ? `Other (${escapeHTML(app.exit_reason.slice(7))})`
                    : r;
                  return `<span style="font-size: 0.7rem; background: #f3f4f6; color: #4b5563; padding: 2px 6px; border-radius: 4px; font-weight: 500;">Reason: ${displayReason}</span>`;
                })() : ''}
              ` : ''}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge ${stClass}">${app.status}</span>
            <button class="btn-view-profile" data-id="${app.id}" style="background: none; border: none; cursor: pointer; color: var(--admin-muted); display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; transition: background 0.2s;" title="View Student Profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
            </button>
            <button class="btn-edit-student" data-id="${app.id}" style="background: none; border: none; cursor: pointer; color: var(--admin-muted); display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; transition: background 0.2s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
            </button>
          </div>
        </div>`;
      });
    });

    // Hook up Edit buttons
    document.querySelectorAll('.btn-edit-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Hook up View Profile buttons
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openProfileModal(id);
      });
    });
  }

  // ─── Edit Student Logic ────────
  async function openEditModal(id) {
    const student = cachedStudents.find(s => s.id.toString() === id.toString());
    if (!student) return;

    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-student-name').value = student.student_name;
    document.getElementById('edit-student-father').value = student.father_name;
    document.getElementById('edit-student-batch').value = student.batch || 'Zuhr';
    document.getElementById('edit-student-course').value = student.course_applying || 'Noorani Qaida';

    // Fee mode
    const feeModeSel = document.getElementById('edit-is-prepaid');
    if (feeModeSel) feeModeSel.value = student.is_prepaid ? 'true' : 'false';

    const statusVal = student.status || 'approved';
    document.getElementById('edit-student-status').value = statusVal;

    // Set exit audit values
    const exitDateVal = student.exit_date || '';
    const exitReasonVal = student.exit_reason || '';
    const exitNotesVal = student.exit_notes || '';

    const dateVal = exitDateVal ? new Date(exitDateVal) : new Date();
    if (exitDatePicker) {
      exitDatePicker.selectDate(dateVal);
      if (!exitDateVal) {
        document.getElementById('edit-exit-date').value = '';
        exitDatePicker.displayEl.textContent = 'Select date';
      }
    }

    const reasonInput = document.getElementById('edit-exit-reason');
    if (reasonInput) reasonInput.value = exitReasonVal;
    const notesInput = document.getElementById('edit-exit-notes');
    if (notesInput) notesInput.value = exitNotesVal;

    // Apply status UX state (collapses/expands non-exit fields and toggles exit section)
    applyStatusUX(statusVal);

    // Handle the Other reason field on modal open
    const otherField = document.getElementById('edit-exit-other-field');
    const otherText = document.getElementById('edit-exit-other-text');
    if (otherField && reasonInput) {
      // Detect if stored reason starts with 'Other: '
      const isOtherReason = exitReasonVal.startsWith('Other: ') || exitReasonVal === 'Other';
      if (isOtherReason && statusVal === 'left') {
        reasonInput.value = 'Other';
        // Sync the CustomSelect wrapper label to reflect the changed value
        const csWrap = reasonInput.closest('.custom-select-wrapper') || reasonInput.parentElement?.closest('.custom-select-wrapper');
        if (csWrap && csWrap._csInstance) csWrap._csInstance.syncOptions();
        if (otherText && exitReasonVal.startsWith('Other: ')) {
          otherText.value = exitReasonVal.slice(7); // strip 'Other: ' prefix
        }
        otherField.style.display = 'block';
        otherField.classList.add('exit-other-field--visible');
        otherText.required = true;
      } else {
        otherField.style.display = 'none';
        otherField.classList.remove('exit-other-field--visible');
        if (otherText) { otherText.value = ''; otherText.required = false; }
      }
    }

    document.getElementById('edit-status-msg').style.display = 'none';
    document.getElementById('modal-edit-student').showModal();
  }

  // ─── Helpers: toggle non-exit fields and exit audit section ───
  function applyStatusUX(statusVal) {
    const nonExitFields = document.getElementById('edit-non-exit-fields');
    const exitSection = document.getElementById('edit-exit-audit-section');
    const exitReason = document.getElementById('edit-exit-reason');

    if (statusVal === 'left') {
      // Collapse the non-exit fields with animation
      if (nonExitFields) {
        nonExitFields.classList.add('edit-non-exit-fields--collapsed');
      }
      if (exitSection) {
        exitSection.style.display = 'block';
        // Trigger animation by briefly removing the class then re-adding
        exitSection.classList.remove('exit-audit-section');
        void exitSection.offsetWidth; // reflow
        exitSection.classList.add('exit-audit-section');
      }
      if (exitReason) exitReason.required = true;

      // Auto-set today's date if not already set
      const editExitDate = document.getElementById('edit-exit-date');
      if (editExitDate && !editExitDate.value && exitDatePicker) {
        exitDatePicker.selectDate(new Date());
      }
    } else {
      // Restore non-exit fields
      if (nonExitFields) {
        nonExitFields.classList.remove('edit-non-exit-fields--collapsed');
      }
      if (exitSection) exitSection.style.display = 'none';
      if (exitReason) exitReason.required = false;
    }
  }

  // Change listener to show/hide exit audit section dynamically
  const editStatusSelect = document.getElementById('edit-student-status');
  const editExitSection = document.getElementById('edit-exit-audit-section');
  const editExitDate = document.getElementById('edit-exit-date');
  const editExitReason = document.getElementById('edit-exit-reason');

  if (editStatusSelect && editExitSection) {
    editStatusSelect.addEventListener('change', () => {
      applyStatusUX(editStatusSelect.value);
    });
  }

  // Show/hide the 'Other' custom text input based on reason selection
  if (editExitReason) {
    editExitReason.addEventListener('change', () => {
      const otherField = document.getElementById('edit-exit-other-field');
      const otherText = document.getElementById('edit-exit-other-text');
      if (otherField) {
        if (editExitReason.value === 'Other') {
          otherField.style.display = 'block';
          otherField.classList.remove('exit-other-field--hidden');
          otherField.classList.add('exit-other-field--visible');
          if (otherText) otherText.required = true;
        } else {
          otherField.classList.remove('exit-other-field--visible');
          otherField.classList.add('exit-other-field--hidden');
          setTimeout(() => { otherField.style.display = 'none'; }, 250);
          if (otherText) { otherText.required = false; otherText.value = ''; }
        }
      }
    });
  }

  const editForm = document.getElementById('form-edit-student');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-student-id').value;
      const statusMsg = document.getElementById('edit-status-msg');
      const statusVal = document.getElementById('edit-student-status').value;
      const submitBtn = editForm.querySelector('button[type="submit"]');

      // ── Immediate feedback: disable button, show spinner text ──
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.4rem;"><svg style="animation:loaderSpin 0.7s linear infinite" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Saving…</span>';
      }

      // Hide any stale inline status
      statusMsg.style.display = 'none';
      statusMsg.textContent = '';

      const payload = {
        student_name: document.getElementById('edit-student-name').value,
        father_name: document.getElementById('edit-student-father').value,
        batch: document.getElementById('edit-student-batch').value,
        course_applying: document.getElementById('edit-student-course').value,
        status: statusVal,
        is_prepaid: document.getElementById('edit-is-prepaid')?.value === 'true'
      };

      if (statusVal === 'left') {
        let adminEmail = 'admin';
        try {
          const { data: { session } } = await window._supabase.auth.getSession();
          if (session?.user?.email) adminEmail = session.user.email;
        } catch (_) { }

        payload.exit_date = document.getElementById('edit-exit-date')?.value || new Date().toISOString().split('T')[0];
        const rawReason = document.getElementById('edit-exit-reason')?.value || 'Not Available';
        const otherCustomText = (document.getElementById('edit-exit-other-text')?.value || '').trim();
        payload.exit_reason = (rawReason === 'Other' && otherCustomText)
          ? `Other: ${otherCustomText}`
          : rawReason;
        payload.exit_notes = document.getElementById('edit-exit-notes')?.value || '';
        payload.exit_recorded_by = adminEmail;
      } else {
        payload.exit_date = null;
        payload.exit_reason = null;
        payload.exit_notes = null;
        payload.exit_recorded_by = null;
      }

      // ── Optimistic Concurrency Control Check ──
      const original = cachedStudents.find(s => s.id.toString() === id.toString());
      if (original) {
        try {
          const { data: latest, error: checkError } = await window._supabase
            .from('student_registrations')
            .select('student_name, father_name, batch, course_applying, status')
            .eq('id', id);

          if (!checkError && latest && latest.length > 0) {
            const currentDb = latest[0];
            const changes = [];

            if (currentDb.student_name !== original.student_name) changes.push(`Name: "${currentDb.student_name}" (you saw "${original.student_name}")`);
            if (currentDb.father_name !== original.father_name) changes.push(`Father's Name: "${currentDb.father_name}" (you saw "${original.father_name}")`);
            if (currentDb.batch !== original.batch) changes.push(`Batch: "${currentDb.batch}" (you saw "${original.batch}")`);
            if (currentDb.course_applying !== original.course_applying) changes.push(`Course: "${currentDb.course_applying}" (you saw "${original.course_applying}")`);
            if (currentDb.status !== original.status) changes.push(`Status: "${currentDb.status}" (you saw "${original.status}")`);

            if (changes.length > 0) {
              const confirmMsg = `Conflict Warning:\n\nAnother administrator has modified this student's record while you were editing it:\n\n` +
                changes.map(c => `• ${c}`).join('\n') +
                `\n\nDo you want to OVERWRITE their changes and save anyway? Click 'OK' to overwrite, or 'Cancel' to reload the latest details.`;
              if (!confirm(confirmMsg)) {
                statusMsg.textContent = 'Edit canceled. Reloading...';
                statusMsg.className = 'status-msg error';
                statusMsg.style.display = 'block';
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.originalText || 'Save Changes'; }
                await hydrateDashboardAndAnalytics();
                setTimeout(() => { document.getElementById('modal-edit-student').close(); }, 1000);
                return;
              }
            }
          }
        } catch (err) {
          console.warn('OCC check failed, skipping check:', err);
        }
      }

      // ── Save via toast.promise() for live notification feedback ──
      const studentName = document.getElementById('edit-student-name').value || 'Student';
      const savePromise = (async () => {
        const { error } = await window._supabase
          .from('student_registrations')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        await hydrateDashboardAndAnalytics();
      })();

      toast.promise(savePromise, {
        loading: `Saving changes for ${studentName}…`,
        success: `${studentName}'s record updated successfully!`,
        error: (err) => `Failed to save: ${err.message}`
      });

      try {
        await savePromise;

        // Inline success confirmation inside the modal
        statusMsg.textContent = '✓ Saved successfully';
        statusMsg.className = 'status-msg success';
        statusMsg.style.display = 'block';

        setTimeout(() => {
          document.getElementById('modal-edit-student').close();
          statusMsg.style.display = 'none';
        }, 900);

      } catch (err) {
        console.error(err);
        // Inline error for detail inside the modal (toast already showed the headline)
        statusMsg.textContent = err.message;
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
      } finally {
        // Always restore the button so the admin can retry or dismiss
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Save Changes';
        }
      }
    });
  }

  async function hydrateDashboardAndAnalytics() {
    if (!window._supabase) return;

    // Inline loader in activity feed — skeletons in KPI cards handle the rest
    const feedContainer = document.getElementById('ds-activity-feed');
    if (feedContainer) {
      feedContainer.innerHTML = '<div class="inline-loader"><div class="mini-spinner"></div>Loading students</div>';
    }

    try {
      const { data: students, error } = await window._supabase
        .from('student_registrations')
        .select('*');
      if (error) throw error;

      cachedStudents = students || [];

      const { data: settings } = await window._supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'monthly_fee')
        .single();

      const { count: pinCount, error: pinError } = await window._supabase
        .from('otp_pins')
        .select('*', { count: 'exact', head: true })
        .eq('is_valid', true);

      const fee = settings ? parseInt(settings.setting_value, 10) : 0;

      // Categorize
      const approved = cachedStudents.filter(s => s.status === 'approved');
      const pending = cachedStudents.filter(s => s.status === 'pending');

      // Update DOM
      const actEl = document.getElementById('ds-active-students');
      if (actEl) actEl.textContent = approved.length;

      const pendEl = document.getElementById('ds-pending-reviews');
      if (pendEl) pendEl.textContent = pending.length;

      const revEl = document.getElementById('ds-est-revenue');
      if (revEl) revEl.textContent = '₹' + approved.reduce((sum, s) => sum + (parseInt(s.monthly_fee) || 0), 0).toLocaleString();

      const pinEl = document.getElementById('ds-valid-pins');
      if (pinEl) pinEl.textContent = pinCount || 0;

      renderStudentMatrix();
      renderCharts(approved);
      initialLoadDone = true;

    } catch (err) {
      console.error("Dashboard engine failed:", err);
    }
  }

  let chartsRendered = false;
  let chartInstances = {};

  async function renderCharts(approvedData) {
    if (typeof Chart === 'undefined') return;

    // Destroy existing chart instances to allow clean redrawing with updated cache data
    Object.keys(chartInstances).forEach(key => {
      if (chartInstances[key]) {
        chartInstances[key].destroy();
        chartInstances[key] = null;
      }
    });

    // Aggregation Logic
    const courseCount = {};
    const genderCount = { 'Male': 0, 'Female': 0 };
    const batchCount = { 'Zuhr': 0, 'Asr': 0, 'Maghrib': 0 };
    const classCount = {};
    const timelineCount = {};

    const ageCourseCount = {
      'Under 6 yrs': {},
      '6-8 yrs': {},
      '9-11 yrs': {},
      '12-14 yrs': {},
      '15+ yrs': {},
      'Unknown': {}
    };

    approvedData.forEach(s => {
      if (s.course_applying) courseCount[s.course_applying] = (courseCount[s.course_applying] || 0) + 1;
      if (s.gender) genderCount[s.gender] = (genderCount[s.gender] || 0) + 1;
      if (s.batch) batchCount[s.batch] = (batchCount[s.batch] || 0) + 1;
      if (s.current_class) classCount[s.current_class] = (classCount[s.current_class] || 0) + 1;

      let ageGroup = 'Unknown';
      if (s.dob) {
        let d = new Date(s.dob);
        if (!isNaN(d)) {
          let age = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24 * 365.25));
          if (age < 6) ageGroup = 'Under 6 yrs';
          else if (age <= 8) ageGroup = '6-8 yrs';
          else if (age <= 11) ageGroup = '9-11 yrs';
          else if (age <= 14) ageGroup = '12-14 yrs';
          else ageGroup = '15+ yrs';
        }
      }
      let course = s.course_applying || 'Unknown';
      if (!ageCourseCount[ageGroup][course]) ageCourseCount[ageGroup][course] = 0;
      ageCourseCount[ageGroup][course]++;

      if (s.doj) {
        const month = s.doj.substring(0, 7);
        timelineCount[month] = (timelineCount[month] || 0) + 1;
      }
    });

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20, boxWidth: 12, usePointStyle: true }
        }
      }
    };

    const pieOptions = {
      ...commonOptions,
      scales: {
        x: { display: false },
        y: { display: false }
      }
    };

    // 1. Chart Growth
    const months = Object.keys(timelineCount).sort();
    const tData = months.map(m => timelineCount[m]);
    const ctxGrowth = document.getElementById('chart-growth');
    if (ctxGrowth) {
      document.getElementById('total-growth').textContent = `Total: ${approvedData.length}`;
      chartInstances.growth = new Chart(ctxGrowth, {
        type: 'line',
        data: { labels: months.length ? months : ['No Data'], datasets: [{ label: 'New Enrollments', data: tData.length ? tData : [0], borderColor: '#2D6A4F', backgroundColor: 'rgba(45, 106, 79, 0.1)', fill: true, tension: 0.3 }] },
        options: commonOptions
      });
    }

    // 2. Chart Course
    const ctxCourse = document.getElementById('chart-course');
    if (ctxCourse) {
      const total = Object.values(courseCount).reduce((a, b) => a + b, 0);
      document.getElementById('total-course').textContent = `Total: ${total}`;
      chartInstances.course = new Chart(ctxCourse, {
        type: 'doughnut',
        data: { labels: Object.keys(courseCount).length ? Object.keys(courseCount) : ['None'], datasets: [{ data: Object.keys(courseCount).length ? Object.values(courseCount) : [1], backgroundColor: ['#D4A017', '#2D6A4F', '#1E293B', '#64748B'] }] },
        options: pieOptions
      });
    }

    // 2b. Chart Batch
    const ctxBatch = document.getElementById('chart-batch');
    if (ctxBatch) {
      const total = Object.values(batchCount).reduce((a, b) => a + b, 0);
      document.getElementById('total-batch').textContent = `Total: ${total}`;
      chartInstances.batch = new Chart(ctxBatch, {
        type: 'doughnut',
        data: { labels: ['Zuhr', 'Asr', 'Maghrib'], datasets: [{ data: [batchCount['Zuhr'], batchCount['Asr'], batchCount['Maghrib']], backgroundColor: ['#FFC107', '#2D6A4F', '#1E293B'] }] },
        options: pieOptions
      });
    }

    // 3. Chart Gender
    const ctxGender = document.getElementById('chart-gender');
    if (ctxGender) {
      const total = (genderCount['Male'] || 0) + (genderCount['Female'] || 0);
      document.getElementById('total-gender').textContent = `Total: ${total}`;
      chartInstances.gender = new Chart(ctxGender, {
        type: 'pie',
        data: { labels: ['Male', 'Female'], datasets: [{ data: [genderCount['Male'] || 0, genderCount['Female'] || 0], backgroundColor: ['#3b82f6', '#ec4899'] }] },
        options: pieOptions
      });
    }

    // 3b. Fee Payment Status (Pie with labels on slices)
    const feeStatusMonthSelect = document.getElementById('fee-status-month');
    if (feeStatusMonthSelect && window._supabase) {
      // Populate dropdown: April 2026 → latest month with data
      if (feeStatusMonthSelect.options.length === 0) {
        // Determine upper bound: max of current collection month and latest month with payment data
        const now = new Date();
        let latestMonth;
        if (now.getDate() <= 25) {
          const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15);
          latestMonth = prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0');
        } else {
          latestMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        }
        // Check DB for the latest month that has payment records
        try {
          const { data: maxRow } = await window._supabase
            .from('fee_payments').select('month').order('month', { ascending: false }).limit(1);
          if (maxRow && maxRow.length && maxRow[0].month > latestMonth) {
            latestMonth = maxRow[0].month;
          }
        } catch (_) { /* use fallback */ }

        // Generate months from ARREARS_START to latestMonth (newest first)
        const allMonths = [];
        const [sy, sm] = ARREARS_START.split('-').map(Number);
        let cur = new Date(sy, sm - 1, 15);
        const [ly, lm] = latestMonth.split('-').map(Number);
        const endDate = new Date(ly, lm - 1, 15);
        while (cur <= endDate) {
          allMonths.push(cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0'));
          cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 15);
        }
        allMonths.reverse(); // newest first
        allMonths.forEach(m => {
          feeStatusMonthSelect.add(new Option(feeMonthLabel(m), m));
        });
        feeStatusMonthSelect.addEventListener('change', () => renderFeeStatusPie(approvedData));
      }
      await renderFeeStatusPie(approvedData);
    }

    async function renderFeeStatusPie(students) {
      const canvas = document.getElementById('chart-fee-status');
      const monthSelect = document.getElementById('fee-status-month');
      if (!canvas || !monthSelect) return;
      const month = monthSelect.value;

      // Ensure exemptions are loaded (may not be if analytics loaded before fee tracker)
      if (!cachedFeeExemptions.length && window._supabase) {
        try {
          const { data: ex } = await window._supabase.from('fee_exemptions').select('*');
          cachedFeeExemptions = ex || [];
        } catch (_) { /* table may not exist yet */ }
      }

      try {
        const { data: pmts } = await window._supabase
          .from('fee_payments').select('student_id, amount').eq('month', month);
        const payments = pmts || [];

        const paidMap = {};
        payments.forEach(p => { paidMap[p.student_id] = (paidMap[p.student_id] || 0) + (p.amount || 0); });

        let totalExpected = 0, totalCollected = 0;
        let paidCount = 0, partialCount = 0, unpaidCount = 0;
        students.forEach(s => {
          const expFee = getExpectedFee(s, month);
          if (expFee === 0) return; // skip exempt, unenrolled, or no-fee students
          totalExpected += expFee;
          const paid = paidMap[s.id] || 0;
          totalCollected += Math.min(paid, expFee);
          if (paid >= expFee) paidCount++;
          else if (paid > 0) partialCount++;
          else unpaidCount++;
        });
        const totalPending = Math.max(0, totalExpected - totalCollected);
        const totalStudents = paidCount + partialCount + unpaidCount;

        // Destroy old instance
        if (chartInstances.feeStatus) { chartInstances.feeStatus.destroy(); chartInstances.feeStatus = null; }

        // Custom plugin: draw ₹ amount labels on slices
        const sliceLabelPlugin = {
          id: 'sliceLabels',
          afterDraw(chart) {
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((arc, idx) => {
                const val = dataset.data[idx];
                if (!val || val === 0) return;
                const { x, y } = arc.tooltipPosition();
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#fff';
                ctx.fillText('₹' + val.toLocaleString('en-IN'), x, y);
                ctx.restore();
              });
            });
          }
        };

        const sliceLabels = [];
        const sliceData = [];
        const sliceColors = [];
        if (totalCollected > 0) { sliceLabels.push('Collected'); sliceData.push(totalCollected); sliceColors.push('#2D6A4F'); }
        if (totalPending > 0) { sliceLabels.push('Pending'); sliceData.push(totalPending); sliceColors.push('#dc2626'); }

        // Tooltip student info per slice
        const sliceTooltips = {};
        if (totalCollected > 0) sliceTooltips['Collected'] = `${paidCount} fully paid` + (partialCount > 0 ? `, ${partialCount} partial` : '');
        if (totalPending > 0) sliceTooltips['Pending'] = `${unpaidCount} unpaid` + (partialCount > 0 ? `, ${partialCount} partial` : '');

        chartInstances.feeStatus = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: sliceLabels.length ? sliceLabels : ['No Data'],
            datasets: [{
              data: sliceData.length ? sliceData : [1],
              backgroundColor: sliceColors.length ? sliceColors : ['#e2e8f0']
            }]
          },
          plugins: [sliceLabelPlugin],
          options: {
            ...pieOptions,
            plugins: {
              ...pieOptions.plugins,
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const count = ctx.label === 'Collected' ? paidCount : unpaidCount;
                    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                    return ` ${count}/${totalStudents} | ${pct}%`;
                  }
                }
              }
            }
          }
        });
      } catch (err) {
        console.error('Fee status chart error:', err);
      }
    }

    // 4. Chart School Class
    const ctxSchool = document.getElementById('chart-school');
    if (ctxSchool) {
      const total = Object.values(classCount).reduce((a, b) => a + b, 0);
      document.getElementById('total-school').textContent = `Total: ${total}`;

      let classKeys = Object.keys(classCount);
      // Smart Sort for classes (Nursery/KG -> 1 -> 2 -> ... -> 12)
      classKeys.sort((a, b) => {
        const getVal = (str) => {
          str = str.toLowerCase().trim();
          if (str.includes('nursery') || str.includes('kg') || str.includes('pre')) return 0;
          const match = str.match(/\d+/);
          if (match) return parseInt(match[0]);
          return 99; // Unknowns at the end
        };
        const valA = getVal(a);
        const valB = getVal(b);
        if (valA !== valB) return valA - valB;
        return a.localeCompare(b);
      });

      const classVals = classKeys.map(k => classCount[k]);

      chartInstances.school = new Chart(ctxSchool, {
        type: 'bar',
        data: { labels: classKeys.length ? classKeys : ['None'], datasets: [{ label: 'Students', data: classKeys.length ? classVals : [0], backgroundColor: '#2D6A4F' }] },
        options: commonOptions
      });
    }

    // 5. Age & Course Demographics
    const ctxAge = document.getElementById('chart-age');
    if (ctxAge) {
      const labels = ['Under 6 yrs', '6-8 yrs', '9-11 yrs', '12-14 yrs', '15+ yrs', 'Unknown'];
      const allCourses = new Set();
      labels.forEach(l => Object.keys(ageCourseCount[l]).forEach(c => allCourses.add(c)));

      const colors = ['#D4A017', '#2D6A4F', '#1E293B', '#64748B'];
      const datasets = Array.from(allCourses).map((course, idx) => ({
        label: course,
        data: labels.map(l => ageCourseCount[l][course] || 0),
        backgroundColor: colors[idx % colors.length]
      }));

      // Hide Unknown if perfectly tracked
      const totalUnknown = datasets.reduce((sum, ds) => sum + ds.data[5], 0);
      if (totalUnknown === 0) {
        labels.pop();
        datasets.forEach(ds => ds.data.pop());
      }

      const totalAge = datasets.reduce((sum, ds) => sum + ds.data.reduce((a, b) => a + b, 0), 0);
      const elTotalAge = document.getElementById('total-age');
      if (elTotalAge) elTotalAge.textContent = `Total: ${totalAge}`;

      chartInstances.age = new Chart(ctxAge, {
        type: 'bar',
        data: { labels, datasets },
        options: {
          ...commonOptions,
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        }
      });
    }

    // Dropout & Churn Analytics
    const leftStudents = cachedStudents.filter(s => s.status === 'left');
    const churnCount = {};
    leftStudents.forEach(s => {
      let reason = s.exit_reason || 'Unspecified';
      // Normalize 'Other: <text>' entries into 'Other' for chart grouping
      if (reason.startsWith('Other: ')) reason = 'Other';
      churnCount[reason] = (churnCount[reason] || 0) + 1;
    });

    const departureTimeline = {};
    leftStudents.forEach(s => {
      if (s.exit_date) {
        const month = s.exit_date.substring(0, 7);
        departureTimeline[month] = (departureTimeline[month] || 0) + 1;
      }
    });

    const ctxChurn = document.getElementById('chart-churn');
    if (ctxChurn) {
      const totalChurn = Object.values(churnCount).reduce((a, b) => a + b, 0);
      document.getElementById('total-churn').textContent = `Total: ${totalChurn}`;
      chartInstances.churn = new Chart(ctxChurn, {
        type: 'doughnut',
        data: {
          labels: Object.keys(churnCount).length ? Object.keys(churnCount) : ['None'],
          datasets: [{
            data: Object.keys(churnCount).length ? Object.values(churnCount) : [1],
            backgroundColor: ['#dc2626', '#d97706', '#2563eb', '#16a34a', '#4f46e5', '#64748b']
          }]
        },
        options: pieOptions
      });
    }

    const ctxDepartures = document.getElementById('chart-departures');
    if (ctxDepartures) {
      const monthsExited = Object.keys(departureTimeline).sort();
      const depData = monthsExited.map(m => departureTimeline[m]);
      const totalDep = depData.reduce((a, b) => a + b, 0);
      document.getElementById('total-departures').textContent = `Total: ${totalDep}`;
      chartInstances.departures = new Chart(ctxDepartures, {
        type: 'bar',
        data: {
          labels: monthsExited.length ? monthsExited : ['No Data'],
          datasets: [{
            label: 'Students Exited',
            data: depData.length ? depData : [0],
            backgroundColor: '#dc2626',
            borderColor: '#b91c1c',
            borderWidth: 1
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    }

    chartsRendered = true;

    // Fee Revenue Analytics (needs async DB fetch, runs alongside other charts)
    renderFeeTrendChart();
  }

  // Hook Dashboard rendering to pill clicks
  const dsPill = document.querySelector('[data-sub="sub-dashboard"]');
  const anPill = document.querySelector('[data-sub="sub-analytics"]');
  if (dsPill) dsPill.addEventListener('click', hydrateDashboardAndAnalytics);
  if (anPill) anPill.addEventListener('click', hydrateDashboardAndAnalytics);

  const dsBtnRef = document.getElementById('btn-ds-refresh');
  if (dsBtnRef) {
    dsBtnRef.addEventListener('click', () => {
      // Clear all UI filters
      const searchInput = document.getElementById('ds-filter-search');
      const statusSelect = document.getElementById('ds-filter-status');
      const batchSelect = document.getElementById('ds-filter-batch');
      const courseSelect = document.getElementById('ds-filter-course');

      if (searchInput && searchInput._smartSearch) searchInput._smartSearch.clear();
      else if (searchInput) searchInput.value = '';

      if (statusSelect) statusSelect.value = 'approved';
      if (batchSelect) batchSelect.value = 'all';
      if (courseSelect) courseSelect.value = 'all';

      // Re-trigger matrix rendering with default filters
      renderStudentMatrix();
    });
  }

  // Wire real-time cohesive filter events with SmartSearch component
  const filterInput = document.getElementById('ds-filter-search');
  const filterDropdown = document.getElementById('ds-filter-status');
  const batchDropdown = document.getElementById('ds-filter-batch');
  const courseDropdown = document.getElementById('ds-filter-course');

  if (filterInput) {
    new SmartSearch(filterInput, {
      debounceMs: 150,
      onInput: () => renderStudentMatrix(),
      onClear: () => renderStudentMatrix()
    });
  }

  if (filterDropdown) filterDropdown.addEventListener('change', renderStudentMatrix);
  if (batchDropdown) batchDropdown.addEventListener('change', renderStudentMatrix);
  if (courseDropdown) courseDropdown.addEventListener('change', renderStudentMatrix);


  // ─── Export Logic ────────
  function exportToExcel() {
    const searchTerm = (document.getElementById('ds-filter-search')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('ds-filter-status')?.value || 'all';
    const batchFilter = document.getElementById('ds-filter-batch')?.value || 'all';
    const courseFilter = document.getElementById('ds-filter-course')?.value || 'all';

    let filtered = [...(cachedStudents || [])];
    if (statusFilter !== 'all') filtered = filtered.filter(s => s.status === statusFilter);
    if (batchFilter !== 'all') {
      if (batchFilter === 'unassigned') {
        filtered = filtered.filter(s => !s.batch || s.batch === '' || s.batch === 'null' || s.batch === 'undefined');
      } else {
        filtered = filtered.filter(s => s.batch === batchFilter);
      }
    }
    if (courseFilter !== 'all') {
      if (courseFilter.toLowerCase() === 'unassigned') {
        filtered = filtered.filter(s => !s.course_applying || s.course_applying === '' || s.course_applying === 'null' || s.course_applying === 'undefined' || s.course_applying.toLowerCase() === 'unassigned');
      } else {
        filtered = filtered.filter(s => s.course_applying === courseFilter);
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.student_name || '').toLowerCase().includes(searchTerm) ||
        (s.form_no || '').toLowerCase().includes(searchTerm)
      );
    }

    if (filtered.length === 0) {
      toast.warning('No data to export based on current filters.');
      return;
    }

    if (typeof XLSX === 'undefined') {
      toast.info('Excel engine is still loading. Please try again in a moment.');
      return;
    }

    // Sort: batch order then alphabetical
    const batchOrder = ['Zuhr', 'Asr', 'Maghrib'];
    filtered.sort((a, b) => {
      const bA = batchOrder.indexOf(a.batch) === -1 ? 99 : batchOrder.indexOf(a.batch);
      const bB = batchOrder.indexOf(b.batch) === -1 ? 99 : batchOrder.indexOf(b.batch);
      if (bA !== bB) return bA - bB;
      return (a.student_name || '').localeCompare(b.student_name || '');
    });

    // Prepare Data
    const data = filtered.map(s => ({
      'Form No': s.form_no || 'N/A',
      'Student Name': s.student_name || '',
      'Father Name': s.father_name || '',
      'Course': s.course_applying || '',
      'Batch': s.batch || 'N/A',
      'Status': s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : '',
      'Joining Date': s.doj || '',
      'Gender': s.gender || '',
      'Aadhar No': s.aadhar_no || '',
      'School': s.school_name || '',
      'Current Class': s.current_class || ''
    }));

    exportToExcel(data, "Students", `MQLC_Students_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  function exportToPDF() {
    // Set timestamp for branding
    const tsEl = document.getElementById('print-timestamp');
    if (tsEl) tsEl.textContent = `Date: ${new Date().toLocaleString()}`;

    // Get the currently filtered students (same logic as export to Excel)
    const searchTerm = (document.getElementById('ds-filter-search')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('ds-filter-status')?.value || 'all';
    const batchFilter = document.getElementById('ds-filter-batch')?.value || 'all';
    const courseFilter = document.getElementById('ds-filter-course')?.value || 'all';

    let filtered = [...(cachedStudents || [])];
    if (statusFilter !== 'all') filtered = filtered.filter(s => s.status === statusFilter);
    if (batchFilter !== 'all') {
      if (batchFilter === 'unassigned') {
        filtered = filtered.filter(s => !s.batch || s.batch === '' || s.batch === 'null' || s.batch === 'undefined');
      } else {
        filtered = filtered.filter(s => s.batch === batchFilter);
      }
    }
    if (courseFilter !== 'all') {
      if (courseFilter.toLowerCase() === 'unassigned') {
        filtered = filtered.filter(s => !s.course_applying || s.course_applying === '' || s.course_applying === 'null' || s.course_applying === 'undefined' || s.course_applying.toLowerCase() === 'unassigned');
      } else {
        filtered = filtered.filter(s => s.course_applying === courseFilter);
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.student_name || '').toLowerCase().includes(searchTerm) ||
        (s.form_no || '').toLowerCase().includes(searchTerm)
      );
    }

    if (filtered.length === 0) {
      toast.warning('No data to export based on current filters.');
      return;
    }

    // Sort: batch order then alphabetical
    const batchOrder = ['Zuhr', 'Asr', 'Maghrib'];
    filtered.sort((a, b) => {
      const bA = batchOrder.indexOf(a.batch) === -1 ? 99 : batchOrder.indexOf(a.batch);
      const bB = batchOrder.indexOf(b.batch) === -1 ? 99 : batchOrder.indexOf(b.batch);
      if (bA !== bB) return bA - bB;
      return (a.student_name || '').localeCompare(b.student_name || '');
    });

    // Group by batch
    const groups = {};
    filtered.forEach(s => {
      const key = s.batch || 'Unassigned';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    const orderedKeys = [...batchOrder.filter(b => groups[b]), ...(groups['Unassigned'] ? ['Unassigned'] : [])];

    // Build the table
    const container = document.getElementById('print-table-container');
    if (!container) return;

    const filterParts = [];
    if (statusFilter !== 'all') filterParts.push(`Status: ${statusFilter}`);
    if (batchFilter !== 'all') filterParts.push(`Batch: ${batchFilter}`);
    if (courseFilter !== 'all') filterParts.push(`Course: ${courseFilter}`);
    if (searchTerm) filterParts.push(`Search: "${searchTerm}"`);
    const filterSummary = filterParts.length > 0
      ? `<p style="font-size:9pt;color:#666;margin:0 0 10pt 0;">Filters Applied: ${filterParts.join(' | ')} &mdash; ${filtered.length} record(s)</p>`
      : `<p style="font-size:9pt;color:#666;margin:0 0 10pt 0;">All Records &mdash; ${filtered.length} total</p>`;

    const thStyle = 'padding:6pt 4pt;text-align:left;border:1px solid #ddd;';
    const tdStyle = 'padding:5pt 4pt;border:1px solid #eee;';

    let tableHTML = filterSummary;

    orderedKeys.forEach((batchName, bIdx) => {
      const students = groups[batchName];
      const pageBreak = bIdx > 0 ? 'page-break-before:always;' : '';

      // Batch section header
      tableHTML += `
        <div style="${pageBreak}margin-top:14pt;margin-bottom:6pt;padding:5pt 8pt;background:#2D6A4F;color:#fff;border-radius:4pt;font-size:9pt;font-weight:700;font-family:'Inter',sans-serif;">
          ${batchName} Batch &mdash; ${students.length} student${students.length === 1 ? '' : 's'}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:8.5pt;font-family:'Inter',sans-serif;margin-bottom:4pt;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="${thStyle}">#</th>
              <th style="${thStyle}">Form No</th>
              <th style="${thStyle}">Student Name</th>
              <th style="${thStyle}">Father Name</th>
              <th style="${thStyle}">Course</th>
              <th style="${thStyle}">Date of Joining</th>
              <th style="${thStyle}">Contact</th>
              <th style="${thStyle}">Aadhar No.</th>
            </tr>
          </thead>
          <tbody>`;

      students.forEach((s, i) => {
        const bgColor = i % 2 === 0 ? '#fff' : '#f8f9fa';
        const contact = s.contact_father || s.contact_mother || 'N/A';
        // Format date of joining as dd Mon yyyy
        let dojFormatted = '';
        if (s.doj) {
          const d = new Date(s.doj);
          if (!isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, '0');
            const mon = d.toLocaleString('en-US', { month: 'short' });
            const yyyy = d.getFullYear();
            dojFormatted = `${dd} ${mon} ${yyyy}`;
          }
        }
        tableHTML += `
            <tr style="background:${bgColor};">
              <td style="${tdStyle}">${i + 1}</td>
              <td style="${tdStyle}">${s.form_no || 'N/A'}</td>
              <td style="${tdStyle}font-weight:600;">${s.student_name || ''}</td>
              <td style="${tdStyle}">${s.father_name || ''}</td>
              <td style="${tdStyle}">${s.course_applying || ''}</td>
              <td style="${tdStyle}">${dojFormatted || 'N/A'}</td>
              <td style="${tdStyle}">${contact}</td>
              <td style="${tdStyle}">${s.aadhar_no || ''}</td>
            </tr>`;
      });

      tableHTML += `
          </tbody>
        </table>`;
    });

    container.innerHTML = tableHTML;

    // Use a small delay to let the DOM render before triggering print
    const originalTitle = document.title;
    document.title = `MQLC_Student_Directory_${new Date().toISOString().split('T')[0]}`;
    setTimeout(() => {
      window.print();
      // Restore title and clean up after printing
      setTimeout(() => {
        document.title = originalTitle;
        container.innerHTML = '';
      }, 1000);
    }, 200);
  }

  const btnExportExcel = document.getElementById('btn-ds-export-excel');
  const btnExportPDF = document.getElementById('btn-ds-export-pdf');
  const btnExportToggle = document.getElementById('btn-export-toggle');
  const exportDropdown = document.getElementById('export-dropdown');

  if (btnExportToggle && exportDropdown) {
    btnExportToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.style.display = exportDropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => {
      exportDropdown.style.display = 'none';
    });
    // Prevent menu close when clicking inside
    exportDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      exportToExcel();
      if (exportDropdown) exportDropdown.style.display = 'none';
    });
  }
  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', () => {
      exportToPDF();
      if (exportDropdown) exportDropdown.style.display = 'none';
    });
  }

  // Initial hydration is now triggered by auth.js via window.hydrateActiveTab()
  // when the dashboard becomes visible and auth is confirmed.
  window.hydrateDashboardAndAnalytics = hydrateDashboardAndAnalytics;

  // Master hydration dispatcher — called by auth.js after session is confirmed
  window.hydrateActiveTab = function hydrateActiveTab() {
    const savedTab = localStorage.getItem('mqlc_active_tab') || 'sub-dashboard';

    // ── 1. Load primary data for the restored tab ──────────────────
    if (savedTab === 'sub-fees') {
      hydrateFeeTracker();
    }
    // Dashboard data is always fetched in background (populates student cache so
    // switching to Dashboard/Analytics/Manual-student-list is instant)
    hydrateDashboardAndAnalytics();

    // ── 2. Pre-generate form number in background ──────────────────
    // Always run, regardless of saved tab, so the field is ready the moment
    // the user navigates to Manual Entry — no wait, no blank field.
    if (manualForm && typeof initManualFormNumber === 'function') {
      const fi = manualForm.querySelector('input[name="form_no"]');
      if (fi && !fi.value) initManualFormNumber();
    }
  };

  // Safeguard: If auth.js already showed dashboard before admin.js finished, hydrate now.
  // Deferred via setTimeout(0) so ALL let/const declarations below (feeLabel, feeCurrentMonth,
  // etc.) are initialized before hydrateActiveTab() runs. Without the deferral, Supabase's
  // onAuthStateChange can fire showDashboard() synchronously during auth.js — setting
  // dashView to display:grid before admin.js starts — causing a TDZ crash on feeLabel.
  const dashView = document.getElementById('dashboard-view');
  if (dashView && dashView.style.display === 'grid') {
    setTimeout(() => { if (window.hydrateActiveTab) window.hydrateActiveTab(); }, 0);
  }

  // ─── 3g. FEE TRACKER ENGINE ─────────────────────────────────────
  // Show previous month by default until 25th, then current month (collection starts post-25th)
  let feeCurrentMonth = (() => {
    const now = new Date();
    if (now.getDate() <= 25) {
      // Show previous month
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      return prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0');
    }
    return now.toISOString().substring(0, 7);
  })();
  let cachedFeePayments = [];
  let cachedFeeExemptions = [];
  let feeTrendChart = null;

  function feeMonthLabel(ym) {
    const [y, m] = ym.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  // Returns true if the student was enrolled on or before the given fee month
  // doj = "YYYY-MM-DD", feeMonth = "YYYY-MM"
  function isEnrolledForMonth(doj, feeMonth) {
    if (!doj) return true; // no DOJ recorded → include by default
    const dojMonth = doj.substring(0, 7); // "YYYY-MM"
    return dojMonth <= feeMonth; // string comparison works for YYYY-MM
  }

  // Arrears floor — ignore all months before this
  const ARREARS_START = '2026-03';

  // Check if a student is exempted for a given month
  function isExemptForMonth(studentId, month) {
    return cachedFeeExemptions.some(e => e.student_id === studentId && e.month === month);
  }

  // Get the exemption record for a student in a given month (or null)
  function getExemption(studentId, month) {
    return cachedFeeExemptions.find(e => e.student_id === studentId && e.month === month) || null;
  }

  // ─── Prepaid Helpers ─────────────────────────────────────────────
  // Returns true if the student is on the prepaid fee collection plan
  function isStudentPrepaid(student) {
    return student.is_prepaid === true;
  }

  // Returns the next month string (YYYY-MM) from a given YYYY-MM
  function getNextMonth(ym) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m, 15); // m is 1-based, so new Date(y, m, 15) = next month
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  // Determines which month the admission payment (first fee) should be recorded against.
  // Prepaid slab: DOJ day 1–15 → admission covers joining month.
  //               DOJ day 16+  → joining month is waived; admission covers next month.
  // This keeps the billing cycle clean — parents won’t be asked again within days.
  function computeAdmissionFeeMonth(doj) {
    if (!doj) return new Date().toISOString().substring(0, 7);
    const dojMonth = doj.substring(0, 7);
    const day = parseInt(doj.substring(8, 10)) || 1;
    return day > 15 ? getNextMonth(dojMonth) : dojMonth;
  }

  // Auto-records the first (admission) fee payment immediately after registration.
  // Silently fails so it never blocks the registration success flow.
  async function recordAdmissionPayment(studentId, doj, feeAmount) {
    if (!studentId || !feeAmount) return;
    const feeMonth = computeAdmissionFeeMonth(doj);
    const paidOn = doj || new Date().toISOString().split('T')[0];
    try {
      await window._supabase.from('fee_payments').insert([{
        student_id: studentId,
        month: feeMonth,
        amount: feeAmount,
        paid_on: paidOn,
        notes: 'Admission payment (auto-recorded on registration)'
      }]);
    } catch (err) {
      console.warn('Auto-record admission payment failed (non-critical):', err.message);
    }
  }

  // Slab-based pro-rata expected fee for a student in a given month
  // Prepaid slabs  : DOJ day 1–15 → full fee that month
  //                  DOJ day 16+  → ₹0 that month, next month = normal fee
  // Postpaid slabs : DOJ day 1–10 → full fee that month
  //                  DOJ day 11–20 → ₹0 that month, next month = fee + half carry-forward
  //                  DOJ day 21+  → ₹0 that month, next month = normal fee
  function getExpectedFee(student, month) {
    const fee = parseInt(student.monthly_fee) || 0;
    if (fee === 0) return 0;
    if (!isEnrolledForMonth(student.doj, month)) return 0;
    if (isExemptForMonth(student.id, month)) return 0;

    if (student.doj) {
      const dojMonth = student.doj.substring(0, 7);
      const day = parseInt(student.doj.substring(8, 10)) || 1;

      if (isStudentPrepaid(student)) {
        // ── Prepaid slabs ──
        // Joining month: waived if joined after 15th (first full service starts next month)
        if (dojMonth === month && day > 15) return 0;
        // All other months (incl. join on or before 15th): full fee
      } else {
        // ── Postpaid slabs (legacy) ──
        // Joining month: only charge if joined on or before 10th
        if (dojMonth === month) {
          if (day > 10) return 0;
        }
        // Month after joining: carry forward half fee if joined 11th–20th
        if (day > 10 && day <= 20) {
          const [dy, dm] = dojMonth.split('-').map(Number);
          const nd = new Date(dy, dm, 15); // dm is 1-based → next month
          const nextMonth = nd.getFullYear() + '-' + String(nd.getMonth() + 1).padStart(2, '0');
          if (month === nextMonth) {
            return fee + Math.round(fee / 2); // e.g. ₹300 + ₹150 = ₹450
          }
        }
      }
    }
    return fee;
  }

  // Calculate outstanding from prior months (arrears)
  function calcArrears(student, currentFeeMonth) {
    const fee = parseInt(student.monthly_fee) || 0;
    if (fee === 0) return 0;
    if (currentFeeMonth <= ARREARS_START) return 0;

    // Effective start: max of DOJ month and ARREARS_START
    const dojMonth = student.doj ? student.doj.substring(0, 7) : ARREARS_START;
    const effectiveStart = dojMonth > ARREARS_START ? dojMonth : ARREARS_START;
    if (currentFeeMonth <= effectiveStart) return 0;

    // Iterate month-by-month to respect pro-rata and exemptions
    const [sy, sm] = effectiveStart.split('-').map(Number);
    const [cy, cm] = currentFeeMonth.split('-').map(Number);
    let totalExpected = 0;
    let cur = new Date(sy, sm - 1, 15);
    const end = new Date(cy, cm - 1, 15);
    while (cur < end) {
      const ym = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0');
      totalExpected += getExpectedFee(student, ym);
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 15);
    }

    // Sum all payments for those prior months
    const totalPaid = cachedFeePayments
      .filter(p => p.student_id === student.id && p.month >= effectiveStart && p.month < currentFeeMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return Math.max(0, totalExpected - totalPaid);
  }

  // Month navigation
  const feePrev = document.getElementById('fee-prev-month');
  const feeNext = document.getElementById('fee-next-month');
  const feeLabel = document.getElementById('fee-month-label');

  if (feePrev) feePrev.addEventListener('click', () => { shiftFeeMonth(-1); });
  if (feeNext) feeNext.addEventListener('click', () => { shiftFeeMonth(1); });

  function shiftFeeMonth(dir) {
    const [y, m] = feeCurrentMonth.split('-').map(Number);
    // Add 15 days to avoid timezone backward drift when creating new dates
    const d = new Date(y, m - 1 + dir, 15);
    feeCurrentMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    hydrateFeeTracker();
  }

  // Filters
  const feeBatchFilter = document.getElementById('fee-filter-batch');
  const feeNameFilter = document.getElementById('fee-filter-name');
  const feeStatusFilter = document.getElementById('fee-filter-status');
  const feeModeFilter = document.getElementById('fee-filter-mode');

  if (feeBatchFilter) feeBatchFilter.addEventListener('change', renderFeeMatrix);
  if (feeNameFilter) feeNameFilter.addEventListener('input', debounce(renderFeeMatrix, 200));
  if (feeStatusFilter) feeStatusFilter.addEventListener('change', renderFeeMatrix);
  if (feeModeFilter) feeModeFilter.addEventListener('change', renderFeeMatrix);

  // Hook to pill click
  const feePill = document.querySelector('[data-sub="sub-fees"]');
  if (feePill) feePill.addEventListener('click', hydrateFeeTracker);

  async function hydrateFeeTracker() {
    if (!window._supabase) return;
    if (feeLabel) feeLabel.textContent = feeMonthLabel(feeCurrentMonth);

    // Reset KPI cards to shimmer skeleton while loading
    const shimmer = '<span class="skeleton-value" style="width: 72px;"></span>';
    const el = id => document.getElementById(id);
    if (el('fee-kpi-expected')) el('fee-kpi-expected').innerHTML = shimmer;
    if (el('fee-kpi-collected')) el('fee-kpi-collected').innerHTML = shimmer;
    if (el('fee-kpi-pending')) el('fee-kpi-pending').innerHTML = shimmer;
    if (el('fee-kpi-rate')) el('fee-kpi-rate').innerHTML = '<span class="skeleton-value"></span>';
    if (el('fee-kpi-rate-sub')) el('fee-kpi-rate-sub').textContent = '';

    // Inline loading indicator inside the fee feed
    const feeFeed = document.getElementById('fee-matrix-feed');
    if (feeFeed) feeFeed.innerHTML = '<div class="inline-loader"><div class="mini-spinner"></div>Loading fee data</div>';

    try {
      // Ensure student cache is fresh
      if (!cachedStudents || !cachedStudents.length) {
        const { data } = await window._supabase.from('student_registrations').select('*');
        cachedStudents = data || [];
      }
      // Fetch payments from April 2026 onwards (needed for arrears calculation)
      const { data: payments, error } = await window._supabase
        .from('fee_payments')
        .select('*')
        .gte('month', ARREARS_START);
      if (error) throw error;
      cachedFeePayments = payments || [];

      // Fetch exemptions
      try {
        const { data: exemptions } = await window._supabase
          .from('fee_exemptions').select('*');
        cachedFeeExemptions = exemptions || [];
      } catch (_) { cachedFeeExemptions = []; /* table may not exist yet */ }

      renderFeeMatrix();
    } catch (err) {
      console.error('Fee tracker error:', err);
    }
  }

  // ─── Fee Revenue Analytics (Annual Scale, in Analytics Tab) ─────────
  let feeAnalyticsPayments = null; // separate cache for analytics

  async function renderFeeTrendChart() {
    const canvas = document.getElementById('chart-fee-trend');
    const summaryEl = document.getElementById('fee-chart-summary');
    const yearSelect = document.getElementById('fee-chart-year');
    if (!canvas || typeof Chart === 'undefined' || !window._supabase) return;

    // Populate year selector if empty
    if (yearSelect && yearSelect.options.length === 0) {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear; y >= 2026; y--) {
        yearSelect.add(new Option(y.toString(), y.toString()));
      }
      yearSelect.addEventListener('change', renderFeeTrendChart);
    }

    const year = yearSelect ? parseInt(yearSelect.value) : new Date().getFullYear();
    const yearStart = `${year}-01`;
    const yearEnd = `${year}-12`;

    // Fetch all payments for the year (cache per session, refetch on year change)
    if (!feeAnalyticsPayments || feeAnalyticsPayments._year !== year) {
      try {
        const { data, error } = await window._supabase
          .from('fee_payments')
          .select('*')
          .gte('month', yearStart)
          .lte('month', yearEnd);
        if (error) throw error;
        feeAnalyticsPayments = data || [];
        feeAnalyticsPayments._year = year;
      } catch (err) {
        console.error('Fee analytics fetch error:', err);
        if (summaryEl) summaryEl.textContent = 'Error loading data';
        return;
      }
    }

    // Use cachedStudents (already loaded by analytics)
    const approved = (cachedStudents || []).filter(s => s.status === 'approved');

    // Ensure exemptions are loaded
    if (!cachedFeeExemptions.length && window._supabase) {
      try {
        const { data: ex } = await window._supabase.from('fee_exemptions').select('*');
        cachedFeeExemptions = ex || [];
      } catch (_) { /* table may not exist yet */ }
    }

    // Generate months for the year — up to current month or latest data month, whichever is later
    const now = new Date();
    let maxMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;
    // Extend to latest month that has payment data in this year
    if (feeAnalyticsPayments && feeAnalyticsPayments.length) {
      feeAnalyticsPayments.forEach(p => {
        if (p.month && p.month.startsWith(year + '-')) {
          const m = parseInt(p.month.split('-')[1]);
          if (m > maxMonth) maxMonth = m;
        }
      });
    }
    const months = [];
    for (let m = 1; m <= Math.min(maxMonth, 12); m++) {
      months.push(`${year}-${String(m).padStart(2, '0')}`);
    }
    // Only show from ARREARS_START month onwards for the start year
    const activeMonths = months.filter(m => m >= ARREARS_START);
    if (activeMonths.length === 0) {
      if (summaryEl) summaryEl.textContent = 'No data for this year';
      return;
    }

    const expectedData = [];
    const onTimeData = [];     // collections matching the current month
    const arrearsData = [];    // collections for prior months (arrears recovery)
    const rateData = [];

    activeMonths.forEach(month => {
      // Expected: sum of pro-rata expected fees for enrolled, non-exempt students
      let exp = 0;
      approved.forEach(s => {
        exp += getExpectedFee(s, month);
      });

      // All payments tagged to this month
      const monthPayments = feeAnalyticsPayments.filter(p => p.month === month);
      const totalCol = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Separate on-time vs arrears recovered
      // Collection window for month M: 25th of M → 24th of M+1
      // "On-time" = paid_on falls on or before 24th of the next month
      // "Arrears" = paid_on falls after the 24th of the next month
      const [my, mm] = month.split('-').map(Number);
      const cutoffDate = new Date(my, mm, 24); // 24th of M+1 (mm is already 1-based, so new Date(y, mm, 24) = next month 24th)
      const cutoffStr = cutoffDate.getFullYear() + '-' + String(cutoffDate.getMonth() + 1).padStart(2, '0') + '-' + String(cutoffDate.getDate()).padStart(2, '0');

      let onTime = 0, arrearsRecov = 0;
      monthPayments.forEach(p => {
        if (p.paid_on) {
          if (p.paid_on <= cutoffStr) {
            onTime += p.amount || 0;
          } else {
            arrearsRecov += p.amount || 0;
          }
        } else {
          onTime += p.amount || 0; // no date recorded → assume on-time
        }
      });

      const pct = exp > 0 ? Math.round((totalCol / exp) * 100) : 0;

      expectedData.push(exp);
      onTimeData.push(onTime);
      arrearsData.push(arrearsRecov);
      rateData.push(pct);
    });

    // Labels
    const labels = activeMonths.map(m => {
      const [, mo] = m.split('-');
      return new Date(year, parseInt(mo) - 1).toLocaleDateString('en-IN', { month: 'short' });
    });

    // Summary badge
    const totalOnTime = onTimeData.reduce((a, b) => a + b, 0);
    const totalArrears = arrearsData.reduce((a, b) => a + b, 0);
    const totalCol = totalOnTime + totalArrears;
    const totalExp = expectedData.reduce((a, b) => a + b, 0);
    const avgRate = rateData.length > 0 ? Math.round(rateData.reduce((a, b) => a + b, 0) / rateData.length) : 0;
    if (summaryEl) {
      summaryEl.textContent = `Collected: ₹${totalCol.toLocaleString('en-IN')} of ₹${totalExp.toLocaleString('en-IN')} · Avg: ${avgRate}%`;
    }

    // Destroy previous chart instance
    if (feeTrendChart) { feeTrendChart.destroy(); feeTrendChart = null; }

    const ctx = canvas.getContext('2d');

    feeTrendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'On-Time (₹)',
            data: onTimeData,
            backgroundColor: '#2D6A4F',
            borderRadius: { topLeft: 4, topRight: 4 },
            stack: 'collections',
            order: 2
          },
          {
            label: 'Arrears Recovered (₹)',
            data: arrearsData,
            backgroundColor: '#b45309',
            borderRadius: { topLeft: 4, topRight: 4 },
            stack: 'collections',
            order: 3
          },
          {
            type: 'line',
            label: 'Expected (₹)',
            data: expectedData,
            borderColor: '#94a3b8',
            borderWidth: 2,
            borderDash: [6, 4],
            backgroundColor: 'transparent',
            pointBackgroundColor: '#94a3b8',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            yAxisID: 'y',
            order: 1
          },
          {
            type: 'line',
            label: 'Collection Rate (%)',
            data: rateData,
            borderColor: '#7c3aed',
            borderWidth: 2,
            backgroundColor: 'transparent',
            pointBackgroundColor: '#7c3aed',
            pointRadius: 3,
            pointHoverRadius: 5,
            pointStyle: 'rectRot',
            tension: 0.3,
            yAxisID: 'y1',
            order: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, padding: 16, font: { size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleFont: { size: 12, weight: '600' },
            bodyFont: { size: 11 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (ctx) {
                if (ctx.dataset.yAxisID === 'y1') return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
                return ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`;
              },
              afterBody: function (items) {
                const idx = items[0].dataIndex;
                const total = onTimeData[idx] + arrearsData[idx];
                const exp = expectedData[idx];
                const gap = Math.max(0, exp - total);
                if (gap > 0) return [`  ──────────`, `  Shortfall: ₹${gap.toLocaleString('en-IN')}`];
                return [];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            position: 'left',
            title: { display: true, text: 'Amount (₹)', font: { size: 11 } },
            ticks: {
              font: { size: 10 },
              callback: v => '₹' + v.toLocaleString('en-IN')
            },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          y1: {
            beginAtZero: true,
            max: 100,
            position: 'right',
            title: { display: true, text: 'Rate (%)', font: { size: 11 } },
            ticks: { font: { size: 10 }, callback: v => v + '%' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  function renderFeeMatrix() {
    const feed = document.getElementById('fee-matrix-feed');
    const countEl = document.getElementById('fee-filter-count');
    if (!feed) return;

    const batchFilter = feeBatchFilter ? feeBatchFilter.value : 'all';
    const statusFilter = feeStatusFilter ? feeStatusFilter.value : 'all';
    const nameFilter = feeNameFilter ? feeNameFilter.value.toLowerCase().trim() : '';
    const modeFilter = document.getElementById('fee-filter-mode')?.value || 'all';

    let students = cachedStudents.filter(s => s.status === 'approved' && isEnrolledForMonth(s.doj, feeCurrentMonth));

    // Apply Filters (Name, Batch, Status, Fee Mode)
    students = students.filter(s => {
      if (nameFilter && !(s.student_name || '').toLowerCase().includes(nameFilter)) return false;
      if (modeFilter === 'prepaid' && !s.is_prepaid) return false;
      if (modeFilter === 'postpaid' && s.is_prepaid) return false;
      if (batchFilter !== 'all') {
        if (batchFilter === 'unassigned') {
          if (s.batch && s.batch !== '' && s.batch !== 'null' && s.batch !== 'undefined') return false;
        } else {
          if (s.batch !== batchFilter) return false;
        }
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'exempt') {
          return isExemptForMonth(s.id, feeCurrentMonth);
        }
        if (isExemptForMonth(s.id, feeCurrentMonth)) return false;
        const expFee = getExpectedFee(s, feeCurrentMonth);
        if (expFee === 0) return false; // N/A students don't belong in any payment status filter
        const paid = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
        let status = 'unpaid';
        if (paid >= expFee) status = 'paid';
        else if (paid > 0) status = 'partial';
        if (status !== statusFilter) return false;
      }
      return true;
    });

    // Sort by batch then name
    const batchOrder = ['Zuhr', 'Asr', 'Maghrib'];
    students.sort((a, b) => {
      const ba = batchOrder.indexOf(a.batch) === -1 ? 99 : batchOrder.indexOf(a.batch);
      const bb = batchOrder.indexOf(b.batch) === -1 ? 99 : batchOrder.indexOf(b.batch);
      if (ba !== bb) return ba - bb;
      return (a.student_name || '').localeCompare(b.student_name || '');
    });

    // Group by batch
    const groups = {};
    students.forEach(s => {
      const k = s.batch || 'Unassigned';
      if (!groups[k]) groups[k] = [];
      groups[k].push(s);
    });

    // KPI calculations (exclude exempt students, include arrears)
    let totalExpected = 0, totalCollected = 0, paidCount = 0, activeStudentCount = 0;
    students.forEach(s => {
      if (isExemptForMonth(s.id, feeCurrentMonth)) return; // skip exempt
      const expFee = getExpectedFee(s, feeCurrentMonth);
      const arrears = calcArrears(s, feeCurrentMonth);
      totalExpected += expFee + arrears;
      const paid = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
      totalCollected += paid;
      if (paid >= expFee && expFee > 0 && arrears === 0) paidCount++;
      if (expFee > 0 || arrears > 0) activeStudentCount++;
    });
    const totalPending = Math.max(0, totalExpected - totalCollected);
    const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('fee-kpi-expected', '₹' + totalExpected.toLocaleString('en-IN'));
    el('fee-kpi-collected', '₹' + totalCollected.toLocaleString('en-IN'));
    el('fee-kpi-pending', '₹' + totalPending.toLocaleString('en-IN'));
    el('fee-kpi-rate', rate + '%');
    el('fee-kpi-rate-sub', `${paidCount} of ${activeStudentCount} students fully paid`);
    if (countEl) countEl.textContent = `Showing ${students.length} student${students.length === 1 ? '' : 's'}`;

    // Update dynamic academic year for print ledger dropdown trigger
    const [currYear, currMonth] = feeCurrentMonth.split('-').map(Number);
    let startYear = currYear;
    if (currMonth >= 1 && currMonth <= 3) {
      startYear = currYear - 1;
    }
    const yearLabel = `Fee Ledger (FY${String(startYear).substring(2)}-FY${String(startYear + 1).substring(2)})`;
    const triggerBtn = document.getElementById('btn-fee-print-ledger-trigger');
    if (triggerBtn) {
      const badge = triggerBtn.querySelector('span');
      if (badge) {
        triggerBtn.innerHTML = '';
        triggerBtn.appendChild(badge);
        triggerBtn.appendChild(document.createTextNode(' ' + yearLabel));
      } else {
        triggerBtn.innerText = yearLabel;
      }
    }

    // Render matrix
    feed.innerHTML = '';
    if (students.length === 0) {
      feed.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">No approved students found.</p>';
      return;
    }

    const orderedKeys = [...batchOrder.filter(b => groups[b]), ...(groups['Unassigned'] ? ['Unassigned'] : [])];
    orderedKeys.forEach(batchName => {
      const batch = groups[batchName];
      feed.innerHTML += `<div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.5rem; margin-top: 0.75rem; border-bottom: 2px solid var(--admin-accent); margin-bottom: 2%;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--admin-accent); text-transform: uppercase; letter-spacing: 0.5px;">${batchName} Batch</span>
        <span style="font-size: 0.7rem; background: var(--admin-bg); color: var(--admin-muted); padding: 2px 8px; border-radius: 10px; font-weight: 500;">${batch.length}</span>
      </div>`;

      batch.forEach(s => {
        const rawFee = parseInt(s.monthly_fee) || 0;
        const expFee = getExpectedFee(s, feeCurrentMonth);
        const exempt = isExemptForMonth(s.id, feeCurrentMonth);
        const exemptRec = exempt ? getExemption(s.id, feeCurrentMonth) : null;
        const curPayments = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth);
        const paid = curPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = Math.max(0, expFee - paid);
        const arrears = calcArrears(s, feeCurrentMonth);
        const totalOutstanding = remaining + arrears;

        // ── Prepaid: check if next month advance is already covered ──
        const prepaid = isStudentPrepaid(s);
        const nextFeeMonth = getNextMonth(feeCurrentMonth);
        let showAdvance = false;
        let nextMonthExpFee = 0;
        if (prepaid && !exempt) {
          nextMonthExpFee = getExpectedFee(s, nextFeeMonth);
          const nextMonthPaid = cachedFeePayments
            .filter(p => p.student_id === s.id && p.month === nextFeeMonth)
            .reduce((sum, p) => sum + (p.amount || 0), 0);
          if (nextMonthExpFee > 0 && nextMonthPaid < nextMonthExpFee) showAdvance = true;
        }

        let statusBadge, statusClass;
        if (exempt) { statusBadge = '⏸ Exempt'; statusClass = 'pending'; }
        else if (rawFee === 0) { statusBadge = 'No Fee Set'; statusClass = 'pending'; }
        else if (expFee === 0) { statusBadge = 'N/A'; statusClass = 'pending'; }
        else if (paid >= expFee) { statusBadge = '✅ Paid'; statusClass = 'approved'; }
        else if (paid > 0) { statusBadge = '⚠️ Partial'; statusClass = 'pending'; }
        else { statusBadge = 'Unpaid'; statusClass = 'rejected'; }

        const showRecord = !exempt && expFee > 0 && (paid < expFee || arrears > 0);
        const showUndo = curPayments.length > 0;

        let relation = 'child';
        if (s.gender === 'Male') relation = 'son';
        else if (s.gender === 'Female') relation = 'daughter';
        let parentSubtext = '';
        if (s.father_name && s.father_name.trim() !== '' && s.father_name !== 'N/A') {
          parentSubtext = ` <span style="font-size: 0.8rem; font-weight: 500; color: var(--admin-muted);">(${escapeHTML(relation)} of ${escapeHTML(s.father_name)})</span>`;
        }

        // Prepaid badge (blue pill next to name)
        const prepaidBadge = prepaid
          ? `<span style="font-size:0.68rem;background:#dbeafe;color:#1d4ed8;padding:1px 7px;border-radius:4px;font-weight:600;margin-left:5px;vertical-align:middle;">Prepaid</span>`
          : '';

        // Pro-rata indicator (postpaid carry-forward only)
        let proRataNote = '';
        if (!exempt && rawFee > 0 && expFee > 0 && expFee > rawFee) {
          const carryAmt = expFee - rawFee;
          proRataNote = `<span style="font-size: 0.7rem; background: #ede9fe; color: #7c3aed; padding: 1px 6px; border-radius: 4px; margin-left: 4px;">incl. ₹${carryAmt.toLocaleString('en-IN')} carry‑forward</span>`;
        }

        // Fee line
        let feeLine = '';
        if (exempt) {
          feeLine = `<p style="font-size: 0.8rem; margin-bottom: 0.15rem; color: var(--admin-muted); font-style: italic;">Exempt — ${exemptRec ? escapeHTML(exemptRec.reason) : 'No reason'}</p>`;
        } else if (expFee > 0) {
          feeLine = `<p style="font-size: 0.8rem; margin-bottom: 0.15rem;">₹${paid.toLocaleString('en-IN')} / ₹${expFee.toLocaleString('en-IN')}${proRataNote}${remaining > 0 && paid > 0 ? ` · <span style="color:#dc2626;">₹${remaining.toLocaleString('en-IN')} due</span>` : ''}</p>`;
        } else if (rawFee === 0) {
          feeLine = `<p style="font-size: 0.8rem; margin-bottom: 0.15rem; color: var(--admin-muted);">No fee assigned</p>`;
        } else {
          feeLine = `<p style="font-size: 0.8rem; margin-bottom: 0.15rem; color: var(--admin-muted);">Not applicable this month</p>`;
        }

        // Arrears subtext
        let arrearsLine = '';
        if (!exempt && arrears > 0) {
          arrearsLine = `<p style="font-size: 0.75rem; margin: 0; color: #b45309;">⚠ ₹${arrears.toLocaleString('en-IN')} overdue from past months · <strong style="color: #dc2626;">Total due: ₹${totalOutstanding.toLocaleString('en-IN')}</strong></p>`;
        }

        // ── Smart Record button for prepaid: if current month settled, default to next month ──
        // (Advance button removed — handled internally by the Record modal)
        let smartOverrideMonth = null; // null = use feeCurrentMonth
        if (prepaid && !exempt && showAdvance && paid >= expFee && arrears === 0) {
          // Current month fully settled — default Record modal to next month
          smartOverrideMonth = nextFeeMonth;
        }
        // Also show Record button if current month settled but next month uncovered
        const showRecordFinal = showRecord || showAdvance;

        // Exempt toggle button
        const exemptBtn = exempt
          ? `<button class="btn-fee-unexempt btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px; color: #7c3aed;" title="Remove exemption">▶ Restore</button>`
          : (rawFee > 0 && paid === 0 && expFee > 0)
            ? `<button class="btn-fee-exempt btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="Exempt this month">⏸ Exempt</button>`
            : '';

        feed.innerHTML += `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;${exempt ? ' opacity: 0.65;' : ''}">
          <div class="activity-detail" style="flex: 1; min-width: 180px;">
            <h4 style="margin-bottom: 0.25rem;">${escapeHTML(s.student_name)}${prepaidBadge}${parentSubtext}</h4>
            ${feeLine}
            ${arrearsLine}
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge ${statusClass}" style="font-size: 0.75rem;">${statusBadge}</span>
            ${rawFee === 0 ? `<button class="btn-set-fee" data-sid="${s.id}" data-name="${s.student_name}">✎ Set Fee</button>` : ''}
            ${showRecordFinal ? `<button class="btn-fee-record btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" data-fee="${smartOverrideMonth ? nextMonthExpFee : expFee}" data-rawfee="${rawFee}" data-paid="${smartOverrideMonth ? 0 : paid}" data-override-month="${smartOverrideMonth || ''}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;">💰 Record</button>` : ''}
            ${showUndo ? `<button class="btn-fee-undo btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="Undo last payment">⟳</button>` : ''}
            ${exemptBtn}
            <button class="btn-fee-history btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="View history">📋</button>
            <button class="btn-fee-print btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="Print receipt">🖨️</button>
          </div>
        </div>
        <div class="fee-history-panel" data-history-for="${s.id}" style="display: none; background: var(--admin-bg); border-radius: 8px; padding: 0.75rem 1rem; margin: 0 0 0.5rem 0; font-size: 0.82rem;"></div>`;
      });
    });

    // Hook buttons
    feed.querySelectorAll('.btn-set-fee').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('setfee-student-id').value = btn.dataset.sid;
        document.getElementById('setfee-student-name').textContent = btn.dataset.name;
        document.getElementById('setfee-amount').value = '';
        document.getElementById('setfee-status-msg').style.display = 'none';
        document.getElementById('modal-set-fee').showModal();
      });
    });
    feed.querySelectorAll('.btn-fee-record').forEach(btn => {
      btn.addEventListener('click', () => {
        const overrideMonth = btn.dataset.overrideMonth || null;
        openPaymentModal(
          btn.dataset.sid, btn.dataset.name,
          parseInt(btn.dataset.fee), parseInt(btn.dataset.paid),
          parseInt(btn.dataset.rawfee || btn.dataset.fee),
          overrideMonth || undefined
        );
      });
    });
    feed.querySelectorAll('.btn-fee-undo').forEach(btn => {
      btn.addEventListener('click', () => undoLastPayment(btn.dataset.sid, btn.dataset.name));
    });
    feed.querySelectorAll('.btn-fee-history').forEach(btn => {
      btn.addEventListener('click', () => toggleHistory(btn.dataset.sid));
    });
    feed.querySelectorAll('.btn-fee-print').forEach(btn => {
      btn.addEventListener('click', () => {
        requestPrintReceipt(btn.dataset.sid);
      });
    });

    // Exempt / Un-exempt buttons
    feed.querySelectorAll('.btn-fee-exempt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('exempt-student-id').value = btn.dataset.sid;
        document.getElementById('exempt-student-name').textContent = btn.dataset.name;
        document.getElementById('exempt-month-label').textContent = feeMonthLabel(feeCurrentMonth);
        document.getElementById('exempt-reason').value = 'On leave';
        document.getElementById('modal-exempt').showModal();
      });
    });
    feed.querySelectorAll('.btn-fee-unexempt').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Remove exemption for ${btn.dataset.name} for ${feeMonthLabel(feeCurrentMonth)}?`)) return;

        const unexemptPromise = (async () => {
          const { error } = await window._supabase.from('fee_exemptions')
            .delete().eq('student_id', btn.dataset.sid).eq('month', feeCurrentMonth);
          if (error) throw error;
        })();

        toast.promise(unexemptPromise, {
          loading: "Removing exemption...",
          success: `Exemption removed for ${btn.dataset.name}!`,
          error: (err) => `Failed to remove exemption: ${err.message}`
        });

        try {
          await unexemptPromise;
          cachedFeeExemptions = cachedFeeExemptions.filter(e => !(e.student_id === btn.dataset.sid && e.month === feeCurrentMonth));
          renderFeeMatrix();
        } catch (err) {
          console.error('Un-exempt error:', err);
        }
      });
    });
  }

  // ─── Payment Modal (Smart Split Multi-Month) ─────────
  // Generate a list of YYYY-MM strings: 6 months back → 5 months forward from a given month
  function generateMonthOptions(centerMonth) {
    const [cy, cm] = centerMonth.split('-').map(Number);
    const options = [];
    for (let i = -6; i <= 5; i++) {
      const d = new Date(cy, cm - 1 + i, 15);
      const ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      options.push(ym);
    }
    return options;
  }

  // Given a month range and total amount, compute per-month split (oldest first)
  function computeSplit(fromMonth, toMonth, totalAmount, monthlyFee) {
    const months = [];
    const [fy, fm] = fromMonth.split('-').map(Number);
    const [ty, tm] = toMonth.split('-').map(Number);
    let cur = new Date(fy, fm - 1, 15);
    const end = new Date(ty, tm - 1, 15);
    while (cur <= end) {
      months.push(cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0'));
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 15);
    }
    // Fill oldest month first
    let remaining = totalAmount;
    const result = months.map(m => {
      const alloc = Math.min(remaining, monthlyFee);
      remaining -= alloc;
      return { month: m, amount: Math.max(0, alloc) };
    });
    // If there's leftover (overpayment), add it to the last month
    if (remaining > 0 && result.length > 0) {
      result[result.length - 1].amount += remaining;
    }
    return result.filter(r => r.amount > 0);
  }

  // Render the live breakdown preview
  function updateSplitPreview() {
    const preview = document.getElementById('pay-split-preview');
    const fromEl = document.getElementById('pay-month-from');
    const toEl = document.getElementById('pay-month-to');
    const amountEl = document.getElementById('pay-amount');
    if (!preview || !fromEl || !toEl || !amountEl) return;

    const from = fromEl.value;
    const to = toEl.value;
    const amount = parseInt(amountEl.value) || 0;
    const fee = parseInt(document.getElementById('pay-student-id').dataset.fee) || 0;

    if (!from || !to || amount <= 0) { preview.style.display = 'none'; return; }
    if (to < from) { preview.style.display = 'none'; return; }

    // Single month → no need for breakdown
    if (from === to) { preview.style.display = 'none'; return; }

    const split = computeSplit(from, to, amount, fee);
    if (split.length <= 1) { preview.style.display = 'none'; return; }

    let html = '<div style="font-weight: 600; margin-bottom: 0.4rem; color: var(--admin-text);">Per-Month Breakdown</div>';
    split.forEach(s => {
      const label = feeMonthLabel(s.month);
      const isFull = fee > 0 && s.amount >= fee;
      const color = isFull ? '#2e7d32' : '#b45309';
      const tag = isFull ? '✓ Full' : 'Partial';
      html += `<div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid var(--admin-border);">
        <span>${label}</span>
        <span style="font-weight: 600;">₹${s.amount.toLocaleString('en-IN')} <span style="font-size: 0.72rem; color: ${color}; font-weight: 500;">${tag}</span></span>
      </div>`;
    });
    preview.innerHTML = html;
    preview.style.display = 'block';
  }

  function openPaymentModal(studentId, name, fee, paid, rawFee, overrideMonth) {
    rawFee = rawFee || fee;
    const remaining = Math.max(0, fee - paid);
    const sidEl = document.getElementById('pay-student-id');
    sidEl.value = studentId;
    sidEl.dataset.fee = rawFee; // use raw monthly fee for split calculations
    sidEl.dataset.expfee = fee; // store expected fee for display

    // overrideMonth is set when recording a prepaid advance for the next month
    const defaultMonth = overrideMonth || feeCurrentMonth;

    document.getElementById('pay-month').value = defaultMonth;
    document.getElementById('pay-student-name').textContent = name;
    document.getElementById('pay-month-label').textContent = feeMonthLabel(defaultMonth);
    document.getElementById('pay-expected').textContent = '₹' + fee.toLocaleString('en-IN');
    document.getElementById('pay-already').textContent = '₹' + paid.toLocaleString('en-IN');
    document.getElementById('pay-remaining').textContent = '₹' + remaining.toLocaleString('en-IN');
    document.getElementById('pay-amount').value = remaining > 0 ? remaining : fee;

    // Populate month selectors — centre the range around the default month
    const months = generateMonthOptions(defaultMonth);
    const fromEl = document.getElementById('pay-month-from');
    const toEl = document.getElementById('pay-month-to');
    [fromEl, toEl].forEach(sel => {
      sel.innerHTML = months.map(m =>
        `<option value="${m}" ${m === defaultMonth ? 'selected' : ''}>${feeMonthLabel(m)}</option>`
      ).join('');
    });

    // Prepaid context note
    const contextNote = document.getElementById('pay-context-note');
    if (contextNote) {
      if (overrideMonth) {
        contextNote.textContent = `💡 Prepaid advance — recording payment for ${feeMonthLabel(overrideMonth)}`;
        contextNote.style.display = 'block';
      } else {
        contextNote.style.display = 'none';
      }
    }

    // Set today's date using inline datepicker
    if (paymentDatePicker) {
      paymentDatePicker.selectDate(new Date());
    }

    document.getElementById('pay-notes').value = '';
    document.getElementById('pay-status-msg').style.display = 'none';
    document.getElementById('pay-split-preview').style.display = 'none';
    document.getElementById('modal-record-payment').showModal();

    // Trigger initial preview
    updateSplitPreview();
  }



  // Wire live preview updates
  const payFromEl = document.getElementById('pay-month-from');
  const payToEl = document.getElementById('pay-month-to');
  const payAmountEl = document.getElementById('pay-amount');
  if (payFromEl) payFromEl.addEventListener('change', updateSplitPreview);
  if (payToEl) payToEl.addEventListener('change', updateSplitPreview);
  if (payAmountEl) payAmountEl.addEventListener('input', updateSplitPreview);
  const payForm = document.getElementById('form-record-payment');
  if (payForm) {
    payForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusMsg = document.getElementById('pay-status-msg');
      const btn = document.getElementById('btn-pay-submit');

      const studentId = document.getElementById('pay-student-id').value;
      const fee = parseInt(document.getElementById('pay-student-id').dataset.fee) || 0;
      const fromMonth = document.getElementById('pay-month-from').value;
      const toMonth = document.getElementById('pay-month-to').value;
      const totalAmount = parseInt(document.getElementById('pay-amount').value);

      // Validate month range
      if (toMonth < fromMonth) {
        toast.warning('"To" month cannot be before "From" month.');
        return;
      }

      // Native date input already returns YYYY-MM-DD
      const paidOn = document.getElementById('pay-date').value;
      if (!paidOn) {
        toast.warning('Please select a valid date.');
        return;
      }

      const notes = document.getElementById('pay-notes').value.trim();

      if (!totalAmount || totalAmount <= 0) {
        toast.warning('Please enter a valid amount.');
        return;
      }

      btn.textContent = 'Recording...';
      btn.disabled = true;

      const recordPromise = (async () => {
        let adminEmail = 'admin';
        const { data: { session } } = await window._supabase.auth.getSession();
        if (session?.user?.email) adminEmail = session.user.email;

        // Compute split and create one record per month
        const split = computeSplit(fromMonth, toMonth, totalAmount, fee);
        const isSingleMonth = split.length === 1;
        const payload = split.map(s => ({
          student_id: studentId,
          month: s.month,
          amount: s.amount,
          paid_on: paidOn,
          recorded_by: adminEmail,
          notes: isSingleMonth
            ? (notes || null)
            : (notes ? `${notes} (split: ${feeMonthLabel(fromMonth)} → ${feeMonthLabel(toMonth)})` : `Split payment: ${feeMonthLabel(fromMonth)} → ${feeMonthLabel(toMonth)}`)
        }));

        const { error } = await window._supabase.from('fee_payments').insert(payload);
        if (error) throw error;
        return { isSingleMonth, split };
      })();

      toast.promise(recordPromise, {
        loading: "Recording fee payment...",
        success: (res) => res.isSingleMonth
          ? 'Payment recorded successfully!'
          : `₹${totalAmount.toLocaleString('en-IN')} split across ${res.split.length} months successfully!`,
        error: (err) => `Failed to record payment: ${err.message}`
      });

      try {
        await recordPromise;
        setTimeout(() => {
          document.getElementById('modal-record-payment').close();
          hydrateFeeTracker();
        }, 1200);
      } catch (err) {
        console.error(err);
      } finally {
        btn.textContent = 'Record Payment';
        btn.disabled = false;
      }
    });
  }

  // ─── Undo Last Payment ─────────
  async function undoLastPayment(studentId, name) {
    const payments = cachedFeePayments.filter(p => p.student_id === studentId && p.month === feeCurrentMonth).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (!payments.length) {
      toast.warning('No payments found to undo for this month.');
      return;
    }

    if (!confirm(`Undo the last payment for ${name} in ${feeMonthLabel(feeCurrentMonth)}?`)) return;

    const undoPromise = (async () => {
      const { error } = await window._supabase.from('fee_payments').delete().eq('id', payments[0].id);
      if (error) throw error;
    })();

    toast.promise(undoPromise, {
      loading: `Undoing last payment for ${name}...`,
      success: `Payment successfully undone!`,
      error: (err) => `Failed to undo payment: ${err.message}`
    });

    try {
      await undoPromise;
      await hydrateFeeTracker();
    } catch (err) {
      console.error(err);
    }
  }

  // ─── Student History Toggle ─────────
  async function toggleHistory(studentId) {
    const panel = document.querySelector(`[data-history-for="${studentId}"]`);
    if (!panel) return;
    if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }

    panel.innerHTML = '<em>Loading history...</em>';
    panel.style.display = 'block';

    try {
      const { data, error } = await window._supabase
        .from('fee_payments')
        .select('*')
        .eq('student_id', studentId)
        .order('month', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || !data.length) {
        panel.innerHTML = '<em style="color: var(--admin-muted);">No payment history found.</em>';
        return;
      }

      // Group by month
      const byMonth = {};
      data.forEach(p => {
        if (!byMonth[p.month]) byMonth[p.month] = [];
        byMonth[p.month].push(p);
      });

      let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">';
      html += '<thead><tr style="border-bottom: 1px solid var(--admin-border);"><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Month</th><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Date Paid</th><th style="text-align: right; padding: 4px 8px; color: var(--admin-muted);">Amount</th></tr></thead><tbody>';
      Object.keys(byMonth).sort().reverse().forEach(month => {
        byMonth[month].forEach(p => {
          html += `<tr style="border-bottom: 1px solid var(--admin-bg);"><td style="padding: 4px 8px;">${feeMonthLabel(month)}</td><td style="padding: 4px 8px;">${p.paid_on || '—'}</td><td style="padding: 4px 8px; font-weight: 600; text-align: right;">₹${p.amount.toLocaleString('en-IN')}</td></tr>`;
        });
      });
      html += '</tbody></table>';
      panel.innerHTML = html;

    } catch (err) {
      panel.innerHTML = '<em style="color: #dc2626;">Error loading history.</em>';
    }
  }

  // ─── Bulk Fee Mark Flow ─────────────────
  const btnFeeBulkPay = document.getElementById('btn-fee-bulk-pay');
  const modalBulkPay = document.getElementById('modal-bulk-fee-mark');
  const bulkPayStudentList = document.getElementById('bulk-pay-student-list');
  const bulkPaySearch = document.getElementById('bulk-pay-search');
  const bulkPayBatch = document.getElementById('bulk-pay-batch');
  const bulkPaySelectAll = document.getElementById('bulk-pay-select-all');
  const btnBulkPayConfirm = document.getElementById('btn-bulk-pay-confirm');
  const formBulkPay = document.getElementById('form-bulk-pay');
  const bulkPayStatusMsg = document.getElementById('bulk-pay-status-msg');
  const bulkPayMonthLabel = document.getElementById('bulk-pay-month-label');

  let eligibleStudents = [];
  let checkedStudentIds = new Set();

  if (btnFeeBulkPay && modalBulkPay) {
    btnFeeBulkPay.addEventListener('click', () => {
      if (bulkPayMonthLabel) {
        bulkPayMonthLabel.textContent = feeMonthLabel(feeCurrentMonth);
      }

      if (bulkPaySearch) bulkPaySearch.value = '';
      if (bulkPayBatch) bulkPayBatch.value = 'all';
      if (bulkPaySelectAll) bulkPaySelectAll.checked = false;
      document.getElementById('bulk-pay-notes').value = '';
      if (bulkPayStatusMsg) {
        bulkPayStatusMsg.style.display = 'none';
        bulkPayStatusMsg.textContent = '';
      }

      if (bulkPaymentDatePicker) {
        bulkPaymentDatePicker.selectDate(new Date());
      }

      eligibleStudents = cachedStudents.filter(s => {
        if (s.status !== 'approved') return false;
        if (!isEnrolledForMonth(s.doj, feeCurrentMonth)) return false;
        if (isExemptForMonth(s.id, feeCurrentMonth)) return false;

        const expFee = getExpectedFee(s, feeCurrentMonth);
        if (expFee === 0) return false;
        const paid = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = Math.max(0, expFee - paid);
        const arrears = calcArrears(s, feeCurrentMonth);
        const totalOutstanding = remaining + arrears;

        return totalOutstanding > 0;
      });

      checkedStudentIds.clear();
      renderBulkPayStudents();
      modalBulkPay.showModal();
    });

    if (bulkPaySearch) {
      new SmartSearch(bulkPaySearch, {
        debounceMs: 150,
        onInput: () => renderBulkPayStudents(),
        onClear: () => renderBulkPayStudents()
      });
    }

    if (bulkPayBatch) {
      bulkPayBatch.addEventListener('change', renderBulkPayStudents);
    }

    if (bulkPaySelectAll) {
      bulkPaySelectAll.addEventListener('change', (e) => {
        const visibleCheckboxes = bulkPayStudentList.querySelectorAll('input[type="checkbox"]');
        visibleCheckboxes.forEach(cb => {
          cb.checked = e.target.checked;
          const sid = cb.dataset.sid;
          if (e.target.checked) {
            checkedStudentIds.add(sid);
          } else {
            checkedStudentIds.delete(sid);
          }
        });
        updateBulkPayConfirmButton();
      });
    }
  }

  function renderBulkPayStudents() {
    if (!bulkPayStudentList) return;

    const searchTerm = bulkPaySearch ? bulkPaySearch.value.toLowerCase().trim() : '';
    const batchFilter = bulkPayBatch ? bulkPayBatch.value : 'all';

    let filtered = eligibleStudents.filter(s => {
      if (searchTerm && !(s.student_name || '').toLowerCase().includes(searchTerm)) return false;
      if (batchFilter !== 'all') {
        if (batchFilter === 'unassigned') {
          if (s.batch && s.batch !== '' && s.batch !== 'null' && s.batch !== 'undefined') return false;
        } else {
          if (s.batch !== batchFilter) return false;
        }
      }
      return true;
    });

    filtered.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));

    bulkPayStudentList.innerHTML = '';
    if (filtered.length === 0) {
      bulkPayStudentList.innerHTML = '<p style="text-align: center; color: var(--admin-muted); font-size: 0.85rem; margin: 1rem 0;">No pending students found matching criteria.</p>';
      if (bulkPaySelectAll) bulkPaySelectAll.checked = false;
      updateBulkPayConfirmButton();
      return;
    }

    filtered.forEach(s => {
      const expFee = getExpectedFee(s, feeCurrentMonth);
      const paid = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
      const remaining = Math.max(0, expFee - paid);
      const arrears = calcArrears(s, feeCurrentMonth);
      const totalOutstanding = remaining + arrears;

      const isChecked = checkedStudentIds.has(s.id.toString());

      const item = document.createElement('label');
      item.className = 'bulk-pay-student-item';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.padding = '0.4rem 0.6rem';
      item.style.borderBottom = '1px solid var(--admin-border)';
      item.style.cursor = 'pointer';
      item.style.fontSize = '0.85rem';
      item.style.fontWeight = '500';

      let detailsStr = `₹${totalOutstanding}`;
      if (arrears > 0) {
        detailsStr += ` (incl. ₹${arrears} arrears)`;
      }

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" data-sid="${s.id}" data-outstanding="${totalOutstanding}" style="width: 16px; height: 16px; accent-color: var(--admin-accent);" ${isChecked ? 'checked' : ''}>
          <span>${escapeHTML(s.student_name)} <small style="color: var(--admin-muted); font-weight: normal;">(${escapeHTML(s.batch || 'Unassigned')})</small></span>
        </div>
        <span style="font-weight: 600; color: #dc2626;">${detailsStr}</span>
      `;

      const cb = item.querySelector('input[type="checkbox"]');
      cb.addEventListener('change', (e) => {
        const sid = s.id.toString();
        if (e.target.checked) {
          checkedStudentIds.add(sid);
        } else {
          checkedStudentIds.delete(sid);
        }

        if (bulkPaySelectAll) {
          const allCheckboxes = bulkPayStudentList.querySelectorAll('input[type="checkbox"]');
          const allChecked = Array.from(allCheckboxes).every(input => input.checked);
          bulkPaySelectAll.checked = allChecked;
        }

        updateBulkPayConfirmButton();
      });

      bulkPayStudentList.appendChild(item);
    });

    updateBulkPayConfirmButton();
  }

  function updateBulkPayConfirmButton() {
    if (!btnBulkPayConfirm) return;
    const count = checkedStudentIds.size;
    btnBulkPayConfirm.textContent = `Record Payments (${count})`;
    btnBulkPayConfirm.disabled = count === 0;
  }

  if (formBulkPay) {
    formBulkPay.addEventListener('submit', async (e) => {
      e.preventDefault();

      const paidOn = document.getElementById('bulk-pay-date').value;
      const notes = document.getElementById('bulk-pay-notes').value.trim();
      const statusMsg = document.getElementById('bulk-pay-status-msg');
      const btn = document.getElementById('btn-bulk-pay-confirm');

      if (checkedStudentIds.size === 0) {
        toast.warning('Please select at least one student.');
        return;
      }

      if (!paidOn) {
        toast.warning('Please select a valid date.');
        return;
      }

      btn.textContent = 'Recording...';
      btn.disabled = true;

      const recordPromise = (async () => {
        let adminEmail = 'admin';
        const { data: { session } } = await window._supabase.auth.getSession();
        if (session?.user?.email) adminEmail = session.user.email;

        const paymentsToInsert = [];

        for (const sid of checkedStudentIds) {
          const student = eligibleStudents.find(s => s.id.toString() === sid);
          if (!student) continue;

          const expFee = getExpectedFee(student, feeCurrentMonth);
          const paid = cachedFeePayments.filter(p => p.student_id === student.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
          const remaining = Math.max(0, expFee - paid);
          const arrears = calcArrears(student, feeCurrentMonth);
          const totalOutstanding = remaining + arrears;

          if (totalOutstanding <= 0) continue;

          if (arrears > 0) {
            const unpaidMonths = [];
            let checkMonth = '2026-03';
            while (checkMonth <= feeCurrentMonth) {
              if (isEnrolledForMonth(student.doj, checkMonth) && !isExemptForMonth(student.id, checkMonth)) {
                const expVal = getExpectedFee(student, checkMonth);
                const paidVal = cachedFeePayments.filter(p => p.student_id === student.id && p.month === checkMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
                const dueVal = Math.max(0, expVal - paidVal);
                if (dueVal > 0) {
                  unpaidMonths.push({ month: checkMonth, due: dueVal });
                }
              }
              const [y, m] = checkMonth.split('-').map(Number);
              const nextM = m === 12 ? 1 : m + 1;
              const nextY = m === 12 ? y + 1 : y;
              checkMonth = nextY + '-' + String(nextM).padStart(2, '0');
            }

            let amtLeft = totalOutstanding;
            unpaidMonths.forEach(mObj => {
              if (amtLeft <= 0) return;
              const payAmt = Math.min(amtLeft, mObj.due);
              paymentsToInsert.push({
                student_id: student.id,
                month: mObj.month,
                amount: payAmt,
                paid_on: paidOn,
                recorded_by: adminEmail,
                notes: notes ? `${notes} (Bulk record)` : 'Bulk payment (Arrears allocated)'
              });
              amtLeft -= payAmt;
            });
          } else {
            paymentsToInsert.push({
              student_id: student.id,
              month: feeCurrentMonth,
              amount: totalOutstanding,
              paid_on: paidOn,
              recorded_by: adminEmail,
              notes: notes || 'Bulk payment'
            });
          }
        }

        if (paymentsToInsert.length === 0) {
          throw new Error("No payments needed recording.");
        }

        const { error } = await window._supabase.from('fee_payments').insert(paymentsToInsert);
        if (error) throw error;

        return paymentsToInsert.length;
      })();

      toast.promise(recordPromise, {
        loading: "Recording bulk payments...",
        success: (count) => `Successfully recorded payments for ${checkedStudentIds.size} student(s) (${count} allocations)!`,
        error: (err) => `Failed to record payments: ${err.message}`
      });

      try {
        await recordPromise;
        setTimeout(() => {
          modalBulkPay.close();
          hydrateFeeTracker();
        }, 1200);
      } catch (err) {
        console.error(err);
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.textContent = `Error: ${err.message}`;
          statusMsg.className = 'status-msg error';
        }
      } finally {
        btn.textContent = `Record Payments (${checkedStudentIds.size})`;
        btn.disabled = false;
      }
    });
  }

  // ─── Fee Export ─────────
  const btnFeeExportToggle = document.getElementById('btn-fee-export-toggle');
  const feeExportDropdown = document.getElementById('fee-export-dropdown');
  if (btnFeeExportToggle && feeExportDropdown) {
    btnFeeExportToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      feeExportDropdown.style.display = feeExportDropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => { feeExportDropdown.style.display = 'none'; });
  }

  function getFeeExportData() {
    const batchFilter = feeBatchFilter ? feeBatchFilter.value : 'all';
    let students = cachedStudents.filter(s => s.status === 'approved' && isEnrolledForMonth(s.doj, feeCurrentMonth));
    if (batchFilter !== 'all') {
      if (batchFilter === 'unassigned') {
        students = students.filter(s => !s.batch || s.batch === '' || s.batch === 'null' || s.batch === 'undefined');
      } else {
        students = students.filter(s => s.batch === batchFilter);
      }
    }
    let rows = students.map(s => {
      const expFee = getExpectedFee(s, feeCurrentMonth);
      const exempt = isExemptForMonth(s.id, feeCurrentMonth);
      const paid = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
      const remaining = Math.max(0, expFee - paid);
      let status = exempt ? 'Exempt' : expFee === 0 ? 'No Fee' : paid >= expFee ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
      return { Name: s.student_name, Batch: s.batch || '', Course: s.course_applying || '', 'Fee Mode': s.is_prepaid ? 'Prepaid' : 'Postpaid', 'Expected (₹)': expFee, 'Paid (₹)': paid, 'Remaining (₹)': remaining, Status: status };
    });

    // Smart Sort: Group by status priority, then alphabetical by name
    const statusPriority = { 'Unpaid': 1, 'Partial': 2, 'Paid': 3, 'Exempt': 4, 'No Fee': 5 };
    rows.sort((a, b) => {
      const pA = statusPriority[a.Status] || 99;
      const pB = statusPriority[b.Status] || 99;
      if (pA !== pB) return pA - pB;
      return (a.Name || '').localeCompare(b.Name || '');
    });

    return rows;
  }

  const btnFeeExcel = document.getElementById('btn-fee-export-excel');
  if (btnFeeExcel) {
    btnFeeExcel.addEventListener('click', () => {
      feeExportDropdown.style.display = 'none';
      const rows = getFeeExportData();
      if (!rows.length) return alert('No data to export.');
      exportToExcel(rows, 'Fee Report', `MQLC_Fee_Report_${feeCurrentMonth}.xlsx`);
    });
  }

  // ─── Fee Summary Report (PDF) — All students, grouped by status ───
  const btnFeePDFSummary = document.getElementById('btn-fee-export-pdf-summary');
  if (btnFeePDFSummary) {
    btnFeePDFSummary.addEventListener('click', () => {
      feeExportDropdown.style.display = 'none';
      const rows = getFeeExportData();
      if (!rows.length) return alert('No data to export.');
      const printBranding = document.getElementById('print-branding');
      const printTable = document.getElementById('print-table-container');
      const ts = document.getElementById('print-timestamp');
      if (ts) ts.textContent = 'Date: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

      let totalExp = 0, totalCol = 0;
      rows.forEach(r => { totalExp += r['Expected (₹)'] || 0; totalCol += r['Paid (₹)'] || 0; });
      const totalPen = Math.max(0, totalExp - totalCol);
      const colRate = totalExp > 0 ? Math.round((totalCol / totalExp) * 100) : 0;

      let tableHTML = `<h3 style="margin-bottom:0.5rem;">Fee Summary Report — ${feeMonthLabel(feeCurrentMonth)}</h3>`;
      tableHTML += `
      <div style="display:flex; justify-content:space-between; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 15px; margin-bottom:1.5rem; font-size:0.85rem;">
        <div><strong>Expected:</strong> ₹${totalExp.toLocaleString('en-IN')}</div>
        <div><strong>Collected:</strong> <span style="color:#2e7d32; font-weight:700;">₹${totalCol.toLocaleString('en-IN')}</span></div>
        <div><strong>Pending:</strong> <span style="color:#c53030; font-weight:700;">₹${totalPen.toLocaleString('en-IN')}</span></div>
        <div><strong>Rate:</strong> <span style="color:#b45309; font-weight:700;">${colRate}%</span></div>
      </div>`;
      tableHTML += '<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">';
      tableHTML += '<thead><tr style="background:#f0f0f0;"><th style="padding:8px; text-align:left; border:1px solid #ddd;">Name</th><th style="padding:8px; text-align:left; border:1px solid #ddd;">Batch</th><th style="padding:8px; text-align:right; border:1px solid #ddd;">Expected</th><th style="padding:8px; text-align:right; border:1px solid #ddd;">Paid</th><th style="padding:8px; text-align:right; border:1px solid #ddd;">Remaining</th><th style="padding:8px; text-align:left; border:1px solid #ddd;">Status</th></tr></thead><tbody>';

      let currentStatus = null;
      rows.forEach(r => {
        if (currentStatus !== r.Status) {
          currentStatus = r.Status;
          let bg = currentStatus === 'Unpaid' ? '#fef2f2' : currentStatus === 'Partial' ? '#fffbeb' : currentStatus === 'Paid' ? '#f0fdf4' : '#f8fafc';
          let color = currentStatus === 'Unpaid' ? '#991b1b' : currentStatus === 'Partial' ? '#92400e' : currentStatus === 'Paid' ? '#166534' : '#475569';
          tableHTML += `<tr style="background:${bg};"><td colspan="6" style="padding:8px; border:1px solid #ddd; font-weight:700; color:${color}; text-transform:uppercase; font-size:0.8rem; letter-spacing:0.5px;">${currentStatus} STUDENTS</td></tr>`;
        }
        tableHTML += `<tr><td style="padding:6px 8px; border:1px solid #ddd;">${r.Name}</td><td style="padding:6px 8px; border:1px solid #ddd;">${r.Batch}</td><td style="padding:6px 8px; border:1px solid #ddd; text-align:right;">₹${r['Expected (₹)']}</td><td style="padding:6px 8px; border:1px solid #ddd; text-align:right;">₹${r['Paid (₹)']}</td><td style="padding:6px 8px; border:1px solid #ddd; text-align:right;">₹${r['Remaining (₹)']}</td><td style="padding:6px 8px; border:1px solid #ddd;">${r.Status}</td></tr>`;
      });
      tableHTML += '</tbody></table>';
      if (printTable) printTable.innerHTML = tableHTML;
      if (printBranding) printBranding.style.display = 'block';
      if (printTable) printTable.style.display = 'block';
      window.print();
      setTimeout(() => {
        if (printBranding) printBranding.style.display = 'none';
        if (printTable) printTable.style.display = 'none';
      }, 500);
    });
  }

  // ─── Fee Collection Sheet (PDF) — Teacher's action list, per batch ───
  const btnFeePDF = document.getElementById('btn-fee-export-pdf');
  if (btnFeePDF) {
    btnFeePDF.addEventListener('click', () => {
      feeExportDropdown.style.display = 'none';

      // ─── Gather student data with arrears ───
      const batchFilter = feeBatchFilter ? feeBatchFilter.value : 'all';
      let students = cachedStudents.filter(s => s.status === 'approved' && isEnrolledForMonth(s.doj, feeCurrentMonth));
      if (batchFilter !== 'all') {
        if (batchFilter === 'unassigned') {
          students = students.filter(s => !s.batch || s.batch === '' || s.batch === 'null' || s.batch === 'undefined');
        } else {
          students = students.filter(s => s.batch === batchFilter);
        }
      }
      if (!students.length) return alert('No data to export.');

      // Enrich each student with fee calculations
      const enriched = students.map(s => {
        const expFee = getExpectedFee(s, feeCurrentMonth);
        const exempt = isExemptForMonth(s.id, feeCurrentMonth);
        const paid = cachedFeePayments.filter(p => p.student_id === s.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = Math.max(0, expFee - paid);
        const arrears = calcArrears(s, feeCurrentMonth);
        const totalDue = remaining + arrears;
        let status = exempt ? 'Exempt' : expFee === 0 ? 'No Fee' : paid >= expFee ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
        return {
          student: s,
          expFee, paid, remaining, arrears, totalDue, status,
          contact: [s.contact_father, s.contact_mother].filter(Boolean).join(' / ') || '—'
        };
      });

      // Group by batch
      const groups = {};
      enriched.forEach(e => {
        const batch = e.student.batch || 'Unassigned';
        if (!groups[batch]) groups[batch] = [];
        groups[batch].push(e);
      });

      const batchOrder = ['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];
      const orderedBatches = Object.keys(groups).sort((a, b) => {
        const iA = batchOrder.indexOf(a), iB = batchOrder.indexOf(b);
        return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
      });

      // ─── Styles ───
      const thStyle = 'padding:6px 8px;text-align:left;border:1px solid #ccc;font-size:8pt;font-weight:700;background:#2D6A4F;color:#fff;';
      const thStyleR = thStyle + 'text-align:right;';
      const thStyleC = thStyle + 'text-align:center;';
      const tdStyle = 'padding:5px 8px;border:1px solid #ddd;font-size:8pt;';
      const tdStyleR = tdStyle + 'text-align:right;';
      const tdStyleC = tdStyle + 'text-align:center;';

      // ─── Build HTML ───
      let tableHTML = '';

      orderedBatches.forEach((batchName, bIdx) => {
        const batchStudents = groups[batchName];
        const pending = batchStudents.filter(e => e.status === 'Unpaid' || e.status === 'Partial');
        const paidList = batchStudents.filter(e => e.status === 'Paid');
        const exemptList = batchStudents.filter(e => e.status === 'Exempt' || e.status === 'No Fee');
        const totalToCollect = pending.reduce((s, e) => s + e.totalDue, 0);
        const pageBreak = bIdx > 0 ? 'page-break-before:always;' : '';

        // Sort pending: Unpaid first, then Partial, then alphabetical
        pending.sort((a, b) => {
          if (a.status !== b.status) return a.status === 'Unpaid' ? -1 : 1;
          return (a.student.student_name || '').localeCompare(b.student.student_name || '');
        });

        // Batch header
        tableHTML += `
          <div style="${pageBreak}margin-bottom:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;background:#2D6A4F;color:#fff;padding:8px 14px;border-radius:6px;margin-bottom:3px;font-family:'Inter',sans-serif;">
              <div style="font-size:11pt;font-weight:700;">${batchName} Batch — Fee Collection Report</div>
              <div style="font-size:9pt;">${feeMonthLabel(feeCurrentMonth)}</div>
            </div>
            <div style="display:flex;gap:1.5rem;background:#f0fdf4;padding:6px 14px;border-radius:0 0 6px 6px;border:1px solid #d1fae5;font-size:8pt;font-family:'Inter',sans-serif;margin-bottom:10px;">
              <span><strong>Total Students:</strong> ${batchStudents.length}</span>
              <span><strong>Pending:</strong> <span style="color:#dc2626;font-weight:700;">${pending.length}</span></span>
              <span><strong>Paid:</strong> <span style="color:#16a34a;font-weight:700;">${paidList.length}</span></span>
              <span><strong>To Collect:</strong> <span style="color:#dc2626;font-weight:700;">₹${totalToCollect.toLocaleString('en-IN')}</span></span>
            </div>`;

        // Main table — Pending students
        if (pending.length > 0) {
          tableHTML += `
            <table style="width:100%;border-collapse:collapse;font-family:'Inter',sans-serif;margin-bottom:8px;">
              <thead>
                <tr>
                  <th style="${thStyleC}width:4%;">#</th>
                  <th style="${thStyle}width:18%;">Student Name</th>
                  <th style="${thStyle}width:14%;">Father's Name</th>
                  <th style="${thStyle}width:12%;">Contact</th>
                  <th style="${thStyleR}width:10%;">This Month</th>
                  <th style="${thStyleR}width:10%;">Arrears</th>
                  <th style="${thStyleR}width:11%;">Total Due</th>
                  <th style="${thStyleC}width:8%;">Status</th>
                  <th style="${thStyleC}width:10%;">Fees Collected ✅</th>
                </tr>
              </thead>
              <tbody>`;

          pending.forEach((e, i) => {
            const bg = i % 2 === 0 ? '#fff' : '#fafafa';
            const statusColor = e.status === 'Unpaid' ? '#dc2626' : '#d97706';
            const statusBg = e.status === 'Unpaid' ? '#fef2f2' : '#fffbeb';
            tableHTML += `
                <tr style="background:${bg};">
                  <td style="${tdStyleC}">${i + 1}</td>
                  <td style="${tdStyle}font-weight:600;">${e.student.student_name || ''}</td>
                  <td style="${tdStyle}">${e.student.father_name || '—'}</td>
                  <td style="${tdStyle}">${e.contact}</td>
                  <td style="${tdStyleR}">₹${e.remaining.toLocaleString('en-IN')}</td>
                  <td style="${tdStyleR}${e.arrears > 0 ? 'color:#dc2626;font-weight:600;' : ''}">${e.arrears > 0 ? '₹' + e.arrears.toLocaleString('en-IN') : '—'}</td>
                  <td style="${tdStyleR}font-weight:700;">₹${e.totalDue.toLocaleString('en-IN')}</td>
                  <td style="${tdStyleC}"><span style="background:${statusBg};color:${statusColor};padding:2px 6px;border-radius:4px;font-size:7pt;font-weight:600;">${e.status}</span></td>
                  <td style="${tdStyleC}font-size:12pt;">☐</td>
                </tr>`;
          });

          // Total row
          const totalRemaining = pending.reduce((s, e) => s + e.remaining, 0);
          const totalArrears = pending.reduce((s, e) => s + e.arrears, 0);
          tableHTML += `
                <tr style="background:#f0f0f0;font-weight:700;">
                  <td colspan="4" style="${tdStyle}text-align:right;font-size:8pt;">TOTAL</td>
                  <td style="${tdStyleR}">₹${totalRemaining.toLocaleString('en-IN')}</td>
                  <td style="${tdStyleR}color:#dc2626;">₹${totalArrears.toLocaleString('en-IN')}</td>
                  <td style="${tdStyleR}">₹${totalToCollect.toLocaleString('en-IN')}</td>
                  <td colspan="2" style="${tdStyleC}"></td>
                </tr>
              </tbody>
            </table>`;
        } else {
          tableHTML += `<p style="font-size:8.5pt;color:#16a34a;font-style:italic;margin:6px 0;font-family:'Inter',sans-serif;">✓ All students in this batch have paid for ${feeMonthLabel(feeCurrentMonth)}.</p>`;
        }

        // Compact reference — Paid students
        if (paidList.length > 0) {
          const paidNames = paidList.map(e => e.student.student_name).sort().join(', ');
          tableHTML += `<p style="font-size:7.5pt;color:#6b7280;margin:4px 0;font-family:'Inter',sans-serif;"><strong style="color:#16a34a;">✓ Paid (${paidList.length}):</strong> ${paidNames}</p>`;
        }

        // Compact reference — Exempt students
        if (exemptList.length > 0) {
          const exemptNames = exemptList.map(e => e.student.student_name).sort().join(', ');
          tableHTML += `<p style="font-size:7.5pt;color:#6b7280;margin:2px 0;font-family:'Inter',sans-serif;"><strong style="color:#7c3aed;">⊘ Exempt/No Fee (${exemptList.length}):</strong> ${exemptNames}</p>`;
        }

        // Signature line
        tableHTML += `
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;padding-top:16px;border-top:1.5px solid #d1d5db;font-size:8pt;color:#6b7280;font-family:'Inter',sans-serif;">
              <div style="text-align:center; margin-top:40px;">
                <div style="width:180px;border-bottom:1px solid #9ca3af;margin-bottom:4px;">&nbsp;</div>
                Teacher's Signature
              </div>
              <div style="text-align:center; margin-top:40px;">
                <div style="width:180px;border-bottom:1px solid #9ca3af;margin-bottom:4px;">&nbsp;</div>
                Trustee's Signature
              </div>
              <div style="text-align:center; margin-top:40px;">
                <div style="width:140px;border-bottom:1px solid #9ca3af;margin-bottom:4px;">&nbsp;</div>
                Date
              </div>
            </div>
          </div>`;
      });

      // ─── Render & Print ───
      const printBranding = document.getElementById('print-branding');
      const printTable = document.getElementById('print-table-container');
      const ts = document.getElementById('print-timestamp');
      if (ts) ts.textContent = 'Date: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      if (printTable) printTable.innerHTML = tableHTML;
      if (printBranding) printBranding.style.display = 'block';
      if (printTable) printTable.style.display = 'block';
      const originalTitle = document.title;
      document.title = `MQLC_Fee_Collection_Sheet_${feeMonthLabel(feeCurrentMonth).replace(/\s+/g, '_')}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
        if (printBranding) printBranding.style.display = 'none';
        if (printTable) printTable.style.display = 'none';
      }, 500);
    });
  }

  // ─── Fee Import (Bulk Upload) ─────────
  const fileInput = document.getElementById('fee-import-file');
  const btnImportClick = document.getElementById('btn-fee-import-click');
  let pendingImportData = [];

  if (btnImportClick && fileInput) {
    btnImportClick.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (typeof XLSX === 'undefined') {
        alert("Excel parser is still loading. Please wait a second and try again.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (evt) {
        const data = evt.target.result;
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'binary' });
        } catch (err) {
          alert('Failed to parse Excel file. Make sure it is a valid .xlsx or .csv file.');
          return;
        }

        const firstSheet = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        processImportRows(rows);
      };
      reader.readAsBinaryString(file);
      fileInput.value = ''; // reset so same file can be chosen again
    });
  }

  function processImportRows(rows) {
    pendingImportData = [];
    let html = '<table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-top: 0.5rem;">';
    html += '<tr style="border-bottom:1px solid var(--admin-border);"><th style="text-align:left; padding:4px;">Student Name</th><th style="text-align:right; padding:4px;">Amount</th><th style="text-align:right; padding:4px;">Status</th></tr>';

    let validCount = 0;

    rows.forEach(row => {
      // Find Name and Amount columns dynamically
      const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name'));
      const amtKey = Object.keys(row).find(k => {
        const l = k.toLowerCase();
        return l === 'amount' || l.includes('paid') || l === 'payment';
      });

      if (!nameKey || !amtKey) return;

      const name = row[nameKey];
      let amt = row[amtKey];

      // Clean string currency formats like '₹500' or '500.00'
      if (typeof amt === 'string') amt = parseInt(amt.replace(/[^0-9]/g, ''));
      amt = parseInt(amt);

      if (!name || isNaN(amt) || amt <= 0) return;

      // Exact match or very close match
      const nToMatch = String(name).trim().toLowerCase();
      const student = cachedStudents.find(s => (s.student_name || '').trim().toLowerCase() === nToMatch);

      if (student) {
        pendingImportData.push({ student_id: student.id, name: student.student_name, amount: amt });
        html += `<tr style="border-bottom:1px solid var(--admin-bg);"><td style="padding:4px;">${student.student_name}</td><td style="padding:4px; text-align:right; font-weight:600;">₹${amt.toLocaleString('en-IN')}</td><td style="padding:4px; text-align:right;"><span style="color:#2e7d32; font-weight:600; background:#e8f5e9; padding:2px 8px; border-radius:12px; font-size:0.75rem;">Ready</span></td></tr>`;
        validCount++;
      } else {
        html += `<tr style="border-bottom:1px solid var(--admin-bg);"><td style="padding:4px; color:var(--admin-danger);">${name}</td><td style="padding:4px; text-align:right;">₹${amt}</td><td style="padding:4px; text-align:right;"><span style="color:#c53030; font-weight:600; background:#fff5f5; padding:2px 8px; border-radius:12px; font-size:0.75rem;">Not Found</span></td></tr>`;
      }
    });

    html += '</table>';

    const previewContainer = document.getElementById('import-preview-content');
    document.getElementById('import-month-label').textContent = feeMonthLabel(feeCurrentMonth);

    if (validCount === 0) {
      previewContainer.innerHTML = '<p style="text-align:center; padding:1rem; color:var(--admin-danger);">No valid payments found. Make sure your file has "Name" and "Amount" columns, and that the names match the database exactly.</p>';
      document.getElementById('btn-confirm-import').style.display = 'none';
    } else {
      previewContainer.innerHTML = html;
      document.getElementById('btn-confirm-import').style.display = 'block';
    }

    document.getElementById('import-status-msg').style.display = 'none';
    document.getElementById('modal-import-preview').showModal();
  }

  const btnConfirmImport = document.getElementById('btn-confirm-import');
  if (btnConfirmImport) {
    btnConfirmImport.addEventListener('click', async () => {
      if (pendingImportData.length === 0) return;

      btnConfirmImport.textContent = 'Importing...';
      btnConfirmImport.disabled = true;
      const statusMsg = document.getElementById('import-status-msg');

      try {
        let adminEmail = 'admin';
        const { data: { session } } = await window._supabase.auth.getSession();
        if (session?.user?.email) adminEmail = session.user.email;

        // Create standard YYYY-MM-DD for today
        const d = new Date();
        const paidOn = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

        const payload = pendingImportData.map(p => ({
          student_id: p.student_id,
          month: feeCurrentMonth,
          amount: p.amount,
          paid_on: paidOn,
          recorded_by: adminEmail,
          notes: 'Bulk Excel Import'
        }));

        const { error } = await window._supabase.from('fee_payments').insert(payload);
        if (error) throw error;

        statusMsg.textContent = `Successfully recorded ${payload.length} payments!`;
        statusMsg.className = 'status-msg success';
        statusMsg.style.display = 'block';

        setTimeout(() => {
          document.getElementById('modal-import-preview').close();
          hydrateFeeTracker();
        }, 1200);
      } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Import Failed: ' + err.message;
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
      } finally {
        btnConfirmImport.textContent = 'Confirm Import';
        btnConfirmImport.disabled = false;
      }
    });
  }

  // ─── 4. GLOBAL SETTINGS BINDING ───────────────────────────────
  const settingsForm = document.getElementById('settings-form');
  const cfgStatus = document.getElementById('cfg-status');

  if (settingsForm) {
    // Pre-fill data
    async function loadSettings() {
      if (!window._supabase) return;
      try {
        const { data, error } = await window._supabase.from('site_settings').select('*');
        if (error) throw error;
        if (data) {
          data.forEach(item => {
            if (item.setting_key === 'monthly_fee') document.getElementById('cfg-fee').value = item.setting_value;
            if (item.setting_key === 'active_programs') document.getElementById('cfg-programs').value = item.setting_value;

            // Jamat fields — normalize to HH:MM for type="time" inputs
            const jamatFields = { namaz_fajr: 'cfg-fajr', namaz_zuhr: 'cfg-zuhr', namaz_asr: 'cfg-asr', namaz_maghrib: 'cfg-maghrib', namaz_isha: 'cfg-isha', namaz_jummah: 'cfg-jummah' };
            if (jamatFields[item.setting_key]) {
              const el = document.getElementById(jamatFields[item.setting_key]);
              if (el && item.setting_value) {
                // Strip AM/PM and whitespace, then zero-pad
                const clean = item.setting_value.replace(/[a-zA-Z\s]/g, '').trim();
                const parts = clean.split(':');
                if (parts.length === 2) {
                  const timeVal = parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
                  // Use Flatpickr API if available, otherwise set directly
                  if (el._flatpickr) {
                    el._flatpickr.setDate(timeVal, true);
                  } else {
                    el.value = timeVal;
                  }
                }
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }

    // Call load when either Settings or Jamat tab is clicked (desktop sidebar + mobile nav)
    document.querySelectorAll('[data-target="tab-settings"]').forEach(btn =>
      btn.addEventListener('click', loadSettings)
    );
    document.querySelectorAll('[data-target="tab-jamat"]').forEach(btn =>
      btn.addEventListener('click', loadSettings)
    );

    // Save Data
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!window._supabase) return;

      const fee = document.getElementById('cfg-fee').value;
      const prog = document.getElementById('cfg-programs').value;

      const btn = document.getElementById('btn-save-settings');
      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const { error } = await window._supabase.from('site_settings').upsert([
          { setting_key: 'monthly_fee', setting_value: fee.toString() },
          { setting_key: 'active_programs', setting_value: prog.toString() }
        ]);

        if (error) throw error;

        cfgStatus.textContent = 'Global settings applied instantly!';
        cfgStatus.className = 'status-msg success';
        setTimeout(() => { cfgStatus.style.display = 'none'; cfgStatus.className = 'status-msg'; }, 4000);
      } catch (err) {
        console.error(err);
        cfgStatus.textContent = err.message;
        cfgStatus.className = 'status-msg error';
      } finally {
        btn.textContent = 'Save Settings';
        btn.disabled = false;
      }
    });
  }

  // ─── 5. JAMAT SETTINGS BINDING ──────────────────────────────────
  const jamatForm = document.getElementById('jamat-form');
  const jamatStatus = document.getElementById('jamat-status');

  if (jamatForm) {
    jamatForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Enforce native HTML5 requirements (blocks blank fields)
      if (!jamatForm.checkValidity()) {
        jamatForm.reportValidity();
        return;
      }

      if (!window._supabase) return;

      const btn = document.getElementById('btn-submit-jamat');
      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const payload = [
          { setting_key: 'namaz_fajr', setting_value: document.getElementById('cfg-fajr').value },
          { setting_key: 'namaz_zuhr', setting_value: document.getElementById('cfg-zuhr').value },
          { setting_key: 'namaz_asr', setting_value: document.getElementById('cfg-asr').value },
          { setting_key: 'namaz_maghrib', setting_value: document.getElementById('cfg-maghrib').value },
          { setting_key: 'namaz_isha', setting_value: document.getElementById('cfg-isha').value },
          { setting_key: 'namaz_jummah', setting_value: document.getElementById('cfg-jummah').value }
        ];

        const { error } = await window._supabase.from('site_settings').upsert(payload);
        if (error) throw error;

        jamatStatus.textContent = 'Jamat Timings updated instantly!';
        jamatStatus.className = 'status-msg success';
        jamatStatus.style.display = 'block';
        setTimeout(() => jamatStatus.style.display = 'none', 3000);
      } catch (err) {
        console.error("Save error:", err);
        jamatStatus.textContent = 'Failed to save timings.';
        jamatStatus.className = 'status-msg error';
        jamatStatus.style.display = 'block';
      } finally {
        btn.textContent = 'Save Timings';
        btn.disabled = false;
      }
    });
  }

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${type}`;
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusMsg.style.display = 'none';
      statusMsg.className = 'status-msg';
    }, 5000);
  }

  // ─── 6. QUIZ LEADERBOARD VIEWER ──────────────────────────────────
  const lbSelect = document.getElementById('lb-quiz-select');
  const lbTbody = document.getElementById('lb-admin-tbody');
  const lbCount = document.getElementById('lb-entry-count');

  async function loadQuizList() {
    if (!window._supabase || !lbSelect) return;

    try {
      // Fetch all distinct quiz_ids
      const { data, error } = await window._supabase
        .from('quiz_leaderboard')
        .select('quiz_id');

      if (error) throw error;

      // Get unique quiz_ids
      const uniqueIds = [...new Set((data || []).map(r => r.quiz_id))].sort().reverse();

      lbSelect.innerHTML = '<option value="">── Select a Quiz ──</option>';
      uniqueIds.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = id;
        lbSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Failed to load quiz list:', err);
      lbSelect.innerHTML = '<option value="">── Error loading quizzes ──</option>';
    }
  }

  async function loadLeaderboard(quizId) {
    if (!window._supabase || !lbTbody) return;

    lbTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-muted);">Loading...</td></tr>';

    try {
      const { data, error } = await window._supabase
        .from('quiz_leaderboard')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true });

      if (error) throw error;

      if (lbCount) lbCount.textContent = `${(data || []).length} entries`;

      if (!data || data.length === 0) {
        lbTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-muted);">No entries for this quiz yet.</td></tr>';
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      lbTbody.innerHTML = '';

      data.forEach((row, i) => {
        const rank = i + 1;
        const medal = medals[i] || rank;
        const mins = Math.floor(row.time_taken / 60);
        const secs = row.time_taken % 60;
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        const bgColor = i % 2 === 0 ? 'transparent' : 'var(--admin-bg)';

        lbTbody.innerHTML += `
          <tr style="background:${bgColor};border-bottom:1px solid var(--admin-border);">
            <td style="padding:0.75rem 0.5rem;font-weight:600;font-size:1rem;">${medal}</td>
            <td style="padding:0.75rem 0.5rem;font-weight:600;">${row.player_name}</td>
            <td style="padding:0.75rem 0.5rem;color:var(--admin-muted);">${row.area || '—'}</td>
            <td style="padding:0.75rem 0.5rem;"><span style="background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:12px;font-weight:600;font-size:0.85rem;">${row.score}</span></td>
            <td style="padding:0.75rem 0.5rem;color:var(--admin-muted);font-size:0.85rem;">${timeStr}</td>
          </tr>`;
      });

    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      lbTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-danger);">Failed to load data.</td></tr>';
    }
  }

  // Wire up
  const lbTabBtns = document.querySelectorAll('[data-target="tab-leaderboard"]');
  lbTabBtns.forEach(btn => btn.addEventListener('click', loadQuizList));

  if (lbSelect) {
    lbSelect.addEventListener('change', () => {
      const val = lbSelect.value;
      if (val) {
        loadLeaderboard(val);
      } else {
        lbTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-muted);">Select a quiz above to view its leaderboard.</td></tr>';
        if (lbCount) lbCount.textContent = '';
      }
    });
  }

  // ─── 7. GLOBAL LOADER UTILITY ─────────────────────────────────────
  const globalLoaderEl = document.getElementById('global-loader');
  const loaderLabelEl = document.getElementById('loader-label');
  let loaderStack = 0;

  window.showLoader = function (label) {
    // Only show loader when the dashboard is visible (not on login screen)
    const dashboardView = document.getElementById('dashboard-view');
    if (!dashboardView || dashboardView.style.display === 'none') return;
    // Only allow during first cold boot — subsequent loads use inline loaders
    if (initialLoadDone) return;
    loaderStack++;
    if (loaderLabelEl && label) loaderLabelEl.innerHTML = label + '<span class="loader-dots"></span>';
    if (globalLoaderEl) globalLoaderEl.classList.add('active');
  };

  window.hideLoader = function () {
    loaderStack = Math.max(0, loaderStack - 1);
    if (loaderStack === 0 && globalLoaderEl) globalLoaderEl.classList.remove('active');
  };

  // ─── 8. SET FEE MODAL HANDLER ─────────────────────────────────────
  const setFeeForm = document.getElementById('form-set-fee');
  if (setFeeForm) {
    setFeeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentId = document.getElementById('setfee-student-id').value;
      const amount = parseInt(document.getElementById('setfee-amount').value);
      const statusMsg = document.getElementById('setfee-status-msg');
      const btn = document.getElementById('btn-setfee-submit');

      if (!amount || amount <= 0) {
        statusMsg.textContent = 'Please enter a valid fee amount.';
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
        return;
      }

      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const { error } = await window._supabase
          .from('student_registrations')
          .update({ monthly_fee: amount })
          .eq('id', studentId);
        if (error) throw error;

        statusMsg.textContent = 'Fee assigned successfully!';
        statusMsg.className = 'status-msg success';
        statusMsg.style.display = 'block';

        // Refresh local cache
        const student = cachedStudents.find(s => s.id.toString() === studentId.toString());
        if (student) student.monthly_fee = amount;

        setTimeout(() => {
          document.getElementById('modal-set-fee').close();
          renderFeeMatrix();
        }, 800);
      } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Failed: ' + err.message;
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
      } finally {
        btn.textContent = 'Assign Fee';
        btn.disabled = false;
      }
    });
  }

  // ─── Exemption Form Handler ─────────
  const exemptForm = document.getElementById('form-exempt');
  if (exemptForm) {
    exemptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentId = document.getElementById('exempt-student-id').value;
      const reason = document.getElementById('exempt-reason').value;
      const btn = document.getElementById('btn-exempt-submit');

      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const { data, error } = await window._supabase
          .from('fee_exemptions')
          .upsert({ student_id: studentId, month: feeCurrentMonth, reason: reason }, { onConflict: 'student_id,month' })
          .select();
        if (error) throw error;

        // Update local cache
        cachedFeeExemptions = cachedFeeExemptions.filter(e => !(e.student_id === studentId && e.month === feeCurrentMonth));
        if (data && data.length) cachedFeeExemptions.push(data[0]);

        document.getElementById('modal-exempt').close();
        renderFeeMatrix();
      } catch (err) {
        console.error('Exemption error:', err);
        alert('Failed to create exemption: ' + err.message);
      } finally {
        btn.textContent = 'Confirm Exemption';
        btn.disabled = false;
      }
    });
  }

  // ─── Student Profile View Controller ─────────────────
  async function openProfileModal(studentId) {
    const student = cachedStudents.find(s => s.id.toString() === studentId.toString());
    if (!student) return;

    const modal = document.getElementById('modal-student-profile');
    const content = document.getElementById('profile-modal-content');
    if (!modal || !content) return;

    document.getElementById('profile-student-title').textContent = `${student.student_name}'s Profile`;
    content.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="loader-dots" style="font-size: 1.5rem;">Loading profile details...</span></div>';
    modal.showModal();

    let payments = [];
    if (window._supabase) {
      try {
        const { data, error } = await window._supabase
          .from('fee_payments')
          .select('*')
          .eq('student_id', studentId)
          .order('month', { ascending: false });
        if (!error && data) payments = data;
      } catch (err) {
        console.error('Error fetching payments for profile:', err);
      }
    }

    let age = 'N/A';
    if (student.dob) {
      const d = new Date(student.dob);
      if (!isNaN(d)) {
        age = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24 * 365.25)) + ' years';
      }
    }

    const initials = student.student_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    let avatarClass = student.gender === 'Female' ? 'female' : '';
    if (student.status === 'left') avatarClass = 'left';

    let exitSectionHtml = '';
    if (student.status === 'left') {
      const formattedExitDate = student.exit_date ? new Date(student.exit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
      exitSectionHtml = `
          <div class="profile-exit-alert">
            <h4>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle;">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              Student Exited
            </h4>
            <p>
              <strong>Date Left:</strong> ${formattedExitDate}<br>
              <strong>Reason:</strong> ${(() => {
                const r = student.exit_reason || 'Unspecified';
                if (r.startsWith('Other: ')) return `Other <em style="color: var(--admin-muted); font-weight: 400;">(${r.slice(7)})</em>`;
                return r;
              })()}<br>
              <strong>Recorded By:</strong> ${student.exit_recorded_by || 'admin'}<br>
              ${student.exit_notes ? `<strong>Notes:</strong> ${student.exit_notes}` : ''}
            </p>
          </div>
        `;
    }

    let paymentsTableHtml = '<p style="color: var(--admin-muted); font-size: 0.85rem; font-style: italic;">No payment history recorded yet.</p>';
    if (payments.length > 0) {
      paymentsTableHtml = `
          <div style="overflow-x: auto; max-height: 200px; border: 1px solid var(--admin-border); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="background: var(--admin-bg); border-bottom: 1.5px solid var(--admin-border);">
                  <th style="padding: 8px 12px; font-weight: 700; color: var(--admin-text);">Month</th>
                  <th style="padding: 8px 12px; font-weight: 700; color: var(--admin-text);">Date Paid</th>
                  <th style="padding: 8px 12px; font-weight: 700; color: var(--admin-text); text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(p => `
                  <tr style="border-bottom: 1px solid var(--admin-border);">
                    <td style="padding: 8px 12px; font-weight: 600; color: var(--admin-accent);">${feeMonthLabel(p.month)}</td>
                    <td style="padding: 8px 12px; color: var(--admin-muted);">${p.paid_on || '—'}</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: var(--admin-text); text-align: right;">₹${p.amount.toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
    }

    content.innerHTML = `
        ${exitSectionHtml}
        <div class="profile-header">
          <div class="profile-avatar ${avatarClass}">${initials}</div>
          <div class="profile-header-meta">
            <h4>${student.student_name}</h4>
            <p>Form No: ${student.form_no || 'N/A'} | Status: <span class="badge ${student.status === 'approved' ? 'approved' : (student.status === 'left' ? 'rejected' : 'pending')}">${student.status}</span></p>
          </div>
        </div>

        <div class="profile-grid">
          <div class="profile-section-card">
            <h4>Madrasa Record</h4>
            <div class="profile-row">
              <span class="profile-label">Date of Joining</span>
              <span class="profile-value">${student.doj || 'N/A'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Batch Session</span>
              <span class="profile-value">${student.batch || 'Zuhr'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Course Enrolled</span>
              <span class="profile-value">${student.course_applying || 'N/A'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Monthly Fees</span>
              <span class="profile-value" style="color: var(--admin-accent); font-weight: 700;">₹${parseInt(student.monthly_fee || 0).toLocaleString('en-IN')}.00</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Fee Mode</span>
              <span class="profile-value">${student.is_prepaid ? `<span style="background:#dbeafe;color:#1d4ed8;font-size:0.78rem;padding:2px 8px;border-radius:50px;font-weight:600;">Prepaid</span>` : `<span style="background:#f3f4f6;color:#6b7280;font-size:0.78rem;padding:2px 8px;border-radius:50px;font-weight:600;">Postpaid</span>`}</span>
            </div>
          </div>

          <div class="profile-section-card">
            <h4>Personal Details</h4>
            <div class="profile-row">
              <span class="profile-label">Gender / Age</span>
              <span class="profile-value">${student.gender || 'N/A'} (${age})</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Aadhar Number</span>
              <span class="profile-value">${student.aadhar_no || 'N/A'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Father's Name</span>
              <span class="profile-value">${student.father_name || 'N/A'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Phone Contact</span>
              <span class="profile-value">
                ${student.parent_phone ? `<a href="tel:${student.parent_phone}" style="color: var(--admin-accent); font-weight: 700; text-decoration: none;">📞 ${student.parent_phone}</a>` : 'N/A'}
              </span>
            </div>
          </div>

          <div class="profile-section-card" style="grid-column: span 2;">
            <h4>Residential & Academic Info</h4>
            <div class="profile-row">
              <span class="profile-label">Residential Address</span>
              <span class="profile-value" style="max-width: 70%; text-align: right; word-break: break-word;">${student.address || 'N/A'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">School / College</span>
              <span class="profile-value">${student.school_name || 'N/A'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Current Academic Class</span>
              <span class="profile-value">${student.current_class || 'N/A'}</span>
            </div>
          </div>

          <div class="profile-section-card" style="grid-column: span 2;">
            <h4>Payment History</h4>
            ${paymentsTableHtml}
          </div>
        </div>
      `;

    const editBtn = document.getElementById('btn-profile-edit');
    if (editBtn) {
      editBtn.replaceWith(editBtn.cloneNode(true));
      document.getElementById('btn-profile-edit').addEventListener('click', () => {
        modal.close();
        openEditModal(studentId);
      });
    }
  }

  // ─── Print Position Request Wrapper ─────────────────
  function requestPrintReceipt(studentId) {
    const choiceModal = document.getElementById('modal-print-choice');
    if (!choiceModal) {
      printReceipt(studentId, 'left');
      return;
    }

    const leftBtn = document.getElementById('btn-print-left');
    const rightBtn = document.getElementById('btn-print-right');

    // Clone buttons to clear previous listeners cleanly
    const newLeftBtn = leftBtn.cloneNode(true);
    leftBtn.replaceWith(newLeftBtn);
    const newRightBtn = rightBtn.cloneNode(true);
    rightBtn.replaceWith(newRightBtn);

    newLeftBtn.addEventListener('click', () => {
      choiceModal.close();
      printReceipt(studentId, 'left');
    });

    newRightBtn.addEventListener('click', () => {
      choiceModal.close();
      printReceipt(studentId, 'right');
    });

    choiceModal.showModal();
  }

  // ─── Reusable Student Ledger Card Builder ──────────────
  function buildStudentLedgerCard(s) {
    const [asy, asm] = ARREARS_START.split('-').map(Number);
    // Calculate current academic year months (April - March) based on feeCurrentMonth
    const [currYear, currMonth] = feeCurrentMonth.split('-').map(Number);
    let startYear = currYear;
    if (currMonth >= 1 && currMonth <= 3) {
      startYear = currYear - 1;
    }

    const monthsList = [];
    for (let i = 0; i < 12; i++) {
      const m = (4 + i - 1) % 12 + 1;
      const y = startYear + Math.floor((4 + i - 1) / 12);
      monthsList.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    // Generate visual annual payment cells
    function buildCell(m) {
      const mLabel = new Date(m + '-15').toLocaleDateString('en-US', { month: 'short' });
      const mExp = getExpectedFee(s, m);
      const mExempt = isExemptForMonth(s.id, m);

      let bgColor = '#f1f3f4';
      let leftColor = '#5f6368';
      let rightColor = '#5f6368';
      let leftLabel = '—';
      let rightLabel = '—';

      if (m > feeCurrentMonth) {
        bgColor = '#f1f3f4';
        leftLabel = 'TBD';
        rightLabel = 'TBD';
      } else if (mExempt) {
        bgColor = '#f1f3f4';
        leftLabel = 'Exempt';
        rightLabel = '—';
      } else if (mExp === 0) {
        bgColor = '#f1f3f4';
        leftLabel = 'N/A';
        rightLabel = '—';
      } else {
        // Cumulative expected up to month m
        let cumulativeExpected = 0;
        let cur = new Date(asy, asm - 1, 15);
        const targetEnd = new Date(m + '-15');
        while (cur <= targetEnd) {
          const ym = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0');
          cumulativeExpected += getExpectedFee(s, ym);
          cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 15);
        }

        // Cumulative paid pool up to month m
        const cumulativePaidPool = cachedFeePayments
          .filter(pay => pay.student_id === s.id && pay.month >= ARREARS_START && pay.month <= m)
          .reduce((sum, pay) => sum + (pay.amount || 0), 0);

        // Cumulative paid before month m
        const cumulativePaidBefore = cachedFeePayments
          .filter(pay => pay.student_id === s.id && pay.month >= ARREARS_START && pay.month < m)
          .reduce((sum, pay) => sum + (pay.amount || 0), 0);

        const leftVal = Math.max(0, cumulativeExpected - cumulativePaidBefore);
        const rightVal = cachedFeePayments
          .filter(pay => pay.student_id === s.id && pay.month === m)
          .reduce((sum, pay) => sum + (pay.amount || 0), 0);

        leftLabel = `₹${leftVal}`;
        rightLabel = `₹${rightVal}`;

        const remainingLiable = Math.max(0, cumulativeExpected - cumulativePaidPool);
        if (remainingLiable === 0) {
          bgColor = '#e6f4ea';
          leftColor = '#137333';
          rightColor = '#137333';
        } else if (rightVal > 0) {
          bgColor = '#fef7e0';
          leftColor = '#c5221f';
          rightColor = '#b06000';
        } else {
          bgColor = '#fce8e6';
          leftColor = '#c5221f';
          rightColor = '#c5221f';
        }
      }

      return `<td style="width: 16.6%; border: 1.5px solid #2D6A4F; padding: 4px; background-color: ${bgColor}; font-weight: 700; text-align: center;">
              <div style="font-size: 0.58rem; text-transform: uppercase; margin-bottom: 4px; color: #5f6368; border-bottom: 1.5px solid #2D6A4F; padding-bottom: 2px;">
                ${mLabel}
              </div>
              <div style="display: flex; font-size: 0.72rem; line-height: 1.2;">
                <div style="flex: 1; border-right: 1px solid #2D6A4F; color: ${leftColor}; font-weight: 800;">
                  ${leftLabel}
                </div>
                <div style="flex: 1; color: ${rightColor}; font-weight: 800;">
                  ${rightLabel}
                </div>
              </div>
            </td>`;
    }

    // Row 1: Apr to Sep
    let matrixHtml = `<table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 0.75rem; border: 1.5px solid #2D6A4F;"><tbody><tr>`;
    for (let i = 0; i < 6; i++) {
      matrixHtml += buildCell(monthsList[i]);
    }
    matrixHtml += `</tr><tr>`;
    // Row 2: Oct to Mar
    for (let i = 6; i < 12; i++) {
      matrixHtml += buildCell(monthsList[i]);
    }
    matrixHtml += `</tr></tbody></table>`;

    // Calculate exact chronological outstanding balance list
    const [cy, cm] = feeCurrentMonth.split('-').map(Number);

    // Build list of months from ARREARS_START to feeCurrentMonth
    const allMonthsList = [];
    let curMonth = new Date(asy, asm - 1, 15);
    const endMonth = new Date(cy, cm - 1, 15);
    while (curMonth <= endMonth) {
      allMonthsList.push(curMonth.getFullYear() + '-' + String(curMonth.getMonth() + 1).padStart(2, '0'));
      curMonth = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 15);
    }

    // Expected fee map
    const expectedFeeMap = {};
    allMonthsList.forEach(m => {
      expectedFeeMap[m] = getExpectedFee(s, m);
    });

    // Total payments made by the student from ARREARS_START up to feeCurrentMonth
    const totalPaidPool = cachedFeePayments
      .filter(pay => pay.student_id === s.id && pay.month >= ARREARS_START && pay.month <= feeCurrentMonth)
      .reduce((sum, pay) => sum + (pay.amount || 0), 0);

    // Distribute pool chronologically to build outstanding due map
    const outstandingDueMap = {};
    let pool = totalPaidPool;
    allMonthsList.forEach(m => {
      const exp = expectedFeeMap[m];
      const alloc = Math.min(pool, exp);
      pool -= alloc;
      outstandingDueMap[m] = exp - alloc;
    });

    // Compute total outstanding balance
    const totalOutstanding = allMonthsList.reduce((sum, m) => sum + outstandingDueMap[m], 0);

    // Build outstanding details list (e.g. 100 (April) + 300 (May))
    const outstandingDetails = [];
    allMonthsList.forEach(m => {
      const due = outstandingDueMap[m];
      if (due > 0) {
        const [y, mm] = m.split('-').map(Number);
        const dateObj = new Date(y, mm - 1, 15);
        const mName = dateObj.toLocaleDateString('en-US', { month: 'long' });
        outstandingDetails.push(`${due} (${mName})`);
      }
    });

    let outstandingLabel = totalOutstanding > 0 ? (outstandingDetails.length > 0 ? outstandingDetails.join(' + ') : '₹0') : '₹0';
    let statusColor = '#137333'; // green
    if (totalOutstanding > 0) {
      statusColor = '#c5221f'; // red
    }

    const receiptNo = `MQLC/${String(s.id).split('-')[0].toUpperCase()}`;
    const amountWords = totalOutstanding > 0 ? (numberToWords(totalOutstanding) + ' Rupees Only') : 'Nil';

    function formatDoj(dojStr) {
      if (!dojStr) return 'N/A';
      const parts = dojStr.split('-');
      if (parts.length < 3) return dojStr;
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const d = parseInt(parts[2]);
      const dateObj = new Date(y, m - 1, d);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

      let suffix = 'th';
      if (d < 11 || d > 13) {
        switch (d % 10) {
          case 1: suffix = 'st'; break;
          case 2: suffix = 'nd'; break;
          case 3: suffix = 'rd'; break;
        }
      }
      return `${d}${suffix} ${monthName} ${y}`;
    }

    return `
            <div style="width: 138mm; height: 195mm; border: 2px solid #2D6A4F; border-radius: 16px; padding: 15px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 4rem; font-weight: 800; color: rgba(45, 106, 79, 0.02); pointer-events: none; white-space: nowrap; user-select: none;">MQLC OFFICIAL</div>
              
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2D6A4F; padding-bottom: 8px; margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="assets/logo.png" alt="Logo" style="width: 40px; height: 40px;">
                    <div style="text-align: left;">
                      <h2 style="margin: 0; color: #2D6A4F; font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em;">Millat Qur'an Learning Center</h2>
                      <p style="margin: 1px 0 0 0; color: #666; font-size: 0.68rem; font-weight: 500;">Faridbaug, Nadi Naka, Bhiwandi</p>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <span style="display: inline-block; background: rgba(45, 106, 79, 0.1); color: #2D6A4F; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 50px; text-transform: uppercase;">Fee Receipt</span>
                    ${s.is_prepaid ? `<span style="display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 50px; margin-left: 4px;">Prepaid</span>` : ''}
                    <p style="margin: 4px 0 0 0; font-size: 0.72rem; font-weight: 600; color: var(--admin-muted);">${receiptNo}</p>
                  </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 0.8rem;">
                  <tbody>
                    <tr>
                      <td style="padding: 4px 0; color: #666; width: 35%;">Student Name:</td>
                      <td style="padding: 4px 0; font-weight: 700; color: #111;">${s.student_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #666;">Father's Name:</td>
                      <td style="padding: 4px 0; font-weight: 600; color: #333;">${s.father_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #666;">Date of Joining:</td>
                      <td style="padding: 4px 0; font-weight: 600; color: #333;">${formatDoj(s.doj)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #666;">Batch & Course:</td>
                      <td style="padding: 4px 0; font-weight: 600; color: #333;">${s.batch || 'N/A'} Batch | ${s.course_applying || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>

                <div style="margin-top: 10px; margin-bottom: 10px;">
                  <span style="font-size: 0.68rem; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Annual Fee Status Matrix</span>
                  ${matrixHtml}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #eee; padding-top: 8px; margin-bottom: 15px; font-size: 0.82rem;">
                  <span style="font-weight: 700; color: #111;">Total Balance Outstanding:</span>
                  <span style="font-weight: 800; color: ${statusColor};">${outstandingLabel}</span>
                </div>
              </div>

              <div>
                <div style="background: rgba(45, 106, 79, 0.02); border: 1px solid rgba(45, 106, 79, 0.12); border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                  <div>
                    <span style="font-size: 0.65rem; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.03em; display: block; margin-bottom: 1px;">Amount in Words</span>
                    <span style="font-size: 0.75rem; font-weight: 600; color: #333; text-transform: capitalize;">${amountWords}</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 0.65rem; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.03em; display: block; margin-bottom: 1px;">Grand Total</span>
                    <span style="font-size: 1.25rem; font-weight: 800; color: #2D6A4F;">₹${totalOutstanding.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 0.72rem; color: #666;">
                  <div style="text-align: center; width: 45%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1.2px solid #bbb; padding-top: 4px; font-weight: 600;">Authorized Signatory</div>
                  </div>
                  <div style="text-align: center; width: 45%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1.2px solid #bbb; padding-top: 4px; font-weight: 600;">Receiver's Signature</div>
                  </div>
                </div>
              </div>
            </div>
          `;
  }

  async function printReceipt(studentId, position = 'left') {
    if (!window._supabase) {
      alert('Supabase is not initialized.');
      return;
    }
    const receiptContainer = document.getElementById('print-receipt-container');
    if (!receiptContainer) return;

    try {
      const s = cachedStudents.find(student => student.id.toString() === studentId.toString());
      if (!s) {
        alert('Student record not found.');
        return;
      }

      const cardHtml = buildStudentLedgerCard(s);

      if (position === 'left') {
        receiptContainer.innerHTML = `
                <div class="receipt-page">
                  <div class="receipt-half">${cardHtml}</div>
                  <div class="receipt-half"></div>
                </div>
              `;
      } else {
        receiptContainer.innerHTML = `
                <div class="receipt-page">
                  <div class="receipt-half"></div>
                  <div class="receipt-half">${cardHtml}</div>
                </div>
              `;
      }

      document.body.classList.add('print-mode-receipt');
      const styleBlock = document.createElement('style');
      styleBlock.id = 'temp-receipt-print-style';
      styleBlock.innerHTML = '@page { size: A4 landscape; margin: 0; }';
      document.head.appendChild(styleBlock);

      window.print();

      document.body.classList.remove('print-mode-receipt');
      const tempStyle = document.getElementById('temp-receipt-print-style');
      if (tempStyle) tempStyle.remove();
      receiptContainer.innerHTML = '';

    } catch (err) {
      console.error('Failed to print receipt:', err);
      alert('Failed to print receipt: ' + err.message);
    }
  }

  // ─── Bulk print list population and control logic ──────────────
  const printLedgerTrigger = document.getElementById('btn-fee-print-ledger-trigger');
  if (printLedgerTrigger) {
    printLedgerTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (feeExportDropdown) feeExportDropdown.style.display = 'none';

      // Populating student checklist modal
      const students = cachedStudents.filter(s => s.status === 'approved' && isEnrolledForMonth(s.doj, feeCurrentMonth));
      students.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));

      const listContainer = document.getElementById('bulk-print-student-list');
      if (listContainer) {
        listContainer.innerHTML = students.map(s => {
          return `
                  <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.5rem; border-radius: 8px; cursor: pointer; user-select: none;" class="bulk-student-item">
                    <input type="checkbox" class="bulk-student-check" value="${s.id}" style="width: 16px; height: 16px; accent-color: var(--admin-accent);">
                    <span style="font-size: 0.88rem; font-weight: 500; color: #333;">${s.student_name}</span>
                    <span style="font-size: 0.72rem; font-weight: 600; background: #e8f0fe; color: #1a73e8; padding: 1px 6px; border-radius: 4px; margin-left: auto;">${s.batch || 'Unassigned'}</span>
                  </label>
                `;
        }).join('');

        // Add change listeners to individual checks
        listContainer.querySelectorAll('.bulk-student-check').forEach(cb => {
          cb.addEventListener('change', updatePrintButtonState);
        });
      }

      // Reset dialog inputs
      const searchField = document.getElementById('bulk-print-search');
      if (searchField) searchField.value = '';
      const selectAllCheck = document.getElementById('bulk-print-select-all');
      if (selectAllCheck) selectAllCheck.checked = false;

      updatePrintButtonState();

      const bulkPrintModal = document.getElementById('modal-bulk-print-select');
      if (bulkPrintModal) bulkPrintModal.showModal();
    });
  }

  function updatePrintButtonState() {
    const checkedChecks = Array.from(document.querySelectorAll('.bulk-student-check:checked'));
    const count = checkedChecks.length;
    const btn = document.getElementById('btn-bulk-print-confirm');
    if (btn) {
      btn.disabled = count === 0;
      btn.innerText = count === 1 ? `Print (1)` : `Print (${count})`;
    }
  }

  // Live search inside student print checklist modal using SmartSearch
  const bulkSearchField = document.getElementById('bulk-print-search');
  if (bulkSearchField) {
    new SmartSearch(bulkSearchField, {
      debounceMs: 100,
      onInput: (val) => {
        const q = val.toLowerCase();
        const items = document.querySelectorAll('.bulk-student-item');
        items.forEach(item => {
          const name = item.querySelector('span').innerText.toLowerCase();
          item.style.display = name.includes(q) ? 'flex' : 'none';
        });
      }
    });
  }

  // Select All handler (affects only currently visible/filtered students)
  const bulkSelectAll = document.getElementById('bulk-print-select-all');
  if (bulkSelectAll) {
    bulkSelectAll.addEventListener('change', () => {
      const isChecked = bulkSelectAll.checked;
      const items = document.querySelectorAll('.bulk-student-item');
      items.forEach(item => {
        if (item.style.display !== 'none') {
          const cb = item.querySelector('.bulk-student-check');
          if (cb) cb.checked = isChecked;
        }
      });
      updatePrintButtonState();
    });
  }

  // Confirm Action print spooling trigger
  const bulkPrintConfirmBtn = document.getElementById('btn-bulk-print-confirm');
  if (bulkPrintConfirmBtn) {
    bulkPrintConfirmBtn.addEventListener('click', () => {
      const checkedChecks = Array.from(document.querySelectorAll('.bulk-student-check:checked'));
      const selectedIds = checkedChecks.map(cb => cb.value);
      if (selectedIds.length === 0) return;

      const bulkPrintModal = document.getElementById('modal-bulk-print-select');
      if (bulkPrintModal) bulkPrintModal.close();

      if (selectedIds.length === 1) {
        requestPrintReceipt(selectedIds[0]);
      } else {
        bulkPrintLedgersForIds(selectedIds, 'left');
      }
    });
  }

  async function bulkPrintLedgersForIds(studentIds, startSide = 'left') {
    if (studentIds.length === 0) return;
    const receiptContainer = document.getElementById('print-receipt-container');
    if (!receiptContainer) return;

    try {
      let html = '';
      const cards = [];
      for (let id of studentIds) {
        const s = cachedStudents.find(student => student.id.toString() === id.toString());
        if (s) {
          const card = buildStudentLedgerCard(s);
          cards.push(card);
        }
      }

      let idx = 0;
      if (startSide === 'right') {
        html += `
                <div class="receipt-page">
                  <div class="receipt-half"></div>
                  <div class="receipt-half">${cards[idx++]}</div>
                </div>
              `;
      }

      while (idx < cards.length) {
        const leftCard = cards[idx++];
        const rightCard = idx < cards.length ? cards[idx++] : '';
        html += `
                <div class="receipt-page">
                  <div class="receipt-half">${leftCard}</div>
                  <div class="receipt-half">${rightCard ? rightCard : ''}</div>
                </div>
              `;
      }

      receiptContainer.innerHTML = html;

      document.body.classList.add('print-mode-receipt');
      const styleBlock = document.createElement('style');
      styleBlock.id = 'temp-receipt-print-style';
      styleBlock.innerHTML = '@page { size: A4 landscape; margin: 0; }';
      document.head.appendChild(styleBlock);

      window.print();

      document.body.classList.remove('print-mode-receipt');
      const tempStyle = document.getElementById('temp-receipt-print-style');
      if (tempStyle) tempStyle.remove();
      receiptContainer.innerHTML = '';
    } catch (err) {
      console.error('Failed to print bulk ledger sheets:', err);
      alert('Failed to print: ' + err.message);
    }
  }

  // Number conversion helper for India system
  function numberToWords(num) {
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1].substr(0, 1))] + ' ' + a[Number(n[1].substr(1, 1))]) + ' crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2].substr(0, 1))] + ' ' + a[Number(n[2].substr(1, 1))]) + ' lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3].substr(0, 1))] + ' ' + a[Number(n[3].substr(1, 1))]) + ' thousand ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[Number(n[4].substr(0, 1))] + ' ' + a[Number(n[4].substr(1, 1))]) + ' hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5].substr(0, 1))] + ' ' + a[Number(n[5].substr(1, 1))]) : '';
    return str.trim();
  }

  // ─── 9. SUPABASE REALTIME DB SYNCHRONIZATION ──────────────────
  if (window._supabase) {
    window._supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_registrations' },
        () => {
          console.log('Supabase Realtime Update: student_registrations changed');
          hydrateDashboardAndAnalytics();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fee_payments' },
        () => {
          console.log('Supabase Realtime Update: fee_payments changed');
          hydrateDashboardAndAnalytics();
          hydrateFeeTracker();
        }
      )
      .subscribe();
  }

  // Standardize Dialog UX: Close on Backdrop Click
  document.querySelectorAll('dialog.admin-modal').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

});
