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
  ConsultationPrescriptionItem
} from '../types';
import {
  authenticateLocalUser,
  registerLocalStudent,
  getLocalDoctors,
  updateLocalDoctorStatus,
  getLocalAppointments,
  addLocalAppointment,
  updateLocalAppointment,
  getLocalInventory,
  updateLocalMedicine,
  dispenseLocalMedicine,
  getLocalStockAlerts,
  getLocalStockLogs,
  getLocalAnalytics,
  evaluateLocalTriage,
  getStoredUsers,
  saveStoredUser,
  getLocalConsultations,
  getLocalConsultationById,
  addLocalConsultation,
  updateLocalConsultationStatus,
  addLocalChatMessage,
  addLocalConsultationPrescription,
  dispenseLocalConsultationMedicine
} from './localStore';
import { fetchFirestoreUsers, syncUserToFirestore } from './firebaseService';

export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (res.ok) {
      return await res.json();
    }

    // If endpoint is 404 (e.g. running on Vercel without Node.js backend), seamlessly authenticate using localStore
    if (res.status === 404) {
      return authenticateLocalUser(credentials);
    }

    if (res.status === 401) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Incorrect password or account not found.');
    }

    const err = await res.json().catch(() => ({}));
    if (err.error) throw new Error(err.error);
    return authenticateLocalUser(credentials);
  } catch (err: any) {
    if (err.message && (err.message.includes('password') || err.message.includes('not found') || err.message.includes('verify your credentials'))) {
      throw err;
    }
    // Network or static deployment fallback (Vercel)
    return authenticateLocalUser(credentials);
  }
}

export async function registerStudent(data: StudentRegisterData): Promise<{ user: User; token: string }> {
  // Always register in localStore first to ensure immediate offline & browser availability
  let localResult: { user: User; token: string };
  try {
    localResult = registerLocalStudent(data);
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      throw err;
    }
    // Continue
    localResult = {
      user: {
        id: `USR-STU-${Date.now().toString().slice(-4)}`,
        username: data.rollNumber.trim().toUpperCase(),
        rollNumber: data.rollNumber.trim().toUpperCase(),
        name: data.name.trim(),
        role: 'student',
        department: data.department || 'Artificial Intelligence & Data Science',
        email: data.email?.trim() || `${data.rollNumber.trim().toLowerCase()}@bitsathy.ac.in`,
        phone: data.phone?.trim() || '',
        hostelBlock: data.hostelBlock?.trim() || 'BIT Campus Hostel',
        joinedDate: new Date().toISOString().split('T')[0]
      },
      token: `BIT-AUTH-${Date.now()}`
    };
  }

  // Also sync to Firestore immediately
  syncUserToFirestore(localResult.user).catch(() => {});

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const serverResult = await res.json();
      saveStoredUser({
        ...serverResult.user,
        passwordHash: data.password
      });
      syncUserToFirestore(serverResult.user).catch(() => {});
      return serverResult;
    }

    if (res.status === 400) {
      const err = await res.json().catch(() => ({}));
      if (err.error && err.error.includes('already exists')) {
        throw new Error(err.error);
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      throw err;
    }
  }

  return localResult;
}

export async function logoutUser(token?: string): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }).catch(() => {});
}

export async function fetchCurrentUser(token: string): Promise<User> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {
    // ignore
  }

  // Fallback to cached user in localStorage
  const stored = localStorage.getItem('bit_health_user') || sessionStorage.getItem('bit_health_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  throw new Error('Session expired');
}

export async function fetchDoctors(): Promise<Doctor[]> {
  try {
    const res = await fetch('/api/doctors');
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return getLocalDoctors();
}

export async function updateDoctorStatus(id: string, currentStatus: Doctor['currentStatus']): Promise<Doctor> {
  try {
    const res = await fetch(`/api/doctors/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentStatus })
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return updateLocalDoctorStatus(id, currentStatus);
}

export async function fetchAppointments(params?: {
  rollNumber?: string;
  doctorId?: string;
  date?: string;
  status?: string;
}): Promise<Appointment[]> {
  try {
    const query = new URLSearchParams();
    if (params?.rollNumber) query.append('rollNumber', params.rollNumber);
    if (params?.doctorId) query.append('doctorId', params.doctorId);
    if (params?.date) query.append('date', params.date);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`/api/appointments?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return getLocalAppointments(params);
}

export async function bookAppointment(data: Partial<Appointment>): Promise<Appointment> {
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return addLocalAppointment(data);
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
  try {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return updateLocalAppointment(id, { status: status as any });
}

export async function saveConsultation(id: string, payload: {
  vitals?: any;
  diagnosis?: string;
  doctorNotes?: string;
  prescriptions?: any[];
  status?: string;
}): Promise<Appointment> {
  try {
    const res = await fetch(`/api/appointments/${id}/consultation`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return updateLocalAppointment(id, payload as Partial<Appointment>);
}

export async function fetchInventory(params?: {
  category?: string;
  search?: string;
  alertOnly?: boolean;
}): Promise<Medicine[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.alertOnly) query.append('alertOnly', 'true');

    const res = await fetch(`/api/inventory?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  let list = getLocalInventory();
  if (params?.category && params.category !== 'All') {
    list = list.filter(m => m.category === params.category);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(s) || m.genericName.toLowerCase().includes(s));
  }
  if (params?.alertOnly) {
    list = list.filter(m => m.stockQuantity <= m.minThreshold);
  }
  return list;
}

export async function addMedicineStock(data: Partial<Medicine>): Promise<{ medicine: Medicine; log: StockLog }> {
  try {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  const med: Medicine = {
    id: `MED-${Date.now().toString().slice(-4)}`,
    name: data.name || 'New Medicine',
    genericName: data.genericName || 'Generic Formulation',
    category: data.category || 'First Aid',
    batchNumber: data.batchNumber || 'BIT-2026-NEW',
    expiryDate: data.expiryDate || '2027-12-31',
    stockQuantity: data.stockQuantity || 100,
    minThreshold: data.minThreshold || 20,
    unit: data.unit || 'Tablets',
    locationRack: data.locationRack || 'Rack A-01',
    unitPrice: data.unitPrice || 0,
    lastRestocked: new Date().toISOString().split('T')[0]
  };
  const updated = updateLocalMedicine(med.id, med);
  const log: StockLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    medicineId: med.id,
    medicineName: med.name,
    type: 'received',
    quantity: med.stockQuantity,
    previousStock: 0,
    newStock: med.stockQuantity,
    performedBy: 'Lead Pharmacist',
    timestamp: new Date().toISOString()
  };
  return { medicine: updated, log };
}

export async function updateMedicine(id: string, updates: Partial<Medicine> & { performedBy?: string; notes?: string }): Promise<Medicine> {
  try {
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return updateLocalMedicine(id, updates);
}

export async function dispenseMedicine(payload: {
  appointmentId?: string;
  medicineId: string;
  quantity: number;
  dispenserName?: string;
}): Promise<{ success: boolean; newStock: number; log: StockLog }> {
  try {
    const res = await fetch('/api/inventory/dispense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return dispenseLocalMedicine(payload);
}

export async function fetchStockAlerts(): Promise<{ lowStock: Medicine[]; nearExpiry: Medicine[]; totalAlerts: number }> {
  try {
    const res = await fetch('/api/inventory/alerts');
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return getLocalStockAlerts();
}

export async function fetchStockLogs(): Promise<StockLog[]> {
  try {
    const res = await fetch('/api/inventory/logs');
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return getLocalStockLogs();
}

function getStoredToken(): string {
  return localStorage.getItem('bit_health_token') || sessionStorage.getItem('bit_health_token') || '';
}

export async function fetchUsersDirectory(params?: {
  role?: string;
  department?: string;
  search?: string;
}): Promise<{ totalUsers: number; users: User[] }> {
  const token = getStoredToken();
  const currentUserRaw = localStorage.getItem('bit_health_user') || sessionStorage.getItem('bit_health_user');
  let currentUser: User | null = null;
  if (currentUserRaw) {
    try {
      currentUser = JSON.parse(currentUserRaw);
    } catch {}
  }

  // 1. Fetch from server API
  let serverUsers: User[] = [];
  try {
    const query = new URLSearchParams();
    if (params?.role && params.role !== 'all') query.append('role', params.role);
    if (params?.department) query.append('department', params.department);
    if (params?.search) query.append('search', params.search);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    if (currentUser?.role) headers['x-user-role'] = currentUser.role;
    if (currentUser?.email) headers['x-user-email'] = currentUser.email;
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;

    const res = await fetch(`/api/users?${query.toString()}`, { headers });
    if (res.ok) {
      const data = await res.json();
      serverUsers = data.users || [];
    }
  } catch (e) {
    console.warn('Notice fetching server users directory:', e);
  }

  // 2. Fetch from Firestore users collection
  let firestoreUsers: User[] = [];
  try {
    firestoreUsers = await fetchFirestoreUsers();
  } catch (e) {
    console.warn('Notice fetching Firestore users directory:', e);
  }

  // 3. Fetch from local browser storage
  const stored = getStoredUsers();
  const storedUsers = stored.map(({ passwordHash, ...u }) => u);

  // 4. Merge all users into a unified map keyed by normalized register / roll number / username / email
  const userMap = new Map<string, User>();

  for (const u of storedUsers) {
    const key = (u.rollNumber || u.username || u.email || u.id).toUpperCase();
    userMap.set(key, u);
  }

  for (const u of serverUsers) {
    const key = (u.rollNumber || u.username || u.email || u.id).toUpperCase();
    const existing = userMap.get(key);
    userMap.set(key, existing ? { ...existing, ...u } : u);
  }

  for (const u of firestoreUsers) {
    const key = (u.rollNumber || u.username || u.email || u.id).toUpperCase();
    const existing = userMap.get(key);
    userMap.set(key, existing ? { ...existing, ...u } : u);
  }

  const allMergedUsers = Array.from(userMap.values());

  // Save any missing users back to localStore so offline cache is updated
  for (const u of allMergedUsers) {
    const isSaved = stored.some(
      su =>
        (su.rollNumber && u.rollNumber && su.rollNumber.toUpperCase() === u.rollNumber.toUpperCase()) ||
        su.username.toUpperCase() === (u.rollNumber || u.username).toUpperCase()
    );
    if (!isSaved) {
      saveStoredUser({
        ...u,
        passwordHash: 'student123'
      });
    }
  }

  // If server had fewer users than our merged total, sync users back to server
  if (serverUsers.length < allMergedUsers.length) {
    fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-role': currentUser?.role || 'admin'
      },
      body: JSON.stringify({ users: allMergedUsers })
    }).catch(() => {});
  }

  // 5. Apply filters
  let filtered = allMergedUsers;
  if (params?.role && params.role !== 'all') {
    filtered = filtered.filter(u => u.role === params.role);
  }
  if (params?.department) {
    const d = params.department.toLowerCase();
    filtered = filtered.filter(u => u.department?.toLowerCase().includes(d));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      u =>
        u.name.toLowerCase().includes(s) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(s)) ||
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.department && u.department.toLowerCase().includes(s)) ||
        (u.phone && u.phone.includes(s))
    );
  }

  return { totalUsers: filtered.length, users: filtered };
}

export async function fetchUserProfile(userIdOrRoll: string): Promise<User> {
  try {
    const token = getStoredToken();
    const res = await fetch(`/api/users/${encodeURIComponent(userIdOrRoll)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }

  const stored = getStoredUsers();
  const found = stored.find(u => u.id === userIdOrRoll || u.rollNumber?.toUpperCase() === userIdOrRoll.toUpperCase() || u.username.toLowerCase() === userIdOrRoll.toLowerCase());
  if (found) {
    const { passwordHash, ...safe } = found;
    return safe;
  }
  throw new Error('User profile not found.');
}

export async function updateUserProfile(userIdOrRoll: string, data: Partial<User> & { password?: string }): Promise<{ message: string; user: User }> {
  try {
    const token = getStoredToken();
    const res = await fetch(`/api/users/${encodeURIComponent(userIdOrRoll)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }

  const stored = getStoredUsers();
  const user = stored.find(u => u.id === userIdOrRoll || u.rollNumber?.toUpperCase() === userIdOrRoll.toUpperCase() || u.username.toLowerCase() === userIdOrRoll.toLowerCase());
  if (!user) throw new Error('User not found.');

  Object.assign(user, data);
  if (data.password) {
    user.passwordHash = data.password;
  }
  saveStoredUser(user);

  const { passwordHash, ...safe } = user;
  return { message: 'Profile updated successfully', user: safe };
}

export async function fetchAnalytics(): Promise<AnalyticsStats> {
  try {
    const res = await fetch('/api/analytics');
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return getLocalAnalytics();
}

export async function runAITriage(payload: {
  symptoms: string;
  duration?: string;
  age?: number;
  gender?: string;
}): Promise<TriageResult> {
  try {
    const res = await fetch('/api/ai/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return evaluateLocalTriage(payload);
}

// --- ONLINE DOCTOR CONSULTATION API METHODS ---

export async function fetchConsultations(params?: {
  rollNumber?: string;
  doctorId?: string;
  status?: string;
}): Promise<OnlineConsultation[]> {
  try {
    const query = new URLSearchParams();
    if (params?.rollNumber) query.append('rollNumber', params.rollNumber);
    if (params?.doctorId) query.append('doctorId', params.doctorId);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`/api/consultations?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return getLocalConsultations(params);
}

export async function fetchConsultationById(id: string): Promise<OnlineConsultation> {
  try {
    const res = await fetch(`/api/consultations/${id}`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  const local = getLocalConsultationById(id);
  if (!local) throw new Error('Consultation not found');
  return local;
}

export async function requestOnlineConsultation(data: Partial<OnlineConsultation>): Promise<OnlineConsultation> {
  try {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return addLocalConsultation(data);
}

export async function updateConsultationStatus(
  id: string,
  status: ConsultationStatus,
  extra?: { rejectionReason?: string; doctorNotes?: string }
): Promise<OnlineConsultation> {
  try {
    const res = await fetch(`/api/consultations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra })
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return updateLocalConsultationStatus(id, status, extra);
}

export async function sendChatMessage(
  consultationId: string,
  payload: {
    senderId: string;
    senderName: string;
    senderRole: 'student' | 'doctor';
    message: string;
  }
): Promise<ChatMessage> {
  try {
    const res = await fetch(`/api/consultations/${consultationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return addLocalChatMessage(consultationId, payload);
}

export async function fetchChatMessages(consultationId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`/api/consultations/${consultationId}/messages`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  const c = getLocalConsultationById(consultationId);
  return c?.messages || [];
}

export async function addConsultationPrescription(
  consultationId: string,
  prescription: Omit<ConsultationPrescriptionItem, 'id'>,
  doctorNotes?: string
): Promise<OnlineConsultation> {
  try {
    const res = await fetch(`/api/consultations/${consultationId}/prescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prescription, doctorNotes })
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return addLocalConsultationPrescription(consultationId, prescription, doctorNotes);
}

export async function dispenseConsultationPrescription(
  consultationId: string,
  prescriptionItemId: string,
  dispenserName?: string
): Promise<{ success: boolean; newStock: number; log: StockLog }> {
  try {
    const res = await fetch(`/api/consultations/${consultationId}/dispense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prescriptionItemId, dispenserName })
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return dispenseLocalConsultationMedicine(consultationId, prescriptionItemId, dispenserName);
}
