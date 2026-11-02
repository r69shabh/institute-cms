/* Institute CMS — single-file, browser-only (localStorage) management app + website builder
   for coaching institutes, academies and small clinics. No backend. */
(function () {
'use strict';

/* ---------------- utilities ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inr = n => inrFmt.format(Math.round(Number(n) || 0));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const addDays = (n, base) => { const d = base ? new Date(base + 'T00:00') : new Date(); d.setDate(d.getDate() + n); return iso(d); };
const fmtDate = s => { if (!s) return ''; const d = new Date(s + 'T00:00'); return isNaN(d) ? s : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
const fmtTime = t => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const COLORS = ['#1f3a5f', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#1d4ed8', '#15803d', '#9333ea', '#c2410c', '#0e7490'];
const colorFor = s => COLORS[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const sum = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }

/* ---------------- labels per business type ---------------- */
const LABELS = {
  institute: { person: 'Student', people: 'Students', offering: 'Course', offerings: 'Courses', staff: 'Faculty', staffOne: 'Faculty member',
    booking: 'Enrolment', bookings: 'Enrolments', track: 'Attendance', kind: 'Coaching institute', guardian: 'Parent / guardian', guardianPh: 'Parent phone' },
  clinic: { person: 'Patient', people: 'Patients', offering: 'Service', offerings: 'Services', staff: 'Doctors', staffOne: 'Doctor',
    booking: 'Appointment', bookings: 'Appointments', track: 'Visit history', kind: 'Clinic', guardian: 'Age / gender', guardianPh: 'Emergency contact' }
};

/* ---------------- seed data ---------------- */
function seedInstitute() {
  const t = today();
  const offerings = [
    { id: 'c1', name: 'JEE Main + Advanced (2-year)', desc: 'Physics, Chemistry and Maths for Class 11–12 with weekly tests, doubt sessions and full-length mocks.', fee: 145000, duration: '2 years', days: 'Mon,Wed,Fri', start: '16:00', end: '18:30', seats: 40, active: true },
    { id: 'c2', name: 'NEET Foundation', desc: 'Biology, Physics and Chemistry with NCERT-first approach and chapter-wise MCQ practice.', fee: 120000, duration: '1 year', days: 'Tue,Thu,Sat', start: '16:00', end: '18:30', seats: 40, active: true },
    { id: 'c3', name: 'Class 10 Boards — Maths & Science', desc: 'Concept classes, sample papers and answer-writing practice for CBSE boards.', fee: 36000, duration: '10 months', days: 'Mon,Tue,Wed,Thu,Fri', start: '14:00', end: '15:30', seats: 30, active: true },
    { id: 'c4', name: 'Class 12 Commerce', desc: 'Accountancy, Economics and Business Studies, with board-pattern tests every fortnight.', fee: 42000, duration: '10 months', days: 'Mon,Wed,Fri,Sat', start: '18:45', end: '20:15', seats: 30, active: true },
    { id: 'c5', name: 'Spoken English & Interview Skills', desc: 'Weekend batch for confident speaking, group discussions and mock interviews.', fee: 8500, duration: '3 months', days: 'Sat,Sun', start: '10:00', end: '11:30', seats: 20, active: true }
  ];
  const staff = [
    { id: 's1', name: 'Dr. Anil Mehra', role: 'Physics · Director', bio: 'M.Sc., Ph.D. (IIT Delhi). 18 years of JEE teaching.' },
    { id: 's2', name: 'Priya Nair', role: 'Chemistry', bio: 'M.Sc. Chemistry. Known for organic chemistry shortcuts and clear notes.' },
    { id: 's3', name: 'Rohit Bansal', role: 'Mathematics', bio: 'B.Tech (NIT). Has mentored 300+ JEE qualifiers.' },
    { id: 's4', name: 'Dr. Sana Qureshi', role: 'Biology', bio: 'MBBS. Teaches NEET Biology with diagrams and mnemonics.' },
    { id: 's5', name: 'Kavita Arora', role: 'Commerce & English', bio: 'M.Com, CELTA certified. Runs the commerce and spoken English batches.' }
  ];
  const names = [['Aarav Sharma', 'Rakesh Sharma'], ['Diya Verma', 'Sunita Verma'], ['Kabir Malhotra', 'Vikram Malhotra'], ['Ananya Gupta', 'Neeraj Gupta'], ['Ishaan Rawat', 'Pooja Rawat'], ['Meera Iyer', 'Lakshmi Iyer'],
    ['Arjun Singh', 'Harpreet Singh'], ['Saanvi Joshi', 'Manish Joshi'], ['Vihaan Chauhan', 'Deepa Chauhan'], ['Riya Kapoor', 'Amit Kapoor'], ['Aditya Negi', 'Sushma Negi'], ['Tanya Bhatia', 'Rajiv Bhatia'],
    ['Yash Agarwal', 'Ritu Agarwal'], ['Navya Reddy', 'Srinivas Reddy']];
  const people = names.map(([n, g], i) => ({ id: 'p' + (i + 1), name: n, phone: '98' + String(10000000 + i * 7314529).slice(0, 8), email: n.split(' ')[0].toLowerCase() + '@example.com', guardian: g, guardianPhone: '99' + String(20000000 + i * 5131) .slice(0, 8), joined: addDays(-120 + i * 6), notes: i === 4 ? 'Needs extra help in organic chemistry.' : '' }));
  const map = ['c1', 'c2', 'c1', 'c3', 'c2', 'c4', 'c1', 'c3', 'c3', 'c4', 'c1', 'c2', 'c4', 'c5'];
  const bookings = people.map((p, i) => { const o = offerings.find(x => x.id === map[i]); const disc = i % 5 === 0 ? 0.1 : 0; return { id: 'b' + (i + 1), personId: p.id, offeringId: o.id, fee: Math.round(o.fee * (1 - disc)), start: p.joined, status: 'Active' }; });
  bookings.push({ id: 'b15', personId: 'p4', offeringId: 'c5', fee: 8500, start: addDays(-30), status: 'Active' });
  const modes = ['UPI', 'Cash', 'UPI', 'Bank transfer', 'Card'];
  const payments = []; let rn = 1001;
  bookings.forEach((b, i) => {
    const parts = i % 4 === 0 ? [1] : i % 4 === 1 ? [0.5, 0.25] : i % 4 === 2 ? [0.4] : [0.5];
    parts.forEach((f, j) => payments.push({ id: uid(), personId: b.personId, bookingId: b.id, amount: Math.round(b.fee * f / 100) * 100, date: addDays(-Math.max(1, 95 - i * 6 - j * 40)), mode: modes[(i + j) % 5], receiptNo: 'R-' + (rn++), note: j === 0 ? 'Admission + 1st instalment' : 'Instalment ' + (j + 1) }));
  });
  const attendance = {};
  for (let d = -14; d <= -1; d++) {
    const date = addDays(d); const wd = DAYS[new Date(date + 'T00:00').getDay()];
    offerings.forEach(o => {
      if (!o.days.split(',').includes(wd)) return;
      const rec = {};
      bookings.filter(b => b.offeringId === o.id).forEach((b, k) => { rec[b.personId] = ((k * 7 + d * 3) % 9 === 0) ? 'A' : 'P'; });
      if (Object.keys(rec).length) attendance[date + '|' + o.id] = rec;
    });
  }
  return {
    type: 'institute',
    settings: { name: 'Shiksha Point Academy', tagline: 'JEE · NEET · Boards coaching', color: '#1f3a5f', phone: '+91 98100 00000', email: 'admissions@example.com',
      address: 'Plot 12, Sector 7, Dwarka, New Delhi 110075 (demo address)', hours: 'Mon–Sat 9:00 AM – 8:30 PM', whatsapp: '',
      heroTitle: 'Small batches. Serious results.', heroSub: 'Coaching for JEE, NEET and Class 10/12 boards with weekly tests, doubt sessions and progress reports for parents.',
      stats: '12+ years|1,800+ students|30 max per batch', about: 'Shiksha Point Academy was started by a group of teachers who believed students learn best in small batches where every doubt gets answered. We publish progress after every test so parents always know where their child stands.',
      receiptFooter: 'Fees once paid are subject to the institute policy. This is a computer-generated receipt.' },
    pages: [
      { id: 'pg1', title: 'About us', slug: 'about', show: true, body: 'Shiksha Point Academy was founded with one simple idea: a teacher should know every student by name.\n\nOur faculty includes IIT and NIT alumni and doctors who teach because they enjoy it. Every batch has a weekly test, and results go to parents the same evening.\n\nWhat makes us different\n• Batches capped at 30 students\n• Daily doubt counter from 2 PM to 8 PM\n• Printed notes and a test series included\n• Monthly parent–teacher meetings' },
      { id: 'pg2', title: 'Results', slug: 'results', show: true, body: '2026 highlights\n\n• 42 students qualified JEE Advanced\n• 67 students scored 600+ in NEET\n• Class 10 batch average: 91.4%\n\n(Demo content — replace with your own results.)' },
      { id: 'pg3', title: 'Fee & refund policy', slug: 'policy', show: false, body: 'Write your fee, instalment and refund policy here. Hidden pages are not shown in the menu.' }
    ],
    offerings, staff, people, bookings, payments, attendance,
    gallery: [
      { id: 'g1', url: '', caption: 'Smart classroom', color: '#1f3a5f' }, { id: 'g2', url: '', caption: 'Physics lab', color: '#0f766e' },
      { id: 'g3', url: '', caption: 'Library & self-study hall', color: '#7c3aed' }, { id: 'g4', url: '', caption: 'Toppers felicitation 2026', color: '#b45309' },
      { id: 'g5', url: '', caption: 'Doubt-clearing counter', color: '#be123c' }, { id: 'g6', url: '', caption: 'Annual science fair', color: '#1d4ed8' }
    ],
    announcements: [
      { id: 'a1', title: 'Admissions open for 2027–28 batches', body: 'Scholarship test every Sunday at 11 AM. Up to 50% fee waiver for top scorers.', date: addDays(-2), pinned: true },
      { id: 'a2', title: 'Diwali break', body: 'Classes stay closed for the festival break; online doubt sessions continue.', date: addDays(-6), pinned: false },
      { id: 'a3', title: 'Full-length JEE mock on Sunday', body: 'Report by 8:45 AM with admit card.', date: addDays(-1), pinned: false }
    ],
    enquiries: [
      { id: 'e1', name: 'Sneha Pandey', phone: '9811122233', email: 'sneha.p@example.com', interest: 'NEET Foundation', message: 'Is there a weekend batch? My daughter is in Class 11.', date: t, status: 'New' },
      { id: 'e2', name: 'Mohit Kumar', phone: '9876501234', email: '', interest: 'JEE Main + Advanced (2-year)', message: 'Please share fee instalment options.', date: addDays(-1), status: 'New' },
      { id: 'e3', name: 'Farah Khan', phone: '9990011122', email: 'farah@example.com', interest: 'Class 10 Boards — Maths & Science', message: 'Want a demo class for my son.', date: addDays(-2), status: 'Contacted' },
      { id: 'e4', name: 'Gaurav Sethi', phone: '9810098100', email: '', interest: 'Spoken English & Interview Skills', message: '', date: addDays(-5), status: 'Converted' },
      { id: 'e5', name: 'Nidhi Saxena', phone: '9711100099', email: 'nidhi@example.com', interest: 'Class 12 Commerce', message: 'Timings for evening batch?', date: addDays(-8), status: 'Closed' }
    ],
    receiptSeq: rn
  };
}

function seedClinic() {
  const offerings = [
    { id: 'c1', name: 'General consultation', desc: 'Fever, infections, BP, diabetes follow-ups and everyday health concerns.', fee: 500, duration: '15 min', active: true },
    { id: 'c2', name: 'Paediatric consultation', desc: 'Child health check-ups, vaccinations schedule and growth monitoring.', fee: 600, duration: '20 min', active: true },
    { id: 'c3', name: 'Dental cleaning & check-up', desc: 'Scaling, polishing and a full oral examination.', fee: 1200, duration: '30 min', active: true },
    { id: 'c4', name: 'Physiotherapy session', desc: 'Back, neck and knee pain; post-surgery rehab.', fee: 800, duration: '45 min', active: true },
    { id: 'c5', name: 'Full body health check', desc: '70+ lab parameters with a doctor review of reports.', fee: 2499, duration: '60 min', active: true }
  ];
  const staff = [
    { id: 's1', name: 'Dr. Ritu Sharma', role: 'MBBS, MD (Medicine)', bio: 'Family physician with 15 years of practice.' },
    { id: 's2', name: 'Dr. Arvind Menon', role: 'MD (Paediatrics)', bio: 'Child specialist; former resident at AIIMS.' },
    { id: 's3', name: 'Dr. Neha Batra', role: 'BDS, MDS', bio: 'Dental surgeon focused on painless dentistry.' },
    { id: 's4', name: 'Dr. Karan Gill', role: 'BPT, MPT', bio: 'Sports and orthopaedic physiotherapist.' }
  ];
  const names = [['Ramesh Yadav', '54 / M'], ['Sunita Devi', '47 / F'], ['Aisha Siddiqui', '29 / F'], ['Baby Vivaan Jain', '3 / M'], ['Harish Kumar', '61 / M'], ['Pallavi Desai', '35 / F'],
    ['Manoj Tiwari', '42 / M'], ['Simran Kaur', '26 / F'], ['Deepak Rana', '38 / M'], ['Kiran Bedi', '58 / F'], ['Ayaan Mirza', '8 / M'], ['Lata Krishnan', '66 / F']];
  const people = names.map(([n, g], i) => ({ id: 'p' + (i + 1), name: n, phone: '98' + String(30000000 + i * 6131) .slice(0, 8), email: '', guardian: g, guardianPhone: '', joined: addDays(-200 + i * 12), notes: i === 0 ? 'Type 2 diabetes — on metformin.' : i === 4 ? 'Hypertension; allergic to penicillin.' : '' }));
  const svcDoc = { c1: 's1', c2: 's2', c3: 's3', c4: 's4', c5: 's1' };
  const plan = [[-40, 'p1', 'c1', '10:00'], [-33, 'p2', 'c4', '11:00'], [-30, 'p3', 'c3', '12:00'], [-25, 'p4', 'c2', '10:30'], [-21, 'p5', 'c1', '17:00'], [-18, 'p1', 'c5', '09:00'],
    [-14, 'p6', 'c4', '18:00'], [-12, 'p7', 'c1', '10:15'], [-9, 'p8', 'c3', '11:30'], [-7, 'p2', 'c4', '11:00'], [-5, 'p9', 'c1', '17:30'], [-3, 'p10', 'c5', '09:00'], [-2, 'p11', 'c2', '16:30'], [-1, 'p5', 'c1', '17:00'],
    [0, 'p1', 'c1', '10:00'], [0, 'p12', 'c4', '11:00'], [0, 'p3', 'c3', '12:30'], [0, 'p4', 'c2', '16:00'], [0, 'p8', 'c1', '17:30'], [0, 'p6', 'c4', '18:30'],
    [1, 'p2', 'c4', '11:00'], [1, 'p9', 'c5', '09:00'], [2, 'p7', 'c1', '10:30'], [4, 'p11', 'c2', '16:30']];
  const notes = ['BP 130/85. Continue medication, review in 4 weeks.', 'Lower back pain improving; home exercises given.', 'Mild gingivitis. Advised flossing.', 'Growth normal. Next vaccine due.', 'Viral fever. Paracetamol, fluids, rest.'];
  const bookings = plan.map(([d, p, c, tm], i) => ({ id: 'b' + (i + 1), personId: p, offeringId: c, staffId: svcDoc[c], date: addDays(d), time: tm, fee: offerings.find(o => o.id === c).fee,
    status: d < 0 ? (i === 10 ? 'No-show' : 'Completed') : 'Booked', notes: d < 0 && i !== 10 ? notes[i % notes.length] : '' }));
  const payments = []; let rn = 5001;
  bookings.filter(b => b.status === 'Completed').forEach((b, i) => { if (i % 6 === 3) return; payments.push({ id: uid(), personId: b.personId, bookingId: b.id, amount: b.fee, date: b.date, mode: ['UPI', 'Cash', 'Card'][i % 3], receiptNo: 'R-' + (rn++), note: '' }); });
  return {
    type: 'clinic',
    settings: { name: 'CarePlus Family Clinic', tagline: 'Family medicine · Dental · Physio', color: '#0f766e', phone: '+91 98110 00000', email: 'appointments@example.com',
      address: 'Shop 4, Central Market, Sector 12, Noida 201301 (demo address)', hours: 'Mon–Sat 9 AM – 1 PM, 5 – 9 PM · Sun 10 AM – 1 PM', whatsapp: '',
      heroTitle: 'Your family doctor, right around the corner.', heroSub: 'General medicine, children’s care, dental and physiotherapy under one roof — book a visit in under a minute.',
      stats: '15 years of care|20,000+ patients|Same-day appointments', about: 'CarePlus is a neighbourhood clinic run by experienced doctors. We keep waiting times short, explain every prescription, and keep your visit history so follow-ups are quick.',
      receiptFooter: 'Thank you for visiting. This is a computer-generated receipt.' },
    pages: [
      { id: 'pg1', title: 'About the clinic', slug: 'about', show: true, body: 'CarePlus Family Clinic has served the neighbourhood since 2011.\n\n• Digital records — your history is ready at every visit\n• In-house sample collection for lab tests\n• Wheelchair accessible, ground floor\n\n(Demo content — replace with your own.)' },
      { id: 'pg2', title: 'Insurance & payments', slug: 'payments', show: true, body: 'We accept UPI, cards and cash. Receipts are issued for every payment and can be used for reimbursement claims.' }
    ],
    offerings, staff, people, bookings, payments, attendance: {},
    gallery: [
      { id: 'g1', url: '', caption: 'Reception & waiting area', color: '#0f766e' }, { id: 'g2', url: '', caption: 'Consultation room', color: '#1d4ed8' },
      { id: 'g3', url: '', caption: 'Dental chair', color: '#7c3aed' }, { id: 'g4', url: '', caption: 'Physiotherapy studio', color: '#b45309' }
    ],
    announcements: [
      { id: 'a1', title: 'Free BP & sugar check camp this Sunday', body: '10 AM – 1 PM. No appointment needed.', date: addDays(-1), pinned: true },
      { id: 'a2', title: 'Flu vaccines in stock', body: 'Recommended for adults over 50 and children under 5.', date: addDays(-4), pinned: false }
    ],
    enquiries: [
      { id: 'e1', name: 'Rahul Bhatt', phone: '9811234567', email: '', interest: 'Physiotherapy session', message: 'Knee pain after running. Evening slot available tomorrow?', date: today(), status: 'New' },
      { id: 'e2', name: 'Shalini Roy', phone: '9899988877', email: 'shalini@example.com', interest: 'Full body health check', message: 'For my parents, both 60+. Is fasting needed?', date: addDays(-1), status: 'New' },
      { id: 'e3', name: 'Imran Ali', phone: '9717171717', email: '', interest: 'Dental cleaning & check-up', message: '', date: addDays(-3), status: 'Contacted' }
    ],
    receiptSeq: rn
  };
}

/* ---------------- store ---------------- */
const KEY_TYPE = 'icms:type';
let S;
function curType() { return localStorage.getItem(KEY_TYPE) || 'institute'; }
function load(type) {
  type = type || curType();
  let d = null;
  try { d = JSON.parse(localStorage.getItem('icms:data:' + type)); } catch (e) { d = null; }
  if (!d || !d.settings) { d = type === 'clinic' ? seedClinic() : seedInstitute(); localStorage.setItem('icms:data:' + type, JSON.stringify(d)); }
  S = d; return d;
}
function save() { localStorage.setItem('icms:data:' + S.type, JSON.stringify(S)); }
const L = () => LABELS[S.type];
const byId = (col, id) => (S[col] || []).find(x => x.id === id);

/* ---------------- domain helpers ---------------- */
function chargesFor(pid) {
  return sum(S.bookings.filter(b => b.personId === pid && (S.type === 'institute' ? b.status !== 'Dropped' : b.status === 'Completed')), b => b.fee);
}
function paidFor(pid) { return sum(S.payments.filter(p => p.personId === pid), p => p.amount); }
function dueFor(pid) { return Math.max(0, chargesFor(pid) - paidFor(pid)); }
function attStats(pid) {
  let p = 0, t = 0;
  Object.values(S.attendance).forEach(rec => { if (rec[pid]) { t++; if (rec[pid] === 'P') p++; } });
  return { p, t, pct: t ? Math.round(p * 100 / t) : null };
}
function todaySchedule(date) {
  date = date || today();
  if (S.type === 'clinic') {
    return S.bookings.filter(b => b.date === date && b.status !== 'Cancelled').sort((a, b) => a.time.localeCompare(b.time)).map(b => ({
      time: b.time, title: (byId('people', b.personId) || {}).name || '—', sub: ((byId('offerings', b.offeringId) || {}).name || '') + ' · ' + ((byId('staff', b.staffId) || {}).name || ''), status: b.status, link: '#/people/' + b.personId, id: b.id }));
  }
  const wd = DAYS[new Date(date + 'T00:00').getDay()];
  return S.offerings.filter(o => o.active && (o.days || '').split(',').includes(wd)).sort((a, b) => a.start.localeCompare(b.start)).map(o => {
    const n = S.bookings.filter(b => b.offeringId === o.id && b.status === 'Active').length;
    const marked = !!S.attendance[date + '|' + o.id];
    return { time: o.start, title: o.name, sub: `${fmtTime(o.start)} – ${fmtTime(o.end)} · ${n} enrolled`, status: marked ? 'Marked' : 'Pending', link: `#/attendance?o=${o.id}&d=${date}`, id: o.id };
  });
}
function statusPill(s) {
  const m = { New: 'info', Contacted: 'warn', Converted: 'ok', Closed: '', Active: 'ok', Completed: 'ok', Dropped: 'bad', Booked: 'info', Cancelled: 'bad', 'No-show': 'bad', Marked: 'ok', Pending: 'warn', Paid: 'ok', Due: 'warn' };
  return `<span class="pill ${m[s] || ''}">${esc(s)}</span>`;
}

/* ---------------- modal + forms ---------------- */
function modal(title, bodyHTML, { onSave, saveLabel = 'Save', extraBtns = '', wide } = {}) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" ${wide ? 'style="width:min(760px,100%)"' : ''}>
    <div class="modal-h"><h2>${esc(title)}</h2><button class="btn ghost" data-x aria-label="Close">✕</button></div>
    <form class="modal-form"><div class="modal-b">${bodyHTML}</div>
    <div class="modal-f">${extraBtns}<span class="spacer"></span><button type="button" class="btn" data-x>${onSave ? 'Cancel' : 'Close'}</button>${onSave ? `<button class="btn primary" type="submit">${esc(saveLabel)}</button>` : ''}</div></form></div></div>`;
  const close = () => { root.innerHTML = ''; };
  $$('[data-x]', root).forEach(b => b.onclick = close);
  $('.modal-bg', root).addEventListener('mousedown', e => { if (e.target.classList.contains('modal-bg')) close(); });
  const form = $('.modal-form', root);
  form.onsubmit = e => { e.preventDefault(); if (!onSave) return close(); if (onSave(formData(form)) !== false) close(); };
  const first = $('input,select,textarea', form); if (first) setTimeout(() => first.focus(), 30);
  return root;
}
function formData(form) {
  const o = {};
  $$('[name]', form).forEach(el => {
    if (el.type === 'checkbox') o[el.name] = el.checked;
    else if (el.type === 'number') o[el.name] = el.value === '' ? '' : Number(el.value);
    else o[el.name] = el.value.trim();
  });
  return o;
}
function fieldHTML(f, v) {
  const val = v == null ? (f.def != null ? f.def : '') : v;
  const req = f.req ? 'required' : '';
  const cls = f.full ? 'f full' : 'f';
  if (f.type === 'checkbox') return `<label class="chk ${f.full ? 'full' : ''}"><input type="checkbox" name="${f.k}" ${val ? 'checked' : ''}> ${esc(f.label)}</label>`;
  if (f.type === 'textarea') return `<label class="${cls}"><span>${esc(f.label)}</span><textarea name="${f.k}" ${req} placeholder="${esc(f.ph || '')}">${esc(val)}</textarea></label>`;
  if (f.type === 'select') {
    const opts = (typeof f.options === 'function' ? f.options() : f.options).map(o => Array.isArray(o) ? o : [o, o]);
    return `<label class="${cls}"><span>${esc(f.label)}</span><select name="${f.k}" ${req}>${opts.map(([k, t]) => `<option value="${esc(k)}" ${String(k) === String(val) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
  }
  return `<label class="${cls}"><span>${esc(f.label)}</span><input type="${f.type || 'text'}" name="${f.k}" value="${esc(val)}" ${req} ${f.min != null ? `min="${f.min}"` : ''} ${f.step ? `step="${f.step}"` : ''} placeholder="${esc(f.ph || '')}"></label>`;
}
const formHTML = (fields, obj = {}) => `<div class="form-grid">${fields.map(f => fieldHTML(f, obj[f.k])).join('')}</div>`;
function editRecord(col, fields, obj, title, after) {
  const isNew = !obj;
  modal((isNew ? 'Add ' : 'Edit ') + title, formHTML(fields, obj || {}), {
    extraBtns: isNew ? '' : `<button type="button" class="btn danger" id="del-rec">Delete</button>`,
    onSave: data => {
      if (isNew) S[col].unshift(Object.assign({ id: uid() }, data)); else Object.assign(obj, data);
      save(); toast(title + (isNew ? ' added' : ' saved')); (after || render)(); return true;
    }
  });
  const d = $('#del-rec'); if (d) d.onclick = () => { if (confirm('Delete this ' + title.toLowerCase() + '?')) { S[col] = S[col].filter(x => x !== obj); save(); $('#modal-root').innerHTML = ''; toast('Deleted'); (after || render)(); } };
}

/* ---------------- field schemas ---------------- */
const F = {
  offering: () => S.type === 'institute' ? [
    { k: 'name', label: 'Course name', req: true, full: true }, { k: 'desc', label: 'Short description', type: 'textarea', full: true },
    { k: 'fee', label: 'Total fee (₹)', type: 'number', min: 0, req: true }, { k: 'duration', label: 'Duration', ph: 'e.g. 1 year' },
    { k: 'days', label: 'Class days (comma separated)', ph: 'Mon,Wed,Fri', def: 'Mon,Wed,Fri' }, { k: 'seats', label: 'Seats', type: 'number', min: 0 },
    { k: 'start', label: 'Starts at', type: 'time', def: '16:00' }, { k: 'end', label: 'Ends at', type: 'time', def: '17:30' },
    { k: 'active', label: 'Show on website & accept enrolments', type: 'checkbox', def: true, full: true }
  ] : [
    { k: 'name', label: 'Service name', req: true, full: true }, { k: 'desc', label: 'Short description', type: 'textarea', full: true },
    { k: 'fee', label: 'Fee (₹)', type: 'number', min: 0, req: true }, { k: 'duration', label: 'Duration', ph: 'e.g. 30 min' },
    { k: 'active', label: 'Show on website & accept bookings', type: 'checkbox', def: true, full: true }
  ],
  staff: () => [{ k: 'name', label: 'Name', req: true }, { k: 'role', label: S.type === 'institute' ? 'Subject / role' : 'Qualification / speciality' }, { k: 'bio', label: 'Short bio', type: 'textarea', full: true }],
  person: () => [
    { k: 'name', label: 'Full name', req: true }, { k: 'phone', label: 'Phone', type: 'tel', req: true }, { k: 'email', label: 'Email', type: 'email' },
    { k: 'guardian', label: L().guardian }, { k: 'guardianPhone', label: L().guardianPh, type: 'tel' }, { k: 'joined', label: S.type === 'institute' ? 'Admission date' : 'First visit', type: 'date', def: today() },
    { k: 'notes', label: S.type === 'institute' ? 'Notes' : 'Medical notes / allergies', type: 'textarea', full: true }
  ],
  booking: () => S.type === 'institute' ? [
    { k: 'personId', label: 'Student', type: 'select', req: true, options: () => S.people.map(p => [p.id, p.name]) },
    { k: 'offeringId', label: 'Course', type: 'select', req: true, options: () => S.offerings.map(o => [o.id, `${o.name} (${inr(o.fee)})`]) },
    { k: 'fee', label: 'Agreed fee (₹, after any discount)', type: 'number', min: 0 }, { k: 'start', label: 'Start date', type: 'date', def: today() },
    { k: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'Dropped'], def: 'Active' }
  ] : [
    { k: 'personId', label: 'Patient', type: 'select', req: true, options: () => S.people.map(p => [p.id, p.name]) },
    { k: 'offeringId', label: 'Service', type: 'select', req: true, options: () => S.offerings.map(o => [o.id, `${o.name} (${inr(o.fee)})`]) },
    { k: 'staffId', label: 'Doctor', type: 'select', options: () => S.staff.map(s => [s.id, s.name]) },
    { k: 'date', label: 'Date', type: 'date', def: today(), req: true }, { k: 'time', label: 'Time', type: 'time', def: '10:00', req: true },
    { k: 'fee', label: 'Charge (₹)', type: 'number', min: 0 }, { k: 'status', label: 'Status', type: 'select', options: ['Booked', 'Completed', 'Cancelled', 'No-show'], def: 'Booked' },
    { k: 'notes', label: 'Visit notes / prescription', type: 'textarea', full: true }
  ],
  payment: () => [
    { k: 'personId', label: L().person, type: 'select', req: true, options: () => S.people.map(p => [p.id, `${p.name}${dueFor(p.id) ? ' — due ' + inr(dueFor(p.id)) : ''}`]) },
    { k: 'amount', label: 'Amount (₹)', type: 'number', min: 1, req: true }, { k: 'date', label: 'Date', type: 'date', def: today(), req: true },
    { k: 'mode', label: 'Mode', type: 'select', options: ['UPI', 'Cash', 'Card', 'Bank transfer', 'Cheque'], def: 'UPI' }, { k: 'note', label: 'Note', ph: 'e.g. 2nd instalment', full: true }
  ],
  announcement: () => [{ k: 'title', label: 'Title', req: true, full: true }, { k: 'body', label: 'Details', type: 'textarea', full: true }, { k: 'date', label: 'Date', type: 'date', def: today() }, { k: 'pinned', label: 'Show in the top bar of the website', type: 'checkbox' }],
  page: () => [{ k: 'title', label: 'Page title', req: true }, { k: 'slug', label: 'URL slug', ph: 'about', req: true }, { k: 'body', label: 'Content (plain text, blank line = new paragraph)', type: 'textarea', full: true }, { k: 'show', label: 'Show in website menu', type: 'checkbox', def: true }],
  gallery: () => [{ k: 'caption', label: 'Caption', req: true, full: true }, { k: 'url', label: 'Image URL (optional — leave blank for a colour tile)', type: 'url', full: true }, { k: 'color', label: 'Tile colour', type: 'select', options: COLORS.map(c => [c, c]), def: COLORS[0] }],
  enquiry: () => [{ k: 'name', label: 'Name', req: true }, { k: 'phone', label: 'Phone', type: 'tel', req: true }, { k: 'email', label: 'Email', type: 'email' },
    { k: 'interest', label: 'Interested in', type: 'select', options: () => ['General', ...S.offerings.map(o => o.name)] }, { k: 'message', label: 'Message', type: 'textarea', full: true },
    { k: 'status', label: 'Status', type: 'select', options: ['New', 'Contacted', 'Converted', 'Closed'], def: 'New' }, { k: 'date', label: 'Date', type: 'date', def: today() }]
};

/* ---------------- receipts ---------------- */
function receiptHTML(p) {
  const per = byId('people', p.personId) || {}; const b = byId('bookings', p.bookingId); const o = b ? byId('offerings', b.offeringId) : null;
  const st = S.settings;
  return `<div class="receipt">
    <div class="rh"><div><div style="font-weight:800;font-size:1.15rem">${esc(st.name)}</div><div class="small muted">${esc(st.address)}<br>${esc(st.phone)} · ${esc(st.email)}</div></div>
    <div class="right"><div style="font-weight:700">FEE RECEIPT</div><div class="small">No. ${esc(p.receiptNo)}</div><div class="small">${fmtDate(p.date)}</div></div></div>
    <table><tr><td class="muted" style="width:40%">Received from</td><td><b>${esc(per.name)}</b>${per.guardian && S.type === 'institute' ? ` <span class="muted">(${esc(L().guardian)}: ${esc(per.guardian)})</span>` : ''}</td></tr>
    <tr><td class="muted">${esc(L().booking)}</td><td>${o ? esc(o.name) : 'General'}</td></tr>
    <tr><td class="muted">Payment mode</td><td>${esc(p.mode)}</td></tr>
    ${p.note ? `<tr><td class="muted">Towards</td><td>${esc(p.note)}</td></tr>` : ''}
    <tr><td class="muted">Balance due after this payment</td><td>${inr(dueFor(p.personId))}</td></tr></table>
    <div style="margin-top:14px;padding:12px;background:#f5f6f8;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>Amount received</span><span class="amt">${inr(p.amount)}</span></div>
    <div class="small muted" style="margin-top:6px">${esc(amountWords(p.amount))} only</div>
    <div class="sig"><span>${esc(st.receiptFooter || '')}</span><span>Authorised signatory</span></div></div>`;
}
function amountWords(n) {
  n = Math.round(n); if (!n) return 'Rupees zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = x => x < 20 ? a[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
  const three = x => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : '');
  const parts = []; const cr = Math.floor(n / 1e7); n %= 1e7; const lk = Math.floor(n / 1e5); n %= 1e5; const th = Math.floor(n / 1000); n %= 1000;
  if (cr) parts.push(three(cr) + ' Crore'); if (lk) parts.push(two(lk) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (n) parts.push(three(n));
  return 'Rupees ' + parts.join(' ');
}
function showReceipt(pid) {
  const p = S.payments.find(x => x.id === pid); if (!p) return;
  modal('Receipt ' + p.receiptNo, receiptHTML(p), { extraBtns: `<button type="button" class="btn primary" id="print-r">🖨 Print / Save PDF</button>`, wide: true });
  $('#print-r').onclick = () => { $('#print-area').innerHTML = receiptHTML(p); window.print(); };
}
function recordPayment(prefill = {}) {
  modal('Record payment', formHTML(F.payment(), prefill), {
    saveLabel: 'Save & show receipt',
    onSave: d => {
      const per = d.personId; const bk = S.bookings.filter(b => b.personId === per).sort((a, b) => (b.start || b.date || '').localeCompare(a.start || a.date || ''))[0];
      const p = Object.assign({ id: uid(), bookingId: bk ? bk.id : '', receiptNo: 'R-' + (S.receiptSeq++) }, d);
      S.payments.unshift(p); save(); render(); setTimeout(() => showReceipt(p.id), 20); return true;
    }
  });
}

/* ---------------- admin views ---------------- */
const NAV = () => [
  ['Overview', [['dashboard', '▦', 'Dashboard'], ['enquiries', '✉', 'Enquiries', S.enquiries.filter(e => e.status === 'New').length]]],
  ['Website', [['website', '◧', 'Website editor'], ['offerings', '☰', L().offerings], ['staff', '☺', L().staff], ['gallery', '▣', 'Gallery'], ['announcements', '📣', 'Announcements'], ['pages', '▤', 'Pages']]],
  [S.type === 'institute' ? 'Academics' : 'Patients', [['people', '👥', L().people], ['bookings', '🗓', L().bookings], ...(S.type === 'institute' ? [['attendance', '✓', 'Attendance']] : []), ['payments', '₹', 'Fees & payments']]],
  ['System', [['settings', '⚙', 'Settings & backup']]]
];

function shell(route, title, inner, actions = '') {
  return `<div class="shell"><aside class="side" id="side">
    <div class="brand"><div class="logo" style="background:${esc(S.settings.color)}">${esc(initials(S.settings.name))}</div><div>${esc(S.settings.name)}<small>${esc(L().kind)} admin</small></div></div>
    ${NAV().map(([g, items]) => `<div class="nav-group">${esc(g)}</div>${items.map(([r, ic, t, n]) => `<a class="nav ${route === r ? 'active' : ''}" href="#/${r}"><span class="ic">${ic}</span>${esc(t)}${n ? `<span class="badge">${n}</span>` : ''}</a>`).join('')}`).join('')}
    <div class="nav-group">Public</div><a class="nav" href="#/site" target="_blank" rel="noopener"><span class="ic">↗</span>Open live website</a>
  </aside><div class="main">
  <div class="demo-banner">Demo — everything is saved only in this browser. Try editing the website, adding a ${esc(L().person.toLowerCase())} or recording a payment. Built by <a href="https://r69shabh.me" target="_blank" rel="noopener">Rishabh Gusain</a>.</div>
  <div class="topbar"><button class="btn menu-btn" id="menu" aria-label="Menu">☰</button><h1>${esc(title)}</h1>${actions}</div>
  <div class="content">${inner}</div></div></div>`;
}

function vDashboard() {
  const newEnq = S.enquiries.filter(e => e.status === 'New');
  const dues = S.people.map(p => ({ p, d: dueFor(p.id) })).filter(x => x.d > 0).sort((a, b) => b.d - a.d);
  const totalDue = sum(dues, x => x.d);
  const ym = addDays(-29);
  const monthPaid = sum(S.payments.filter(p => (p.date || '') >= ym), p => p.amount);
  const sched = todaySchedule();
  const active = S.type === 'institute' ? S.bookings.filter(b => b.status === 'Active').length : S.bookings.filter(b => b.status === 'Booked' && b.date >= today()).length;
  let attPct = null;
  if (S.type === 'institute') { let p = 0, t = 0; Object.values(S.attendance).forEach(r => Object.values(r).forEach(v => { t++; if (v === 'P') p++; })); attPct = t ? Math.round(p * 100 / t) : null; }
  const dayLbl = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  return shell('dashboard', 'Dashboard', `
  <div class="grid g4">
    <a class="card kpi" href="#/enquiries" style="text-decoration:none;color:inherit"><div class="lbl">New enquiries</div><div class="val">${newEnq.length}</div><div class="sub">${S.enquiries.length} total</div></a>
    <a class="card kpi" href="#/payments" style="text-decoration:none;color:inherit"><div class="lbl">Fees due</div><div class="val" style="color:var(--warn)">${inr(totalDue)}</div><div class="sub">${dues.length} ${esc(L().people.toLowerCase())}</div></a>
    <div class="card kpi"><div class="lbl">Collected (last 30 days)</div><div class="val" style="color:var(--ok)">${inr(monthPaid)}</div><div class="sub">${S.payments.filter(p => (p.date || '') >= ym).length} receipts</div></div>
    <div class="card kpi"><div class="lbl">${S.type === 'institute' ? 'Active enrolments' : 'Upcoming appointments'}</div><div class="val">${active}</div><div class="sub">${attPct != null ? `Avg attendance ${attPct}%` : `${S.people.length} patients on file`}</div></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="card-h"><h2>Today’s schedule</h2><span class="muted small">${esc(dayLbl)}</span></div>
      ${sched.length ? sched.map(s => `<div class="list-item"><div class="time">${fmtTime(s.time)}</div><div style="flex:1;min-width:0"><a href="${s.link}" style="font-weight:600;text-decoration:none;color:inherit">${esc(s.title)}</a><div class="small muted">${esc(s.sub)}</div></div>${statusPill(s.status)}
      ${S.type === 'clinic' && s.status === 'Booked' ? `<button class="btn sm" data-complete="${s.id}">Done</button>` : ''}${S.type === 'institute' ? `<a class="btn sm" href="${s.link}">${s.status === 'Marked' ? 'View' : 'Mark'}</a>` : ''}</div>`).join('') : `<div class="empty">Nothing scheduled today.</div>`}
      <div class="row" style="margin-top:10px"><a class="btn sm" href="#/${S.type === 'institute' ? 'attendance' : 'bookings'}">${S.type === 'institute' ? 'Attendance register' : 'All appointments'} →</a>${S.type === 'clinic' ? `<button class="btn sm primary" id="new-appt">+ Book appointment</button>` : ''}</div></div>
    <div class="card"><div class="card-h"><h2>New enquiries</h2><a class="btn sm" href="#/enquiries">View all</a></div>
      ${newEnq.length ? newEnq.slice(0, 5).map(e => `<div class="list-item"><div class="avatar" style="background:${colorFor(e.name)}">${esc(initials(e.name))}</div><div style="flex:1;min-width:0"><b>${esc(e.name)}</b> <span class="small muted">· ${fmtDate(e.date)}</span><div class="small">${esc(e.interest)}</div>${e.message ? `<div class="small muted">“${esc(e.message)}”</div>` : ''}</div><a class="btn sm" href="tel:${esc(e.phone)}">Call</a></div>`).join('') : `<div class="empty">No new enquiries. Enquiries from your website form appear here.</div>`}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h2>Pending fees</h2><button class="btn sm primary" id="rec-pay">+ Record payment</button></div>
    ${dues.length ? `<div class="table-wrap"><table><thead><tr><th>${esc(L().person)}</th><th class="hide-m">Phone</th><th class="right">Billed</th><th class="right">Paid</th><th class="right">Due</th><th></th></tr></thead><tbody>
    ${dues.slice(0, 8).map(({ p, d }) => `<tr class="click" data-go="#/people/${p.id}"><td><b>${esc(p.name)}</b></td><td class="hide-m">${esc(p.phone)}</td><td class="right">${inr(chargesFor(p.id))}</td><td class="right">${inr(paidFor(p.id))}</td><td class="right"><b style="color:var(--warn)">${inr(d)}</b></td><td class="right"><button class="btn sm" data-pay="${p.id}" data-amt="${d}">Collect</button></td></tr>`).join('')}
    </tbody></table></div>` : `<div class="empty">All fees are cleared 🎉</div>`}</div>`,
  `<a class="btn hide-m" href="#/site" target="_blank" rel="noopener">View website ↗</a>`);
}

function listToolbar(placeholder, addLabel, extra = '') {
  return `<div class="row" style="margin-bottom:12px"><input type="search" class="search" id="q" placeholder="${esc(placeholder)}" value="${esc(VIEW.q || '')}">${extra}<span class="spacer"></span>${addLabel ? `<button class="btn primary" id="add">${esc(addLabel)}</button>` : ''}</div>`;
}
const match = (o, q) => !q || JSON.stringify(o).toLowerCase().includes(q.toLowerCase());

function vEnquiries() {
  const st = VIEW.f || 'All';
  const rows = S.enquiries.filter(e => (st === 'All' || e.status === st) && match(e, VIEW.q)).sort((a, b) => b.date.localeCompare(a.date));
  return shell('enquiries', 'Enquiries', `<div class="card">${listToolbar('Search enquiries…', '+ Add enquiry',
    `<select id="filt" style="width:auto">${['All', 'New', 'Contacted', 'Converted', 'Closed'].map(s => `<option ${s === st ? 'selected' : ''}>${s}</option>`).join('')}</select>`)}
  ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Name</th><th>Interested in</th><th class="hide-m">Message</th><th>Status</th><th></th></tr></thead><tbody>
  ${rows.map(e => `<tr><td class="nowrap">${fmtDate(e.date)}</td><td><b>${esc(e.name)}</b><div class="small"><a href="tel:${esc(e.phone)}">${esc(e.phone)}</a>${e.email ? ` · ${esc(e.email)}` : ''}</div></td><td>${esc(e.interest)}</td><td class="hide-m small muted">${esc(e.message)}</td>
  <td><select data-enq-status="${e.id}" style="width:auto;padding:4px 6px">${['New', 'Contacted', 'Converted', 'Closed'].map(s => `<option ${s === e.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
  <td class="right nowrap"><button class="btn sm" data-convert="${e.id}" title="Create ${esc(L().person.toLowerCase())} from enquiry">→ ${esc(L().person)}</button> <button class="btn sm" data-edit-enq="${e.id}">Edit</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">No enquiries match.</div>`}</div>`);
}

function vOfferings() {
  const rows = S.offerings.filter(o => match(o, VIEW.q));
  return shell('offerings', L().offerings, `<div class="card">${listToolbar('Search…', '+ Add ' + L().offering.toLowerCase())}
  <div class="table-wrap"><table><thead><tr><th>${esc(L().offering)}</th>${S.type === 'institute' ? '<th class="hide-m">Schedule</th><th>Enrolled</th>' : '<th>Duration</th><th>Visits</th>'}<th class="right">Fee</th><th>Status</th></tr></thead><tbody>
  ${rows.map(o => { const n = S.bookings.filter(b => b.offeringId === o.id && (S.type === 'institute' ? b.status === 'Active' : b.status === 'Completed')).length;
    return `<tr class="click" data-edit-off="${o.id}"><td><b>${esc(o.name)}</b><div class="small muted">${esc(o.desc)}</div></td>${S.type === 'institute' ? `<td class="hide-m small">${esc((o.days || '').replace(/,/g, ', '))}<br>${fmtTime(o.start)} – ${fmtTime(o.end)}</td><td>${n}${o.seats ? ' / ' + o.seats : ''}</td>` : `<td>${esc(o.duration)}</td><td>${n}</td>`}<td class="right nowrap"><b>${inr(o.fee)}</b>${o.duration && S.type === 'institute' ? `<div class="small muted">${esc(o.duration)}</div>` : ''}</td><td>${o.active ? statusPill('Active') : '<span class="pill">Hidden</span>'}</td></tr>`; }).join('')}
  </tbody></table></div></div>`);
}

function vStaff() {
  return shell('staff', L().staff, `<div class="card">${listToolbar('Search…', '+ Add ' + L().staffOne.toLowerCase())}
  <div class="grid g3">${S.staff.filter(s => match(s, VIEW.q)).map(s => `<div class="card" style="margin:0;cursor:pointer" data-edit-staff="${s.id}"><div class="row"><div class="avatar" style="background:${colorFor(s.name)}">${esc(initials(s.name))}</div><div><b>${esc(s.name)}</b><div class="small muted">${esc(s.role)}</div></div></div><p class="small" style="margin:10px 0 0">${esc(s.bio)}</p></div>`).join('') || '<div class="empty">None yet.</div>'}</div></div>`);
}

function galTile(g, h) { return g.url ? `<div class="tile" style="background-image:url('${esc(g.url)}');${h ? 'height:' + h : ''}"></div>` : `<div class="tile" style="background:linear-gradient(135deg,${esc(g.color || COLORS[0])},${esc(g.color || COLORS[0])}cc);${h ? 'height:' + h : ''}">${esc(g.caption)}</div>`; }
function vGallery() {
  return shell('gallery', 'Gallery', `<div class="card"><div class="row" style="margin-bottom:12px"><span class="muted small">Paste image links from Google Photos, Instagram CDN or your own hosting — or keep colour tiles until you have photos.</span><span class="spacer"></span><button class="btn primary" id="add">+ Add photo</button></div>
  <div class="gal-admin">${S.gallery.map(g => `<figure>${galTile(g)}<figcaption><span style="flex:1">${esc(g.caption)}</span><button class="btn sm" data-edit-gal="${g.id}">Edit</button></figcaption></figure>`).join('')}</div></div>`);
}

function vAnnouncements() {
  const rows = [...S.announcements].sort((a, b) => (b.pinned - a.pinned) || b.date.localeCompare(a.date));
  return shell('announcements', 'Announcements', `<div class="card">${listToolbar('Search…', '+ New announcement')}
  ${rows.filter(a => match(a, VIEW.q)).map(a => `<div class="list-item" style="cursor:pointer" data-edit-ann="${a.id}"><div style="flex:1"><b>${esc(a.title)}</b> ${a.pinned ? '<span class="pill info">Top bar</span>' : ''}<div class="small muted">${fmtDate(a.date)}</div><div class="small">${esc(a.body)}</div></div><span class="btn sm">Edit</span></div>`).join('') || '<div class="empty">No announcements.</div>'}</div>`);
}

function vPages() {
  return shell('pages', 'Pages', `<div class="card">${listToolbar('Search…', '+ New page')}
  <div class="table-wrap"><table><thead><tr><th>Title</th><th>Link</th><th>Menu</th><th></th></tr></thead><tbody>
  ${S.pages.filter(p => match(p, VIEW.q)).map(p => `<tr><td><b>${esc(p.title)}</b><div class="small muted">${esc(p.body.slice(0, 90))}…</div></td><td class="small"><a href="#/site/page/${esc(p.slug)}" target="_blank" rel="noopener">/${esc(p.slug)}</a></td><td>${p.show ? statusPill('Active') : '<span class="pill">Hidden</span>'}</td><td class="right"><button class="btn sm" data-edit-page="${p.id}">Edit</button></td></tr>`).join('')}
  </tbody></table></div></div>`);
}

function vPeople() {
  const rows = S.people.filter(p => match(p, VIEW.q)).sort((a, b) => a.name.localeCompare(b.name));
  return shell('people', L().people, `<div class="card">${listToolbar('Search by name, phone…', '+ Add ' + L().person.toLowerCase())}
  <div class="table-wrap"><table><thead><tr><th>Name</th><th class="hide-m">${esc(L().guardian)}</th><th>${S.type === 'institute' ? 'Course' : 'Last visit'}</th>${S.type === 'institute' ? '<th class="hide-m">Attendance</th>' : ''}<th class="right">Due</th></tr></thead><tbody>
  ${rows.map(p => { const bks = S.bookings.filter(b => b.personId === p.id); const d = dueFor(p.id); const a = attStats(p.id);
    const second = S.type === 'institute' ? bks.filter(b => b.status === 'Active').map(b => (byId('offerings', b.offeringId) || {}).name).join(', ') : (() => { const last = bks.filter(b => b.status === 'Completed').sort((x, y) => y.date.localeCompare(x.date))[0]; return last ? fmtDate(last.date) : '—'; })();
    return `<tr class="click" data-go="#/people/${p.id}"><td><div class="row" style="flex-wrap:nowrap"><div class="avatar" style="background:${colorFor(p.name)}">${esc(initials(p.name))}</div><div><b>${esc(p.name)}</b><div class="small muted">${esc(p.phone)}</div></div></div></td><td class="hide-m small">${esc(p.guardian)}</td><td class="small">${esc(second)}</td>${S.type === 'institute' ? `<td class="hide-m" style="min-width:110px">${a.pct != null ? `<div class="bar"><i style="width:${a.pct}%"></i></div><span class="small muted">${a.pct}%</span>` : '—'}</td>` : ''}<td class="right">${d ? `<b style="color:var(--warn)">${inr(d)}</b>` : statusPill('Paid')}</td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">No matches.</td></tr>'}
  </tbody></table></div></div>`);
}

function vPerson(id) {
  const p = byId('people', id); if (!p) return shell('people', 'Not found', '<div class="card empty">Record not found. <a href="#/people">Back</a></div>');
  const bks = S.bookings.filter(b => b.personId === id).sort((a, b) => (b.date || b.start || '').localeCompare(a.date || a.start || ''));
  const pays = S.payments.filter(x => x.personId === id).sort((a, b) => b.date.localeCompare(a.date));
  const a = attStats(id); const d = dueFor(id);
  const attRows = Object.entries(S.attendance).filter(([, r]) => r[id]).sort((x, y) => y[0].localeCompare(x[0])).slice(0, 20);
  return shell('people', p.name, `
  <div class="grid g4">
    <div class="card kpi"><div class="lbl">Billed</div><div class="val">${inr(chargesFor(id))}</div></div>
    <div class="card kpi"><div class="lbl">Paid</div><div class="val" style="color:var(--ok)">${inr(paidFor(id))}</div></div>
    <div class="card kpi"><div class="lbl">Due</div><div class="val" style="color:${d ? 'var(--warn)' : 'var(--ok)'}">${inr(d)}</div></div>
    <div class="card kpi"><div class="lbl">${S.type === 'institute' ? 'Attendance' : 'Visits'}</div><div class="val">${S.type === 'institute' ? (a.pct != null ? a.pct + '%' : '—') : bks.filter(b => b.status === 'Completed').length}</div><div class="sub">${S.type === 'institute' ? `${a.p} of ${a.t} classes` : 'completed'}</div></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="card-h"><h2>Details</h2><button class="btn sm" id="edit-person">Edit</button></div>
      <table><tr><td class="muted">Phone</td><td><a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></td></tr>${p.email ? `<tr><td class="muted">Email</td><td>${esc(p.email)}</td></tr>` : ''}
      <tr><td class="muted">${esc(L().guardian)}</td><td>${esc(p.guardian)}</td></tr>${p.guardianPhone ? `<tr><td class="muted">${esc(L().guardianPh)}</td><td>${esc(p.guardianPhone)}</td></tr>` : ''}
      <tr><td class="muted">${S.type === 'institute' ? 'Admission' : 'First visit'}</td><td>${fmtDate(p.joined)}</td></tr>${p.notes ? `<tr><td class="muted">Notes</td><td>${esc(p.notes)}</td></tr>` : ''}</table></div>
    <div class="card"><div class="card-h"><h2>${esc(L().bookings)}</h2><button class="btn sm" id="add-bk">+ Add</button></div>
      ${bks.length ? bks.map(b => { const o = byId('offerings', b.offeringId) || {}; return `<div class="list-item" style="cursor:pointer" data-edit-bk="${b.id}"><div style="flex:1"><b>${esc(o.name)}</b><div class="small muted">${S.type === 'institute' ? 'From ' + fmtDate(b.start) : fmtDate(b.date) + ' · ' + fmtTime(b.time) + ' · ' + esc((byId('staff', b.staffId) || {}).name || '')}</div>${b.notes ? `<div class="small">📝 ${esc(b.notes)}</div>` : ''}</div><div class="right"><div>${inr(b.fee)}</div>${statusPill(b.status)}</div></div>`; }).join('') : '<div class="empty">None yet.</div>'}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h2>Payments</h2><button class="btn sm primary" data-pay="${id}" data-amt="${d}">+ Record payment</button></div>
    ${pays.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Receipt</th><th>Mode</th><th class="hide-m">Note</th><th class="right">Amount</th><th></th></tr></thead><tbody>${pays.map(x => `<tr><td class="nowrap">${fmtDate(x.date)}</td><td>${esc(x.receiptNo)}</td><td>${esc(x.mode)}</td><td class="hide-m small">${esc(x.note)}</td><td class="right"><b>${inr(x.amount)}</b></td><td class="right"><button class="btn sm" data-receipt="${x.id}">Receipt</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No payments yet.</div>'}</div>
  ${S.type === 'institute' ? `<div class="card" style="margin-top:16px"><div class="card-h"><h2>Recent attendance</h2></div>${attRows.length ? `<div class="row">${attRows.map(([k, r]) => { const [dt, oid] = k.split('|'); return `<span class="pill ${r[id] === 'P' ? 'ok' : 'bad'}" title="${esc((byId('offerings', oid) || {}).name || '')}">${fmtDate(dt).replace(/ \d{4}$/, '')} · ${r[id] === 'P' ? 'Present' : 'Absent'}</span>`; }).join('')}</div>` : '<div class="empty">No attendance marked yet.</div>'}</div>` : ''}
  <div class="row" style="margin-top:16px"><a class="btn" href="#/people">← All ${esc(L().people.toLowerCase())}</a></div>`);
}

function vBookings() {
  const st = VIEW.f || 'All';
  let rows = S.bookings.filter(b => (st === 'All' || b.status === st) && match({ b, p: byId('people', b.personId), o: byId('offerings', b.offeringId) }, VIEW.q));
  rows.sort((a, b) => S.type === 'clinic' ? (b.date + b.time).localeCompare(a.date + a.time) : (b.start || '').localeCompare(a.start || ''));
  const statuses = S.type === 'institute' ? ['All', 'Active', 'Completed', 'Dropped'] : ['All', 'Booked', 'Completed', 'Cancelled', 'No-show'];
  return shell('bookings', L().bookings, `<div class="card">${listToolbar('Search…', S.type === 'institute' ? '+ New enrolment' : '+ Book appointment', `<select id="filt" style="width:auto">${statuses.map(s => `<option ${s === st ? 'selected' : ''}>${s}</option>`).join('')}</select>`)}
  <div class="table-wrap"><table><thead><tr>${S.type === 'clinic' ? '<th>When</th>' : '<th>Start</th>'}<th>${esc(L().person)}</th><th>${esc(L().offering)}</th>${S.type === 'clinic' ? '<th class="hide-m">Doctor</th>' : ''}<th class="right">Fee</th><th>Status</th><th></th></tr></thead><tbody>
  ${rows.map(b => { const p = byId('people', b.personId) || {}; const o = byId('offerings', b.offeringId) || {};
    return `<tr><td class="nowrap">${S.type === 'clinic' ? `${fmtDate(b.date)}<div class="small muted">${fmtTime(b.time)}</div>` : fmtDate(b.start)}</td><td><a href="#/people/${p.id}"><b>${esc(p.name)}</b></a></td><td class="small">${esc(o.name)}</td>${S.type === 'clinic' ? `<td class="hide-m small">${esc((byId('staff', b.staffId) || {}).name || '')}</td>` : ''}<td class="right">${inr(b.fee)}</td><td>${statusPill(b.status)}</td><td class="right nowrap">${S.type === 'clinic' && b.status === 'Booked' ? `<button class="btn sm" data-complete="${b.id}">Done</button> ` : ''}<button class="btn sm" data-edit-bk="${b.id}">Edit</button></td></tr>`; }).join('') || '<tr><td colspan="7" class="empty">Nothing here.</td></tr>'}
  </tbody></table></div></div>`);
}

function vAttendance() {
  const oid = VIEW.o || (todaySchedule()[0] || {}).id || (S.offerings[0] || {}).id;
  const date = VIEW.d || today();
  const key = date + '|' + oid;
  const rec = S.attendance[key] || {};
  const studs = S.bookings.filter(b => b.offeringId === oid && b.status === 'Active').map(b => byId('people', b.personId)).filter(Boolean);
  const o = byId('offerings', oid) || {};
  const wd = DAYS[new Date(date + 'T00:00').getDay()];
  const scheduled = (o.days || '').split(',').includes(wd);
  const p = studs.filter(s => (rec[s.id] || 'P') === 'P').length;
  return shell('attendance', 'Attendance', `<div class="card">
  <div class="row" style="margin-bottom:14px"><label style="flex:2;min-width:200px"><span class="small muted">Batch</span><select id="att-o">${S.offerings.map(x => `<option value="${x.id}" ${x.id === oid ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
  <label style="flex:1;min-width:150px"><span class="small muted">Date</span><input type="date" id="att-d" value="${date}" max="${today()}"></label></div>
  ${!scheduled ? `<div class="pill warn" style="margin-bottom:10px">No class scheduled for this batch on ${wd} — you can still mark an extra class.</div>` : ''}
  <div class="row" style="margin-bottom:8px"><b>${esc(o.name || '')}</b><span class="muted small">${fmtTime(o.start)} – ${fmtTime(o.end)}</span><span class="spacer"></span><span class="small">${S.attendance[key] ? statusPill('Marked') : statusPill('Pending')}</span><button class="btn sm" id="all-p">All present</button></div>
  ${studs.length ? studs.map(s => { const v = rec[s.id] || 'P'; return `<div class="att-row"><div class="avatar" style="background:${colorFor(s.name)}">${esc(initials(s.name))}</div><div style="flex:1"><b>${esc(s.name)}</b><div class="small muted">${attStats(s.id).pct ?? '—'}% overall</div></div><div class="toggle" data-stu="${s.id}"><button type="button" class="p ${v === 'P' ? 'on' : ''}" data-v="P">P</button><button type="button" class="a ${v === 'A' ? 'on' : ''}" data-v="A">A</button></div></div>`; }).join('') : '<div class="empty">No active students in this batch.</div>'}
  ${studs.length ? `<div class="row" style="margin-top:14px"><span class="muted small" id="att-count">${p} present · ${studs.length - p} absent</span><span class="spacer"></span><button class="btn primary" id="att-save">Save attendance</button></div>` : ''}
  </div>`);
}

function vPayments() {
  const rows = S.payments.filter(x => match({ x, p: byId('people', x.personId) }, VIEW.q)).sort((a, b) => b.date.localeCompare(a.date) || b.receiptNo.localeCompare(a.receiptNo));
  const ym = addDays(-29);
  const totalDue = sum(S.people, p => dueFor(p.id));
  const byMode = {}; S.payments.filter(p => p.date >= ym).forEach(p => byMode[p.mode] = (byMode[p.mode] || 0) + p.amount);
  return shell('payments', 'Fees & payments', `
  <div class="grid g3"><div class="card kpi"><div class="lbl">Collected (last 30 days)</div><div class="val" style="color:var(--ok)">${inr(sum(S.payments.filter(p => p.date >= ym), p => p.amount))}</div><div class="sub">${Object.entries(byMode).map(([m, v]) => `${esc(m)} ${inr(v)}`).join(' · ') || '—'}</div></div>
  <div class="card kpi"><div class="lbl">Total collected</div><div class="val">${inr(sum(S.payments, p => p.amount))}</div><div class="sub">${S.payments.length} receipts</div></div>
  <div class="card kpi"><div class="lbl">Outstanding</div><div class="val" style="color:var(--warn)">${inr(totalDue)}</div><div class="sub"><a href="#/dashboard">See who owes</a></div></div></div>
  <div class="card" style="margin-top:16px">${listToolbar('Search by name, receipt no…', '+ Record payment', `<button class="btn" id="csv">⬇ Export CSV</button>`)}
  <div class="table-wrap"><table><thead><tr><th>Date</th><th>Receipt</th><th>${esc(L().person)}</th><th>Mode</th><th class="right">Amount</th><th></th></tr></thead><tbody>
  ${rows.map(x => { const p = byId('people', x.personId) || {}; return `<tr><td class="nowrap">${fmtDate(x.date)}</td><td>${esc(x.receiptNo)}</td><td><a href="#/people/${p.id}">${esc(p.name)}</a>${x.note ? `<div class="small muted">${esc(x.note)}</div>` : ''}</td><td>${esc(x.mode)}</td><td class="right"><b>${inr(x.amount)}</b></td><td class="right nowrap"><button class="btn sm" data-receipt="${x.id}">Receipt</button> <button class="btn sm danger" data-del-pay="${x.id}" aria-label="Delete">✕</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="empty">No payments.</td></tr>'}
  </tbody></table></div></div>`);
}

const PALETTE = ['#1f3a5f', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#1d4ed8', '#15803d', '#111827'];
function vWebsite() {
  const st = S.settings;
  return shell('website', 'Website editor', `<div class="editor">
  <div>
    <div class="card"><div class="card-h"><h2>Brand & homepage</h2></div>
      <form id="site-form">
        <label class="f"><span>${S.type === 'institute' ? 'Institute' : 'Clinic'} name</span><input type="text" name="name" value="${esc(st.name)}" required></label>
        <label class="f"><span>Tagline</span><input type="text" name="tagline" value="${esc(st.tagline)}"></label>
        <span class="small muted">Brand colour</span><div class="swatches" style="margin-top:4px">${PALETTE.map(c => `<button type="button" data-color="${c}" class="${c === st.color ? 'on' : ''}" style="background:${c}" aria-label="${c}"></button>`).join('')}<input type="color" name="color" value="${esc(st.color)}" style="width:34px;height:30px;padding:0;border:0;background:none" aria-label="Custom colour"></div>
        <label class="f"><span>Headline</span><input type="text" name="heroTitle" value="${esc(st.heroTitle)}"></label>
        <label class="f"><span>Sub-heading</span><textarea name="heroSub" style="min-height:70px">${esc(st.heroSub)}</textarea></label>
        <label class="f"><span>Highlights (separate with |)</span><input type="text" name="stats" value="${esc(st.stats)}"></label>
        <label class="f"><span>About (homepage)</span><textarea name="about">${esc(st.about)}</textarea></label>
        <div class="form-grid"><label class="f"><span>Phone</span><input type="text" name="phone" value="${esc(st.phone)}"></label><label class="f"><span>WhatsApp (optional)</span><input type="text" name="whatsapp" value="${esc(st.whatsapp || '')}" placeholder="91XXXXXXXXXX"></label></div>
        <label class="f"><span>Email</span><input type="text" name="email" value="${esc(st.email)}"></label>
        <label class="f"><span>Timings</span><input type="text" name="hours" value="${esc(st.hours)}"></label>
        <label class="f"><span>Address</span><input type="text" name="address" value="${esc(st.address)}"></label>
        <button class="btn primary" type="submit">Save & update preview</button>
      </form></div>
    <div class="card"><div class="card-h"><h2>Website content</h2></div><div class="mini-list">
      ${[['offerings', L().offerings, S.offerings.filter(o => o.active).length + ' shown'], ['staff', L().staff, S.staff.length + ' profiles'], ['gallery', 'Gallery', S.gallery.length + ' photos'], ['announcements', 'Announcements', S.announcements.length + ' posts'], ['pages', 'Pages', S.pages.filter(p => p.show).length + ' in menu'], ['enquiries', 'Enquiry form inbox', S.enquiries.filter(e => e.status === 'New').length + ' new']].map(([r, t, n]) => `<a class="mi" href="#/${r}" style="text-decoration:none;color:inherit"><b style="flex:1">${esc(t)}</b><span class="small muted">${esc(n)}</span><span>›</span></a>`).join('')}
    </div></div>
  </div>
  <div class="preview-frame" id="pf"><div class="preview-bar"><span class="dots"><i></i><i></i><i></i></span><span style="flex:1">Live preview</span><div class="toggle"><button type="button" class="on p" id="pv-d">Desktop</button><button type="button" id="pv-m">Mobile</button></div><a class="btn sm" href="#/site" target="_blank" rel="noopener">Open ↗</a></div>
  <div class="pv-wrap"><iframe id="preview" title="Website preview" src="#/site?embed=1"></iframe></div></div>
  </div>`);
}

function vSettings() {
  return shell('settings', 'Settings & backup', `<div class="grid g2">
  <div class="card"><h2>Business type</h2><p class="muted small">Switch between the coaching-institute and clinic versions. Each keeps its own data.</p>
    <div class="row"><button class="btn ${S.type === 'institute' ? 'primary' : ''}" data-type="institute">🎓 Coaching institute / academy</button><button class="btn ${S.type === 'clinic' ? 'primary' : ''}" data-type="clinic">🩺 Clinic</button></div></div>
  <div class="card"><h2>Receipts</h2><form id="rc-form"><label class="f"><span>Receipt footer text</span><textarea name="receiptFooter" style="min-height:60px">${esc(S.settings.receiptFooter || '')}</textarea></label><label class="f"><span>Next receipt number</span><input type="number" name="receiptSeq" value="${S.receiptSeq}" min="1"></label><button class="btn primary">Save</button></form></div>
  <div class="card"><h2>Backup</h2><p class="muted small">Download all data as a file, or restore from a backup. Use this to move data to another computer.</p>
    <div class="row"><button class="btn" id="exp">⬇ Download backup</button><label class="btn">⬆ Restore backup<input type="file" id="imp" accept="application/json" hidden></label></div></div>
  <div class="card"><h2>Reset demo</h2><p class="muted small">Clear your changes and reload the sample data.</p><button class="btn danger" id="reset">Reset ${esc(L().kind.toLowerCase())} demo data</button></div>
  </div>`);
}

/* ---------------- public website ---------------- */
function siteHTML(sub, embed) {
  const st = S.settings; const lb = L();
  const pinned = S.announcements.filter(a => a.pinned).sort((a, b) => b.date.localeCompare(a.date))[0];
  const menuPages = S.pages.filter(p => p.show);
  const base = embed ? '#/site?embed=1' : '#/site';
  const pageLink = slug => embed ? `#/site/page/${slug}?embed=1` : `#/site/page/${slug}`;
  const anchor = id => `${base}${embed ? '&' : '?'}s=${id}`;
  const stats = (st.stats || '').split('|').map(s => s.trim()).filter(Boolean).map(s => { const m = s.match(/^(\d\S*)\s+(.*)$/); return m ? `<div><b>${esc(m[1])}</b><span>${esc(m[2])}</span></div>` : `<div><b style="font-size:1.1rem;padding-top:.3rem">${esc(s)}</b></div>`; }).join('');
  const header = `${embed ? '' : `<div class="site-demo-bar">Demo website built with Institute CMS · <a href="#/dashboard">Open the admin panel</a> · by <a href="https://r69shabh.me" target="_blank" rel="noopener">Rishabh Gusain</a></div>`}
  ${pinned ? `<div class="ann"><div class="wrap"><span>📣</span><span><b>${esc(pinned.title)}</b> — ${esc(pinned.body)}</span></div></div>` : ''}
  <header><div class="wrap hdr"><a class="nm" href="${base}"><span class="logo">${esc(initials(st.name))}</span>${esc(st.name)}</a>
  <button class="menu-t" id="site-menu" aria-label="Menu">☰</button>
  <nav class="links" id="site-links"><a href="${anchor('offerings')}">${esc(lb.offerings)}</a><a href="${anchor('staff')}">${esc(lb.staff)}</a><a href="${anchor('gallery')}">Gallery</a>${menuPages.map(p => `<a href="${pageLink(p.slug)}">${esc(p.title)}</a>`).join('')}<a class="cta" href="${anchor('contact')}">${S.type === 'institute' ? 'Enquire now' : 'Book a visit'}</a></nav></div></header>`;
  const footer = `<footer><div class="wrap row"><div style="flex:1;min-width:220px"><b style="color:#fff">${esc(st.name)}</b><br>${esc(st.address)}<br><a href="tel:${esc(st.phone)}">${esc(st.phone)}</a> · <a href="mailto:${esc(st.email)}">${esc(st.email)}</a></div><div class="small">© ${new Date().getFullYear()} ${esc(st.name)}</div></div></footer>`;
  if (sub && sub.page) {
    const pg = S.pages.find(p => p.slug === sub.page);
    return `<div class="site" style="--c:${esc(st.color)}">${header}<section><div class="wrap">${pg ? `<div class="sh"><h2>${esc(pg.title)}</h2></div><div class="page-body">${esc(pg.body)}</div>` : '<h2>Page not found</h2>'}<p style="margin-top:28px"><a href="${base}">← Back to home</a></p></div></section>${footer}</div>`;
  }
  const off = S.offerings.filter(o => o.active);
  const notices = [...S.announcements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const wa = (st.whatsapp || '').replace(/\D/g, '');
  return `<div class="site" style="--c:${esc(st.color)}">${header}
  <div class="hero"><div class="wrap"><div class="pill info" style="margin-bottom:14px">${esc(st.tagline)}</div><h1>${esc(st.heroTitle)}</h1><p>${esc(st.heroSub)}</p>
    <div class="row"><a class="cta" href="${anchor('contact')}">${S.type === 'institute' ? 'Book a free demo class' : 'Book an appointment'}</a><a class="btn" href="tel:${esc(st.phone)}">📞 ${esc(st.phone)}</a></div>
    ${stats ? `<div class="stats">${stats}</div>` : ''}</div></div>
  <section id="s-offerings"><div class="wrap"><div class="sh"><h2>${S.type === 'institute' ? 'Courses & batches' : 'Our services'}</h2><p>${S.type === 'institute' ? 'Pick a batch that fits your schedule. Fees can be paid in instalments.' : 'Transparent fees. Walk-ins welcome, appointments preferred.'}</p></div>
    <div class="cards">${off.map(o => `<div class="oc"><h3>${esc(o.name)}</h3><div class="meta">${S.type === 'institute' ? `${esc((o.days || '').replace(/,/g, ' · '))} · ${fmtTime(o.start)}–${fmtTime(o.end)}` : esc(o.duration)}${o.duration && S.type === 'institute' ? ` · ${esc(o.duration)}` : ''}</div><p style="margin:0;color:#475467">${esc(o.desc)}</p><div class="fee">${inr(o.fee)}</div><a href="${anchor('contact')}&i=${encodeURIComponent(o.name)}" style="font-weight:600">${S.type === 'institute' ? 'Enquire about this batch' : 'Book this'} →</a></div>`).join('')}</div></div></section>
  <section class="alt"><div class="wrap grid g2"><div><div class="sh"><h2>About us</h2></div><p style="color:#475467;white-space:pre-wrap">${esc(st.about)}</p>${menuPages[0] ? `<a href="${pageLink(menuPages[0].slug)}" style="font-weight:600">Read more →</a>` : ''}</div>
    <div><div class="sh"><h2>Notice board</h2></div>${notices.map(n => `<div class="notice"><div class="d">${fmtDate(n.date)}</div><b>${esc(n.title)}</b><div style="color:#475467;font-size:.95rem">${esc(n.body)}</div></div>`).join('') || '<p class="muted">No notices.</p>'}</div></div></section>
  <section id="s-staff"><div class="wrap"><div class="sh"><h2>${S.type === 'institute' ? 'Meet our faculty' : 'Our doctors'}</h2></div><div class="cards">${S.staff.map(s => `<div class="oc fac"><div class="avatar">${esc(initials(s.name))}</div><h3>${esc(s.name)}</h3><div class="meta">${esc(s.role)}</div><p style="margin:0;color:#475467;font-size:.94rem">${esc(s.bio)}</p></div>`).join('')}</div></div></section>
  <section id="s-gallery" class="alt"><div class="wrap"><div class="sh"><h2>Gallery</h2></div><div class="gal">${S.gallery.map(g => `<figure>${galTile(g)}${g.url ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}</div></div></section>
  <section id="s-contact"><div class="wrap contact"><div class="info"><div class="sh"><h2>Visit or contact us</h2><p>We usually reply within a few hours.</p></div>
    <p>📍 ${esc(st.address)}</p><p>📞 <a href="tel:${esc(st.phone)}">${esc(st.phone)}</a></p><p>✉️ <a href="mailto:${esc(st.email)}">${esc(st.email)}</a></p><p>🕘 ${esc(st.hours)}</p>${wa ? `<p><a class="cta" href="https://wa.me/${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></p>` : ''}</div>
    <form id="enq-form"><h3 style="margin-bottom:12px">${S.type === 'institute' ? 'Admission enquiry' : 'Request an appointment'}</h3>
      <label class="f"><span>Your name</span><input type="text" name="name" required autocomplete="name"></label>
      <div class="form-grid"><label class="f"><span>Phone</span><input type="tel" name="phone" required pattern="[0-9+ -]{8,15}" autocomplete="tel"></label><label class="f"><span>Email (optional)</span><input type="email" name="email" autocomplete="email"></label></div>
      <label class="f"><span>Interested in</span><select name="interest"><option>General</option>${off.map(o => `<option ${sub && sub.i === o.name ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label>
      <label class="f"><span>Message</span><textarea name="message" style="min-height:70px" placeholder="${S.type === 'institute' ? 'Class, preferred batch timing…' : 'Preferred date/time, symptoms…'}"></textarea></label>
      <button class="cta" type="submit" style="width:100%">Send</button><p class="small muted" id="enq-ok" style="margin:10px 0 0"></p></form></div></section>
  ${footer}</div>`;
}

/* ---------------- router & binding ---------------- */
let VIEW = {};
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/dashboard';
  const [path, qs] = h.split('?');
  const q = {}; (qs || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return { parts: path.split('/').filter(Boolean), q };
}
let lastRoute = '';
function render() {
  load();
  const { parts, q } = parseHash();
  const route = parts[0] || 'dashboard';
  if (route !== lastRoute) { VIEW = {}; lastRoute = route; }
  Object.assign(VIEW, q);
  const app = $('#app');
  document.body.classList.toggle('is-site', route === 'site');
  if (route === 'site') {
    const embed = q.embed === '1';
    app.innerHTML = siteHTML({ page: parts[1] === 'page' ? parts[2] : null, i: q.i }, embed);
    document.title = S.settings.name + (S.settings.tagline ? ' — ' + S.settings.tagline : '');
    bindSite(q);
    return;
  }
  document.title = S.settings.name + ' · Admin';
  const views = { dashboard: vDashboard, enquiries: vEnquiries, website: vWebsite, offerings: vOfferings, staff: vStaff, gallery: vGallery, announcements: vAnnouncements,
    pages: vPages, people: () => parts[1] ? vPerson(parts[1]) : vPeople(), bookings: vBookings, attendance: S.type === 'institute' ? vAttendance : vBookings, payments: vPayments, settings: vSettings };
  const scrollY = window.scrollY; const focusId = document.activeElement && document.activeElement.id; const caret = focusId === 'q' ? document.activeElement.selectionStart : null;
  app.innerHTML = (views[route] || vDashboard)();
  bindAdmin(route, parts);
  if (focusId === 'q' && $('#q')) { const el = $('#q'); el.focus(); try { el.setSelectionRange(caret, caret); } catch (e) {} window.scrollTo(0, scrollY); }
}

function bindSite(q) {
  const m = $('#site-menu'); if (m) m.onclick = () => $('#site-links').classList.toggle('open');
  if (q.s) { const el = document.getElementById('s-' + q.s); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }
  const f = $('#enq-form');
  if (f) f.onsubmit = e => {
    e.preventDefault(); const d = formData(f);
    load(); S.enquiries.unshift(Object.assign({ id: uid(), date: today(), status: 'New' }, d)); save();
    f.reset(); $('#enq-ok').textContent = '✅ Thank you! We have received your enquiry and will call you back soon.';
    try { if (window.parent !== window) window.parent.postMessage('icms:enquiry', '*'); } catch (err) {}
  };
}

function bindAdmin(route, parts) {
  const side = $('#side'); const mb = $('#menu'); if (mb) mb.onclick = () => side.classList.toggle('open');
  $$('.side a.nav').forEach(a => a.addEventListener('click', () => side.classList.remove('open')));
  const q = $('#q'); if (q) q.oninput = () => { VIEW.q = q.value; render(); };
  const filt = $('#filt'); if (filt) filt.onchange = () => { VIEW.f = filt.value; render(); };
  $$('[data-go]').forEach(el => el.addEventListener('click', e => { if (e.target.closest('button,a,select')) return; location.hash = el.dataset.go; }));
  $$('[data-pay]').forEach(b => b.onclick = e => { e.stopPropagation(); recordPayment({ personId: b.dataset.pay, amount: Number(b.dataset.amt) || '' }); });
  $$('[data-receipt]').forEach(b => b.onclick = () => showReceipt(b.dataset.receipt));
  $$('[data-complete]').forEach(b => b.onclick = () => completeAppt(b.dataset.complete));
  $$('[data-edit-bk]').forEach(el => el.onclick = () => editBooking(byId('bookings', el.dataset.editBk)));
  const add = $('#add');
  const addMap = {
    enquiries: () => editRecord('enquiries', F.enquiry(), null, 'Enquiry'), offerings: () => editRecord('offerings', F.offering(), null, L().offering),
    staff: () => editRecord('staff', F.staff(), null, L().staffOne), gallery: () => editRecord('gallery', F.gallery(), null, 'Photo'),
    announcements: () => editRecord('announcements', F.announcement(), null, 'Announcement'), pages: () => editRecord('pages', F.page(), null, 'Page'),
    people: () => editRecord('people', F.person(), null, L().person), bookings: () => editBooking(null), payments: () => recordPayment()
  };
  if (add && addMap[route]) add.onclick = addMap[route];
  const rp = $('#rec-pay'); if (rp) rp.onclick = () => recordPayment();
  const na = $('#new-appt'); if (na) na.onclick = () => editBooking(null);

  $$('[data-enq-status]').forEach(s => s.onchange = () => { byId('enquiries', s.dataset.enqStatus).status = s.value; save(); toast('Status updated'); render(); });
  $$('[data-edit-enq]').forEach(b => b.onclick = () => editRecord('enquiries', F.enquiry(), byId('enquiries', b.dataset.editEnq), 'Enquiry'));
  $$('[data-convert]').forEach(b => b.onclick = () => {
    const e = byId('enquiries', b.dataset.convert);
    modal('Add ' + L().person.toLowerCase() + ' from enquiry', formHTML(F.person(), { name: e.name, phone: e.phone, email: e.email, joined: today(), notes: e.message }), {
      saveLabel: 'Create ' + L().person.toLowerCase(),
      onSave: d => { const p = Object.assign({ id: uid() }, d); S.people.unshift(p); e.status = 'Converted';
        const o = S.offerings.find(x => x.name === e.interest);
        if (o && S.type === 'institute') S.bookings.unshift({ id: uid(), personId: p.id, offeringId: o.id, fee: o.fee, start: today(), status: 'Active' });
        save(); toast(L().person + ' created'); location.hash = '#/people/' + p.id; return true; }
    });
  });
  $$('[data-edit-off]').forEach(el => el.onclick = () => editRecord('offerings', F.offering(), byId('offerings', el.dataset.editOff), L().offering));
  $$('[data-edit-staff]').forEach(el => el.onclick = () => editRecord('staff', F.staff(), byId('staff', el.dataset.editStaff), L().staffOne));
  $$('[data-edit-gal]').forEach(el => el.onclick = () => editRecord('gallery', F.gallery(), byId('gallery', el.dataset.editGal), 'Photo'));
  $$('[data-edit-ann]').forEach(el => el.onclick = () => editRecord('announcements', F.announcement(), byId('announcements', el.dataset.editAnn), 'Announcement'));
  $$('[data-edit-page]').forEach(el => el.onclick = () => editRecord('pages', F.page(), byId('pages', el.dataset.editPage), 'Page'));
  $$('[data-del-pay]').forEach(b => b.onclick = () => { if (confirm('Delete this payment record?')) { S.payments = S.payments.filter(x => x.id !== b.dataset.delPay); save(); toast('Payment deleted'); render(); } });

  if (route === 'people' && parts[1]) {
    const p = byId('people', parts[1]);
    const ep = $('#edit-person'); if (ep) ep.onclick = () => editRecord('people', F.person(), p, L().person, () => { if (!byId('people', parts[1])) location.hash = '#/people'; else render(); });
    const ab = $('#add-bk'); if (ab) ab.onclick = () => editBooking(null, { personId: p.id });
  }
  if (route === 'attendance' && S.type === 'institute') bindAttendance();
  if (route === 'website') bindWebsite();
  if (route === 'payments') { const c = $('#csv'); if (c) c.onclick = exportCSV; }
  if (route === 'settings') bindSettings();
}

function editBooking(b, prefill = {}) {
  const isNew = !b;
  const fields = F.booking();
  modal((isNew ? (S.type === 'institute' ? 'New enrolment' : 'Book appointment') : 'Edit ' + L().booking.toLowerCase()), formHTML(fields, b || prefill), {
    extraBtns: isNew ? '' : `<button type="button" class="btn danger" id="del-bk">Delete</button>`,
    onSave: d => {
      const o = byId('offerings', d.offeringId); if (d.fee === '' && o) d.fee = o.fee;
      if (S.type === 'clinic' && d.status === 'Booked') {
        const clash = S.bookings.find(x => x !== b && x.staffId === d.staffId && x.date === d.date && x.time === d.time && x.status === 'Booked');
        if (clash && !confirm('This doctor already has an appointment at that time. Book anyway?')) return false;
      }
      if (isNew) S.bookings.unshift(Object.assign({ id: uid() }, d)); else Object.assign(b, d);
      save(); toast(L().booking + ' saved'); render(); return true;
    }
  });
  const sel = $('#modal-root select[name=offeringId]'); const fee = $('#modal-root input[name=fee]');
  if (sel && fee) { const sync = () => { const o = byId('offerings', sel.value); if (o && (isNew || fee.value === '')) fee.value = o.fee; }; sel.onchange = sync; if (isNew) sync(); }
  const db = $('#del-bk'); if (db) db.onclick = () => { if (confirm('Delete?')) { S.bookings = S.bookings.filter(x => x !== b); save(); $('#modal-root').innerHTML = ''; render(); } };
}

function completeAppt(id) {
  const b = byId('bookings', id); const p = byId('people', b.personId) || {};
  modal('Complete visit — ' + p.name, `<label class="f"><span>Visit notes / prescription</span><textarea name="notes">${esc(b.notes || '')}</textarea></label><label class="f"><span>Charge (₹)</span><input type="number" name="fee" value="${b.fee}" min="0"></label><label class="chk"><input type="checkbox" name="paid" checked> Payment received now</label><label class="f"><span>Payment mode</span><select name="mode"><option>UPI</option><option>Cash</option><option>Card</option></select></label>`, {
    saveLabel: 'Mark completed',
    onSave: d => { b.notes = d.notes; b.fee = d.fee; b.status = 'Completed';
      let pid = null;
      if (d.paid && d.fee > 0) { const pay = { id: uid(), personId: b.personId, bookingId: b.id, amount: d.fee, date: today(), mode: d.mode, receiptNo: 'R-' + (S.receiptSeq++), note: (byId('offerings', b.offeringId) || {}).name || '' }; S.payments.unshift(pay); pid = pay.id; }
      save(); render(); toast('Visit completed'); if (pid) setTimeout(() => showReceipt(pid), 20); return true; }
  });
}

function bindAttendance() {
  const o = $('#att-o'), d = $('#att-d');
  const go = () => { location.hash = `#/attendance?o=${o.value}&d=${d.value || today()}`; };
  if (o) o.onchange = go; if (d) d.onchange = go;
  const count = () => { const all = $$('.toggle[data-stu]'); const p = all.filter(t => $('.on', t) && $('.on', t).dataset.v === 'P').length; const c = $('#att-count'); if (c) c.textContent = `${p} present · ${all.length - p} absent`; };
  $$('.toggle[data-stu] button').forEach(btn => btn.onclick = () => { $$('button', btn.parentNode).forEach(x => x.classList.remove('on')); btn.classList.add('on'); count(); });
  const ap = $('#all-p'); if (ap) ap.onclick = () => { $$('.toggle[data-stu]').forEach(t => { $$('button', t).forEach(x => x.classList.toggle('on', x.dataset.v === 'P')); }); count(); };
  const sv = $('#att-save'); if (sv) sv.onclick = () => {
    const rec = {}; $$('.toggle[data-stu]').forEach(t => { rec[t.dataset.stu] = ($('.on', t) || {}).dataset ? $('.on', t).dataset.v : 'P'; });
    S.attendance[(VIEW.d || today()) + '|' + o.value] = rec; save(); toast('Attendance saved'); render();
  };
}

function bindWebsite() {
  const f = $('#site-form'); const fr = $('#preview');
  const colorIn = $('input[name=color]', f);
  $$('[data-color]', f).forEach(b => b.onclick = () => { colorIn.value = b.dataset.color; $$('[data-color]', f).forEach(x => x.classList.toggle('on', x === b)); });
  f.onsubmit = e => { e.preventDefault(); Object.assign(S.settings, formData(f)); save(); toast('Website updated'); render(); };
  const pf = $('#pf');
  const fit = () => { if (pf.classList.contains('mobile')) { fr.style.transform = ''; fr.style.height = ''; return; } const sc = Math.min(1, pf.clientWidth / 1280); fr.style.transform = `scale(${sc})`; fr.style.height = (fr.parentNode.clientHeight / sc) + 'px'; };
  fit(); window.onresize = fit;
  $('#pv-d').onclick = () => { pf.classList.remove('mobile'); fit(); $('#pv-d').classList.add('on', 'p'); $('#pv-m').classList.remove('on', 'p'); };
  $('#pv-m').onclick = () => { pf.classList.add('mobile'); fit(); $('#pv-m').classList.add('on', 'p'); $('#pv-d').classList.remove('on', 'p'); };
  // live typing preview: re-render iframe content on input (debounced) without saving
  let t; f.oninput = () => { clearTimeout(t); t = setTimeout(() => { try { const w = fr.contentWindow; if (w && w.__icmsPreview) w.__icmsPreview(Object.assign({}, S.settings, formData(f))); } catch (err) {} }, 250); };
}
window.__icmsPreview = settings => { if (!location.hash.startsWith('#/site')) return; S.settings = settings; const { parts, q } = parseHash(); $('#app').innerHTML = siteHTML({ page: parts[1] === 'page' ? parts[2] : null }, q.embed === '1'); bindSite({}); };
window.addEventListener('message', e => { if (e.data === 'icms:enquiry' && lastRoute !== 'site') toast('New enquiry received — see Enquiries'); });

function bindSettings() {
  $$('[data-type]').forEach(b => b.onclick = () => { localStorage.setItem(KEY_TYPE, b.dataset.type); load(b.dataset.type); toast('Switched to ' + LABELS[b.dataset.type].kind); location.hash = '#/dashboard'; render(); });
  const rc = $('#rc-form'); rc.onsubmit = e => { e.preventDefault(); const d = formData(rc); S.settings.receiptFooter = d.receiptFooter; S.receiptSeq = d.receiptSeq || S.receiptSeq; save(); toast('Saved'); };
  $('#exp').onclick = () => download(`${S.settings.name.replace(/\W+/g, '-').toLowerCase()}-backup-${today()}.json`, JSON.stringify(S, null, 1), 'application/json');
  $('#imp').onchange = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.settings || !d.type) throw 0; localStorage.setItem('icms:data:' + d.type, JSON.stringify(d)); localStorage.setItem(KEY_TYPE, d.type); toast('Backup restored'); render(); } catch (err) { alert('That file is not a valid backup.'); } }; r.readAsText(file); };
  $('#reset').onclick = () => { if (confirm('Reset all ' + L().kind.toLowerCase() + ' data to the demo sample?')) { localStorage.removeItem('icms:data:' + S.type); toast('Demo data restored'); render(); } };
}
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function exportCSV() {
  const rows = [['Date', 'Receipt', L().person, 'Phone', 'Mode', 'Amount (INR)', 'Note']].concat(S.payments.map(x => { const p = byId('people', x.personId) || {}; return [x.date, x.receiptNo, p.name, p.phone, x.mode, x.amount, x.note]; }));
  download('payments-' + today() + '.csv', rows.map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#modal-root').innerHTML = ''; });
window.addEventListener('hashchange', () => { $('#modal-root').innerHTML = ''; render(); if (!location.hash.includes('s=')) window.scrollTo(0, 0); });
window.addEventListener('storage', e => { if (!e.key || !e.key.startsWith('icms:')) return; if (lastRoute === 'website' || $('#modal-root').innerHTML) { load(); return; } render(); });
render();
})();
