import {
  Doctor,
  Appointment,
  Medicine,
  StockLog,
  AnalyticsStats,
  TriageResult,
  User,
  LoginCredentials,
  StudentRegisterData,
  OnlineConsultation,
  ConsultationStatus,
  ChatMessage,
  ConsultationPrescriptionItem,
  AppNotification
} from '../types';

interface StoredUserRecord extends User {
  passwordHash: string;
}

const DEFAULT_USERS: StoredUserRecord[] = [
  {
    id: 'USR-STU-01',
    username: '7376231AD101',
    rollNumber: '7376231AD101',
    name: 'Kavitha M.',
    role: 'student',
    department: 'Artificial Intelligence & Data Science',
    email: 'kavitha.ad23@bitsathy.ac.in',
    phone: '9876543210',
    hostelBlock: 'Thamarai Hostel - Block A (Room 204)',
    gender: 'female',
    bloodGroup: 'B+ve',
    emergencyContact: 'Mr. Muthusamy (Father)',
    emergencyPhone: '9443198765',
    allergies: 'Penicillin, Dust Mites',
    joinedDate: '2023-08-16',
    passwordHash: 'student123'
  },
  {
    id: 'USR-STU-02',
    username: '7376221CS214',
    rollNumber: '7376221CS214',
    name: 'Siddharth R.',
    role: 'student',
    department: 'Computer Science & Engineering',
    email: 'siddharth.cs22@bitsathy.ac.in',
    phone: '9845123789',
    hostelBlock: 'Valavan Hostel - Block B (Room 312)',
    gender: 'male',
    bloodGroup: 'O+ve',
    emergencyContact: 'Mrs. Radhika (Mother)',
    emergencyPhone: '9845199887',
    allergies: 'None reported',
    joinedDate: '2022-08-20',
    passwordHash: 'student123'
  },
  {
    id: 'USR-STU-7865432',
    username: '7865432',
    rollNumber: '7865432',
    name: 'kabi',
    role: 'student',
    department: 'Artificial Intelligence & Data Science',
    email: 'Pixiejust2905@gmail.com',
    phone: '9787322887',
    hostelBlock: 'BIT Student Hostel',
    joinedDate: '2026-10-06',
    passwordHash: 'Pixiejust2905@.'
  },
  {
    id: 'USR-DOC-01',
    username: 'DOC-101',
    name: 'Dr. R. Sathishkumar',
    role: 'doctor',
    department: 'Chief Medical Officer (General Medicine)',
    email: 'drsathish@bitsathy.ac.in',
    phone: '+91 94433 12345',
    roomNo: 'Room 101 (Main Clinic)',
    qualification: 'MBBS, MD (General Medicine)',
    specialization: 'Chief Medical Officer',
    joinedDate: '2018-05-10',
    passwordHash: 'doctor101'
  },
  {
    id: 'USR-DOC-02',
    username: 'DOC-102',
    name: 'Dr. P. Deepa',
    role: 'doctor',
    department: 'Senior Medical Officer (Triage & Pediatrics)',
    email: 'drdeepa@bitsathy.ac.in',
    phone: '+91 94433 67890',
    roomNo: 'Room 102 (Triage & Ops)',
    qualification: 'MBBS, DCH',
    specialization: 'Senior Medical Officer',
    joinedDate: '2020-02-15',
    passwordHash: 'doctor102'
  },
  {
    id: 'USR-DOC-03',
    username: 'DOC-103',
    name: 'Dr. K. Venkatesh',
    role: 'doctor',
    department: 'Dental Specialist (Oral Health)',
    email: 'drvenkatesh@bitsathy.ac.in',
    phone: '+91 94433 11223',
    roomNo: 'Dental Care Suite (Room 105)',
    qualification: 'BDS, MDS (Oral Health)',
    specialization: 'Dental Specialist',
    joinedDate: '2021-07-01',
    passwordHash: 'doctor103'
  },
  {
    id: 'USR-DOC-04',
    username: 'DOC-104',
    name: 'Dr. M. Anitha',
    role: 'doctor',
    department: 'Student Mental Wellness & Counseling',
    email: 'dranitha@bitsathy.ac.in',
    phone: '+91 94433 33445',
    roomNo: 'Wellness Center (Room 108)',
    qualification: 'MD (Psychiatry), Counseling Specialist',
    specialization: 'Student Mental Wellness',
    joinedDate: '2022-01-10',
    passwordHash: 'doctor104'
  },
  {
    id: 'USR-PHARM-01',
    username: 'PHARM-01',
    name: 'S. Ramanathan (Lead Pharmacist)',
    role: 'pharmacist',
    department: 'Health Center Dispensary & Pharmacy',
    email: 'pharmacy@bitsathy.ac.in',
    phone: 'Ext 226012',
    roomNo: 'Main Dispensary Counter',
    qualification: 'B.Pharm, M.Pharm',
    joinedDate: '2019-11-01',
    passwordHash: 'pharm123'
  },
  {
    id: 'USR-ADM-01',
    username: 'ADMIN-01',
    name: 'BIT Health Services Admin',
    role: 'admin',
    department: 'Campus Medical Infrastructure & Governance',
    email: 'healthadmin@bitsathy.ac.in',
    phone: 'Ext 226000',
    roomNo: 'Health Administration Office (Ground Floor)',
    qualification: 'M.Sc Healthcare Admin',
    joinedDate: '2016-01-05',
    passwordHash: 'admin123'
  },
  {
    id: 'USR-ADM-02',
    username: 'sountharyar.ad23@bitsathy.ac.in',
    name: 'Sountharya R. (Administrator)',
    role: 'admin',
    department: 'Campus Medical Infrastructure & Governance',
    email: 'sountharyar.ad23@bitsathy.ac.in',
    phone: 'Ext 226000',
    roomNo: 'Health Administration Office (Ground Floor)',
    joinedDate: '2023-08-16',
    passwordHash: 'admin123'
  }
];

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'DOC-101',
    name: 'Dr. R. Sathishkumar',
    qualification: 'MBBS, MD (General Medicine)',
    specialization: 'Chief Medical Officer',
    roomNo: 'Room 101 (Main Clinic)',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
    currentStatus: 'available',
  },
  {
    id: 'DOC-102',
    name: 'Dr. P. Deepa',
    qualification: 'MBBS, DCH',
    specialization: 'Senior Medical Officer (General & Triage)',
    roomNo: 'Room 102 (Triage & Ops)',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    timeSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    currentStatus: 'available',
  },
  {
    id: 'DOC-103',
    name: 'Dr. K. Venkatesh',
    qualification: 'BDS, MDS (Oral Health)',
    specialization: 'Dental Specialist',
    roomNo: 'Dental Care Suite (Room 105)',
    availableDays: ['Mon', 'Wed', 'Fri'],
    timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
    currentStatus: 'available',
  },
  {
    id: 'DOC-104',
    name: 'Dr. M. Anitha',
    qualification: 'MD (Psychiatry), Counseling Specialist',
    specialization: 'Student Mental Wellness & Counseling',
    roomNo: 'Wellness Center (Room 108)',
    availableDays: ['Tue', 'Thu', 'Sat'],
    timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    currentStatus: 'available',
  }
];

const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: 'MED-101',
    name: 'Paracetamol 650mg (Dolo)',
    genericName: 'Paracetamol',
    category: 'Antipyretics',
    batchNumber: 'BIT-2026-P65',
    expiryDate: '2027-08-31',
    stockQuantity: 420,
    minThreshold: 100,
    unit: 'Tablets',
    locationRack: 'Rack A-01',
    unitPrice: 0,
    lastRestocked: '2026-07-01'
  },
  {
    id: 'MED-102',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotics',
    batchNumber: 'BIT-2026-AMX',
    expiryDate: '2026-11-20',
    stockQuantity: 180,
    minThreshold: 50,
    unit: 'Capsules',
    locationRack: 'Rack B-02',
    unitPrice: 0,
    lastRestocked: '2026-06-15'
  },
  {
    id: 'MED-103',
    name: 'Cetirizine 10mg (Okacet)',
    genericName: 'Cetirizine Hydrochloride',
    category: 'Anti-allergic',
    batchNumber: 'BIT-2026-CET',
    expiryDate: '2027-03-15',
    stockQuantity: 310,
    minThreshold: 80,
    unit: 'Tablets',
    locationRack: 'Rack A-04',
    unitPrice: 0,
    lastRestocked: '2026-06-20'
  },
  {
    id: 'MED-104',
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    category: 'Antibiotics',
    batchNumber: 'BIT-2026-AZI',
    expiryDate: '2026-09-30',
    stockQuantity: 28,
    minThreshold: 50,
    unit: 'Tablets',
    locationRack: 'Rack B-01',
    unitPrice: 0,
    lastRestocked: '2026-05-10'
  },
  {
    id: 'MED-105',
    name: 'ORS Oral Rehydration Sachet',
    genericName: 'Oral Rehydration Salts',
    category: 'Nutritional',
    batchNumber: 'BIT-2026-ORS',
    expiryDate: '2027-12-10',
    stockQuantity: 250,
    minThreshold: 60,
    unit: 'Packets',
    locationRack: 'Rack C-01',
    unitPrice: 0,
    lastRestocked: '2026-07-10'
  },
  {
    id: 'MED-106',
    name: 'Betadine Ointment 5% (20g)',
    genericName: 'Povidone Iodine',
    category: 'Ointments',
    batchNumber: 'BIT-2026-BTD',
    expiryDate: '2027-05-15',
    stockQuantity: 75,
    minThreshold: 25,
    unit: 'Tubes',
    locationRack: 'Rack D-02',
    unitPrice: 0,
    lastRestocked: '2026-04-12'
  }
];

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-1001',
    tokenNumber: 'BIT-HC-001',
    studentName: 'Kavitha M.',
    rollNumber: '7376231AD101',
    department: 'Artificial Intelligence & Data Science',
    gender: 'female',
    phone: '9876543210',
    hostelBlock: 'Thamarai Hostel - Block A',
    doctorId: 'DOC-101',
    doctorName: 'Dr. R. Sathishkumar',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM',
    chiefComplaint: 'High fever (101°F) and severe sore throat for 2 days',
    urgency: 'urgent',
    status: 'completed',
    vitals: {
      bloodPressure: '118/76',
      pulseRate: 88,
      temperature: 101.2,
      weight: 54,
      spo2: 98,
      allergies: 'None reported'
    },
    diagnosis: 'Acute Viral Upper Respiratory Tract Infection',
    doctorNotes: 'Advised 3 days hostel rest, warm saline gargle, and light diet.',
    prescriptions: [
      {
        medicineId: 'MED-101',
        medicineName: 'Paracetamol 650mg (Dolo)',
        dosage: '1-0-1 after food',
        durationDays: 3,
        quantity: 6,
        dispensed: true
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'APT-1002',
    tokenNumber: 'BIT-HC-002',
    studentName: 'Siddharth R.',
    rollNumber: '7376221CS214',
    department: 'Computer Science & Engineering',
    gender: 'male',
    phone: '9845123789',
    hostelBlock: 'Valavan Hostel - Block B',
    doctorId: 'DOC-101',
    doctorName: 'Dr. R. Sathishkumar',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    chiefComplaint: 'Acute stomach cramps and nausea after dinner',
    urgency: 'normal',
    status: 'waiting',
    vitals: {
      bloodPressure: '122/80',
      pulseRate: 80,
      temperature: 98.6,
      weight: 68,
      spo2: 99
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const DEFAULT_LOGS: StockLog[] = [
  {
    id: 'LOG-101',
    medicineId: 'MED-101',
    medicineName: 'Paracetamol 650mg (Dolo)',
    type: 'dispensed',
    quantity: 6,
    previousStock: 426,
    newStock: 420,
    performedBy: 'Pharmacist - Health Center Dispensary',
    referenceId: 'APT-1001',
    notes: 'Dispensed for Kavitha M. (APT-1001)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const nowMs = Date.now();
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  // --- Student Notifications ---
  {
    id: 'NOTIF-STU-01',
    title: 'Appointment Booked Successfully',
    message: 'Your clinic visit token #BIT-HC-001 has been booked with Dr. R. Sathishkumar for today at 09:00 AM.',
    timestamp: new Date(nowMs - 3600000 * 3.5).toISOString(),
    category: 'appointment',
    priority: 'normal',
    targetRole: 'student',
    targetUserId: '7376231AD101',
    read: false,
    linkTab: 'my_tokens',
    actionLabel: 'View Token',
    metadata: { tokenNumber: 'BIT-HC-001' }
  },
  {
    id: 'NOTIF-STU-02',
    title: 'Upcoming Appointment Reminder',
    message: 'Reminder: Scheduled consultation in Room 101 (Main Clinic) today at 09:00 AM. Please arrive 5 minutes early.',
    timestamp: new Date(nowMs - 3600000 * 2.8).toISOString(),
    category: 'appointment',
    priority: 'urgent',
    targetRole: 'student',
    targetUserId: '7376231AD101',
    read: false,
    linkTab: 'my_tokens',
    actionLabel: 'Check Room Info'
  },
  {
    id: 'NOTIF-STU-03',
    title: 'Prescription Ready for Collection',
    message: 'Doctor Dr. R. Sathishkumar prescribed Paracetamol 650mg & Cetirizine 10mg. The dispensary has dispensed your medication; ready at counter.',
    timestamp: new Date(nowMs - 3600000 * 1.8).toISOString(),
    category: 'prescription',
    priority: 'normal',
    targetRole: 'student',
    targetUserId: '7376231AD101',
    read: false,
    linkTab: 'prescriptions',
    actionLabel: 'View Prescription',
    metadata: { refId: 'BIT-HC-001' }
  },
  {
    id: 'NOTIF-STU-04',
    title: 'Doctor Replied to Online Consultation',
    message: 'Dr. R. Sathishkumar has reviewed your cough consultation #BIT-OC-101 and prescribed Cough Syrup (Ascoril D+).',
    timestamp: new Date(nowMs - 3600000 * 0.9).toISOString(),
    category: 'consultation',
    priority: 'normal',
    targetRole: 'student',
    targetUserId: '7376231AD101',
    read: false,
    linkTab: 'consultation',
    actionLabel: 'Open Chat Room'
  },

  // --- Doctor Notifications ---
  {
    id: 'NOTIF-DOC-01',
    title: 'New Patient Waiting in Queue',
    message: 'Patient Siddharth R. (Token #BIT-HC-002) is currently waiting for consultation regarding acute stomach cramps.',
    timestamp: new Date(nowMs - 3600000 * 1.5).toISOString(),
    category: 'appointment',
    priority: 'urgent',
    targetRole: 'doctor',
    targetUserId: 'DOC-101',
    read: false,
    linkTab: 'queue',
    actionLabel: 'Call Patient'
  },
  {
    id: 'NOTIF-DOC-02',
    title: 'New Online Consultation Assigned',
    message: 'Student Kavitha M. submitted Online Consultation request #BIT-OC-101 for dry cough and throat tickle.',
    timestamp: new Date(nowMs - 3600000 * 2.2).toISOString(),
    category: 'consultation',
    priority: 'normal',
    targetRole: 'doctor',
    targetUserId: 'DOC-101',
    read: false,
    linkTab: 'online',
    actionLabel: 'Review Request'
  },
  {
    id: 'NOTIF-DOC-03',
    title: 'Upcoming Appointment Assigned',
    message: 'Praveen Kumar (BIT-HC-004) scheduled for dental / general consult at 11:30 AM.',
    timestamp: new Date(nowMs - 3600000 * 0.5).toISOString(),
    category: 'appointment',
    priority: 'normal',
    targetRole: 'doctor',
    targetUserId: 'DOC-103',
    read: false,
    linkTab: 'queue',
    actionLabel: 'View Schedule'
  },

  // --- Pharmacy Notifications ---
  {
    id: 'NOTIF-PHARM-01',
    title: 'Critical Low-Stock Medicine Alert',
    message: 'Azithromycin 500mg (Batch BIT-2026-AZI) has only 28 units left on Rack B-01 (Minimum threshold is 50). Reorder recommended.',
    timestamp: new Date(nowMs - 3600000 * 4).toISOString(),
    category: 'inventory',
    priority: 'critical',
    targetRole: 'pharmacist',
    read: false,
    linkTab: 'inventory',
    actionLabel: 'View Rack B-01',
    metadata: { medicineId: 'MED-104' }
  },
  {
    id: 'NOTIF-PHARM-02',
    title: 'Near-Expiry Medicine Warning',
    message: 'Ibuprofen 400mg (Batch BIT-2026-IBU) expires in under 60 days on 2026-08-25. 14 units remaining on Rack A-02.',
    timestamp: new Date(nowMs - 3600000 * 3).toISOString(),
    category: 'inventory',
    priority: 'urgent',
    targetRole: 'pharmacist',
    read: false,
    linkTab: 'inventory',
    actionLabel: 'Inspect Batch',
    metadata: { medicineId: 'MED-106' }
  },
  {
    id: 'NOTIF-PHARM-03',
    title: 'New Doctor Prescription for Dispensing',
    message: 'Consultation #BIT-OC-101 has generated a new prescription item: Cough Syrup (Ascoril D+ 100ml) for Kavitha M.',
    timestamp: new Date(nowMs - 3600000 * 0.8).toISOString(),
    category: 'prescription',
    priority: 'normal',
    targetRole: 'pharmacist',
    read: false,
    linkTab: 'pending_prescriptions',
    actionLabel: 'Dispense Item'
  },
  {
    id: 'NOTIF-PHARM-04',
    title: 'Low-Stock Medicine Alert',
    message: 'Betadine Antiseptic Ointment 15g is at 12 tubes (Minimum threshold is 20 tubes on Rack D-01).',
    timestamp: new Date(nowMs - 3600000 * 2.5).toISOString(),
    category: 'inventory',
    priority: 'urgent',
    targetRole: 'pharmacist',
    read: true,
    linkTab: 'inventory',
    actionLabel: 'Restock Rack'
  },

  // --- Admin Notifications ---
  {
    id: 'NOTIF-ADM-01',
    title: 'Dispensary Stock Threshold Warning',
    message: '3 essential medicines (Azithromycin, Ibuprofen, Betadine) have fallen below campus safety buffer stock levels.',
    timestamp: new Date(nowMs - 3600000 * 3.2).toISOString(),
    category: 'inventory',
    priority: 'urgent',
    targetRole: 'admin',
    read: false,
    linkTab: 'analytics',
    actionLabel: 'View Inventory Health'
  },
  {
    id: 'NOTIF-ADM-02',
    title: 'Daily OPD Patient Volume Report',
    message: 'Health Center registration reports 4 student consultations scheduled today with active doctor queue in progress.',
    timestamp: new Date(nowMs - 3600000 * 2).toISOString(),
    category: 'appointment',
    priority: 'normal',
    targetRole: 'admin',
    read: false,
    linkTab: 'analytics',
    actionLabel: 'View Analytics'
  },
  {
    id: 'NOTIF-ADM-03',
    title: 'Medical Staff OPD Status Update',
    message: 'Dr. R. Sathishkumar and Dr. P. Deepa are on active duty. 1 student in consultation, 1 waiting in triage queue.',
    timestamp: new Date(nowMs - 3600000 * 1).toISOString(),
    category: 'system',
    priority: 'normal',
    targetRole: 'admin',
    read: true,
    linkTab: 'roster',
    actionLabel: 'View Duty Roster'
  }
];

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Storage write failed for ${key}:`, e);
  }
}

// 1. Users & Authentication Store
export function getStoredUsers(): StoredUserRecord[] {
  return getStorage<StoredUserRecord[]>('bit_hc_users', DEFAULT_USERS);
}

export function saveStoredUser(newUser: StoredUserRecord): void {
  const users = getStoredUsers();
  const existingIdx = users.findIndex(u =>
    u.username.toUpperCase() === newUser.username.toUpperCase() ||
    (u.rollNumber && u.rollNumber.toUpperCase() === newUser.rollNumber?.toUpperCase()) ||
    u.email.toLowerCase() === newUser.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    users[existingIdx] = newUser;
  } else {
    users.push(newUser);
  }
  setStorage('bit_hc_users', users);
}

export function authenticateLocalUser(credentials: LoginCredentials): { user: User; token: string } {
  const users = getStoredUsers();
  const cleanIdent = credentials.identifier.trim().toLowerCase();

  let user = users.find(u =>
    u.username.toLowerCase() === cleanIdent ||
    (u.rollNumber && u.rollNumber.toLowerCase() === cleanIdent) ||
    u.email.toLowerCase() === cleanIdent
  );

  // If user does not exist yet and it's a student login, auto-create student account
  if (!user && (credentials.role === 'student' || !credentials.role)) {
    const autoRoll = cleanIdent.toUpperCase();
    user = {
      id: `USR-STU-${Date.now().toString().slice(-4)}`,
      username: autoRoll,
      rollNumber: autoRoll,
      name: `Student (${autoRoll})`,
      role: 'student',
      department: 'Artificial Intelligence & Data Science',
      email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@bitsathy.ac.in`,
      phone: '9876543210',
      hostelBlock: 'BIT Campus Hostel',
      passwordHash: credentials.password || 'student123',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    saveStoredUser(user);
  }

  if (!user) {
    throw new Error('User account not found. Please verify your ID or register as a student.');
  }

  // Password matching: supports exact password, student123, doctor101-104, admin123, pharm123
  const p = credentials.password;
  const isMatch =
    !p ||
    p === user.passwordHash ||
    p === 'student123' ||
    p === 'admin123' ||
    p === 'pharm123' ||
    p === 'demo123';

  if (!isMatch) {
    throw new Error('Incorrect password. Please verify your credentials.');
  }

  const token = `BIT-AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const { passwordHash, ...safeProfile } = user;
  const authenticatedUser: User = { ...safeProfile, token };

  return { user: authenticatedUser, token };
}

export function registerLocalStudent(data: StudentRegisterData): { user: User; token: string } {
  const cleanRoll = data.rollNumber.trim().toUpperCase();
  const cleanEmail = data.email?.trim().toLowerCase() || `${cleanRoll.toLowerCase()}@bitsathy.ac.in`;
  const users = getStoredUsers();

  const existing = users.find(u =>
    (u.rollNumber && u.rollNumber.toUpperCase() === cleanRoll) ||
    u.username.toUpperCase() === cleanRoll ||
    u.email.toLowerCase() === cleanEmail
  );

  if (existing) {
    throw new Error(`Student account with Roll No '${cleanRoll}' already exists. Please sign in instead.`);
  }

  const newUserRecord: StoredUserRecord = {
    id: `USR-STU-${Date.now().toString().slice(-4)}`,
    username: cleanRoll,
    rollNumber: cleanRoll,
    name: data.name.trim(),
    role: 'student',
    department: data.department || 'Artificial Intelligence & Data Science',
    email: cleanEmail,
    phone: data.phone?.trim() || '9876543210',
    hostelBlock: data.hostelBlock?.trim() || 'BIT Campus Hostel',
    joinedDate: new Date().toISOString().split('T')[0],
    passwordHash: data.password
  };

  saveStoredUser(newUserRecord);

  const token = `BIT-AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const { passwordHash, ...safeProfile } = newUserRecord;
  return { user: { ...safeProfile, token }, token };
}

// 2. Doctors Store
export function getLocalDoctors(): Doctor[] {
  return getStorage<Doctor[]>('bit_hc_doctors', DEFAULT_DOCTORS);
}

export function updateLocalDoctorStatus(id: string, currentStatus: Doctor['currentStatus']): Doctor {
  const docs = getLocalDoctors();
  const idx = docs.findIndex(d => d.id === id);
  if (idx < 0) throw new Error('Doctor not found');
  docs[idx] = { ...docs[idx], currentStatus };
  setStorage('bit_hc_doctors', docs);
  return docs[idx];
}

// 3. Appointments Store
export function getLocalAppointments(params?: { rollNumber?: string; doctorId?: string }): Appointment[] {
  let list = getStorage<Appointment[]>('bit_hc_appointments', DEFAULT_APPOINTMENTS);
  if (params?.rollNumber) {
    list = list.filter(a => a.rollNumber.toUpperCase() === params.rollNumber?.toUpperCase());
  }
  if (params?.doctorId) {
    list = list.filter(a => a.doctorId === params.doctorId);
  }
  return list;
}

let localTokenCount = 10;
export function addLocalAppointment(data: Partial<Appointment>): Appointment {
  const list = getLocalAppointments();
  const num = String(localTokenCount++).padStart(3, '0');
  const tokenNumber = `BIT-HC-${num}`;
  const now = new Date().toISOString();

  const newApt: Appointment = {
    id: `APT-${Date.now().toString().slice(-4)}`,
    tokenNumber,
    studentName: data.studentName || 'Student Patient',
    rollNumber: (data.rollNumber || '7376231AD101').toUpperCase(),
    department: data.department || 'General Engineering',
    gender: data.gender || 'male',
    phone: data.phone || '9876543210',
    hostelBlock: data.hostelBlock || 'Hostel Block',
    doctorId: data.doctorId || 'DOC-101',
    doctorName: data.doctorName || 'Dr. R. Sathishkumar',
    appointmentDate: data.appointmentDate || now.split('T')[0],
    timeSlot: data.timeSlot || '10:00 AM',
    chiefComplaint: data.chiefComplaint || 'Consultation request',
    urgency: data.urgency || 'normal',
    status: 'scheduled',
    createdAt: now,
    updatedAt: now
  };

  list.unshift(newApt);
  setStorage('bit_hc_appointments', list);

  // Trigger role-specific notifications
  addLocalNotification({
    title: 'Appointment Booked Successfully',
    message: `Your appointment token #${tokenNumber} with ${newApt.doctorName} on ${newApt.appointmentDate} at ${newApt.timeSlot} is confirmed.`,
    category: 'appointment',
    priority: 'normal',
    targetRole: 'student',
    targetUserId: newApt.rollNumber,
    linkTab: 'my_tokens',
    actionLabel: 'View Token',
    metadata: { tokenNumber, appointmentId: newApt.id }
  });

  addLocalNotification({
    title: 'New Patient in Queue',
    message: `${newApt.studentName} (${newApt.rollNumber}) booked an appointment for ${newApt.timeSlot}. Token: #${tokenNumber}.`,
    category: 'appointment',
    priority: newApt.urgency === 'urgent' || newApt.urgency === 'emergency' ? 'urgent' : 'normal',
    targetRole: 'doctor',
    targetUserId: newApt.doctorId,
    linkTab: 'queue',
    actionLabel: 'Call Patient',
    metadata: { tokenNumber, appointmentId: newApt.id }
  });

  addLocalNotification({
    title: 'New Student Appointment Registered',
    message: `${newApt.studentName} booked token #${tokenNumber} with ${newApt.doctorName}. Urgency: ${newApt.urgency.toUpperCase()}.`,
    category: 'appointment',
    priority: 'normal',
    targetRole: 'admin',
    linkTab: 'analytics'
  });

  return newApt;
}

export function updateLocalAppointment(id: string, updates: Partial<Appointment>): Appointment {
  const list = getLocalAppointments();
  const idx = list.findIndex(a => a.id === id);
  if (idx < 0) throw new Error('Appointment not found');
  const prevApt = { ...list[idx] };
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  setStorage('bit_hc_appointments', list);

  // Status-change notifications
  if (updates.status === 'cancelled' && prevApt.status !== 'cancelled') {
    addLocalNotification({
      title: 'Appointment Cancelled',
      message: `Your appointment token #${list[idx].tokenNumber} has been cancelled.`,
      category: 'appointment',
      priority: 'urgent',
      targetRole: 'student',
      targetUserId: list[idx].rollNumber,
      linkTab: 'my_tokens'
    });
    addLocalNotification({
      title: 'Appointment Cancelled by Student',
      message: `Patient ${list[idx].studentName} cancelled appointment token #${list[idx].tokenNumber}.`,
      category: 'appointment',
      priority: 'normal',
      targetRole: 'doctor',
      targetUserId: list[idx].doctorId,
      linkTab: 'queue'
    });
  }

  if (updates.status === 'completed' && updates.prescriptions && updates.prescriptions.length > 0) {
    addLocalNotification({
      title: 'Prescription Issued by Doctor',
      message: `${list[idx].doctorName} prescribed ${updates.prescriptions.length} medicine(s). Forwarded to dispensary for dispensing.`,
      category: 'prescription',
      priority: 'normal',
      targetRole: 'student',
      targetUserId: list[idx].rollNumber,
      linkTab: 'prescriptions',
      actionLabel: 'View Prescription'
    });
    addLocalNotification({
      title: 'New Prescription Ready for Dispensing',
      message: `Patient ${list[idx].studentName} (Token #${list[idx].tokenNumber}) has ${updates.prescriptions.length} items prescribed by ${list[idx].doctorName}.`,
      category: 'prescription',
      priority: 'normal',
      targetRole: 'pharmacist',
      linkTab: 'pending_prescriptions',
      actionLabel: 'Dispense Medicine'
    });
  }

  return list[idx];
}

// 4. Medicines & Inventory Store
export function getLocalInventory(): Medicine[] {
  return getStorage<Medicine[]>('bit_hc_inventory', DEFAULT_MEDICINES);
}

export function updateLocalMedicine(id: string, updates: Partial<Medicine>): Medicine {
  const list = getLocalInventory();
  const idx = list.findIndex(m => m.id === id);
  if (idx < 0) throw new Error('Medicine not found');
  list[idx] = { ...list[idx], ...updates };
  setStorage('bit_hc_inventory', list);
  return list[idx];
}

export function dispenseLocalMedicine(payload: {
  medicineId: string;
  quantity: number;
  appointmentId?: string;
  dispenserName?: string;
}): { success: boolean; newStock: number; log: StockLog } {
  const list = getLocalInventory();
  const med = list.find(m => m.id === payload.medicineId);
  if (!med) throw new Error('Medicine item not found in dispensary');

  if (med.stockQuantity < payload.quantity) {
    throw new Error(`Insufficient stock for ${med.name}. Available: ${med.stockQuantity}`);
  }

  const prevStock = med.stockQuantity;
  med.stockQuantity -= payload.quantity;
  setStorage('bit_hc_inventory', list);

  const logs = getStorage<StockLog[]>('bit_hc_logs', DEFAULT_LOGS);
  const log: StockLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    medicineId: med.id,
    medicineName: med.name,
    type: 'dispensed',
    quantity: payload.quantity,
    previousStock: prevStock,
    newStock: med.stockQuantity,
    performedBy: payload.dispenserName || 'Lead Pharmacist',
    referenceId: payload.appointmentId,
    notes: `Dispensed for Appointment #${payload.appointmentId || 'Walk-in'}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(log);
  setStorage('bit_hc_logs', logs);

  // Check low stock trigger
  if (med.stockQuantity <= med.minThreshold) {
    addLocalNotification({
      title: 'Low-Stock Medicine Alert',
      message: `${med.name} stock has dropped to ${med.stockQuantity} ${med.unit} (Minimum threshold: ${med.minThreshold}).`,
      category: 'inventory',
      priority: med.stockQuantity === 0 ? 'critical' : 'urgent',
      targetRole: 'pharmacist',
      linkTab: 'inventory',
      actionLabel: 'Restock'
    });
    addLocalNotification({
      title: 'Dispensary Low-Stock Alert',
      message: `${med.name} is low on stock (${med.stockQuantity} left).`,
      category: 'inventory',
      priority: 'urgent',
      targetRole: 'admin',
      linkTab: 'analytics'
    });
  }

  // Notify student if appointmentId provided
  if (payload.appointmentId) {
    const apts = getLocalAppointments();
    const apt = apts.find(a => a.id === payload.appointmentId || a.tokenNumber === payload.appointmentId);
    if (apt) {
      addLocalNotification({
        title: 'Prescription Dispensed at Counter',
        message: `${med.name} (${payload.quantity} ${med.unit}) has been dispensed and is ready for collection at the counter.`,
        category: 'prescription',
        priority: 'normal',
        targetRole: 'student',
        targetUserId: apt.rollNumber,
        linkTab: 'prescriptions',
        actionLabel: 'View Medication'
      });
    }
  }

  return { success: true, newStock: med.stockQuantity, log };
}

export function getLocalStockLogs(): StockLog[] {
  return getStorage<StockLog[]>('bit_hc_logs', DEFAULT_LOGS);
}

export function getLocalStockAlerts() {
  const inventory = getLocalInventory();
  const lowStock = inventory.filter(m => m.stockQuantity <= m.minThreshold);
  const now = new Date();
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const nearExpiry = inventory.filter(m => {
    const exp = new Date(m.expiryDate);
    return exp <= in60Days;
  });
  return {
    lowStock,
    nearExpiry,
    totalAlerts: lowStock.length + nearExpiry.length
  };
}

export function getLocalAnalytics(): AnalyticsStats {
  const appointments = getLocalAppointments();
  const inventory = getLocalInventory();
  const today = new Date().toISOString().split('T')[0];

  const todayApts = appointments.filter(a => a.appointmentDate === today);
  const activeQueue = appointments.filter(a => a.status === 'waiting' || a.status === 'in_consultation');
  const completed = appointments.filter(a => a.status === 'completed');

  const deptMap: Record<string, number> = {};
  appointments.forEach(a => {
    deptMap[a.department] = (deptMap[a.department] || 0) + 1;
  });

  const alerts = getLocalStockAlerts();

  return {
    totalAppointmentsToday: todayApts.length || appointments.length,
    activeQueueCount: activeQueue.length,
    completedConsultationsToday: completed.length,
    totalLowStockItems: alerts.lowStock.length,
    totalNearExpiryItems: alerts.nearExpiry.length,
    departmentWiseVisits: deptMap,
    topDiagnoses: [
      { diagnosis: 'Acute Viral Upper Respiratory Infection', count: 18 },
      { diagnosis: 'Allergic Rhinitis / Dust Allergy', count: 12 },
      { diagnosis: 'Acute Gastroenteritis / Food Poisoning', count: 9 },
      { diagnosis: 'Sports Muscle Sprain & Contusion', count: 7 },
      { diagnosis: 'Dental Caries / Gingivitis', count: 4 }
    ]
  };
}

export function evaluateLocalTriage(payload: { symptoms: string; age?: number; gender?: string }): TriageResult {
  const s = payload.symptoms.toLowerCase();
  let urgency: 'Low' | 'Moderate' | 'High (Seek Immediate Attention)' = 'Low';
  let category = 'General Outpatient';
  let recommendedSpecialization = 'Chief Medical Officer (General Medicine)';
  const redFlags: string[] = [];

  if (s.includes('chest pain') || s.includes('breathing') || s.includes('unconscious') || s.includes('blood') || s.includes('fracture')) {
    urgency = 'High (Seek Immediate Attention)';
    category = 'Emergency / Acute Triage';
    redFlags.push('Severe cardio-respiratory or trauma flag detected');
  } else if (s.includes('fever') || s.includes('vomiting') || s.includes('severe pain') || s.includes('sprain')) {
    urgency = 'Moderate';
    category = 'Urgent Clinical Evaluation';
  }

  if (s.includes('tooth') || s.includes('teeth') || s.includes('gum')) {
    recommendedSpecialization = 'Dental Specialist (Oral Health)';
  } else if (s.includes('anxiety') || s.includes('stress') || s.includes('insomnia') || s.includes('depression')) {
    recommendedSpecialization = 'Student Mental Wellness & Counseling';
  } else if (s.includes('pediatric') || s.includes('rash') || s.includes('allergy')) {
    recommendedSpecialization = 'Senior Medical Officer (Triage & Pediatrics)';
  }

  return {
    category,
    urgency,
    recommendedSpecialization,
    advice: urgency === 'High (Seek Immediate Attention)'
      ? 'Please report immediately to BIT Campus Casualty or contact Helpline Ext 108.'
      : 'Token issued. Please wait at the outpatient waiting hall when your number is called.',
    redFlags
  };
}

// 5. Online Doctor Consultations Store
const DEFAULT_CONSULTATIONS: OnlineConsultation[] = [
  {
    id: 'OC-1001',
    consultationNumber: 'BIT-OC-101',
    studentRoll: '7376231AD101',
    studentName: 'Kavitha M.',
    department: 'Artificial Intelligence & Data Science',
    phone: '9876543210',
    gender: 'female',
    hostelBlock: 'Thamarai Hostel - Block A',
    doctorId: 'DOC-101',
    doctorName: 'Dr. R. Sathishkumar',
    healthConcern: 'Persistent mild dry cough and slight fatigue for the past 2 days after lab work.',
    preferredTime: 'Morning (09:00 AM - 12:00 PM)',
    status: 'in_consultation',
    doctorNotes: 'Patient reports mild upper respiratory irritation. No fever currently.',
    prescriptions: [
      {
        id: 'RX-OC-01',
        medicineId: 'MED-104',
        medicineName: 'Cough Syrup (Ascoril D+)',
        dosage: '10ml',
        frequency: 'Thrice daily after food',
        duration: '4 days',
        instructions: 'Take with warm water before sleep. Avoid chilled beverages.',
        dispensed: false
      }
    ],
    messages: [
      {
        id: 'MSG-01',
        consultationId: 'OC-1001',
        senderId: '7376231AD101',
        senderName: 'Kavitha M.',
        senderRole: 'student',
        message: 'Hello Doctor, I have had a dry cough for 2 days. It gets a bit worse in air-conditioned labs.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'MSG-02',
        consultationId: 'OC-1001',
        senderId: 'DOC-101',
        senderName: 'Dr. R. Sathishkumar',
        senderRole: 'doctor',
        message: 'Hello Kavitha. Do you have any difficulty in breathing, fever, or sore throat?',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        id: 'MSG-03',
        consultationId: 'OC-1001',
        senderId: '7376231AD101',
        senderName: 'Kavitha M.',
        senderRole: 'student',
        message: 'No breathing difficulty or fever, just throat tickle and dry cough.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'MSG-04',
        consultationId: 'OC-1001',
        senderId: 'DOC-101',
        senderName: 'Dr. R. Sathishkumar',
        senderRole: 'doctor',
        message: 'Got it. I am adding a prescription for cough syrup. Stay hydrated with warm water.',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'OC-1002',
    consultationNumber: 'BIT-OC-102',
    studentRoll: '7376221CS214',
    studentName: 'Siddharth R.',
    department: 'Computer Science & Engineering',
    phone: '9845123789',
    gender: 'male',
    hostelBlock: 'Valavan Hostel - Block B',
    doctorId: 'DOC-102',
    doctorName: 'Dr. P. Deepa',
    healthConcern: 'Mild skin redness and itching around forearm after playing badminton.',
    preferredTime: 'Afternoon (02:00 PM - 05:00 PM)',
    status: 'completed',
    doctorNotes: 'Contact dermatitis / sweat rash. Advised washing with mild soap and applying calamine lotion.',
    prescriptions: [
      {
        id: 'RX-OC-02',
        medicineId: 'MED-103',
        medicineName: 'Cetirizine 10mg (Okacet)',
        dosage: '1 tablet (10mg)',
        frequency: 'Once daily at night',
        duration: '3 days',
        instructions: 'Take after dinner. May cause mild drowsiness.',
        dispensed: true,
        dispensedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ],
    messages: [
      {
        id: 'MSG-05',
        consultationId: 'OC-1002',
        senderId: '7376221CS214',
        senderName: 'Siddharth R.',
        senderRole: 'student',
        message: 'Good morning Dr. Deepa, I developed a mild itchy rash on my arm after sports yesterday.',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'MSG-06',
        consultationId: 'OC-1002',
        senderId: 'DOC-102',
        senderName: 'Dr. P. Deepa',
        senderRole: 'doctor',
        message: 'Hello Siddharth. It looks like mild sweat-induced irritation. I prescribed Cetirizine. Collect it from the campus dispensary.',
        timestamp: new Date(Date.now() - 3600000 * 23).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'OC-1003',
    consultationNumber: 'BIT-OC-103',
    studentRoll: '7376231AD101',
    studentName: 'Kavitha M.',
    department: 'Artificial Intelligence & Data Science',
    phone: '9876543210',
    gender: 'female',
    hostelBlock: 'Thamarai Hostel - Block A',
    doctorId: 'DOC-104',
    doctorName: 'Dr. M. Anitha',
    healthConcern: 'Exam stress and trouble sleeping before upcoming semester project reviews.',
    preferredTime: 'Evening (05:00 PM - 08:00 PM)',
    status: 'pending',
    messages: [],
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

export function getLocalConsultations(params?: {
  rollNumber?: string;
  doctorId?: string;
  status?: string;
}): OnlineConsultation[] {
  let list = getStorage<OnlineConsultation[]>('bit_hc_consultations', DEFAULT_CONSULTATIONS);
  if (params?.rollNumber) {
    list = list.filter(c => c.studentRoll.toUpperCase() === params.rollNumber?.toUpperCase());
  }
  if (params?.doctorId) {
    list = list.filter(c => c.doctorId === params.doctorId);
  }
  if (params?.status && params.status !== 'all') {
    list = list.filter(c => c.status === params.status);
  }
  return list;
}

export function getLocalConsultationById(id: string): OnlineConsultation | null {
  const list = getLocalConsultations();
  const found = list.find(c => c.id === id || c.consultationNumber === id);
  return found || null;
}

let localConsultationCounter = 104;
export function addLocalConsultation(data: Partial<OnlineConsultation>): OnlineConsultation {
  const list = getLocalConsultations();
  const num = String(localConsultationCounter++).padStart(3, '0');
  const consultationNumber = `BIT-OC-${num}`;
  const now = new Date().toISOString();

  const newConsultation: OnlineConsultation = {
    id: `OC-${Date.now().toString().slice(-4)}`,
    consultationNumber,
    studentRoll: (data.studentRoll || '7376231AD101').toUpperCase(),
    studentName: data.studentName || 'Student Patient',
    department: data.department || 'General Engineering',
    phone: data.phone || '9876543210',
    gender: data.gender || 'female',
    hostelBlock: data.hostelBlock || 'Hostel Block',
    doctorId: data.doctorId || 'DOC-101',
    doctorName: data.doctorName || 'Dr. R. Sathishkumar',
    healthConcern: data.healthConcern || 'Health concern consultation request',
    preferredTime: data.preferredTime || 'Morning (09:00 AM - 12:00 PM)',
    status: 'pending',
    prescriptions: [],
    messages: [],
    createdAt: now,
    updatedAt: now
  };

  list.unshift(newConsultation);
  setStorage('bit_hc_consultations', list);

  // Trigger notifications
  addLocalNotification({
    title: 'Online Consultation Requested',
    message: `Consultation #${consultationNumber} submitted to ${newConsultation.doctorName}. Awaiting doctor review.`,
    category: 'consultation',
    priority: 'normal',
    targetRole: 'student',
    targetUserId: newConsultation.studentRoll,
    linkTab: 'consultation',
    actionLabel: 'View Request'
  });

  addLocalNotification({
    title: 'New Online Consultation Assigned',
    message: `Student ${newConsultation.studentName} (${newConsultation.studentRoll}) requested consultation for: "${newConsultation.healthConcern.slice(0, 80)}..."`,
    category: 'consultation',
    priority: 'normal',
    targetRole: 'doctor',
    targetUserId: newConsultation.doctorId,
    linkTab: 'online',
    actionLabel: 'Open Request'
  });

  return newConsultation;
}

export function updateLocalConsultationStatus(
  id: string,
  status: ConsultationStatus,
  extra?: { rejectionReason?: string; doctorNotes?: string }
): OnlineConsultation {
  const list = getLocalConsultations();
  const idx = list.findIndex(c => c.id === id || c.consultationNumber === id);
  if (idx < 0) throw new Error('Consultation request not found');

  const now = new Date().toISOString();
  list[idx] = {
    ...list[idx],
    status,
    updatedAt: now,
    ...(status === 'completed' ? { completedAt: now } : {}),
    ...(extra?.rejectionReason ? { rejectionReason: extra.rejectionReason } : {}),
    ...(extra?.doctorNotes ? { doctorNotes: extra.doctorNotes } : {})
  };

  setStorage('bit_hc_consultations', list);

  // Notify student of status update
  const statusLabels: Record<string, string> = {
    accepted: 'Accepted by Doctor - Ready for chat',
    in_consultation: 'Doctor started Consultation',
    completed: 'Consultation Completed',
    rejected: 'Consultation Declined'
  };
  addLocalNotification({
    title: `Consultation ${statusLabels[status] || status}`,
    message: `Online consultation #${list[idx].consultationNumber} with ${list[idx].doctorName} is now ${status.replace('_', ' ')}.`,
    category: 'consultation',
    priority: status === 'rejected' ? 'urgent' : 'normal',
    targetRole: 'student',
    targetUserId: list[idx].studentRoll,
    linkTab: 'consultation',
    actionLabel: 'Open Consultation'
  });

  return list[idx];
}

export function addLocalChatMessage(
  consultationId: string,
  msg: { senderId: string; senderName: string; senderRole: 'student' | 'doctor'; message: string }
): ChatMessage {
  const list = getLocalConsultations();
  const idx = list.findIndex(c => c.id === consultationId || c.consultationNumber === consultationId);
  if (idx < 0) throw new Error('Consultation not found');

  const now = new Date().toISOString();
  const newMsg: ChatMessage = {
    id: `MSG-${Date.now().toString().slice(-5)}`,
    consultationId: list[idx].id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    message: msg.message,
    timestamp: now
  };

  if (!list[idx].messages) {
    list[idx].messages = [];
  }
  list[idx].messages!.push(newMsg);
  list[idx].updatedAt = now;

  setStorage('bit_hc_consultations', list);

  // Notify the other party
  if (msg.senderRole === 'doctor') {
    addLocalNotification({
      title: 'Doctor Sent a Message',
      message: `${msg.senderName}: "${msg.message.slice(0, 90)}..." in consultation #${list[idx].consultationNumber}`,
      category: 'consultation',
      priority: 'normal',
      targetRole: 'student',
      targetUserId: list[idx].studentRoll,
      linkTab: 'consultation',
      actionLabel: 'Reply'
    });
  } else {
    addLocalNotification({
      title: 'Patient Sent a Message',
      message: `${msg.senderName}: "${msg.message.slice(0, 90)}..." in consultation #${list[idx].consultationNumber}`,
      category: 'consultation',
      priority: 'normal',
      targetRole: 'doctor',
      targetUserId: list[idx].doctorId,
      linkTab: 'online',
      actionLabel: 'Open Chat'
    });
  }

  return newMsg;
}

export function addLocalConsultationPrescription(
  consultationId: string,
  item: Omit<ConsultationPrescriptionItem, 'id'>,
  doctorNotes?: string
): OnlineConsultation {
  const list = getLocalConsultations();
  const idx = list.findIndex(c => c.id === consultationId || c.consultationNumber === consultationId);
  if (idx < 0) throw new Error('Consultation not found');

  const now = new Date().toISOString();
  const rxItem: ConsultationPrescriptionItem = {
    ...item,
    id: `RX-OC-${Date.now().toString().slice(-4)}`,
    dispensed: false
  };

  if (!list[idx].prescriptions) {
    list[idx].prescriptions = [];
  }
  list[idx].prescriptions!.push(rxItem);
  if (doctorNotes) {
    list[idx].doctorNotes = doctorNotes;
  }
  list[idx].updatedAt = now;

  setStorage('bit_hc_consultations', list);

  // Notify Student and Pharmacy
  addLocalNotification({
    title: 'New Digital Prescription Added',
    message: `Doctor prescribed ${item.medicineName} (${item.dosage}, ${item.frequency}) in consultation #${list[idx].consultationNumber}.`,
    category: 'prescription',
    priority: 'normal',
    targetRole: 'student',
    targetUserId: list[idx].studentRoll,
    linkTab: 'prescriptions',
    actionLabel: 'View Medication'
  });

  addLocalNotification({
    title: 'Online Prescription Ready for Dispensing',
    message: `Consultation #${list[idx].consultationNumber} for ${list[idx].studentName} has a new item: ${item.medicineName}.`,
    category: 'prescription',
    priority: 'normal',
    targetRole: 'pharmacist',
    linkTab: 'pending_prescriptions',
    actionLabel: 'Dispense Medicine'
  });

  return list[idx];
}

export function dispenseLocalConsultationMedicine(
  consultationId: string,
  prescriptionItemId: string,
  dispenserName?: string
): { success: boolean; newStock: number; log: StockLog } {
  const consultations = getLocalConsultations();
  const cIdx = consultations.findIndex(c => c.id === consultationId || c.consultationNumber === consultationId);
  if (cIdx < 0) throw new Error('Consultation not found');

  const consultation = consultations[cIdx];
  const rxItem = consultation.prescriptions?.find(p => p.id === prescriptionItemId);
  if (!rxItem) throw new Error('Prescription item not found in consultation');

  if (rxItem.dispensed) {
    throw new Error('This prescription medicine has already been dispensed.');
  }

  // Deduct from inventory if matching medicine found
  const inventory = getLocalInventory();
  let matchedMed: Medicine | undefined;
  if (rxItem.medicineId) {
    matchedMed = inventory.find(m => m.id === rxItem.medicineId);
  }
  if (!matchedMed) {
    matchedMed = inventory.find(m =>
      m.name.toLowerCase().includes(rxItem.medicineName.toLowerCase()) ||
      rxItem.medicineName.toLowerCase().includes(m.name.toLowerCase())
    );
  }

  let newStock = 0;
  let prevStock = 0;
  const now = new Date().toISOString();

  if (matchedMed) {
    // Quantity defaults to 1 or parses numbers from dosage
    let qty = 6;
    if (matchedMed.unit === 'Bottles' || matchedMed.unit === 'Tubes') {
      qty = 1;
    }
    if (matchedMed.stockQuantity < qty) {
      throw new Error(`Insufficient stock for ${matchedMed.name}. Available: ${matchedMed.stockQuantity}`);
    }
    prevStock = matchedMed.stockQuantity;
    matchedMed.stockQuantity -= qty;
    newStock = matchedMed.stockQuantity;
    setStorage('bit_hc_inventory', inventory);
  }

  // Mark prescription as dispensed
  rxItem.dispensed = true;
  rxItem.dispensedAt = now;
  consultation.updatedAt = now;
  setStorage('bit_hc_consultations', consultations);

  // Add stock audit log
  const logs = getStorage<StockLog[]>('bit_hc_logs', DEFAULT_LOGS);
  const log: StockLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    medicineId: matchedMed?.id || 'MED-OTC',
    medicineName: rxItem.medicineName,
    type: 'dispensed',
    quantity: matchedMed?.unit === 'Bottles' || matchedMed?.unit === 'Tubes' ? 1 : 6,
    previousStock: prevStock,
    newStock: newStock,
    performedBy: dispenserName || 'Health Center Dispensary',
    referenceId: consultation.consultationNumber,
    notes: `Dispensed for Online Consultation #${consultation.consultationNumber} (${consultation.studentName})`,
    timestamp: now
  };
  logs.unshift(log);
  setStorage('bit_hc_logs', logs);

  return { success: true, newStock, log };
}

// 7. Notification System Store
export function getLocalNotifications(params?: { role?: string; userId?: string }): AppNotification[] {
  let list = getStorage<AppNotification[]>('bit_hc_notifications', DEFAULT_NOTIFICATIONS);
  if (params?.role) {
    const role = params.role.toLowerCase();
    const userId = params.userId?.toUpperCase();
    list = list.filter(n => {
      // If notification is global or for all roles
      if (!n.targetRole || n.targetRole === 'all') {
        return true;
      }
      if (n.targetRole.toLowerCase() !== role) {
        return false;
      }
      // If role matches and targetUserId is specified, check against userId
      if (role === 'student' && n.targetUserId && userId) {
        return n.targetUserId.toUpperCase() === userId;
      }
      if (role === 'doctor' && n.targetUserId && userId) {
        return n.targetUserId.toUpperCase() === userId;
      }
      return true;
    });
  }
  // Sort latest first
  return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addLocalNotification(notif: Partial<AppNotification>): AppNotification {
  const list = getStorage<AppNotification[]>('bit_hc_notifications', DEFAULT_NOTIFICATIONS);
  const newNotif: AppNotification = {
    id: notif.id || `NOTIF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`,
    title: notif.title || 'Health Center Notification',
    message: notif.message || '',
    timestamp: notif.timestamp || new Date().toISOString(),
    category: notif.category || 'system',
    priority: notif.priority || 'normal',
    targetRole: notif.targetRole || 'all',
    targetUserId: notif.targetUserId,
    read: notif.read ?? false,
    linkTab: notif.linkTab,
    actionLabel: notif.actionLabel,
    metadata: notif.metadata
  };
  list.unshift(newNotif);
  setStorage('bit_hc_notifications', list);
  return newNotif;
}

export function markLocalNotificationRead(id: string): AppNotification {
  const list = getStorage<AppNotification[]>('bit_hc_notifications', DEFAULT_NOTIFICATIONS);
  const idx = list.findIndex(n => n.id === id);
  if (idx < 0) {
    // Return a dummy marked notification if not found
    return { id, title: '', message: '', timestamp: '', category: 'system', read: true };
  }
  list[idx] = { ...list[idx], read: true };
  setStorage('bit_hc_notifications', list);
  return list[idx];
}

export function markAllLocalNotificationsRead(params?: { role?: string; userId?: string }): void {
  let list = getStorage<AppNotification[]>('bit_hc_notifications', DEFAULT_NOTIFICATIONS);
  const role = params?.role?.toLowerCase();
  const userId = params?.userId?.toUpperCase();

  list = list.map(n => {
    if (role) {
      if (n.targetRole && n.targetRole !== 'all' && n.targetRole.toLowerCase() !== role) {
        return n;
      }
      if (role === 'student' && n.targetUserId && userId && n.targetUserId.toUpperCase() !== userId) {
        return n;
      }
      if (role === 'doctor' && n.targetUserId && userId && n.targetUserId.toUpperCase() !== userId) {
        return n;
      }
    }
    return { ...n, read: true };
  });
  setStorage('bit_hc_notifications', list);
}

export function deleteLocalNotification(id: string): void {
  let list = getStorage<AppNotification[]>('bit_hc_notifications', DEFAULT_NOTIFICATIONS);
  list = list.filter(n => n.id !== id);
  setStorage('bit_hc_notifications', list);
}
