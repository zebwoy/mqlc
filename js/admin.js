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

      // Collect Data
      const payload = {
        doj: fd.get('doj') || null,
        form_no: fd.get('form_no') || null,
        course_applying: 'Unassigned',
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
        status: 'approved' // explicitly bypass queue and auto-approve manual entries
      };

      try {
        const btn = document.getElementById('btn-submit-reg');
        btn.textContent = 'Saving Record...';
        btn.disabled = true;

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
      filtered = filtered.filter(s => s.course_applying === courseFilter);
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
              ${app.status === 'left' ? `<span style="font-size: 0.7rem; background: #fde8e8; color: #c53030; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">Inactive</span>` : ''}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge ${stClass}">${app.status}</span>
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
    document.getElementById('edit-student-status').value = student.status || 'approved';
    document.getElementById('edit-status-msg').style.display = 'none';

    document.getElementById('modal-edit-student').showModal();
  }

  const editForm = document.getElementById('form-edit-student');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-student-id').value;
      const statusMsg = document.getElementById('edit-status-msg');

      const payload = {
        student_name: document.getElementById('edit-student-name').value,
        father_name: document.getElementById('edit-student-father').value,
        batch: document.getElementById('edit-student-batch').value,
        course_applying: document.getElementById('edit-student-course').value,
        status: document.getElementById('edit-student-status').value
      };

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
      if (revEl) revEl.textContent = '₹' + (approved.length * fee).toLocaleString();

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

  function renderCharts(approvedData) {
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

    chartsRendered = true;
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
    if (batchFilter !== 'all') filtered = filtered.filter(s => s.batch === batchFilter);
    if (courseFilter !== 'all') filtered = filtered.filter(s => s.course_applying === courseFilter);
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
    if (courseFilter !== 'all') filtered = filtered.filter(s => s.course_applying === courseFilter);
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

    orderedKeys.forEach(batchName => {
      const students = groups[batchName];

      // Batch section header
      tableHTML += `
        <div style="margin-top:14pt;margin-bottom:6pt;padding:5pt 8pt;background:#2D6A4F;color:#fff;border-radius:4pt;font-size:9pt;font-weight:700;font-family:'Inter',sans-serif;">
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
              <th style="${thStyle}">Status</th>
              <th style="${thStyle}">Gender</th>
              <th style="${thStyle}">Contact</th>
              <th style="${thStyle}">Aadhar No.</th>
            </tr>
          </thead>
          <tbody>`;

      students.forEach((s, i) => {
        const bgColor = i % 2 === 0 ? '#fff' : '#f8f9fa';
        const contact = s.contact_father || s.contact_mother || 'N/A';
        tableHTML += `
            <tr style="background:${bgColor};">
              <td style="${tdStyle}">${i + 1}</td>
              <td style="${tdStyle}">${s.form_no || 'N/A'}</td>
              <td style="${tdStyle}font-weight:600;">${s.student_name || ''}</td>
              <td style="${tdStyle}">${s.father_name || ''}</td>
              <td style="${tdStyle}">${s.course_applying || ''}</td>
              <td style="${tdStyle}text-transform:capitalize;">${s.status || ''}</td>
              <td style="${tdStyle}">${s.gender || ''}</td>
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

  function feeMonthLabel(ym) {
    const [y, m] = ym.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
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
    if (el('fee-kpi-expected'))  el('fee-kpi-expected').innerHTML = shimmer;
    if (el('fee-kpi-collected')) el('fee-kpi-collected').innerHTML = shimmer;
    if (el('fee-kpi-pending'))   el('fee-kpi-pending').innerHTML = shimmer;
    if (el('fee-kpi-rate'))      el('fee-kpi-rate').innerHTML = '<span class="skeleton-value"></span>';
    if (el('fee-kpi-rate-sub'))  el('fee-kpi-rate-sub').textContent = '';

    // Inline loading indicator inside the fee feed
    const feeFeed = document.getElementById('fee-matrix-feed');
    if (feeFeed) feeFeed.innerHTML = '<div class="inline-loader"><div class="mini-spinner"></div>Loading fee data</div>';

    try {
      // Ensure student cache is fresh
      if (!cachedStudents || !cachedStudents.length) {
        const { data } = await window._supabase.from('student_registrations').select('*');
        cachedStudents = data || [];
      }
      // Fetch payments for this month
      const { data: payments, error } = await window._supabase
        .from('fee_payments')
        .select('*')
        .eq('month', feeCurrentMonth);
      if (error) throw error;
      cachedFeePayments = payments || [];
      renderFeeMatrix();
    } catch (err) {
      console.error('Fee tracker error:', err);
    }
  }

  function renderFeeMatrix() {
    const feed = document.getElementById('fee-matrix-feed');
    const countEl = document.getElementById('fee-filter-count');
    if (!feed) return;

    const batchFilter = feeBatchFilter ? feeBatchFilter.value : 'all';
    const statusFilter = feeStatusFilter ? feeStatusFilter.value : 'all';
    const nameFilter = feeNameFilter ? feeNameFilter.value.toLowerCase().trim() : '';

    let students = cachedStudents.filter(s => s.status === 'approved');

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
        const fee = parseInt(s.monthly_fee) || 0;
        const paid = cachedFeePayments.filter(p => p.student_id === s.id).reduce((sum, p) => sum + (p.amount || 0), 0);
        let status = 'unpaid';
        if (paid >= fee && fee > 0) status = 'paid';
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

    // KPI calculations
    let totalExpected = 0, totalCollected = 0, paidCount = 0;
    students.forEach(s => {
      const fee = parseInt(s.monthly_fee) || 0;
      totalExpected += fee;
      const paid = cachedFeePayments.filter(p => p.student_id === s.id).reduce((sum, p) => sum + (p.amount || 0), 0);
      totalCollected += paid;
      if (paid >= fee && fee > 0) paidCount++;
    });
    const totalPending = Math.max(0, totalExpected - totalCollected);
    const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('fee-kpi-expected', '₹' + totalExpected.toLocaleString('en-IN'));
    el('fee-kpi-collected', '₹' + totalCollected.toLocaleString('en-IN'));
    el('fee-kpi-pending', '₹' + totalPending.toLocaleString('en-IN'));
    el('fee-kpi-rate', rate + '%');
    el('fee-kpi-rate-sub', `${paidCount} of ${students.length} students fully paid`);
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
        const fee = parseInt(s.monthly_fee) || 0;
        const payments = cachedFeePayments.filter(p => p.student_id === s.id);
        const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = Math.max(0, fee - paid);

        let statusBadge, statusClass;
        if (fee === 0) { statusBadge = 'No Fee Set'; statusClass = 'pending'; }
        else if (paid >= fee) { statusBadge = '✅ Paid'; statusClass = 'approved'; }
        else if (paid > 0) { statusBadge = '⚠️ Partial'; statusClass = 'pending'; }
        else { statusBadge = 'Unpaid'; statusClass = 'rejected'; }

        const showRecord = fee > 0 && paid < fee;
        const showUndo = payments.length > 0;

        let relation = 'child';
        if (s.gender === 'Male') relation = 'son';
        else if (s.gender === 'Female') relation = 'daughter';
        let parentSubtext = '';
        if (s.father_name && s.father_name.trim() !== '' && s.father_name !== 'N/A') {
          parentSubtext = ` <span style="font-size: 0.8rem; font-weight: 500; color: var(--admin-muted);">(${relation} of ${s.father_name})</span>`;
        }

        feed.innerHTML += `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div class="activity-detail" style="flex: 1; min-width: 180px;">
            <h4 style="margin-bottom: 0.25rem;">${s.student_name}${parentSubtext}</h4>
            <p style="font-size: 0.8rem; margin-bottom: 0.25rem;">₹${paid.toLocaleString('en-IN')} / ₹${fee.toLocaleString('en-IN')}${remaining > 0 && paid > 0 ? ` · <span style="color:#dc2626;">₹${remaining.toLocaleString('en-IN')} due</span>` : ''}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge ${statusClass}" style="font-size: 0.75rem;">${statusBadge}</span>
            ${fee === 0 ? `<button class="btn-set-fee" data-sid="${s.id}" data-name="${s.student_name}">✎ Set Fee</button>` : ''}
            ${showRecord ? `<button class="btn-fee-record btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" data-fee="${fee}" data-paid="${paid}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;">💰 Record</button>` : ''}
            ${showUndo ? `<button class="btn-fee-undo btn-secondary" data-sid="${s.id}" data-name="${s.student_name}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 50px;" title="Undo last payment">⟳</button>` : ''}
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
      btn.addEventListener('click', () => openPaymentModal(btn.dataset.sid, btn.dataset.name, parseInt(btn.dataset.fee), parseInt(btn.dataset.paid)));
    });
    feed.querySelectorAll('.btn-fee-undo').forEach(btn => {
      btn.addEventListener('click', () => undoLastPayment(btn.dataset.sid, btn.dataset.name));
    });
    feed.querySelectorAll('.btn-fee-history').forEach(btn => {
      btn.addEventListener('click', () => toggleHistory(btn.dataset.sid));
    });
  }

  // ─── Payment Modal ─────────
  function openPaymentModal(studentId, name, fee, paid) {
    const remaining = Math.max(0, fee - paid);
    document.getElementById('pay-student-id').value = studentId;
    document.getElementById('pay-month').value = feeCurrentMonth;
    document.getElementById('pay-student-name').textContent = name;
    document.getElementById('pay-month-label').textContent = feeMonthLabel(feeCurrentMonth);
    document.getElementById('pay-expected').textContent = '₹' + fee.toLocaleString('en-IN');
    document.getElementById('pay-already').textContent = '₹' + paid.toLocaleString('en-IN');
    document.getElementById('pay-remaining').textContent = '₹' + remaining.toLocaleString('en-IN');
    document.getElementById('pay-amount').value = remaining;

    const d = new Date();
    document.getElementById('pay-date').value = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();

    document.getElementById('pay-notes').value = '';
    document.getElementById('pay-status-msg').style.display = 'none';
    document.getElementById('modal-record-payment').showModal();
  }

  // Auto-format DD/MM/YYYY logic
  const payDateInput = document.getElementById('pay-date');
  if (payDateInput) {
    payDateInput.addEventListener('input', function (e) {
      if (e.inputType === 'deleteContentBackward') return; // Allow natural backspace
      let v = this.value.replace(/\D/g, ''); // Strip non-digits
      if (v.length > 8) v = v.substring(0, 8); // Max 8 digits

      if (v.length >= 5) {
        this.value = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
      } else if (v.length >= 3) {
        this.value = `${v.substring(0, 2)}/${v.substring(2)}`;
      } else {
        this.value = v;
      }
    });
  }

  const payForm = document.getElementById('form-record-payment');
  if (payForm) {
    payForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusMsg = document.getElementById('pay-status-msg');
      const btn = document.getElementById('btn-pay-submit');

      const studentId = document.getElementById('pay-student-id').value;
      const month = document.getElementById('pay-month').value;
      const amount = parseInt(document.getElementById('pay-amount').value);

      // Parse DD/MM/YYYY back to YYYY-MM-DD for Supabase
      const rawDate = document.getElementById('pay-date').value;
      const dateParts = rawDate.split('/');
      if (dateParts.length !== 3 || dateParts[2].length !== 4) {
        statusMsg.textContent = 'Please enter a valid complete date (DD/MM/YYYY).';
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
        return;
      }
      const paidOn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const notes = document.getElementById('pay-notes').value.trim();

      if (!amount || amount <= 0) {
        statusMsg.textContent = 'Please enter a valid amount.';
        statusMsg.className = 'status-msg error';
        statusMsg.style.display = 'block';
        return;
      }

      btn.textContent = 'Recording...';
      btn.disabled = true;

      try {
        // Get admin email
        let adminEmail = 'admin';
        const { data: { session } } = await window._supabase.auth.getSession();
        if (session?.user?.email) adminEmail = session.user.email;

        const { error } = await window._supabase.from('fee_payments').insert([{
          student_id: studentId,
          month,
          amount,
          paid_on: paidOn,
          recorded_by: adminEmail,
          notes: notes || null
        }]);
        if (error) throw error;

        statusMsg.textContent = 'Payment recorded successfully!';
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
      const payments = cachedFeePayments.filter(p => p.student_id === studentId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
      html += '<thead><tr style="border-bottom: 1px solid var(--admin-border);"><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Month</th><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Amount</th><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Date</th><th style="text-align: left; padding: 4px 8px; color: var(--admin-muted);">Notes</th></tr></thead><tbody>';
      Object.keys(byMonth).sort().reverse().forEach(month => {
        byMonth[month].forEach(p => {
          html += `<tr style="border-bottom: 1px solid var(--admin-bg);"><td style="padding: 4px 8px;">${feeMonthLabel(month)}</td><td style="padding: 4px 8px; font-weight: 600;">₹${p.amount.toLocaleString('en-IN')}</td><td style="padding: 4px 8px;">${p.paid_on || '—'}</td><td style="padding: 4px 8px; color: var(--admin-muted);">${p.notes || '—'}</td></tr>`;
        });
      });
      html += '</tbody></table>';
      panel.innerHTML = html;
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
    let students = cachedStudents.filter(s => s.status === 'approved');
    if (batchFilter !== 'all') {
      if (batchFilter === 'unassigned') {
        students = students.filter(s => !s.batch || s.batch === '' || s.batch === 'null' || s.batch === 'undefined');
      } else {
        students = students.filter(s => s.batch === batchFilter);
      }
    }
    let rows = students.map(s => {
      const fee = parseInt(s.monthly_fee) || 0;
      const paid = cachedFeePayments.filter(p => p.student_id === s.id).reduce((sum, p) => sum + (p.amount || 0), 0);
      const remaining = Math.max(0, fee - paid);
      let status = fee === 0 ? 'No Fee' : paid >= fee ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
      return { Name: s.student_name, Batch: s.batch || '', Course: s.course_applying || '', 'Expected (₹)': fee, 'Paid (₹)': paid, 'Remaining (₹)': remaining, Status: status };
    });

    // Smart Sort: Group by status priority, then alphabetical by name
    const statusPriority = { 'Unpaid': 1, 'Partial': 2, 'Paid': 3, 'No Fee': 4 };
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

  const btnFeePDF = document.getElementById('btn-fee-export-pdf');
  if (btnFeePDF) {
    btnFeePDF.addEventListener('click', () => {
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

      let tableHTML = `<h3 style="margin-bottom:0.5rem;">Fee Collection Report — ${feeMonthLabel(feeCurrentMonth)}</h3>`;
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

            // Jamat fields
            if (item.setting_key === 'namaz_fajr') { const e = document.getElementById('cfg-fajr'); if (e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_zuhr') { const e = document.getElementById('cfg-zuhr'); if (e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_asr') { const e = document.getElementById('cfg-asr'); if (e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_maghrib') { const e = document.getElementById('cfg-maghrib'); if (e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_isha') { const e = document.getElementById('cfg-isha'); if (e) e.value = item.setting_value; }
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }

    // Call load when either Settings or Jamat tab is clicked
    const settingsTabBtn = document.querySelector('[data-target="tab-settings"]');
    if (settingsTabBtn) settingsTabBtn.addEventListener('click', loadSettings);

    const jamatTabBtn = document.querySelector('[data-target="tab-jamat"]');
    if (jamatTabBtn) jamatTabBtn.addEventListener('click', loadSettings);

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
          { setting_key: 'namaz_isha', setting_value: document.getElementById('cfg-isha').value }
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

});
