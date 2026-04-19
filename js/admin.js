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
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.style.display = 'none');

      // Activate target
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).style.display = 'block';
    });
  });

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
        doj: fd.get('doj'),
        form_no: fd.get('form_no'),
        course_applying: fd.get('course_applying'),
        student_name: fd.get('student_name'),
        father_name: fd.get('father_name'),
        gender: fd.get('gender'),
        dob: fd.get('dob'),
        aadhar_no: fd.get('aadhar_no'),
        address: fd.get('address'),
        contact_father: fd.get('contact_father'),
        contact_mother: fd.get('contact_mother'),
        current_class: fd.get('current_class'),
        school_name: fd.get('school_name'),
        school_days: Array.from(manualForm.querySelectorAll('input[name="school_days_arr"]:checked')).map(cb => cb.value).join(', '),
        school_time: `${fd.get('school_time_from')} - ${fd.get('school_time_to')}`,
        batch: fd.get('batch'),
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

    // Everyday Shortcut Logic
    const everydayCheckbox = document.getElementById('sd-everyday');
    if (everydayCheckbox) {
      everydayCheckbox.addEventListener('change', (e) => {
        const checkboxes = manualForm.querySelectorAll('input[name="school_days_arr"]');
        checkboxes.forEach(cb => {
          if (cb.value !== 'Sun') {
            cb.checked = e.target.checked;
          } else {
            // Uncheck Sunday if "Everyday" (Mon-Sat) is toggled
            if (e.target.checked) cb.checked = false;
          }
        });
      });
    }

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

      formNoInput.value = "Generating...";
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

    // Initial call + call whenever the Manual tab pill is clicked
    initManualFormNumber();
    const manualPillBtn = document.querySelector('[data-sub="sub-manual"]');
    if (manualPillBtn) {
      manualPillBtn.addEventListener('click', () => {
        // Only regenerate if the field is empty or stale
        const fi = manualForm.querySelector('input[name="form_no"]');
        if (!fi || !fi.value || fi.value === 'Generating...') {
          initManualFormNumber();
        }
      });
    }

  } // end if (manualForm)

  let cachedStudents = [];

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
      filtered = filtered.filter(s => s.batch === batchFilter);
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
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.5rem; margin-top: 0.75rem; border-bottom: 2px solid var(--admin-accent);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--admin-accent); text-transform: uppercase; letter-spacing: 0.5px;">${batchName} Batch</span>
          <span style="font-size: 0.7rem; background: var(--admin-bg); color: var(--admin-muted); padding: 2px 8px; border-radius: 10px; font-weight: 500;">${students.length}</span>
        </div>`;

      students.forEach(app => {
        let stClass = app.status === 'approved' ? 'approved' :
          (app.status === 'rejected' ? 'rejected' :
            (app.status === 'left' ? 'rejected' : 'pending'));
        feedContainer.innerHTML += `
        <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="activity-detail">
            <h4 style="margin-bottom: 0.25rem;">${app.student_name}</h4>
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

  // ─── 3f. Dashboard & Analytics Engine ──────────────────────────
  async function hydrateDashboardAndAnalytics() {
    if (!window._supabase) return;
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

    approvedData.forEach(s => {
      if (s.course_applying) courseCount[s.course_applying] = (courseCount[s.course_applying] || 0) + 1;
      if (s.gender) genderCount[s.gender] = (genderCount[s.gender] || 0) + 1;
      if (s.batch) batchCount[s.batch] = (batchCount[s.batch] || 0) + 1;
      if (s.current_class) classCount[s.current_class] = (classCount[s.current_class] || 0) + 1;
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
      chartInstances.school = new Chart(ctxSchool, {
        type: 'bar',
        data: { labels: Object.keys(classCount).length ? Object.keys(classCount) : ['None'], datasets: [{ label: 'Students', data: Object.keys(classCount).length ? Object.values(classCount) : [0], backgroundColor: '#2D6A4F' }] },
        options: commonOptions
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

  // Auto trigger once to cache states quietly
  setTimeout(hydrateDashboardAndAnalytics, 1000);

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
  const lbTabBtn = document.querySelector('[data-target="tab-leaderboard"]');
  if (lbTabBtn) lbTabBtn.addEventListener('click', loadQuizList);

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

});
