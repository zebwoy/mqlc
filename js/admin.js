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
  const btnUpload = document.getElementById('btn-upload-widget');

  if (btnUpload && typeof cloudinary !== 'undefined') {
    const uploadWidget = cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: 'home/mqlc/updates',
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: 10,
        showAdvancedOptions: false,
        cropping: true,
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
          console.log('Done! Here is the image info: ', result.info);
          alert('Upload Successful! The new media is now live on the homepage slider.');
        }
      }
    );

    btnUpload.addEventListener("click", () => {
      if (CLOUDINARY_UPLOAD_PRESET === 'YOUR_UNSIGNED_PRESET_NAME') {
        alert("Action Required: Please add your Cloudinary Upload Preset to js/admin.js first!");
        return;
      }
      uploadWidget.open();
    }, false);
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
        school_time: `${fd.get('school_time_from')} - ${fd.get('school_time_to')}`,
        can_read_arabic: fd.get('can_read_arabic') === 'on',
        can_read_quran_fluently: fd.get('can_read_quran_fluently') === 'on',
        knows_tajweed: fd.get('knows_tajweed') === 'on',
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
