import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, signInWithGoogle, logoutFirebaseAuth, handleFirestoreError, OperationType } from '../firebase';
import { User, Role, Doctor, Appointment, Medicine, StockLog, AnalyticsStats } from '../types';

export const ADMIN_EMAILS = [
  'sountharyar.ad23@bitsathy.ac.in',
  'healthadmin@bitsathy.ac.in'
];

// Initial seed doctors
export const INITIAL_DOCTORS: Doctor[] = [
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

// Initial seed medicines
export const INITIAL_MEDICINES: Medicine[] = [
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

export async function initializeFirestoreSeed(): Promise<void> {
  try {
    // Check if doctors are seeded
    const doctorsPath = 'doctors';
    const docSnap = await getDocs(collection(db, doctorsPath)).catch(err => {
      handleFirestoreError(err, OperationType.GET, doctorsPath);
    });

    if (docSnap.empty) {
      for (const docItem of INITIAL_DOCTORS) {
        await setDoc(doc(db, doctorsPath, docItem.id), docItem).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `${doctorsPath}/${docItem.id}`);
        });
      }
    }

    // Check if medicines are seeded
    const medPath = 'medicines';
    const medSnap = await getDocs(collection(db, medPath)).catch(err => {
      handleFirestoreError(err, OperationType.GET, medPath);
    });

    if (medSnap.empty) {
      for (const medItem of INITIAL_MEDICINES) {
        await setDoc(doc(db, medPath, medItem.id), medItem).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `${medPath}/${medItem.id}`);
        });
      }
    }

    // Ensure admins registry has the designated administrator emails
    const adminsPath = 'admins';
    for (const email of ADMIN_EMAILS) {
      const sanitizedId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
      await setDoc(doc(db, adminsPath, sanitizedId), {
        email,
        role: 'admin',
        addedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }
  } catch (e) {
    console.warn('Firestore initial seeding note:', e);
  }
}

// Trigger initial seed non-blockingly
initializeFirestoreSeed().catch(() => {});

// Google Sign-In with Firebase Auth
export async function authenticateWithGoogle(): Promise<{ user: User; token: string }> {
  try {
    const cred = await signInWithGoogle();
    const fbUser = cred.user;
    const email = fbUser.email || '';
    const uid = fbUser.uid;

    // Determine Role
    let role: Role = 'student';
    if (ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().startsWith('healthadmin')) {
      role = 'admin';
    } else if (email.toLowerCase().includes('doctor') || email.toLowerCase().startsWith('dr')) {
      role = 'doctor';
    } else if (email.toLowerCase().includes('pharmacy') || email.toLowerCase().includes('pharm')) {
      role = 'pharmacist';
    }

    // Check if user record exists in Firestore
    const userDocRef = doc(db, 'users', uid);
    let userData: User;

    try {
      const existingDoc = await getDoc(userDocRef);
      if (existingDoc.exists()) {
        userData = existingDoc.data() as User;
      } else {
        // Build new user record
        const rollMatch = email.match(/([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)@bitsathy\.ac\.in/);
        const autoRoll = rollMatch ? rollMatch[1].toUpperCase() : uid.slice(0, 10).toUpperCase();

        userData = {
          id: uid,
          username: autoRoll,
          rollNumber: role === 'student' ? autoRoll : undefined,
          name: fbUser.displayName || 'BIT Member',
          role: role,
          email: email,
          department: role === 'student' ? 'Artificial Intelligence & Data Science' : 'Campus Health Unit',
          phone: fbUser.phoneNumber || '',
          avatarUrl: fbUser.photoURL || undefined,
          joinedDate: new Date().toISOString().split('T')[0]
        };

        await setDoc(userDocRef, userData);
      }
    } catch (readErr) {
      // In case of permission restriction on uninitialized user doc, fallback gracefully
      userData = {
        id: uid,
        username: email.split('@')[0],
        rollNumber: email.split('@')[0].toUpperCase(),
        name: fbUser.displayName || 'BIT Member',
        role: role,
        email: email,
        avatarUrl: fbUser.photoURL || undefined
      };
    }

    const token = await fbUser.getIdToken();
    return { user: userData, token };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
}

// Subscribe to Live Appointments
export function subscribeAppointments(
  callback: (appointments: Appointment[]) => void,
  filter?: { rollNumber?: string; doctorId?: string; status?: string }
): () => void {
  const collRef = collection(db, 'appointments');
  let q = query(collRef);

  if (filter?.rollNumber) {
    q = query(collRef, where('rollNumber', '==', filter.rollNumber));
  } else if (filter?.doctorId) {
    q = query(collRef, where('doctorId', '==', filter.doctorId));
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: Appointment[] = [];
      snapshot.forEach((d) => items.push(d.data() as Appointment));
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'appointments');
    }
  );

  return unsubscribe;
}

// Subscribe to Live Doctors
export function subscribeDoctors(callback: (doctors: Doctor[]) => void): () => void {
  const collRef = collection(db, 'doctors');
  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const items: Doctor[] = [];
      snapshot.forEach((d) => items.push(d.data() as Doctor));
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'doctors');
    }
  );
  return unsubscribe;
}

// Subscribe to Live Inventory
export function subscribeInventory(callback: (medicines: Medicine[]) => void): () => void {
  const collRef = collection(db, 'medicines');
  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const items: Medicine[] = [];
      snapshot.forEach((d) => items.push(d.data() as Medicine));
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'medicines');
    }
  );
  return unsubscribe;
}

// Subscribe to Stock Logs
export function subscribeStockLogs(callback: (logs: StockLog[]) => void): () => void {
  const collRef = collection(db, 'stock_logs');
  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const items: StockLog[] = [];
      snapshot.forEach((d) => items.push(d.data() as StockLog));
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'stock_logs');
    }
  );
  return unsubscribe;
}
