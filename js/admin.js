/* ─── js/admin.js ──────────────────────────────────────────────── */

// ⚠️ REQUIRED: Cloudinary Unsigned Upload Preset
// You must go to Cloudinary Settings -> Upload -> Add Upload Preset
// Set 'Signing Mode' to 'Unsigned' and set the Folder to `home/mqlc/updates`
const CLOUDINARY_CLOUD_NAME = 'dlcowjk3q';
const CLOUDINARY_UPLOAD_PRESET = 'wrye55gv'; // REPLACE THIS

document.addEventListener('DOMContentLoaded', () => {

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
            setTimeout(() => alert('Upload Successful! The new media is now live on the Updates slider.'), 500);
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
            setTimeout(() => alert('Upload Successful! The file is now live on the Bulletin Board.'), 500);
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
            setTimeout(() => alert('Quiz Upload Successful! The new interactive quiz has been published to your bulletin board.'), 500);
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
      const targetSub = document.getElementById(pill.getAttribute('data-sub'));
      if (targetSub) targetSub.style.display = 'block';

      // 1. If Manual Entry is activated, auto-generate the next Form Number
      if (pill.getAttribute('data-sub') === 'sub-manual') {
        initManualFormNumber();
      }
    });
  });

  // 3b. Generate OTP PIN Logic
  const btnGenerateOtp = document.getElementById('btn-generate-otp');
  const otpDisplay = document.getElementById('otp-display');

  if (btnGenerateOtp) {
    btnGenerateOtp.addEventListener('click', async () => {
      if (!window._supabase) {
        alert("Supabase not initialized.");
        return;
      }
      btnGenerateOtp.disabled = true;
      btnGenerateOtp.textContent = "Generating...";

      // Generate 6 digit random pin
      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      try {
        const { error } = await window._supabase.from('otp_pins').insert([{ pin: pin }]);
        if (error) throw error;

        otpDisplay.textContent = pin;
        otpDisplay.style.color = 'var(--admin-accent)';
      } catch (err) {
        console.error("OTP Gen Error:", err);
        alert("Failed to generate PIN: " + err.message);
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
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);">${app.form_no || 'N/A'}</td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border); font-weight: 500;">${app.student_name}</td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);">${app.course_applying}</td>
          <td style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--admin-border);"><span style="background: rgba(212, 160, 23, 0.2); color: #B08200; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${app.status.toUpperCase()}</span></td>
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
      <strong>Form Info:</strong> ${app.form_no || 'N/A'} | ${app.course_applying || 'N/A'}<br>
      <strong>Father:</strong> ${app.father_name} (${app.contact_father})<br>
      <strong>Mother:</strong> ${app.contact_mother || 'N/A'}<br>
      <strong>DOB:</strong> ${app.dob} | <strong>Gender:</strong> ${app.gender}<br>
      <strong>Address:</strong> ${app.address}<br>
      <hr style="border:0; border-top: 1px solid var(--admin-border); margin: 0.5rem 0;">
      <strong>School:</strong> ${app.school_name} (Class ${app.current_class || 'N/A'})<br>
      <strong>School Days:</strong> ${app.school_days || 'N/A'}<br>
      <strong>School Time:</strong> ${app.school_time || 'N/A'}<br>
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
        const fee = document.getElementById('input-assign-fee').value;
        if (!fee) {
          feedback.textContent = 'Please enter a valid monthly fee.';
          feedback.classList.add('error');
          return;
        }

        try {
          const { error } = await window._supabase
            .from('student_registrations')
            .update({ status: 'approved', monthly_fee: fee })
            .eq('id', id);
          if (error) throw error;

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

  // ─── 3e. Manual Form Submission Logic (Legacy Override) ────────
  const manualForm = document.getElementById('registration-form');
  const manualStatusMsg = document.getElementById('reg-status');

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

      try {
        const btn = document.getElementById('btn-submit-reg');
        btn.textContent = 'Saving Record...';
        btn.disabled = true;

        // Fetch global monthly fee setting
        let feeVal = 0;
        try {
          const { data: settingData } = await window._supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', 'monthly_fee')
            .single();
          if (settingData && settingData.setting_value) {
            feeVal = parseInt(settingData.setting_value, 10) || 0;
          }
        } catch (feeErr) {
          console.warn("Failed to retrieve global monthly fee:", feeErr);
        }

        const payload = {
          doj: fd.get('doj') || null,
          form_no: fd.get('form_no') || null,
          course_applying: fd.get('course_applying') || 'Unassigned',
          student_name: fd.get('student_name') || null,
          father_name: fd.get('father_name') || null,
          gender: fd.get('gender') || null,
          dob: fd.get('dob') || null,
          aadhar_no: fd.get('aadhar_no') || null,
          address: fd.get('address') || null,
          contact_father: fd.get('contact_father') || null,
          contact_mother: fd.get('contact_mother') || null,
          current_class: fd.get('current_class') || null,
          school_name: 'N/A',
          school_days: 'N/A',
          school_time: 'N/A',
          batch: fd.get('batch') || null,
          monthly_fee: feeVal,
          status: 'approved' // explicitly bypass queue and auto-approve manual entries
        };

        const { data, error } = await window._supabase
          .from('student_registrations')
          .insert([payload]);

        if (error) throw error;

        manualForm.reset();
        manualStatusMsg.textContent = 'Student manually registered';
        manualStatusMsg.className = 'status-msg success';
        manualStatusMsg.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
          manualStatusMsg.style.display = 'none';
          manualStatusMsg.textContent = '';
        }, 3000);

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

    // Aadhar Card Auto-Formatter (XXXX-XXXX-XXXX)
    const aadharInput = manualForm.querySelector('input[name="aadhar_no"]');
    if (aadharInput) {
      aadharInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove all non-numerics
        if (val.length > 12) val = val.slice(0, 12); // Limit to 12 digits

        let formatted = '';
        for (let i = 0; i < val.length; i++) {
          if (i > 0 && i % 4 === 0) formatted += '-';
          formatted += val[i];
        }
        e.target.value = formatted;
      });
    }

    // Auto-generate Form Number (MQLC-YYYY-XXXX)
    async function initManualFormNumber() {
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
          parentSubtext = ` <span style="font-size: 0.8rem; font-weight: 500; color: var(--admin-muted);">(${relation} of ${app.father_name})</span>`;
        }

        feedContainer.innerHTML += `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="activity-detail">
            <h4 style="margin-bottom: 0.25rem;">${app.student_name}${parentSubtext}</h4>
            <p style="font-size: 0.8rem; margin-bottom: 0.25rem;">${app.course_applying} | Form: ${app.form_no || 'N/A'}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${app.status === 'left' ? `
                <span style="font-size: 0.7rem; background: #fde8e8; color: #c53030; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">Inactive</span>
                ${app.exit_reason ? `<span style="font-size: 0.7rem; background: #f3f4f6; color: #4b5563; padding: 2px 6px; border-radius: 4px; font-weight: 500;">Reason: ${app.exit_reason}</span>` : ''}
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
    
    const statusVal = student.status || 'approved';
    document.getElementById('edit-student-status').value = statusVal;

    // Set exit audit values
    const exitDateVal = student.exit_date || '';
    const exitReasonVal = student.exit_reason || '';
    const exitNotesVal = student.exit_notes || '';

    const dateVal = exitDateVal ? new Date(exitDateVal) : new Date();
    exitDpSelectDate(dateVal);
    const input = document.getElementById('edit-exit-date');
    if (input) input.value = exitDateVal; // set actual database value
    const display = document.getElementById('exit-date-display');
    if (display) display.textContent = exitDateVal ? exitDpFormatDisplay(dateVal) : 'Select date';

    const reasonInput = document.getElementById('edit-exit-reason');
    if (reasonInput) reasonInput.value = exitReasonVal;
    const notesInput = document.getElementById('edit-exit-notes');
    if (notesInput) notesInput.value = exitNotesVal;

    const exitSection = document.getElementById('edit-exit-audit-section');
    if (exitSection && reasonInput) {
      if (statusVal === 'left') {
        exitSection.style.display = 'block';
        reasonInput.required = true;
      } else {
        exitSection.style.display = 'none';
        reasonInput.required = false;
      }
    }

    document.getElementById('edit-status-msg').style.display = 'none';
    document.getElementById('modal-edit-student').showModal();
  }

  // ─── Inline Date Picker Engine for Student Exit ───
  let exitDpViewYear = new Date().getFullYear();
  let exitDpViewMonth = new Date().getMonth();

  function exitDpFormatDisplay(date) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function exitDpToISO(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function exitDpSelectDate(date) {
    const input = document.getElementById('edit-exit-date');
    const display = document.getElementById('exit-date-display');
    if (input) input.value = exitDpToISO(date);
    if (display) display.textContent = exitDpFormatDisplay(date);
    exitDpViewYear = date.getFullYear();
    exitDpViewMonth = date.getMonth();
    exitDpRenderGrid();
  }

  function exitDpRenderGrid() {
    const grid = document.getElementById('exit-dp-grid');
    const label = document.getElementById('exit-dp-month-label');
    if (!grid || !label) return;

    const viewDate = new Date(exitDpViewYear, exitDpViewMonth, 1);
    label.textContent = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const today = new Date();
    const selectedVal = document.getElementById('edit-exit-date')?.value || '';
    const firstDay = viewDate.getDay();
    const daysInMonth = new Date(exitDpViewYear, exitDpViewMonth + 1, 0).getDate();

    let html = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      .map(d => `<span class="dp-head">${d}</span>`).join('');

    for (let i = 0; i < firstDay; i++) {
      html += `<span></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = exitDpToISO(new Date(exitDpViewYear, exitDpViewMonth, day));
      const isToday = (day === today.getDate() && exitDpViewMonth === today.getMonth() && exitDpViewYear === today.getFullYear());
      const isSelected = (iso === selectedVal);
      const cls = `dp-day${isToday ? ' dp-today' : ''}${isSelected ? ' dp-selected' : ''}`;
      html += `<button type="button" class="${cls}" data-date="${iso}">${day}</button>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.dp-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const [y, m, d] = btn.dataset.date.split('-').map(Number);
        exitDpSelectDate(new Date(y, m - 1, d));
        const dropdown = document.getElementById('exit-date-dropdown');
        if (dropdown) dropdown.style.display = 'none';
      });
    });
  }

  // Toggle calendar
  const exitDpTrigger = document.getElementById('exit-date-trigger');
  const exitDpDropdown = document.getElementById('exit-date-dropdown');
  if (exitDpTrigger && exitDpDropdown) {
    exitDpTrigger.addEventListener('click', () => {
      const isOpen = exitDpDropdown.style.display !== 'none';
      exitDpDropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) exitDpRenderGrid();
    });
  }

  // Prev / Next month
  const exitDpPrev = document.getElementById('exit-dp-prev-month');
  const exitDpNext = document.getElementById('exit-dp-next-month');
  if (exitDpPrev) exitDpPrev.addEventListener('click', () => { exitDpViewMonth--; if (exitDpViewMonth < 0) { exitDpViewMonth = 11; exitDpViewYear--; } exitDpRenderGrid(); });
  if (exitDpNext) exitDpNext.addEventListener('click', () => { exitDpViewMonth++; if (exitDpViewMonth > 11) { exitDpViewMonth = 0; exitDpViewYear++; } exitDpRenderGrid(); });

  // Today button
  const exitDpTodayBtn = document.getElementById('exit-dp-today-btn');
  if (exitDpTodayBtn) exitDpTodayBtn.addEventListener('click', () => {
    exitDpSelectDate(new Date());
    if (exitDpDropdown) exitDpDropdown.style.display = 'none';
  });

  // Change listener to show/hide exit audit section dynamically
  const editStatusSelect = document.getElementById('edit-student-status');
  const editExitSection = document.getElementById('edit-exit-audit-section');
  const editExitDate = document.getElementById('edit-exit-date');
  const editExitReason = document.getElementById('edit-exit-reason');

  if (editStatusSelect && editExitSection) {
    editStatusSelect.addEventListener('change', () => {
      if (editStatusSelect.value === 'left') {
        editExitSection.style.display = 'block';
        if (editExitReason) editExitReason.required = true;
        if (editExitDate && !editExitDate.value) {
          exitDpSelectDate(new Date());
        }
      } else {
        editExitSection.style.display = 'none';
        if (editExitReason) editExitReason.required = false;
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

      const payload = {
        student_name: document.getElementById('edit-student-name').value,
        father_name: document.getElementById('edit-student-father').value,
        batch: document.getElementById('edit-student-batch').value,
        course_applying: document.getElementById('edit-student-course').value,
        status: statusVal
      };

      if (statusVal === 'left') {
        let adminEmail = 'admin';
        try {
          const { data: { session } } = await window._supabase.auth.getSession();
          if (session?.user?.email) adminEmail = session.user.email;
        } catch (_) {}

        payload.exit_date = document.getElementById('edit-exit-date')?.value || new Date().toISOString().split('T')[0];
        payload.exit_reason = document.getElementById('edit-exit-reason')?.value || 'Other';
        payload.exit_notes = document.getElementById('edit-exit-notes')?.value || '';
        payload.exit_recorded_by = adminEmail;
      } else {
        payload.exit_date = null;
        payload.exit_reason = null;
        payload.exit_notes = null;
        payload.exit_recorded_by = null;
      }

      // Optimistic Concurrency Control Check
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
                await hydrateDashboardAndAnalytics();
                setTimeout(() => {
                  document.getElementById('modal-edit-student').close();
                }, 1000);
                return;
              }
            }
          }
        } catch (err) {
          console.warn('OCC check failed, skipping check:', err);
        }
      }

      try {
        statusMsg.textContent = 'Updating...';
        statusMsg.className = 'status-msg';
        statusMsg.style.display = 'block';

        const { error } = await window._supabase
          .from('student_registrations')
          .update(payload)
          .eq('id', id);

        if (error) throw error;

        statusMsg.textContent = 'Student updated successfully';
        statusMsg.className = 'status-msg success';

        // Refresh cache and UI
        await hydrateDashboardAndAnalytics();

        setTimeout(() => {
          document.getElementById('modal-edit-student').close();
        }, 1000);

      } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Failed to update: ' + err.message;
        statusMsg.className = 'status-msg error';
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
    if (chartsRendered || typeof Chart === 'undefined') return;

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
      const reason = s.exit_reason || 'Unspecified';
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

      if (searchInput) searchInput.value = '';
      if (statusSelect) statusSelect.value = 'approved';
      if (batchSelect) batchSelect.value = 'all';
      if (courseSelect) courseSelect.value = 'all';

      // Re-trigger matrix rendering with default filters
      renderStudentMatrix();
    });
  }

  // Wire real-time cohesive filter events
  const filterInput = document.getElementById('ds-filter-search');
  const filterDropdown = document.getElementById('ds-filter-status');
  const batchDropdown = document.getElementById('ds-filter-batch');
  const courseDropdown = document.getElementById('ds-filter-course');
  if (filterInput) filterInput.addEventListener('input', renderStudentMatrix);
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
      alert('No data to export based on current filters.');
      return;
    }

    if (typeof XLSX === 'undefined') {
      alert('Excel engine is still loading. Please try again in a moment.');
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

    // Prepare Data for SheetJS
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

    const ws = XLSX.utils.json_to_sheet(data);

    // 1. Set Column Widths (Better readability)
    const wscols = [
      { wch: 15 }, // Form No
      { wch: 25 }, // Student Name
      { wch: 25 }, // Father Name
      { wch: 25 }, // Course
      { wch: 10 }, // Batch
      { wch: 10 }, // Status
      { wch: 12 }, // Joining Date
      { wch: 10 }, // Gender
      { wch: 15 }, // Aadhar No.
      { wch: 30 }, // School
      { wch: 15 }  // Class
    ];
    ws['!cols'] = wscols;

    // 2. Enable Autofilter for the whole range
    const range = XLSX.utils.decode_range(ws['!ref']);
    ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

    // 3. Freeze Top Row (Header)
    ws['!views'] = [{ state: 'frozen', ySplit: 1, activePane: 'bottomLeft', pane: 'bottomLeft' }];

    // 4. Create Workbook and Download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `MQLC_Students_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      alert('No data to export based on current filters.');
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

  // Initial hydration is now triggered by auth.js via window.hydrateDashboardAndAnalytics()
  // when the dashboard becomes visible, eliminating the blind 1s delay.
  window.hydrateDashboardAndAnalytics = hydrateDashboardAndAnalytics;

  // Safeguard: If the dashboard is already made visible by auth.js before admin.js loaded, run hydration now
  const dashView = document.getElementById('dashboard-view');
  if (dashView && dashView.style.display === 'grid') {
    hydrateDashboardAndAnalytics();
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

  // Slab-based pro-rata expected fee for a student in a given month
  // Handles: enrollment check, exemption check, joining-month carry-forward
  // Slabs: DOJ day 1-10 → full fee that month
  //        DOJ day 11-20 → ₹0 that month, next month = fee + half (carry-forward)
  //        DOJ day 21+   → ₹0 that month, next month = normal fee
  function getExpectedFee(student, month) {
    const fee = parseInt(student.monthly_fee) || 0;
    if (fee === 0) return 0;
    if (!isEnrolledForMonth(student.doj, month)) return 0;
    if (isExemptForMonth(student.id, month)) return 0;

    if (student.doj) {
      const dojMonth = student.doj.substring(0, 7);
      const day = parseInt(student.doj.substring(8, 10)) || 1;

      // Joining month: only charge if joined on or before 10th
      if (dojMonth === month) {
        if (day > 10) return 0;
      }

      // Month after joining: carry forward half fee if joined 11th-20th
      if (day > 10 && day <= 20) {
        const [dy, dm] = dojMonth.split('-').map(Number);
        const nd = new Date(dy, dm, 15); // next month (dm is 1-based → Date treats as 0-based+1 = next)
        const nextMonth = nd.getFullYear() + '-' + String(nd.getMonth() + 1).padStart(2, '0');
        if (month === nextMonth) {
          return fee + Math.round(fee / 2); // e.g. ₹300 + ₹150 = ₹450
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

  if (feeBatchFilter) feeBatchFilter.addEventListener('change', renderFeeMatrix);
  if (feeNameFilter) feeNameFilter.addEventListener('input', renderFeeMatrix);
  if (feeStatusFilter) feeStatusFilter.addEventListener('change', renderFeeMatrix);

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

    let students = cachedStudents.filter(s => s.status === 'approved' && isEnrolledForMonth(s.doj, feeCurrentMonth));

    // Apply Filters (Name, Batch, Status)
    students = students.filter(s => {
      if (nameFilter && !(s.student_name || '').toLowerCase().includes(nameFilter)) return false;
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
          parentSubtext = ` <span style="font-size: 0.8rem; font-weight: 500; color: var(--admin-muted);">(${relation} of ${s.father_name})</span>`;
        }

        // Pro-rata indicator
        let proRataNote = '';
        if (!exempt && rawFee > 0 && expFee > 0 && expFee > rawFee) {
          const carryAmt = expFee - rawFee;
          proRataNote = `<span style="font-size: 0.7rem; background: #ede9fe; color: #7c3aed; padding: 1px 6px; border-radius: 4px; margin-left: 4px;">incl. ₹${carryAmt.toLocaleString('en-IN')} carry‑forward</span>`;
        }

        // Fee line
        let feeLine = '';
        if (exempt) {
          feeLine = `<p style="font-size: 0.8rem; margin-bottom: 0.15rem; color: var(--admin-muted); font-style: italic;">Exempt — ${exemptRec ? exemptRec.reason : 'No reason'}</p>`;
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

        // Exempt toggle button — only show for unpaid students or to restore exemptions
        const exemptBtn = exempt
          ? `<button class="btn-fee-unexempt btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px; color: #7c3aed;" title="Remove exemption">▶ Restore</button>`
          : (rawFee > 0 && paid === 0 && expFee > 0)
            ? `<button class="btn-fee-exempt btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="Exempt this month">⏸ Exempt</button>`
            : '';

        feed.innerHTML += `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;${exempt ? ' opacity: 0.65;' : ''}">
          <div class="activity-detail" style="flex: 1; min-width: 180px;">
            <h4 style="margin-bottom: 0.25rem;">${s.student_name}${parentSubtext}</h4>
            ${feeLine}
            ${arrearsLine}
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge ${statusClass}" style="font-size: 0.75rem;">${statusBadge}</span>
            ${rawFee === 0 ? `<button class="btn-set-fee" data-sid="${s.id}" data-name="${s.student_name}">✎ Set Fee</button>` : ''}
            ${showRecord ? `<button class="btn-fee-record btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" data-fee="${expFee}" data-rawfee="${rawFee}" data-paid="${paid}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;">💰 Record</button>` : ''}
            ${showUndo ? `<button class="btn-fee-undo btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="Undo last payment">⟳</button>` : ''}
            ${exemptBtn}
            <button class="btn-fee-history btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="View history">📋</button>
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
      btn.addEventListener('click', () => openPaymentModal(btn.dataset.sid, btn.dataset.name, parseInt(btn.dataset.fee), parseInt(btn.dataset.paid), parseInt(btn.dataset.rawfee || btn.dataset.fee)));
    });
    feed.querySelectorAll('.btn-fee-undo').forEach(btn => {
      btn.addEventListener('click', () => undoLastPayment(btn.dataset.sid, btn.dataset.name));
    });
    feed.querySelectorAll('.btn-fee-history').forEach(btn => {
      btn.addEventListener('click', () => toggleHistory(btn.dataset.sid));
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
        try {
          await window._supabase.from('fee_exemptions')
            .delete().eq('student_id', btn.dataset.sid).eq('month', feeCurrentMonth);
          cachedFeeExemptions = cachedFeeExemptions.filter(e => !(e.student_id === btn.dataset.sid && e.month === feeCurrentMonth));
          renderFeeMatrix();
        } catch (err) { console.error('Un-exempt error:', err); alert('Failed to remove exemption.'); }
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

  function openPaymentModal(studentId, name, fee, paid, rawFee) {
    rawFee = rawFee || fee;
    const remaining = Math.max(0, fee - paid);
    const sidEl = document.getElementById('pay-student-id');
    sidEl.value = studentId;
    sidEl.dataset.fee = rawFee; // use raw monthly fee for split calculations
    sidEl.dataset.expfee = fee; // store expected fee for display

    document.getElementById('pay-month').value = feeCurrentMonth;
    document.getElementById('pay-student-name').textContent = name;
    document.getElementById('pay-month-label').textContent = feeMonthLabel(feeCurrentMonth);
    document.getElementById('pay-expected').textContent = '₹' + fee.toLocaleString('en-IN');
    document.getElementById('pay-already').textContent = '₹' + paid.toLocaleString('en-IN');
    document.getElementById('pay-remaining').textContent = '₹' + remaining.toLocaleString('en-IN');
    document.getElementById('pay-amount').value = remaining;

    // Populate month selectors
    const months = generateMonthOptions(feeCurrentMonth);
    const fromEl = document.getElementById('pay-month-from');
    const toEl = document.getElementById('pay-month-to');
    [fromEl, toEl].forEach(sel => {
      sel.innerHTML = months.map(m =>
        `<option value="${m}" ${m === feeCurrentMonth ? 'selected' : ''}>${feeMonthLabel(m)}</option>`
      ).join('');
    });

    // Set today's date using inline datepicker
    dpSelectDate(new Date());
    document.getElementById('pay-date-dropdown').style.display = 'none';

    document.getElementById('pay-notes').value = '';
    document.getElementById('pay-status-msg').style.display = 'none';
    document.getElementById('pay-split-preview').style.display = 'none';
    document.getElementById('modal-record-payment').showModal();

    // Trigger initial preview
    updateSplitPreview();
  }

  // ─── Inline Date Picker Engine ───
  let dpViewYear, dpViewMonth; // currently viewed month in the calendar

  function dpFormatDisplay(date) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function dpToISO(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function dpSelectDate(date) {
    document.getElementById('pay-date').value = dpToISO(date);
    document.getElementById('pay-date-display').textContent = dpFormatDisplay(date);
    dpViewYear = date.getFullYear();
    dpViewMonth = date.getMonth();
    dpRenderGrid();
  }

  function dpRenderGrid() {
    const grid = document.getElementById('dp-grid');
    const label = document.getElementById('dp-month-label');
    if (!grid || !label) return;

    const viewDate = new Date(dpViewYear, dpViewMonth, 1);
    label.textContent = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const today = new Date();
    const selectedVal = document.getElementById('pay-date').value;
    const firstDay = viewDate.getDay(); // 0=Sun
    const daysInMonth = new Date(dpViewYear, dpViewMonth + 1, 0).getDate();

    let html = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      .map(d => `<span class="dp-head">${d}</span>`).join('');

    // Blanks for days before 1st
    for (let i = 0; i < firstDay; i++) {
      html += `<span></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = dpToISO(new Date(dpViewYear, dpViewMonth, day));
      const isToday = (day === today.getDate() && dpViewMonth === today.getMonth() && dpViewYear === today.getFullYear());
      const isSelected = (iso === selectedVal);
      const cls = `dp-day${isToday ? ' dp-today' : ''}${isSelected ? ' dp-selected' : ''}`;
      html += `<button type="button" class="${cls}" data-date="${iso}">${day}</button>`;
    }

    grid.innerHTML = html;

    // Bind day clicks
    grid.querySelectorAll('.dp-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const [y, m, d] = btn.dataset.date.split('-').map(Number);
        dpSelectDate(new Date(y, m - 1, d));
        document.getElementById('pay-date-dropdown').style.display = 'none';
      });
    });
  }

  // Toggle calendar
  const dpTrigger = document.getElementById('pay-date-trigger');
  const dpDropdown = document.getElementById('pay-date-dropdown');
  if (dpTrigger && dpDropdown) {
    dpTrigger.addEventListener('click', () => {
      const isOpen = dpDropdown.style.display !== 'none';
      dpDropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) dpRenderGrid();
    });
  }

  // Prev / Next month
  const dpPrev = document.getElementById('dp-prev-month');
  const dpNext = document.getElementById('dp-next-month');
  if (dpPrev) dpPrev.addEventListener('click', () => { dpViewMonth--; if (dpViewMonth < 0) { dpViewMonth = 11; dpViewYear--; } dpRenderGrid(); });
  if (dpNext) dpNext.addEventListener('click', () => { dpViewMonth++; if (dpViewMonth > 11) { dpViewMonth = 0; dpViewYear++; } dpRenderGrid(); });

  // Today button
  const dpTodayBtn = document.getElementById('dp-today-btn');
  if (dpTodayBtn) dpTodayBtn.addEventListener('click', () => {
    dpSelectDate(new Date());
    document.getElementById('pay-date-dropdown').style.display = 'none';
  });

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
        statusMsg.textContent = '"To" month cannot be before "From" month.';
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
        return;
      }

      // Native date input already returns YYYY-MM-DD
      const paidOn = document.getElementById('pay-date').value;
      if (!paidOn) {
        statusMsg.textContent = 'Please select a valid date.';
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
        return;
      }

      const notes = document.getElementById('pay-notes').value.trim();

      if (!totalAmount || totalAmount <= 0) {
        statusMsg.textContent = 'Please enter a valid amount.';
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
        return;
      }

      btn.textContent = 'Recording...';
      btn.disabled = true;

      try {
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

        const msg = isSingleMonth
          ? 'Payment recorded successfully!'
          : `₹${totalAmount.toLocaleString('en-IN')} split across ${split.length} months successfully!`;
        statusMsg.textContent = msg;
        statusMsg.className = 'status-msg success';
        statusMsg.style.display = 'block';

        setTimeout(() => {
          document.getElementById('modal-record-payment').close();
          hydrateFeeTracker();
        }, 800);
      } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Failed: ' + err.message;
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
      } finally {
        btn.textContent = 'Record Payment';
        btn.disabled = false;
      }
    });
  }

  // ─── Undo Last Payment ─────────
  async function undoLastPayment(studentId, name) {
    if (!confirm(`Undo the last payment for ${name} in ${feeMonthLabel(feeCurrentMonth)}?`)) return;
    try {
      const payments = cachedFeePayments.filter(p => p.student_id === studentId && p.month === feeCurrentMonth).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (!payments.length) return;
      const { error } = await window._supabase.from('fee_payments').delete().eq('id', payments[0].id);
      if (error) throw error;
      await hydrateFeeTracker();
    } catch (err) {
      console.error(err);
      alert('Failed to undo: ' + err.message);
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
      html += '<thead><tr style="border-bottom: 1px solid var(--admin-border);"><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Month</th><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Date Paid</th><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Amount</th><th style="text-align: right; padding: 4px 8px; color: var(--admin-muted);">Action</th></tr></thead><tbody>';
      Object.keys(byMonth).sort().reverse().forEach(month => {
        byMonth[month].forEach(p => {
          html += `<tr style="border-bottom: 1px solid var(--admin-bg);"><td style="padding: 4px 8px;">${feeMonthLabel(month)}</td><td style="padding: 4px 8px;">${p.paid_on || '—'}</td><td style="padding: 4px 8px; font-weight: 600;">₹${p.amount.toLocaleString('en-IN')}</td><td style="padding: 4px 8px; text-align: right;"><button class="btn-print-receipt btn-secondary" data-pid="${p.id}" style="padding: 2px 8px; font-size: 0.72rem; border-radius: 50px;">📄 Receipt</button></td></tr>`;
        });
      });
      html += '</tbody></table>';
      panel.innerHTML = html;

      // Bind print receipt buttons
      panel.querySelectorAll('.btn-print-receipt').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const pid = e.currentTarget.getAttribute('data-pid');
          requestPrintReceipt(pid);
        });
      });
    } catch (err) {
      panel.innerHTML = '<em style="color: #dc2626;">Error loading history.</em>';
    }
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
      return { Name: s.student_name, Batch: s.batch || '', Course: s.course_applying || '', 'Expected (₹)': expFee, 'Paid (₹)': paid, 'Remaining (₹)': remaining, Status: status };
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
      if (typeof XLSX !== 'undefined') {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fee Report');
        XLSX.writeFile(wb, `MQLC_Fee_Report_${feeCurrentMonth}.xlsx`);
      } else {
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h]}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `MQLC_Fee_Report_${feeCurrentMonth}.csv`; a.click();
      }
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
              <strong>Reason:</strong> ${student.exit_reason || 'Unspecified'}<br>
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
                  <th style="padding: 8px 12px; font-weight: 700; color: var(--admin-text);">Amount</th>
                  <th style="padding: 8px 12px; font-weight: 700; color: var(--admin-text); text-align: right;">Receipt</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(p => `
                  <tr style="border-bottom: 1px solid var(--admin-border);">
                    <td style="padding: 8px 12px; font-weight: 600; color: var(--admin-accent);">${feeMonthLabel(p.month)}</td>
                    <td style="padding: 8px 12px; color: var(--admin-muted);">${p.paid_on || '—'}</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: var(--admin-text);">₹${p.amount.toLocaleString('en-IN')}</td>
                    <td style="padding: 8px 12px; text-align: right;">
                      <button class="btn-profile-receipt btn-secondary" data-pid="${p.id}" style="padding: 2px 8px; font-size: 0.7rem; border-radius: 50px;">📄 Receipt</button>
                    </td>
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

      const payBtn = document.getElementById('btn-profile-pay');
      if (payBtn) {
        payBtn.replaceWith(payBtn.cloneNode(true));
        document.getElementById('btn-profile-pay').addEventListener('click', () => {
          modal.close();
          const rawFee = parseInt(student.monthly_fee) || 0;
          const expFee = getExpectedFee(student, feeCurrentMonth);
          const paidAmt = cachedFeePayments.filter(p => p.student_id === student.id && p.month === feeCurrentMonth).reduce((sum, p) => sum + (p.amount || 0), 0);
          openPaymentModal(student.id, student.student_name, expFee, paidAmt, rawFee);
        });
      }

      content.querySelectorAll('.btn-profile-receipt').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const pid = e.currentTarget.getAttribute('data-pid');
          requestPrintReceipt(pid);
        });
      });
    }

    // ─── Print Position Request Wrapper ─────────────────
    function requestPrintReceipt(paymentId) {
      const choiceModal = document.getElementById('modal-print-choice');
      if (!choiceModal) {
        printReceipt(paymentId, 'left');
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
        printReceipt(paymentId, 'left');
      });
      
      newRightBtn.addEventListener('click', () => {
        choiceModal.close();
        printReceipt(paymentId, 'right');
      });
      
      choiceModal.showModal();
    }

    // ─── Transaction Receipt Printer Engine ──────────────
    async function printReceipt(paymentId, position = 'left') {
      if (!window._supabase) {
        alert('Supabase is not initialized.');
        return;
      }
      const receiptContainer = document.getElementById('print-receipt-container');
      if (!receiptContainer) return;

      try {
        const { data: payments, error } = await window._supabase
          .from('fee_payments')
          .select('*, student_registrations(*)')
          .eq('id', paymentId);
        
        if (error) throw error;
        if (!payments || !payments.length) {
          alert('Payment record not found.');
          return;
        }
        
        const p = payments[0];
        const s = p.student_registrations;
        if (!s) {
          alert('Student record associated with this payment not found.');
          return;
        }

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
          const mPaid = cachedFeePayments.filter(pay => pay.student_id === s.id && pay.month === m).reduce((sum, pay) => sum + (pay.amount || 0), 0);
          
          let bgColor = '#f1f3f4';
          let textColor = '#5f6368';
          let textLabel = '—';
          
          if (m > p.month) {
            bgColor = '#f1f3f4';
            textColor = '#5f6368';
            textLabel = 'TBD';
          } else if (mExempt) {
            bgColor = '#f1f3f4';
            textColor = '#5f6368';
            textLabel = 'Exempt';
          } else if (mExp === 0) {
            bgColor = '#f1f3f4';
            textColor = '#5f6368';
            textLabel = 'N/A';
          } else if (mPaid >= mExp) {
            bgColor = '#e6f4ea'; // light green
            textColor = '#137333';
            textLabel = `₹${mPaid}`;
          } else if (mPaid > 0) {
            bgColor = '#fef7e0'; // light yellow
            textColor = '#b06000';
            textLabel = `₹${mPaid}`;
          } else {
            bgColor = '#fce8e6'; // light red
            textColor = '#c5221f';
            textLabel = `₹0`;
          }
          
          return `<td style="width: 16.6%; border: 1.5px solid #2D6A4F; padding: 5px; background-color: ${bgColor}; color: ${textColor}; font-weight: 700; text-align: center;">
            <div style="font-size: 0.58rem; text-transform: uppercase; margin-bottom: 2px;">${mLabel}</div>
            <div style="font-size: 0.72rem;">${textLabel}</div>
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

        // Calculate exact total outstanding balance and list outstanding months in parenthesis
        const expFee = getExpectedFee(s, feeCurrentMonth);
        const paid = cachedFeePayments.filter(pay => pay.student_id === s.id && pay.month === feeCurrentMonth).reduce((sum, pay) => sum + (pay.amount || 0), 0);
        const remaining = Math.max(0, expFee - paid);
        const arrears = calcArrears(s, feeCurrentMonth);
        const totalOutstanding = remaining + arrears;

        const outstandingMonths = [];
        const [asy, asm] = ARREARS_START.split('-').map(Number);
        const [cy, cm] = feeCurrentMonth.split('-').map(Number);
        let cur = new Date(asy, asm - 1, 15);
        const end = new Date(cy, cm - 1, 15);
        while (cur <= end) {
          const ym = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0');
          const mExp = getExpectedFee(s, ym);
          const mExempt = isExemptForMonth(s.id, ym);
          if (!mExempt && mExp > 0) {
            const mPaid = cachedFeePayments.filter(pay => pay.student_id === s.id && pay.month === ym).reduce((sum, pay) => sum + (pay.amount || 0), 0);
            const mDue = mExp - mPaid;
            if (mDue > 0) {
              const mLabel = cur.toLocaleDateString('en-US', { month: 'short' });
              outstandingMonths.push(mLabel.toLowerCase());
            }
          }
          cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 15);
        }

        let outstandingLabel = `₹${totalOutstanding.toLocaleString('en-IN')}`;
        let statusColor = '#137333'; // green
        if (totalOutstanding > 0) {
          statusColor = '#c5221f'; // red
          if (outstandingMonths.length > 0) {
            outstandingLabel += ` (${outstandingMonths.join(', ')})`;
          }
        }

        const receiptNo = `MQLC/${String(s.id).split('-')[0].toUpperCase()}`;
        const amountWords = numberToWords(p.amount) + ' Rupees Only';

        const cardHtml = `
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
                  <span style="font-size: 1.25rem; font-weight: 800; color: #2D6A4F;">₹${p.amount.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 0.72rem; color: #666;">
                <div style="text-align: center; width: 45%;">
                  <div style="height: 35px;"></div>
                  <div style="border-top: 1.2px solid #bbb; padding-top: 4px; font-weight: 600;">Authorized Signatory</div>
                </div>
                <div style="text-align: center; width: 45%;">
                  <div style="height: 35px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-style: italic; color: #888;">Recorded by: ${p.recorded_by || 'admin'}</div>
                  <div style="border-top: 1.2px solid #bbb; padding-top: 4px; font-weight: 600;">Receiver's Signature</div>
                </div>
              </div>
            </div>
          </div>
        `;

        if (position === 'left') {
          receiptContainer.innerHTML = `
            <div class="receipt-half">${cardHtml}</div>
            <div class="receipt-half"></div>
          `;
        } else {
          receiptContainer.innerHTML = `
            <div class="receipt-half"></div>
            <div class="receipt-half">${cardHtml}</div>
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

    // Number conversion helper for India system
    function numberToWords(num) {
      const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      
      if ((num = num.toString()).length > 9) return 'overflow';
      let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1].substr(0,1))] + ' ' + a[Number(n[1].substr(1,1))]) + ' crore ' : '';
      str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2].substr(0,1))] + ' ' + a[Number(n[2].substr(1,1))]) + ' lakh ' : '';
      str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3].substr(0,1))] + ' ' + a[Number(n[3].substr(1,1))]) + ' thousand ' : '';
      str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[Number(n[4].substr(0,1))] + ' ' + a[Number(n[4].substr(1,1))]) + ' hundred ' : '';
      str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5].substr(0,1))] + ' ' + a[Number(n[5].substr(1,1))]) : '';
      return str.trim();
    }

});
