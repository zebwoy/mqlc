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

  if (typeof cloudinary !== 'undefined') {
    function openCloudinaryWidget(targetFolder, successMsg) {
      if (CLOUDINARY_UPLOAD_PRESET === 'YOUR_UNSIGNED_PRESET_NAME') {
        alert("Action Required: Please add your Cloudinary Upload Preset to js/admin.js first!");
        return;
      }
      
      cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          folder: targetFolder,
          sources: ['local', 'url'],
          multiple: true,
          maxFiles: 10,
          showAdvancedOptions: false,
          cropping: false, // Cropping should be off for PDFs to securely upload!
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#E2E8F0",
              tabIcon: "#2D6A4F",
              menuIcons: "#1E293B",
              textDark: "#1E293B",
              textLight: "#FFFFFF",
              link: "#2D6A4F",
              action: "#D4A017",
              inactiveTabIcon: "#64748B",
              error: "#EF4444",
              inProgress: "#2D6A4F",
              complete: "#31C48D",
              sourceBg: "#F5F7FA"
            }
          }
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log('Upload success: ', result.info);
            alert(successMsg);
          }
        }
      ).open();
    }

    if (cardUploadUpdates) {
      cardUploadUpdates.addEventListener("click", () => {
        openCloudinaryWidget('home/mqlc/updates', 'Upload Successful! The new media is now live on the Updates slider.');
      });
      cardUploadUpdates.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCloudinaryWidget('home/mqlc/updates', 'Upload Successful! The new media is now live on the Updates slider.');
        }
      });
    }

    if (cardUploadBulletin) {
      cardUploadBulletin.addEventListener("click", () => {
        openCloudinaryWidget('home/mqlc/bulletin', 'Upload Successful! The file is now live on the Bulletin Board.');
      });
      cardUploadBulletin.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCloudinaryWidget('home/mqlc/bulletin', 'Upload Successful! The file is now live on the Bulletin Board.');
        }
      });
    }
  }

  // ─── 3. SUPABASE FORM SUBMISSION ──────────────────────────────
  const form = document.getElementById('registration-form');
  const statusMsg = document.getElementById('reg-status');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!window._supabase) {
        showStatus('Error: Supabase client is not initialized.', 'error');
        return;
      }

      // Collect Data
      const fd = new FormData(form);
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
        school_days: Array.from(form.querySelectorAll('input[name="school_days_arr"]:checked')).map(cb => cb.value).join(', '),
        school_time: `${fd.get('school_time_from')} - ${fd.get('school_time_to')}`
      };

      try {
        // Change button state
        const btn = document.getElementById('btn-submit-reg');
        const origText = btn.textContent;
        btn.textContent = 'Saving Record...';
        btn.disabled = true;

        const { data, error } = await window._supabase
          .from('student_registrations')
          .insert([payload]);

        if (error) throw error;

        // Success
        form.reset();
        showStatus('Student registration saved securely to Supabase!', 'success');
      } catch (err) {
        console.error(err);
        showStatus(`Failed to save: ${err.message}`, 'error');
      } finally {
        const btn = document.getElementById('btn-submit-reg');
        btn.textContent = 'Submit Registration';
        btn.disabled = false;
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
            if (item.setting_key === 'namaz_fajr') { const e = document.getElementById('cfg-fajr'); if(e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_zuhr') { const e = document.getElementById('cfg-zuhr'); if(e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_asr') { const e = document.getElementById('cfg-asr'); if(e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_maghrib') { const e = document.getElementById('cfg-maghrib'); if(e) e.value = item.setting_value; }
            if (item.setting_key === 'namaz_isha') { const e = document.getElementById('cfg-isha'); if(e) e.value = item.setting_value; }
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
