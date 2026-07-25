/* ─── js/demo-data.js ──────────────────────────────────────────────────────── */
/* Realistic mock dataset for Demo Mode. Loaded only when DEMO_MODE is active. */

window.DEMO_DATA = (() => {

  // ── Students ────────────────────────────────────────────────────────────────
  const students = [
    { id: 1,  form_no: 'MQLC-001', student_name: 'Aisha Fatima',    father_name: 'Khalid Ahmed',   gender: 'Female', dob: '2015-04-12', doj: '2026-03-01', batch: 'Zuhr',    course_applying: 'Hifz',     current_class: '3rd', area: 'Bandra',    monthly_fee: 800,  status: 'approved', is_prepaid: false, created_at: '2026-03-01' },
    { id: 2,  form_no: 'MQLC-002', student_name: 'Zaid ul Hassan',  father_name: 'Hassan Raza',    gender: 'Male',   dob: '2013-08-22', doj: '2026-03-01', batch: 'Zuhr',    course_applying: 'Hifz',     current_class: '5th', area: 'Kurla',     monthly_fee: 800,  status: 'approved', is_prepaid: false, created_at: '2026-03-01' },
    { id: 3,  form_no: 'MQLC-003', student_name: 'Maryam Siddiqui', father_name: 'Adnan Siddiqui', gender: 'Female', dob: '2016-11-05', doj: '2026-03-15', batch: 'Asr',     course_applying: 'Nazira',   current_class: '2nd', area: 'Govandi',   monthly_fee: 600,  status: 'approved', is_prepaid: false, created_at: '2026-03-15' },
    { id: 4,  form_no: 'MQLC-004', student_name: 'Ibrahim Khan',    father_name: 'Salman Khan',    gender: 'Male',   dob: '2012-01-30', doj: '2026-03-15', batch: 'Asr',     course_applying: 'Hifz',     current_class: '6th', area: 'Malad',     monthly_fee: 800,  status: 'approved', is_prepaid: true,  created_at: '2026-03-15' },
    { id: 5,  form_no: 'MQLC-005', student_name: 'Ruqayyah Ansari', father_name: 'Irfan Ansari',   gender: 'Female', dob: '2017-06-18', doj: '2026-04-01', batch: 'Zuhr',    course_applying: 'Nazira',   current_class: '1st', area: 'Jogeshwari', monthly_fee: 600, status: 'approved', is_prepaid: false, created_at: '2026-04-01' },
    { id: 6,  form_no: 'MQLC-006', student_name: 'Yusuf Shaikh',   father_name: 'Bilal Shaikh',   gender: 'Male',   dob: '2014-09-10', doj: '2026-04-01', batch: 'Maghrib', course_applying: 'Tajweed',  current_class: '4th', area: 'Andheri',   monthly_fee: 500,  status: 'approved', is_prepaid: false, created_at: '2026-04-01' },
    { id: 7,  form_no: 'MQLC-007', student_name: 'Safiyyah Malik',  father_name: 'Imran Malik',    gender: 'Female', dob: '2015-12-03', doj: '2026-04-10', batch: 'Asr',     course_applying: 'Nazira',   current_class: '3rd', area: 'Bhandup',   monthly_fee: 600,  status: 'approved', is_prepaid: false, created_at: '2026-04-10' },
    { id: 8,  form_no: 'MQLC-008', student_name: 'Hamza Qureshi',   father_name: 'Tariq Qureshi',  gender: 'Male',   dob: '2011-03-27', doj: '2026-04-10', batch: 'Maghrib', course_applying: 'Hifz',     current_class: '7th', area: 'Vikhroli',  monthly_fee: 800,  status: 'approved', is_prepaid: true,  created_at: '2026-04-10' },
    { id: 9,  form_no: 'MQLC-009', student_name: 'Khadijah Patel',  father_name: 'Yusuf Patel',    gender: 'Female', dob: '2016-07-14', doj: '2026-05-01', batch: 'Zuhr',    course_applying: 'Tajweed',  current_class: '2nd', area: 'Borivali',  monthly_fee: 500,  status: 'approved', is_prepaid: false, created_at: '2026-05-01' },
    { id: 10, form_no: 'MQLC-010', student_name: 'Umar Farooq',     father_name: 'Farooq Ahmed',   gender: 'Male',   dob: '2013-05-22', doj: '2026-05-01', batch: 'Asr',     course_applying: 'Hifz',     current_class: '5th', area: 'Thane',     monthly_fee: 800,  status: 'approved', is_prepaid: false, created_at: '2026-05-01' },
    { id: 11, form_no: 'MQLC-011', student_name: 'Asma Hussain',    father_name: 'Raza Hussain',   gender: 'Female', dob: '2018-02-09', doj: '2026-05-15', batch: 'Zuhr',    course_applying: 'Nazira',   current_class: 'Nursery', area: 'Mumbra', monthly_fee: 400,  status: 'approved', is_prepaid: false, created_at: '2026-05-15' },
    { id: 12, form_no: 'MQLC-012', student_name: 'Bilal Memon',     father_name: 'Farhan Memon',   gender: 'Male',   dob: '2010-10-16', doj: '2026-05-15', batch: 'Maghrib', course_applying: 'Hifz',     current_class: '8th', area: 'Dombivli', monthly_fee: 800,  status: 'approved', is_prepaid: true,  created_at: '2026-05-15' },
    { id: 13, form_no: 'MQLC-013', student_name: 'Noor ul Huda',    father_name: 'Ghulam Nabi',    gender: 'Female', dob: '2015-08-28', doj: '2026-06-01', batch: 'Asr',     course_applying: 'Nazira',   current_class: '3rd', area: 'Kurla',     monthly_fee: 600,  status: 'approved', is_prepaid: false, created_at: '2026-06-01' },
    { id: 14, form_no: 'MQLC-014', student_name: 'Rayyan Sheikh',   father_name: 'Nasir Sheikh',   gender: 'Male',   dob: '2014-03-11', doj: '2026-06-01', batch: 'Zuhr',    course_applying: 'Tajweed',  current_class: '4th', area: 'Bandra',    monthly_fee: 500,  status: 'approved', is_prepaid: false, created_at: '2026-06-01' },
    { id: 15, form_no: 'MQLC-015', student_name: 'Hafsa Rafiq',     father_name: 'Abdul Rafiq',    gender: 'Female', dob: '2012-12-19', doj: '2026-06-15', batch: 'Maghrib', course_applying: 'Hifz',     current_class: '6th', area: 'Govandi',   monthly_fee: 800,  status: 'approved', is_prepaid: false, created_at: '2026-06-15' },
    { id: 16, form_no: 'MQLC-016', student_name: 'Talha Baig',      father_name: 'Waseem Baig',    gender: 'Male',   dob: '2017-04-07', doj: '2026-06-15', batch: 'Asr',     course_applying: 'Nazira',   current_class: '1st', area: 'Malad',     monthly_fee: 600,  status: 'approved', is_prepaid: false, created_at: '2026-06-15' },
    { id: 17, form_no: 'MQLC-017', student_name: 'Fatima Zahra',    father_name: 'Ali Hassan',     gender: 'Female', dob: '2016-09-23', doj: '2026-07-01', batch: 'Zuhr',    course_applying: 'Nazira',   current_class: '2nd', area: 'Andheri',   monthly_fee: 600,  status: 'approved', is_prepaid: false, created_at: '2026-07-01' },
    { id: 18, form_no: 'MQLC-018', student_name: 'Mikail Vohra',    father_name: 'Sajid Vohra',    gender: 'Male',   dob: '2013-11-04', doj: '2026-07-01', batch: 'Maghrib', course_applying: 'Hifz',     current_class: '5th', area: 'Jogeshwari', monthly_fee: 800, status: 'approved', is_prepaid: false, created_at: '2026-07-01' },
    { id: 19, form_no: 'MQLC-019', student_name: 'Amina Contractor', father_name: 'Zubair Contractor', gender: 'Female', dob: '2015-01-17', doj: '2026-07-10', batch: 'Asr', course_applying: 'Tajweed', current_class: '3rd', area: 'Borivali', monthly_fee: 500, status: 'approved', is_prepaid: false, created_at: '2026-07-10' },
    { id: 20, form_no: 'MQLC-020', student_name: 'Sulayman Ghani',  father_name: 'Abdul Ghani',    gender: 'Male',   dob: '2011-06-30', doj: '2026-07-10', batch: 'Zuhr',    course_applying: 'Hifz',     current_class: '7th', area: 'Thane',     monthly_fee: 800,  status: 'approved', is_prepaid: false, created_at: '2026-07-10' },
    { id: 21, form_no: 'MQLC-021', student_name: 'Zaynab Chaudhry', father_name: 'Zafar Chaudhry', gender: 'Female', dob: '2016-03-08', doj: '2026-07-15', batch: 'Asr',    course_applying: 'Nazira',   current_class: '2nd', area: 'Mumbra',    monthly_fee: 600,  status: 'pending',  is_prepaid: false, created_at: '2026-07-15' },
    { id: 22, form_no: 'MQLC-022', student_name: 'Junaid Mirza',    father_name: 'Shakeel Mirza',  gender: 'Male',   dob: '2014-10-21', doj: '2026-07-15', batch: 'Maghrib', course_applying: 'Hifz',     current_class: '4th', area: 'Dombivli', monthly_fee: 800,  status: 'pending',  is_prepaid: false, created_at: '2026-07-15' },
    { id: 23, form_no: 'MQLC-023', student_name: 'Hana Rashid',     father_name: 'Omar Rashid',    gender: 'Female', dob: '2018-05-13', doj: '2026-07-20', batch: null,      course_applying: null,       current_class: null,  area: 'Bhandup',   monthly_fee: 0,    status: 'pending',  is_prepaid: false, created_at: '2026-07-20' },
  ];

  // ── Fee Payments ─────────────────────────────────────────────────────────────
  // Generates a realistic mix of paid/unpaid for approved students across months
  const feePayments = [
    // March 2026
    { id: 1,  student_id: 1,  month: '2026-03', amount_paid: 800,  payment_date: '2026-03-05', payment_mode: 'Cash' },
    { id: 2,  student_id: 2,  month: '2026-03', amount_paid: 800,  payment_date: '2026-03-05', payment_mode: 'UPI'  },
    { id: 3,  student_id: 3,  month: '2026-03', amount_paid: 600,  payment_date: '2026-03-10', payment_mode: 'Cash' },
    { id: 4,  student_id: 4,  month: '2026-03', amount_paid: 800,  payment_date: '2026-03-15', payment_mode: 'Cash' },
    // April 2026
    { id: 5,  student_id: 1,  month: '2026-04', amount_paid: 800,  payment_date: '2026-04-03', payment_mode: 'Cash' },
    { id: 6,  student_id: 2,  month: '2026-04', amount_paid: 800,  payment_date: '2026-04-03', payment_mode: 'UPI'  },
    { id: 7,  student_id: 3,  month: '2026-04', amount_paid: 600,  payment_date: '2026-04-08', payment_mode: 'Cash' },
    { id: 8,  student_id: 4,  month: '2026-04', amount_paid: 800,  payment_date: '2026-04-08', payment_mode: 'Cash' },
    { id: 9,  student_id: 5,  month: '2026-04', amount_paid: 600,  payment_date: '2026-04-12', payment_mode: 'UPI'  },
    { id: 10, student_id: 6,  month: '2026-04', amount_paid: 500,  payment_date: '2026-04-12', payment_mode: 'Cash' },
    { id: 11, student_id: 7,  month: '2026-04', amount_paid: 600,  payment_date: '2026-04-15', payment_mode: 'Cash' },
    { id: 12, student_id: 8,  month: '2026-04', amount_paid: 800,  payment_date: '2026-04-15', payment_mode: 'UPI'  },
    // May 2026
    { id: 13, student_id: 1,  month: '2026-05', amount_paid: 800,  payment_date: '2026-05-02', payment_mode: 'Cash' },
    { id: 14, student_id: 2,  month: '2026-05', amount_paid: 800,  payment_date: '2026-05-02', payment_mode: 'Cash' },
    { id: 15, student_id: 4,  month: '2026-05', amount_paid: 800,  payment_date: '2026-05-10', payment_mode: 'Cash' },
    { id: 16, student_id: 5,  month: '2026-05', amount_paid: 600,  payment_date: '2026-05-10', payment_mode: 'UPI'  },
    { id: 17, student_id: 6,  month: '2026-05', amount_paid: 500,  payment_date: '2026-05-14', payment_mode: 'Cash' },
    { id: 18, student_id: 8,  month: '2026-05', amount_paid: 800,  payment_date: '2026-05-14', payment_mode: 'UPI'  },
    { id: 19, student_id: 9,  month: '2026-05', amount_paid: 500,  payment_date: '2026-05-18', payment_mode: 'Cash' },
    { id: 20, student_id: 10, month: '2026-05', amount_paid: 800,  payment_date: '2026-05-18', payment_mode: 'Cash' },
    { id: 21, student_id: 11, month: '2026-05', amount_paid: 400,  payment_date: '2026-05-20', payment_mode: 'Cash' },
    { id: 22, student_id: 12, month: '2026-05', amount_paid: 800,  payment_date: '2026-05-20', payment_mode: 'UPI'  },
    // June 2026
    { id: 23, student_id: 1,  month: '2026-06', amount_paid: 800,  payment_date: '2026-06-04', payment_mode: 'Cash' },
    { id: 24, student_id: 2,  month: '2026-06', amount_paid: 800,  payment_date: '2026-06-04', payment_mode: 'UPI'  },
    { id: 25, student_id: 4,  month: '2026-06', amount_paid: 800,  payment_date: '2026-06-06', payment_mode: 'Cash' },
    { id: 26, student_id: 5,  month: '2026-06', amount_paid: 600,  payment_date: '2026-06-06', payment_mode: 'Cash' },
    { id: 27, student_id: 8,  month: '2026-06', amount_paid: 800,  payment_date: '2026-06-08', payment_mode: 'UPI'  },
    { id: 28, student_id: 10, month: '2026-06', amount_paid: 800,  payment_date: '2026-06-10', payment_mode: 'Cash' },
    { id: 29, student_id: 12, month: '2026-06', amount_paid: 800,  payment_date: '2026-06-10', payment_mode: 'UPI'  },
    { id: 30, student_id: 13, month: '2026-06', amount_paid: 600,  payment_date: '2026-06-12', payment_mode: 'Cash' },
    { id: 31, student_id: 14, month: '2026-06', amount_paid: 500,  payment_date: '2026-06-12', payment_mode: 'Cash' },
    { id: 32, student_id: 15, month: '2026-06', amount_paid: 800,  payment_date: '2026-06-15', payment_mode: 'Cash' },
    { id: 33, student_id: 16, month: '2026-06', amount_paid: 600,  payment_date: '2026-06-15', payment_mode: 'UPI'  },
    // July 2026 (current — some paid, some pending)
    { id: 34, student_id: 1,  month: '2026-07', amount_paid: 800,  payment_date: '2026-07-03', payment_mode: 'Cash' },
    { id: 35, student_id: 2,  month: '2026-07', amount_paid: 800,  payment_date: '2026-07-03', payment_mode: 'UPI'  },
    { id: 36, student_id: 4,  month: '2026-07', amount_paid: 800,  payment_date: '2026-07-05', payment_mode: 'Cash' },
    { id: 37, student_id: 8,  month: '2026-07', amount_paid: 800,  payment_date: '2026-07-06', payment_mode: 'UPI'  },
    { id: 38, student_id: 12, month: '2026-07', amount_paid: 800,  payment_date: '2026-07-08', payment_mode: 'UPI'  },
    { id: 39, student_id: 14, month: '2026-07', amount_paid: 500,  payment_date: '2026-07-10', payment_mode: 'Cash' },
    { id: 40, student_id: 17, month: '2026-07', amount_paid: 600,  payment_date: '2026-07-12', payment_mode: 'Cash' },
  ];

  // ── Leaderboard Data ──────────────────────────────────────────────────────────
  const leaderboardQuizzes = [
    { quiz_id: 'Surah Al-Mulk Quiz — Week 28', entries: [
      { player_name: 'Hamza Qureshi',   area: 'Vikhroli',   score: 10, time_taken: 47 },
      { player_name: 'Ibrahim Khan',    area: 'Malad',      score: 10, time_taken: 53 },
      { player_name: 'Bilal Memon',     area: 'Dombivli',  score: 9,  time_taken: 61 },
      { player_name: 'Umar Farooq',     area: 'Thane',      score: 9,  time_taken: 74 },
      { player_name: 'Zaid ul Hassan',  area: 'Kurla',      score: 8,  time_taken: 58 },
      { player_name: 'Talha Baig',      area: 'Malad',      score: 8,  time_taken: 82 },
      { player_name: 'Mikail Vohra',    area: 'Jogeshwari', score: 7,  time_taken: 65 },
      { player_name: 'Rayyan Sheikh',   area: 'Bandra',     score: 7,  time_taken: 91 },
      { player_name: 'Sulayman Ghani',  area: 'Thane',      score: 6,  time_taken: 70 },
      { player_name: 'Yusuf Shaikh',    area: 'Andheri',    score: 5,  time_taken: 88 },
    ]},
    { quiz_id: 'Tajweed Rules Quiz — Week 25', entries: [
      { player_name: 'Aisha Fatima',    area: 'Bandra',     score: 10, time_taken: 38 },
      { player_name: 'Maryam Siddiqui',area: 'Govandi',    score: 10, time_taken: 45 },
      { player_name: 'Hafsa Rafiq',     area: 'Govandi',    score: 9,  time_taken: 52 },
      { player_name: 'Khadijah Patel',  area: 'Borivali',   score: 9,  time_taken: 66 },
      { player_name: 'Safiyyah Malik',  area: 'Bhandup',    score: 8,  time_taken: 59 },
      { player_name: 'Fatima Zahra',    area: 'Andheri',    score: 8,  time_taken: 77 },
      { player_name: 'Ruqayyah Ansari',area: 'Jogeshwari', score: 7,  time_taken: 63 },
      { player_name: 'Noor ul Huda',    area: 'Kurla',      score: 6,  time_taken: 84 },
      { player_name: 'Asma Hussain',    area: 'Mumbra',     score: 5,  time_taken: 72 },
      { player_name: 'Amina Contractor',area: 'Borivali',   score: 4,  time_taken: 95 },
    ]},
  ];

  // ── Student History (Audit Log) ───────────────────────────────────────────
  const studentHistory = [
    // Ibrahim Khan (id:4) — batch transfer + course upgrade
    { id: 1, student_id: 4, field_name: 'Batch',           old_value: 'Asr',     new_value: 'Maghrib',  changed_by: 'admin@mqlc.com', changed_at: '2026-05-10T09:14:00Z', reason: 'Asr batch at full capacity' },
    { id: 2, student_id: 4, field_name: 'Course',          old_value: 'Nazira',  new_value: 'Hifz',     changed_by: 'admin@mqlc.com', changed_at: '2026-05-10T09:14:00Z', reason: 'Completed Nazira — enrolled in Hifz' },
    { id: 3, student_id: 4, field_name: 'Monthly Fee',     old_value: '600',     new_value: '800',      changed_by: 'admin@mqlc.com', changed_at: '2026-05-10T09:15:00Z', reason: 'Hifz course rate' },

    // Hamza Qureshi (id:8) — fee mode switch + batch change
    { id: 4, student_id: 8, field_name: 'Fee Mode',        old_value: 'false',   new_value: 'true',     changed_by: 'admin@mqlc.com', changed_at: '2026-04-18T11:30:00Z', reason: 'Parent requested prepaid plan' },
    { id: 5, student_id: 8, field_name: 'Batch',           old_value: 'Asr',     new_value: 'Maghrib',  changed_by: 'admin@mqlc.com', changed_at: '2026-04-01T08:00:00Z', reason: null },

    // Bilal Memon (id:12) — status change and course progression
    { id: 6, student_id: 12, field_name: 'Status',         old_value: 'pending', new_value: 'approved', changed_by: 'admin@mqlc.com', changed_at: '2026-05-16T10:05:00Z', reason: null },
    { id: 7, student_id: 12, field_name: 'Batch',          old_value: 'Zuhr',    new_value: 'Maghrib',  changed_by: 'admin@mqlc.com', changed_at: '2026-06-01T09:00:00Z', reason: 'Better timing for family' },
    { id: 8, student_id: 12, field_name: "Father's Name",  old_value: 'Farhan',  new_value: 'Farhan Memon', changed_by: 'admin@mqlc.com', changed_at: '2026-06-05T14:22:00Z', reason: 'Correction — full name' },
  ];

  return { students, feePayments, feeExemptions: [], leaderboardQuizzes, studentHistory };
})();

