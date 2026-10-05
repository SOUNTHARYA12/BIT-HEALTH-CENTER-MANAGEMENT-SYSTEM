import {
  Doctor,
  Appointment,
  Medicine,
  StockLog,
  AnalyticsStats,
  TriageResult,
  User,
  LoginCredentials,
  StudentRegisterData
} from '../types';

export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Authentication failed');
  }
  return res.json();
}

export async function registerStudent(data: StudentRegisterData): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
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
  const res = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Session expired');
  const data = await res.json();
  return data.user;
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch('/api/doctors');
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function updateDoctorStatus(id: string, currentStatus: Doctor['currentStatus']): Promise<Doctor> {
  const res = await fetch(`/api/doctors/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentStatus })
  });
  if (!res.ok) throw new Error('Failed to update doctor status');
  return res.json();
}

export async function fetchAppointments(params?: {
  rollNumber?: string;
  doctorId?: string;
  date?: string;
  status?: string;
}): Promise<Appointment[]> {
  const query = new URLSearchParams();
  if (params?.rollNumber) query.append('rollNumber', params.rollNumber);
  if (params?.doctorId) query.append('doctorId', params.doctorId);
  if (params?.date) query.append('date', params.date);
  if (params?.status) query.append('status', params.status);

  const res = await fetch(`/api/appointments?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function bookAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to book appointment');
  }
  return res.json();
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update appointment status');
  return res.json();
}

export async function saveConsultation(id: string, payload: {
  vitals?: any;
  diagnosis?: string;
  doctorNotes?: string;
  prescriptions?: any[];
  status?: string;
}): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${id}/consultation`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save consultation notes');
  return res.json();
}

export async function fetchInventory(params?: {
  category?: string;
  search?: string;
  alertOnly?: boolean;
}): Promise<Medicine[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.alertOnly) query.append('alertOnly', 'true');

  const res = await fetch(`/api/inventory?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function addMedicineStock(data: Partial<Medicine>): Promise<{ medicine: Medicine; log: StockLog }> {
  const res = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add medicine stock');
  }
  return res.json();
}

export async function updateMedicine(id: string, updates: Partial<Medicine> & { performedBy?: string; notes?: string }): Promise<Medicine> {
  const res = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update medicine details');
  return res.json();
}

export async function dispenseMedicine(payload: {
  appointmentId?: string;
  medicineId: string;
  quantity: number;
  dispenserName?: string;
}): Promise<{ success: boolean; newStock: number; log: StockLog }> {
  const res = await fetch('/api/inventory/dispense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to dispense medicine');
  }
  return res.json();
}

export async function fetchStockAlerts(): Promise<{ lowStock: Medicine[]; nearExpiry: Medicine[]; totalAlerts: number }> {
  const res = await fetch('/api/inventory/alerts');
  if (!res.ok) throw new Error('Failed to fetch stock alerts');
  return res.json();
}

export async function fetchStockLogs(): Promise<StockLog[]> {
  const res = await fetch('/api/inventory/logs');
  if (!res.ok) throw new Error('Failed to fetch stock logs');
  return res.json();
}

function getStoredToken(): string {
  return localStorage.getItem('bit_health_token') || sessionStorage.getItem('bit_health_token') || '';
}

export async function fetchUsersDirectory(params?: {
  role?: string;
  department?: string;
  search?: string;
}): Promise<{ totalUsers: number; users: User[] }> {
  const query = new URLSearchParams();
  if (params?.role) query.append('role', params.role);
  if (params?.department) query.append('department', params.department);
  if (params?.search) query.append('search', params.search);

  const token = getStoredToken();
  const res = await fetch(`/api/users?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch user directory. Admin privileges required.');
  }
  return res.json();
}

export async function fetchUserProfile(userIdOrRoll: string): Promise<User> {
  const token = getStoredToken();
  const res = await fetch(`/api/users/${encodeURIComponent(userIdOrRoll)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch user profile.');
  }
  return res.json();
}

export async function updateUserProfile(userIdOrRoll: string, data: Partial<User> & { password?: string }): Promise<{ message: string; user: User }> {
  const token = getStoredToken();
  const res = await fetch(`/api/users/${encodeURIComponent(userIdOrRoll)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update profile.');
  }
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsStats> {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function runAITriage(payload: {
  symptoms: string;
  duration?: string;
  age?: number;
  gender?: string;
}): Promise<TriageResult> {
  const res = await fetch('/api/ai/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to perform AI symptom triage');
  return res.json();
}
