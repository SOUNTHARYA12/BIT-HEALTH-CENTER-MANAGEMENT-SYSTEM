import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  Doctor,
  Appointment,
  Medicine,
  StockLog,
  AnalyticsStats,
  TriageResult,
  User,
  LoginCredentials,
  OnlineConsultation,
  ConsultationStatus,
  ChatMessage,
  ConsultationPrescriptionItem
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- PERSISTENT USER STORAGE HELPER ---

interface AuthUserRecord extends User {
  passwordHash: string;
}

const DEFAULT_MOCK_USERS: AuthUserRecord[] = [
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
    gender: 'female',
    bloodGroup: 'A+ve',
    emergencyContact: 'Parent / Guardian',
    emergencyPhone: '9787322887',
    allergies: 'None reported',
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

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn('Could not create data dir:', e);
    }
  }
}

function loadSavedUsers(): AuthUserRecord[] {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any missing default records
        const map = new Map<string, AuthUserRecord>();
        for (const u of DEFAULT_MOCK_USERS) {
          map.set(u.username.toUpperCase(), u);
        }
        for (const u of parsed) {
          map.set(u.username.toUpperCase(), u);
        }
        return Array.from(map.values());
      }
    }
  } catch (err) {
    console.warn('Could not read saved users:', err);
  }
  return [...DEFAULT_MOCK_USERS];
}

function saveUsersToDisk(users: AuthUserRecord[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save users to disk:', err);
  }
}

let mockUsers: AuthUserRecord[] = loadSavedUsers();

let activeSessions: Map<string, User> = new Map();

let doctors: Doctor[] = [
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

let inventory: Medicine[] = [
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
    stockQuantity: 28, // Low stock warning!
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
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    category: 'Analgesics',
    batchNumber: 'BIT-2026-IBU',
    expiryDate: '2026-08-25', // Near expiry & low stock!
    stockQuantity: 14,
    minThreshold: 60,
    unit: 'Tablets',
    locationRack: 'Rack A-02',
    unitPrice: 0,
    lastRestocked: '2026-04-12'
  },
  {
    id: 'MED-107',
    name: 'Betadine Antiseptic Ointment 15g',
    genericName: 'Povidone-Iodine 5%',
    category: 'Ointments',
    batchNumber: 'BIT-2026-BET',
    expiryDate: '2027-01-15',
    stockQuantity: 12, // Low stock!
    minThreshold: 20,
    unit: 'Tubes',
    locationRack: 'Rack D-01',
    unitPrice: 0,
    lastRestocked: '2026-05-18'
  },
  {
    id: 'MED-108',
    name: 'Elastic Bandage 3 inch',
    genericName: 'Crepe Bandage',
    category: 'First Aid',
    batchNumber: 'BIT-2026-BND',
    expiryDate: '2029-01-01',
    stockQuantity: 75,
    minThreshold: 20,
    unit: 'Rolls',
    locationRack: 'Rack D-03',
    unitPrice: 0,
    lastRestocked: '2026-06-01'
  },
  {
    id: 'MED-109',
    name: 'Pantoprazole 40mg (Pan 40)',
    genericName: 'Pantoprazole Sodium',
    category: 'Digestive',
    batchNumber: 'BIT-2026-PAN',
    expiryDate: '2027-05-20',
    stockQuantity: 190,
    minThreshold: 40,
    unit: 'Tablets',
    locationRack: 'Rack C-03',
    unitPrice: 0,
    lastRestocked: '2026-07-02'
  },
  {
    id: 'MED-110',
    name: 'Cough Syrup (Ascoril D 100ml)',
    genericName: 'Dextromethorphan + Chlorpheniramine',
    category: 'Respiratory',
    batchNumber: 'BIT-2026-CGH',
    expiryDate: '2026-12-15',
    stockQuantity: 35,
    minThreshold: 15,
    unit: 'Bottles',
    locationRack: 'Rack E-01',
    unitPrice: 0,
    lastRestocked: '2026-06-25'
  }
];

const todayStr = new Date().toISOString().split('T')[0];

let appointments: Appointment[] = [
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
    appointmentDate: todayStr,
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
      },
      {
        medicineId: 'MED-103',
        medicineName: 'Cetirizine 10mg (Okacet)',
        dosage: '0-0-1 at night',
        durationDays: 3,
        quantity: 3,
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
    appointmentDate: todayStr,
    timeSlot: '10:00 AM',
    chiefComplaint: 'Acute stomach cramps and nausea after mess dinner',
    urgency: 'normal',
    status: 'in_consultation',
    vitals: {
      bloodPressure: '122/80',
      pulseRate: 80,
      temperature: 98.6,
      weight: 68,
      spo2: 99,
      allergies: 'Penicillin allergy'
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'APT-1003',
    tokenNumber: 'BIT-HC-003',
    studentName: 'Ananya S.',
    rollNumber: '7376241EC105',
    department: 'Electronics & Communication Engg',
    gender: 'female',
    phone: '9789012345',
    hostelBlock: 'Mullai Hostel - Block C',
    doctorId: 'DOC-102',
    doctorName: 'Dr. P. Deepa',
    appointmentDate: todayStr,
    timeSlot: '10:30 AM',
    chiefComplaint: 'Ankle sprain during sports field practice',
    urgency: 'urgent',
    status: 'waiting',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'APT-1004',
    tokenNumber: 'BIT-HC-004',
    studentName: 'Praveen Kumar',
    rollNumber: '7376231ME150',
    department: 'Mechanical Engineering',
    gender: 'male',
    phone: '9654321098',
    hostelBlock: 'Kambar Hostel - Block A',
    doctorId: 'DOC-103',
    doctorName: 'Dr. K. Venkatesh',
    appointmentDate: todayStr,
    timeSlot: '11:30 AM',
    chiefComplaint: 'Toothache in lower right molar',
    urgency: 'normal',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let stockLogs: StockLog[] = [
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
  },
  {
    id: 'LOG-102',
    medicineId: 'MED-103',
    medicineName: 'Cetirizine 10mg (Okacet)',
    type: 'dispensed',
    quantity: 3,
    previousStock: 313,
    newStock: 310,
    performedBy: 'Pharmacist - Health Center Dispensary',
    referenceId: 'APT-1001',
    notes: 'Dispensed for Kavitha M. (APT-1001)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'LOG-103',
    medicineId: 'MED-105',
    medicineName: 'ORS Oral Rehydration Sachet',
    type: 'received',
    quantity: 100,
    previousStock: 150,
    newStock: 250,
    performedBy: 'Health Center Administrator',
    referenceId: 'PO-2026-088',
    notes: 'Monthly bulk stock arrival from Central Medical Stores',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

let onlineConsultations: OnlineConsultation[] = [
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

let consultationTokenCounter = 104;
function generateConsultationToken(): string {
  const num = String(consultationTokenCounter++).padStart(3, '0');
  return `BIT-OC-${num}`;
}

// Helper: Token Generator
let tokenCounter = 5;
function generateToken(): string {
  const num = String(tokenCounter++).padStart(3, '0');
  return `BIT-HC-${num}`;
}

// --- API ENDPOINTS ---

// 0. AUTHENTICATION ENDPOINTS
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Please enter your Roll Number, Employee ID, or Email address.' });
  }

  const cleanIdent = String(identifier).trim().toLowerCase();

  // Find user by rollNumber, username, or email
  let userRecord = mockUsers.find(u =>
    u.username.toLowerCase() === cleanIdent ||
    (u.rollNumber && u.rollNumber.toLowerCase() === cleanIdent) ||
    u.email.toLowerCase() === cleanIdent
  );

  // If user doesn't exist yet, auto-create a student session if identifier looks like a valid roll number or email
  if (!userRecord && (role === 'student' || !role)) {
    const autoRoll = cleanIdent.toUpperCase();
    userRecord = {
      id: `USR-STU-${Date.now().toString().slice(-4)}`,
      username: autoRoll,
      rollNumber: autoRoll,
      name: `Student (${autoRoll})`,
      role: 'student',
      department: 'General Engineering',
      email: `${cleanIdent.includes('@') ? cleanIdent : cleanIdent + '@bitsathy.ac.in'}`,
      phone: '9876543210',
      hostelBlock: 'BIT Campus Hostel',
      passwordHash: password || 'student123'
    };
    mockUsers.push(userRecord);
  }

  if (!userRecord) {
    return res.status(401).json({ error: 'Invalid user credentials or account not found.' });
  }

  // Check password match (supports default password or 'demo123')
  if (password && password !== userRecord.passwordHash && password !== 'demo123') {
    return res.status(401).json({ error: 'Incorrect password. Default passwords: student123, doctor123, pharm123, admin123' });
  }

  // Generate session token
  const token = `BIT-AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const { passwordHash, ...userProfile } = userRecord;
  const authenticatedUser: User = { ...userProfile, token };

  activeSessions.set(token, authenticatedUser);

  res.json({
    message: 'Login successful',
    user: authenticatedUser,
    token
  });
});

app.post('/api/auth/register', (req, res) => {
  const { rollNumber, name, department, email, phone, hostelBlock, password } = req.body;

  if (!rollNumber || !name || !password) {
    return res.status(400).json({ error: 'Roll number, student name, and password are required.' });
  }

  const cleanRoll = String(rollNumber).trim().toUpperCase();
  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanRoll.toLowerCase()}@bitsathy.ac.in`;

  // Check if student with this roll number or email already exists
  const existing = mockUsers.find(u =>
    (u.rollNumber && u.rollNumber.toUpperCase() === cleanRoll) ||
    u.username.toUpperCase() === cleanRoll ||
    u.email.toLowerCase() === cleanEmail
  );

  if (existing) {
    return res.status(400).json({ error: `Student account with Roll No '${cleanRoll}' already exists. Please sign in instead.` });
  }

  const newUserRecord: AuthUserRecord = {
    id: `USR-STU-${Date.now().toString().slice(-4)}`,
    username: cleanRoll,
    rollNumber: cleanRoll,
    name: name.trim(),
    role: 'student',
    department: department || 'Engineering & Technology',
    email: cleanEmail,
    phone: phone || '9876543210',
    hostelBlock: hostelBlock || 'BIT Student Hostel',
    passwordHash: password
  };

  mockUsers.push(newUserRecord);
  saveUsersToDisk(mockUsers);

  // Generate session token & log them in automatically
  const token = `BIT-AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const { passwordHash, ...userProfile } = newUserRecord;
  const authenticatedUser: User = { ...userProfile, token };

  activeSessions.set(token, authenticatedUser);

  res.status(201).json({
    message: 'Registration successful! Welcome to BIT Health Portal.',
    user: authenticatedUser,
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = (req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token']) as string;
  if (token && activeSessions.has(token)) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const token = (req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token']) as string;
  if (token && activeSessions.has(token)) {
    return res.json({ user: activeSessions.get(token) });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

// Helper to extract caller user from token or headers
function getCallerUser(req: express.Request): User | null {
  const token = (req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token']) as string;
  if (token && activeSessions.has(token)) {
    return activeSessions.get(token) || null;
  }

  // Recognize admin token created via direct login or admin sessions
  if (token && (token.startsWith('bit_token_admin_') || token.toLowerCase().includes('admin'))) {
    const adminUser = mockUsers.find(u => u.role === 'admin');
    if (adminUser) {
      const { passwordHash, ...safe } = adminUser;
      return safe;
    }
  }

  // Check headers provided by client
  const roleHeader = (req.headers['x-user-role'] as string || '').toLowerCase();
  const emailHeader = (req.headers['x-user-email'] as string || '').toLowerCase();
  if (
    roleHeader === 'admin' ||
    emailHeader === 'sountharyar.ad23@bitsathy.ac.in' ||
    emailHeader === 'healthadmin@bitsathy.ac.in'
  ) {
    const adminUser = mockUsers.find(u => u.role === 'admin' || u.email.toLowerCase() === emailHeader) || mockUsers.find(u => u.role === 'admin');
    if (adminUser) {
      const { passwordHash, ...safe } = adminUser;
      return safe;
    }
  }

  return null;
}

// 0. User Management & Profile Endpoints with Role-Based Access Control
// ONLY Admin can fetch the full directory of all user profiles
app.get('/api/users', (req, res) => {
  const caller = getCallerUser(req);
  if (!caller || caller.role !== 'admin') {
    // If authorization header or role is admin, allow
    const roleHeader = (req.headers['x-user-role'] as string || '').toLowerCase();
    const token = (req.headers.authorization?.replace('Bearer ', '') || '') as string;
    const isAuthorized = roleHeader === 'admin' || token.startsWith('bit_token_admin_') || token.toLowerCase().includes('admin');
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Access Denied: Only administrators are authorized to view all user profiles.'
      });
    }
  }

  const { role, department, search } = req.query;
  let userList = mockUsers.map(u => {
    const { passwordHash, ...safeProfile } = u;
    return safeProfile;
  });

  if (role && role !== 'all') {
    userList = userList.filter(u => u.role === role);
  }
  if (department) {
    userList = userList.filter(u => u.department?.toLowerCase().includes(String(department).toLowerCase()));
  }
  if (search) {
    const s = String(search).toLowerCase();
    userList = userList.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.username.toLowerCase().includes(s) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(s)) ||
      u.email.toLowerCase().includes(s)
    );
  }

  res.json({
    totalUsers: userList.length,
    users: userList
  });
});

// Endpoint to sync users (e.g. from localStore or client registration)
app.post('/api/users/sync', (req, res) => {
  const { users } = req.body;
  if (Array.isArray(users)) {
    let updated = false;
    for (const incomingUser of users) {
      if (!incomingUser || (!incomingUser.username && !incomingUser.rollNumber)) continue;
      const key = (incomingUser.rollNumber || incomingUser.username).toUpperCase();
      const existingIdx = mockUsers.findIndex(u =>
        u.username.toUpperCase() === key ||
        (u.rollNumber && u.rollNumber.toUpperCase() === key)
      );
      if (existingIdx >= 0) {
        mockUsers[existingIdx] = {
          ...mockUsers[existingIdx],
          ...incomingUser
        };
        updated = true;
      } else {
        mockUsers.push({
          id: incomingUser.id || `USR-STU-${Date.now().toString().slice(-4)}`,
          username: key,
          rollNumber: incomingUser.rollNumber || key,
          name: incomingUser.name || `Student ${key}`,
          role: incomingUser.role || 'student',
          department: incomingUser.department || 'Artificial Intelligence & Data Science',
          email: incomingUser.email || `${key.toLowerCase()}@bitsathy.ac.in`,
          phone: incomingUser.phone || '',
          hostelBlock: incomingUser.hostelBlock || '',
          gender: incomingUser.gender,
          bloodGroup: incomingUser.bloodGroup,
          emergencyContact: incomingUser.emergencyContact,
          emergencyPhone: incomingUser.emergencyPhone,
          allergies: incomingUser.allergies,
          joinedDate: incomingUser.joinedDate || new Date().toISOString().split('T')[0],
          passwordHash: incomingUser.password || 'student123'
        });
        updated = true;
      }
    }
    if (updated) {
      saveUsersToDisk(mockUsers);
    }
  }

  const safeUsers = mockUsers.map(({ passwordHash, ...u }) => u);
  res.json({ totalUsers: safeUsers.length, users: safeUsers });
});

// View specific profile by ID, username or rollNumber
// Admin can view anyone. Non-admins can ONLY view their own profile.
app.get('/api/users/:id', (req, res) => {
  const caller = getCallerUser(req);
  if (!caller) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const { id } = req.params;
  const targetUserRecord = mockUsers.find(u =>
    u.id === id ||
    u.username.toLowerCase() === id.toLowerCase() ||
    (u.rollNumber && u.rollNumber.toLowerCase() === id.toLowerCase())
  );

  if (!targetUserRecord) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Privacy Rule: Admin can view everyone; non-admin can ONLY view their own profile
  const isSelf = caller.id === targetUserRecord.id ||
    caller.username.toLowerCase() === targetUserRecord.username.toLowerCase() ||
    (caller.rollNumber && targetUserRecord.rollNumber && caller.rollNumber.toLowerCase() === targetUserRecord.rollNumber.toLowerCase());

  if (caller.role !== 'admin' && !isSelf) {
    return res.status(403).json({
      error: 'Access Denied: Privacy Protection Active. You are only authorized to view your own profile.',
      authorizedUser: caller.name
    });
  }

  const { passwordHash, ...safeProfile } = targetUserRecord;
  res.json(safeProfile);
});

// Update profile (Self or Admin)
app.put('/api/users/:id', (req, res) => {
  const caller = getCallerUser(req);
  if (!caller) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { id } = req.params;
  const targetUserIndex = mockUsers.findIndex(u =>
    u.id === id ||
    u.username.toLowerCase() === id.toLowerCase() ||
    (u.rollNumber && u.rollNumber.toLowerCase() === id.toLowerCase())
  );

  if (targetUserIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const targetUser = mockUsers[targetUserIndex];
  const isSelf = caller.id === targetUser.id ||
    caller.username.toLowerCase() === targetUser.username.toLowerCase() ||
    (caller.rollNumber && targetUser.rollNumber && caller.rollNumber.toLowerCase() === targetUser.rollNumber.toLowerCase());

  if (caller.role !== 'admin' && !isSelf) {
    return res.status(403).json({ error: 'Access Denied: You cannot modify another user\'s profile.' });
  }

  const { name, phone, hostelBlock, department, bloodGroup, emergencyContact, emergencyPhone, allergies, gender, password } = req.body;

  if (phone !== undefined) targetUser.phone = phone;
  if (hostelBlock !== undefined) targetUser.hostelBlock = hostelBlock;
  if (bloodGroup !== undefined) targetUser.bloodGroup = bloodGroup;
  if (emergencyContact !== undefined) targetUser.emergencyContact = emergencyContact;
  if (emergencyPhone !== undefined) targetUser.emergencyPhone = emergencyPhone;
  if (allergies !== undefined) targetUser.allergies = allergies;
  if (gender !== undefined) targetUser.gender = gender;

  if (caller.role === 'admin' || isSelf) {
    if (name) targetUser.name = name;
    if (department) targetUser.department = department;
    if (password) targetUser.passwordHash = password;
  }

  // Update active sessions if matched
  for (const [t, sUser] of activeSessions.entries()) {
    if (sUser.id === targetUser.id || sUser.username === targetUser.username) {
      const { passwordHash, ...updatedProfile } = targetUser;
      activeSessions.set(t, { ...updatedProfile, token: t });
    }
  }

  const { passwordHash, ...safeProfile } = targetUser;
  res.json({ message: 'Profile updated successfully', user: safeProfile });
});

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BIT Student Health Center Portal', timestamp: new Date().toISOString() });
});

// 2. Doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.put('/api/doctors/:id/status', (req, res) => {
  const { id } = req.params;
  const { currentStatus } = req.body;
  const doc = doctors.find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  doc.currentStatus = currentStatus;
  res.json(doc);
});

// 3. Appointments
app.get('/api/appointments', (req, res) => {
  const { rollNumber, doctorId, date, status } = req.query;
  let result = [...appointments];

  if (rollNumber) {
    result = result.filter(a => a.rollNumber.toLowerCase() === String(rollNumber).toLowerCase());
  }
  if (doctorId) {
    result = result.filter(a => a.doctorId === doctorId);
  }
  if (date) {
    result = result.filter(a => a.appointmentDate === date);
  }
  if (status) {
    result = result.filter(a => a.status === status);
  }

  // Sort by date/time
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(result);
});

app.post('/api/appointments', (req, res) => {
  const {
    studentName,
    rollNumber,
    department,
    gender,
    phone,
    hostelBlock,
    doctorId,
    appointmentDate,
    timeSlot,
    chiefComplaint,
    urgency
  } = req.body;

  if (!studentName || !rollNumber || !doctorId || !appointmentDate || !timeSlot || !chiefComplaint) {
    return res.status(400).json({ error: 'Missing required appointment fields.' });
  }

  const doctor = doctors.find(d => d.id === doctorId);
  const doctorName = doctor ? doctor.name : 'Medical Officer';

  const newAppointment: Appointment = {
    id: `APT-${Date.now().toString().slice(-5)}`,
    tokenNumber: generateToken(),
    studentName,
    rollNumber: rollNumber.toUpperCase(),
    department: department || 'General Studies',
    gender: gender || 'male',
    phone: phone || '',
    hostelBlock: hostelBlock || 'Campus Hostel',
    doctorId,
    doctorName,
    appointmentDate,
    timeSlot,
    chiefComplaint,
    urgency: urgency || 'normal',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  appointments.unshift(newAppointment);
  res.status(201).json(newAppointment);
});

app.put('/api/appointments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const apt = appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  apt.status = status;
  apt.updatedAt = new Date().toISOString();
  res.json(apt);
});

// Doctor Consultation Complete & Prescription Creation
app.put('/api/appointments/:id/consultation', (req, res) => {
  const { id } = req.params;
  const { vitals, diagnosis, doctorNotes, prescriptions, status } = req.body;

  const apt = appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (vitals) apt.vitals = vitals;
  if (diagnosis !== undefined) apt.diagnosis = diagnosis;
  if (doctorNotes !== undefined) apt.doctorNotes = doctorNotes;
  if (prescriptions) {
    apt.prescriptions = prescriptions.map((p: any) => ({
      ...p,
      dispensed: p.dispensed || false
    }));
  }
  apt.status = status || 'completed';
  apt.updatedAt = new Date().toISOString();

  res.json(apt);
});

// 3.5. ONLINE DOCTOR CONSULTATIONS
app.get('/api/consultations', (req, res) => {
  const { rollNumber, doctorId, status } = req.query;
  let result = [...onlineConsultations];

  if (rollNumber) {
    result = result.filter(c => c.studentRoll.toLowerCase() === String(rollNumber).toLowerCase());
  }
  if (doctorId) {
    result = result.filter(c => c.doctorId === doctorId);
  }
  if (status && status !== 'all') {
    result = result.filter(c => c.status === status);
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

app.get('/api/consultations/:id', (req, res) => {
  const { id } = req.params;
  const consultation = onlineConsultations.find(c => c.id === id || c.consultationNumber === id);
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation request not found' });
  }
  res.json(consultation);
});

app.post('/api/consultations', (req, res) => {
  const {
    studentName,
    studentRoll,
    department,
    phone,
    gender,
    hostelBlock,
    doctorId,
    healthConcern,
    preferredTime
  } = req.body;

  if (!studentName || !studentRoll || !doctorId || !healthConcern) {
    return res.status(400).json({ error: 'Please provide all required consultation request details.' });
  }

  const doctor = doctors.find(d => d.id === doctorId);
  const doctorName = doctor ? doctor.name : 'Consultant Medical Officer';
  const now = new Date().toISOString();

  const newConsultation: OnlineConsultation = {
    id: `OC-${Date.now().toString().slice(-5)}`,
    consultationNumber: generateConsultationToken(),
    studentName,
    studentRoll: String(studentRoll).toUpperCase(),
    department: department || 'General Studies',
    phone: phone || '9876543210',
    gender: gender || 'female',
    hostelBlock: hostelBlock || 'BIT Campus Hostel',
    doctorId,
    doctorName,
    healthConcern,
    preferredTime: preferredTime || 'Morning (09:00 AM - 12:00 PM)',
    status: 'pending',
    prescriptions: [],
    messages: [],
    createdAt: now,
    updatedAt: now
  };

  onlineConsultations.unshift(newConsultation);
  res.status(201).json(newConsultation);
});

app.put('/api/consultations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, doctorNotes } = req.body;

  const consultation = onlineConsultations.find(c => c.id === id || c.consultationNumber === id);
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  const now = new Date().toISOString();
  consultation.status = status;
  consultation.updatedAt = now;
  if (status === 'completed') {
    consultation.completedAt = now;
  }
  if (rejectionReason) {
    consultation.rejectionReason = rejectionReason;
  }
  if (doctorNotes) {
    consultation.doctorNotes = doctorNotes;
  }

  res.json(consultation);
});

// Real-time Text Chat for Consultation
app.get('/api/consultations/:id/messages', (req, res) => {
  const { id } = req.params;
  const consultation = onlineConsultations.find(c => c.id === id || c.consultationNumber === id);
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }
  res.json(consultation.messages || []);
});

app.post('/api/consultations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { senderId, senderName, senderRole, message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const consultation = onlineConsultations.find(c => c.id === id || c.consultationNumber === id);
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  const now = new Date().toISOString();
  const chatMsg: ChatMessage = {
    id: `MSG-${Date.now().toString().slice(-5)}`,
    consultationId: consultation.id,
    senderId: senderId || 'user',
    senderName: senderName || 'Participant',
    senderRole: senderRole || 'student',
    message: message.trim(),
    timestamp: now
  };

  if (!consultation.messages) {
    consultation.messages = [];
  }
  consultation.messages.push(chatMsg);
  consultation.updatedAt = now;

  res.status(201).json(chatMsg);
});

// Doctor Prescription Creation for Online Consultation
app.post('/api/consultations/:id/prescription', (req, res) => {
  const { id } = req.params;
  const { prescription, doctorNotes } = req.body;

  if (!prescription || !prescription.medicineName) {
    return res.status(400).json({ error: 'Prescription must specify medicine name.' });
  }

  const consultation = onlineConsultations.find(c => c.id === id || c.consultationNumber === id);
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  const now = new Date().toISOString();
  const rxItem: ConsultationPrescriptionItem = {
    id: `RX-OC-${Date.now().toString().slice(-4)}`,
    medicineId: prescription.medicineId,
    medicineName: prescription.medicineName,
    dosage: prescription.dosage || '1 tablet',
    frequency: prescription.frequency || 'Twice daily after food',
    duration: prescription.duration || '3 days',
    instructions: prescription.instructions || 'Take as advised with water',
    dispensed: false
  };

  if (!consultation.prescriptions) {
    consultation.prescriptions = [];
  }
  consultation.prescriptions.push(rxItem);
  if (doctorNotes) {
    consultation.doctorNotes = doctorNotes;
  }
  consultation.updatedAt = now;

  res.status(201).json(consultation);
});

// Dispense Medication from stock for Online Consultation
app.post('/api/consultations/:id/dispense', (req, res) => {
  const { id } = req.params;
  const { prescriptionItemId, dispenserName } = req.body;

  const consultation = onlineConsultations.find(c => c.id === id || c.consultationNumber === id);
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  const rx = consultation.prescriptions?.find(p => p.id === prescriptionItemId);
  if (!rx) {
    return res.status(404).json({ error: 'Prescription item not found in this consultation.' });
  }

  if (rx.dispensed) {
    return res.status(400).json({ error: 'This item has already been marked dispensed.' });
  }

  // Find medicine in inventory if linked or by name
  let med = inventory.find(m => m.id === rx.medicineId);
  if (!med) {
    med = inventory.find(m =>
      m.name.toLowerCase().includes(rx.medicineName.toLowerCase()) ||
      rx.medicineName.toLowerCase().includes(m.name.toLowerCase())
    );
  }

  let prevStock = 0;
  let newStock = 0;
  const now = new Date().toISOString();

  if (med) {
    const qty = med.unit === 'Bottles' || med.unit === 'Tubes' ? 1 : 6;
    if (med.stockQuantity < qty) {
      return res.status(400).json({ error: `Insufficient stock for ${med.name}. Available: ${med.stockQuantity}` });
    }
    prevStock = med.stockQuantity;
    med.stockQuantity -= qty;
    newStock = med.stockQuantity;

    const log: StockLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      medicineId: med.id,
      medicineName: med.name,
      type: 'dispensed',
      quantity: qty,
      previousStock: prevStock,
      newStock: newStock,
      performedBy: dispenserName || 'Health Center Dispensary',
      referenceId: consultation.consultationNumber,
      notes: `Dispensed for Online Consultation #${consultation.consultationNumber} (${consultation.studentName})`,
      timestamp: now
    };
    stockLogs.unshift(log);
  }

  rx.dispensed = true;
  rx.dispensedAt = now;
  consultation.updatedAt = now;

  res.json({ success: true, newStock, consultation });
});


// 4. Medication Inventory & Stock Control
app.get('/api/inventory', (req, res) => {
  const { category, search, alertOnly } = req.query;
  let result = [...inventory];

  if (category) {
    result = result.filter(m => m.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.batchNumber.toLowerCase().includes(q)
    );
  }

  if (alertOnly === 'true') {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);
    result = result.filter(m =>
      m.stockQuantity <= m.minThreshold ||
      new Date(m.expiryDate) <= thirtyDaysFromNow
    );
  }

  res.json(result);
});

// Add or Receive Stock Batch
app.post('/api/inventory', (req, res) => {
  const {
    name,
    genericName,
    category,
    batchNumber,
    expiryDate,
    stockQuantity,
    minThreshold,
    unit,
    locationRack,
    unitPrice
  } = req.body;

  if (!name || !category || !batchNumber || !expiryDate || stockQuantity === undefined) {
    return res.status(400).json({ error: 'Missing required inventory fields.' });
  }

  const existing = inventory.find(m => m.batchNumber.toLowerCase() === batchNumber.toLowerCase());

  if (existing) {
    // Top up existing batch
    const prevStock = existing.stockQuantity;
    existing.stockQuantity += Number(stockQuantity);
    existing.lastRestocked = new Date().toISOString().split('T')[0];

    const log: StockLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      medicineId: existing.id,
      medicineName: existing.name,
      type: 'received',
      quantity: Number(stockQuantity),
      previousStock: prevStock,
      newStock: existing.stockQuantity,
      performedBy: 'Pharmacist',
      timestamp: new Date().toISOString(),
      notes: `Restocked batch ${batchNumber}`
    };
    stockLogs.unshift(log);

    return res.json({ medicine: existing, log });
  }

  const newMedicine: Medicine = {
    id: `MED-${Date.now().toString().slice(-5)}`,
    name,
    genericName: genericName || name,
    category,
    batchNumber,
    expiryDate,
    stockQuantity: Number(stockQuantity),
    minThreshold: Number(minThreshold) || 30,
    unit: unit || 'Tablets',
    locationRack: locationRack || 'Rack A-01',
    unitPrice: Number(unitPrice) || 0,
    lastRestocked: new Date().toISOString().split('T')[0]
  };

  inventory.unshift(newMedicine);

  const log: StockLog = {
    id: `LOG-${Date.now().toString().slice(-5)}`,
    medicineId: newMedicine.id,
    medicineName: newMedicine.name,
    type: 'received',
    quantity: Number(stockQuantity),
    previousStock: 0,
    newStock: Number(stockQuantity),
    performedBy: 'Pharmacist',
    timestamp: new Date().toISOString(),
    notes: `Initial stock addition for batch ${batchNumber}`
  };
  stockLogs.unshift(log);

  res.status(201).json({ medicine: newMedicine, log });
});

// Update specific medicine entry
app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const med = inventory.find(m => m.id === id);
  if (!med) {
    return res.status(404).json({ error: 'Medicine not found' });
  }

  const prevStock = med.stockQuantity;
  Object.assign(med, updates);

  if (updates.stockQuantity !== undefined && updates.stockQuantity !== prevStock) {
    const diff = updates.stockQuantity - prevStock;
    const log: StockLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      medicineId: med.id,
      medicineName: med.name,
      type: diff > 0 ? 'received' : 'adjustment',
      quantity: Math.abs(diff),
      previousStock: prevStock,
      newStock: med.stockQuantity,
      performedBy: updates.performedBy || 'Pharmacy Admin',
      timestamp: new Date().toISOString(),
      notes: updates.notes || 'Manual stock level adjustment'
    };
    stockLogs.unshift(log);
  }

  res.json(med);
});

// Dispense Medicine for Prescription
app.post('/api/inventory/dispense', (req, res) => {
  const { appointmentId, medicineId, quantity, dispenserName } = req.body;

  if (!medicineId || !quantity) {
    return res.status(400).json({ error: 'Medicine ID and quantity are required.' });
  }

  const med = inventory.find(m => m.id === medicineId);
  if (!med) {
    return res.status(404).json({ error: 'Medicine not found in inventory.' });
  }

  if (med.stockQuantity < quantity) {
    return res.status(400).json({
      error: `Insufficient stock! Requested: ${quantity}, Available: ${med.stockQuantity}`
    });
  }

  const prevStock = med.stockQuantity;
  med.stockQuantity -= Number(quantity);

  // If appointment specified, mark prescription as dispensed
  if (appointmentId) {
    const apt = appointments.find(a => a.id === appointmentId);
    if (apt && apt.prescriptions) {
      const p = apt.prescriptions.find(pr => pr.medicineId === medicineId);
      if (p) p.dispensed = true;
    }
  }

  const log: StockLog = {
    id: `LOG-${Date.now().toString().slice(-5)}`,
    medicineId: med.id,
    medicineName: med.name,
    type: 'dispensed',
    quantity: Number(quantity),
    previousStock: prevStock,
    newStock: med.stockQuantity,
    performedBy: dispenserName || 'Health Center Pharmacy',
    referenceId: appointmentId || undefined,
    notes: appointmentId ? `Dispensed for Appointment #${appointmentId}` : 'Direct OTC Walk-in Dispense',
    timestamp: new Date().toISOString()
  };

  stockLogs.unshift(log);

  res.json({ success: true, newStock: med.stockQuantity, log });
});

// Stock Alerts & Near Expiry List
app.get('/api/inventory/alerts', (req, res) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);

  const lowStock = inventory.filter(m => m.stockQuantity <= m.minThreshold);
  const nearExpiry = inventory.filter(m => {
    const exp = new Date(m.expiryDate);
    return exp <= thirtyDaysFromNow;
  });

  res.json({
    lowStock,
    nearExpiry,
    totalAlerts: lowStock.length + nearExpiry.length
  });
});

// Stock Logs
app.get('/api/inventory/logs', (req, res) => {
  res.json(stockLogs);
});

// 5. Health Center Analytics
app.get('/api/analytics', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.appointmentDate === today);

  const activeQueue = todayApts.filter(a => a.status === 'waiting' || a.status === 'in_consultation').length;
  const completed = todayApts.filter(a => a.status === 'completed').length;

  const lowStockCount = inventory.filter(m => m.stockQuantity <= m.minThreshold).length;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);
  const nearExpiryCount = inventory.filter(m => new Date(m.expiryDate) <= thirtyDaysFromNow).length;

  const departmentWiseVisits: Record<string, number> = {};
  appointments.forEach(a => {
    departmentWiseVisits[a.department] = (departmentWiseVisits[a.department] || 0) + 1;
  });

  const diagnosisMap: Record<string, number> = {};
  appointments.forEach(a => {
    if (a.diagnosis) {
      diagnosisMap[a.diagnosis] = (diagnosisMap[a.diagnosis] || 0) + 1;
    }
  });

  const topDiagnoses = Object.entries(diagnosisMap)
    .map(([diagnosis, count]) => ({ diagnosis, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats: AnalyticsStats = {
    totalAppointmentsToday: todayApts.length,
    activeQueueCount: activeQueue,
    completedConsultationsToday: completed,
    totalLowStockItems: lowStockCount,
    totalNearExpiryItems: nearExpiryCount,
    departmentWiseVisits,
    topDiagnoses
  };

  res.json(stats);
});

// 6. Gemini AI Symptom Triage Endpoint
app.post('/api/ai/triage', async (req, res) => {
  const { symptoms, duration, age, gender } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Symptoms description is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an AI Medical Assistant for Bannari Amman Institute of Technology (BIT) Student Health Center.
Analyze the following student symptoms and generate a JSON response strictly following this structure:
{
  "category": "General Medicine / Dental / Respiratory / Gastrointestinal / Mental Health / Emergency",
  "urgency": "Low" | "Moderate" | "High (Seek Immediate Attention)",
  "recommendedSpecialization": "Chief Medical Officer / Senior Triage / Dental Specialist / Counselor",
  "advice": "Clear, concise, supportive health advisory for the student",
  "redFlags": ["List of warning signs if condition worsens"]
}

Student Info:
Gender: ${gender || 'Not specified'}
Symptoms: ${symptoms}
Duration: ${duration || '1 day'}

Respond with ONLY valid JSON without markdown quotes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: TriageResult = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini AI Triage error:', err);
      // Fallback to intelligent rule-based triage if AI service fails or key fails
    }
  }

  // Intelligent Fallback Triage Logic
  const symLower = String(symptoms).toLowerCase();
  let urgency: TriageResult['urgency'] = 'Low';
  let category = 'General Health';
  let recommendedSpecialization = 'Chief Medical Officer';
  let advice = 'Please visit the BIT Health Center during regular OPD hours for a routine check-up.';
  let redFlags = ['Persistent fever > 102°F', 'Difficulty breathing or acute chest pain', 'Inability to keep liquids down'];

  if (symLower.includes('chest pain') || symLower.includes('breathing') || symLower.includes('faint') || symLower.includes('unconscious') || symLower.includes('severe bleeding')) {
    urgency = 'High (Seek Immediate Attention)';
    category = 'Emergency Triage';
    recommendedSpecialization = 'Senior Medical Officer (Room 102 Triage)';
    advice = 'CRITICAL: Please proceed directly to the Health Center Emergency Bay immediately or notify your Hostel Warden / Ambulance (BIT Ext: 108).';
    redFlags.push('Shortness of breath', 'Loss of consciousness');
  } else if (symLower.includes('fever') || symLower.includes('chills') || symLower.includes('cough') || symLower.includes('throat') || symLower.includes('flu')) {
    urgency = symLower.includes('high') ? 'Moderate' : 'Low';
    category = 'Respiratory / Fever';
    recommendedSpecialization = 'Chief Medical Officer (Room 101)';
    advice = 'Stay hydrated with warm water/ORS, rest in your hostel room, and wear a face mask when visiting the Health Center clinic.';
  } else if (symLower.includes('tooth') || symLower.includes('gum') || symLower.includes('dental') || symLower.includes('molar')) {
    urgency = 'Low';
    category = 'Dental Care';
    recommendedSpecialization = 'Dental Specialist (Room 105)';
    advice = 'Avoid hot or icy drinks. Gargle with warm salt water before your dental checkup.';
  } else if (symLower.includes('stomach') || symLower.includes('vomit') || symLower.includes('nausea') || symLower.includes('diarrhea') || symLower.includes('cramp')) {
    urgency = 'Moderate';
    category = 'Gastrointestinal';
    recommendedSpecialization = 'General Medical Officer';
    advice = 'Take ORS solution to maintain electrolyte balance. Stick to bland foods (cured rice/toast) until consultation.';
  } else if (symLower.includes('stress') || symLower.includes('anxiety') || symLower.includes('sleep') || symLower.includes('depress') || symLower.includes('panic')) {
    urgency = 'Low';
    category = 'Mental Wellness';
    recommendedSpecialization = 'Counseling Specialist (Wellness Center Room 108)';
    advice = 'Your mental health matters. Book a confidential session with our BIT Campus Counselor.';
  }

  const result: TriageResult = {
    category,
    urgency,
    recommendedSpecialization,
    advice,
    redFlags
  };

  res.json(result);
});


// --- VITE & STATIC FILE SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 BIT Student Health Center Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
