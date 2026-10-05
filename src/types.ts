export type Role = 'student' | 'doctor' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  username: string; // Roll number or Staff ID
  name: string;
  role: Role;
  department?: string;
  rollNumber?: string;
  email: string;
  phone?: string;
  hostelBlock?: string;
  avatarUrl?: string;
  token?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string;
  gender?: 'male' | 'female' | 'other';
  roomNo?: string;
  qualification?: string;
  specialization?: string;
  joinedDate?: string;
}

export interface LoginCredentials {
  identifier: string; // Roll number, Staff ID, or Email
  password: string;
  role: Role;
}

export interface StudentRegisterData {
  rollNumber: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  hostelBlock: string;
  password: string;
}

export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';

export type AppointmentStatus = 'scheduled' | 'waiting' | 'in_consultation' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  roomNo: string;
  availableDays: string[];
  timeSlots: string[];
  currentStatus: 'available' | 'in_consultation' | 'on_break' | 'offline';
  photoUrl?: string;
}

export interface PrescribedMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string; // e.g. "1-0-1 after meals"
  durationDays: number;
  quantity: number;
  notes?: string;
  dispensed?: boolean;
}

export interface PatientVitals {
  bloodPressure?: string; // e.g. "120/80"
  pulseRate?: number; // bpm
  temperature?: number; // °F
  weight?: number; // kg
  spo2?: number; // %
  allergies?: string;
}

export interface Appointment {
  id: string;
  tokenNumber: string; // e.g. "BIT-HC-042"
  studentName: string;
  rollNumber: string; // e.g. "7376231AD101"
  department: string; // e.g. "Artificial Intelligence & Data Science"
  gender: 'male' | 'female' | 'other';
  phone: string;
  hostelBlock?: string; // e.g. "Valavan Hostel - Block B"
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  chiefComplaint: string;
  urgency: UrgencyLevel;
  status: AppointmentStatus;
  vitals?: PatientVitals;
  diagnosis?: string;
  doctorNotes?: string;
  prescriptions?: PrescribedMedicine[];
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotics' | 'Antipyretics' | 'Analgesics' | 'Anti-allergic' | 'First Aid' | 'Respiratory' | 'Digestive' | 'Ointments' | 'Nutritional';
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  stockQuantity: number;
  minThreshold: number;
  unit: 'Tablets' | 'Capsules' | 'Bottles' | 'Tubes' | 'Rolls' | 'Packets';
  locationRack: string; // e.g. "Rack A-03"
  unitPrice: number; // INR (0 if free for students)
  lastRestocked: string;
}

export interface StockLog {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'received' | 'dispensed' | 'expired_discard' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
  referenceId?: string; // Appointment ID or Purchase Order
  notes?: string;
  timestamp: string;
}

export interface AnalyticsStats {
  totalAppointmentsToday: number;
  activeQueueCount: number;
  completedConsultationsToday: number;
  totalLowStockItems: number;
  totalNearExpiryItems: number;
  departmentWiseVisits: Record<string, number>;
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
}

export interface TriageResult {
  category: string;
  urgency: 'Low' | 'Moderate' | 'High (Seek Immediate Attention)';
  recommendedSpecialization: string;
  advice: string;
  redFlags: string[];
}
