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

      // Collect Data
      const fd = new FormData(manualForm);
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
  }

  let cachedStudents = [];

  function renderStudentMatrix() {
    const feedContainer = document.getElementById('ds-activity-feed');
    if (!feedContainer) return;

    const searchTerm = (document.getElementById('ds-filter-search')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('ds-filter-status')?.value || 'all';

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

    // Handle Text Filter
    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.student_name || '').toLowerCase().includes(searchTerm) ||
        (s.form_no || '').toLowerCase().includes(searchTerm)
      );
    }

    feedContainer.innerHTML = '';
    if (filtered.length === 0) {
      feedContainer.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">No students found matching filter criteria.</p>';
      return;
    }

    filtered.forEach(app => {
      let stClass = app.status === 'approved' ? 'approved' : (app.status === 'rejected' ? 'rejected' : 'pending');
      feedContainer.innerHTML += `
        <div class="activity-item">
          <div class="activity-detail">
            <h4>${app.student_name}</h4>
            <p>${app.course_applying} | Form: ${app.form_no || 'N/A'}</p>
          </div>
          <span class="badge ${stClass}">${app.status}</span>
        </div>`;
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
    const classCount = {};
    const timelineCount = {};

    approvedData.forEach(s => {
      if (s.course_applying) courseCount[s.course_applying] = (courseCount[s.course_applying] || 0) + 1;
      if (s.gender) genderCount[s.gender] = (genderCount[s.gender] || 0) + 1;
      if (s.current_class) classCount[s.current_class] = (classCount[s.current_class] || 0) + 1;
      if (s.doj) {
        const month = s.doj.substring(0, 7);
        timelineCount[month] = (timelineCount[month] || 0) + 1;
      }
    });

    const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

    // 1. Chart Growth
    const months = Object.keys(timelineCount).sort();
    const tData = months.map(m => timelineCount[m]);
    const ctxGrowth = document.getElementById('chart-growth');
    if (ctxGrowth) {
      chartInstances.growth = new Chart(ctxGrowth, {
        type: 'line',
        data: { labels: months.length ? months : ['No Data'], datasets: [{ label: 'New Enrollments', data: tData.length ? tData : [0], borderColor: '#2D6A4F', backgroundColor: 'rgba(45, 106, 79, 0.1)', fill: true, tension: 0.3 }] },
        options: commonOptions
      });
    }

    // 2. Chart Course
    const ctxCourse = document.getElementById('chart-course');
    if (ctxCourse) {
      chartInstances.course = new Chart(ctxCourse, {
        type: 'doughnut',
        data: { labels: Object.keys(courseCount).length ? Object.keys(courseCount) : ['None'], datasets: [{ data: Object.keys(courseCount).length ? Object.values(courseCount) : [1], backgroundColor: ['#D4A017', '#2D6A4F', '#1E293B', '#64748B'] }] },
        options: commonOptions
      });
    }

    // 3. Chart Gender
    const ctxGender = document.getElementById('chart-gender');
    if (ctxGender) {
      chartInstances.gender = new Chart(ctxGender, {
        type: 'pie',
        data: { labels: ['Male', 'Female'], datasets: [{ data: [genderCount['Male'] || 0, genderCount['Female'] || 0], backgroundColor: ['#3b82f6', '#ec4899'] }] },
        options: commonOptions
      });
    }

    // 4. Chart School Class
    const ctxSchool = document.getElementById('chart-school');
    if (ctxSchool) {
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
      chartsRendered = false;
      Object.values(chartInstances).forEach(c => c.destroy());
      chartInstances = {};
      hydrateDashboardAndAnalytics();
    });
  }

  // Wire real-time cohesive filter events
  const filterInput = document.getElementById('ds-filter-search');
  const filterDropdown = document.getElementById('ds-filter-status');
  if (filterInput) filterInput.addEventListener('input', renderStudentMatrix);
  if (filterDropdown) filterDropdown.addEventListener('change', renderStudentMatrix);

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

});
