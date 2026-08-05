import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { Clinic, ClinicStatus } from '../types/clinic';
import { logAuditEvent } from './auditLogService';

const CLINICS_COLLECTION = 'clinics';

export const DEFAULT_CLINICS: Clinic[] = [
  {
    id: 'clinic-beverly-hills',
    name: 'Dentora Beverly Hills Laser & Aesthetic Dentistry',
    logo: '/logo.png',
    address: '9450 Wilshire Blvd, Suite 400, Beverly Hills, CA 90212',
    phone: '+1 (310) 555-0199',
    email: 'bh@dentora.clinic',
    website: 'https://bh.dentora.clinic',
    taxNumber: 'US-EIN-9840211',
    currency: 'USD',
    timezone: 'America/Los_Angeles (GMT-7)',
    workingHours: {
      openTime: '08:30 AM',
      closeTime: '06:00 PM',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    subscriptionPlan: 'Enterprise',
    subscriptionStatus: 'active',
    ownerId: 'user-owner-001',
    ownerName: 'Dr. Elena Rostova, MD',
    createdDate: '2026-01-15',
    status: 'active',
  },
  {
    id: 'clinic-lahore-gulberg',
    name: 'Dentora Specialist Dental Clinic & Orthodontic Center',
    logo: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=200&q=80',
    address: 'Main MM Alam Road, Block B2, Gulberg III, Lahore, Pakistan',
    phone: '+92 42 35789000',
    email: 'lahore@dentora.clinic',
    website: 'https://lahore.dentora.clinic',
    taxNumber: 'NTN-8920194-2',
    currency: 'PKR',
    timezone: 'Asia/Karachi (GMT+5)',
    workingHours: {
      openTime: '09:00 AM',
      closeTime: '09:00 PM',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    subscriptionPlan: 'Professional',
    subscriptionStatus: 'active',
    ownerId: 'user-owner-002',
    ownerName: 'Dr. Tariq Mahmood, BDS, FCPS',
    createdDate: '2026-02-01',
    status: 'active',
  },
  {
    id: 'clinic-dubai-downtown',
    name: 'Dentora Dubai Downtown Dental Lounge',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80',
    address: 'Boulevard Plaza Tower 1, Level 14, Downtown Dubai, UAE',
    phone: '+971 4 399 8812',
    email: 'dubai@dentora.clinic',
    website: 'https://dubai.dentora.clinic',
    taxNumber: 'UAE-TRN-10029301',
    currency: 'AED',
    timezone: 'Asia/Dubai (GMT+4)',
    workingHours: {
      openTime: '09:00 AM',
      closeTime: '08:00 PM',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    subscriptionPlan: 'Enterprise',
    subscriptionStatus: 'active',
    ownerId: 'user-owner-003',
    ownerName: 'Dr. Sophia Al-Mansoor',
    createdDate: '2026-03-10',
    status: 'active',
  }
];

export async function fetchAllClinics(): Promise<Clinic[]> {
  try {
    const querySnapshot = await getDocs(collection(db, CLINICS_COLLECTION));
    if (querySnapshot.empty) {
      // Seed default clinics if empty
      for (const c of DEFAULT_CLINICS) {
        await setDoc(doc(db, CLINICS_COLLECTION, c.id), c);
      }
      return DEFAULT_CLINICS;
    }
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Clinic));
  } catch (error) {
    console.warn('Firestore fetchAllClinics failed, falling back to local state:', error);
    return DEFAULT_CLINICS;
  }
}

export function subscribeToClinics(callback: (clinics: Clinic[]) => void) {
  const colRef = collection(db, CLINICS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // seed
        DEFAULT_CLINICS.forEach((c) => setDoc(doc(db, CLINICS_COLLECTION, c.id), c).catch(console.error));
        callback(DEFAULT_CLINICS);
      } else {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Clinic));
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, CLINICS_COLLECTION);
    }
  );
}

export async function createClinic(clinicData: Omit<Clinic, 'id' | 'createdDate'>, performedBy: string): Promise<Clinic> {
  try {
    const id = `clinic-${Date.now()}`;
    const newClinic: Clinic = {
      ...clinicData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
    };

    await setDoc(doc(db, CLINICS_COLLECTION, id), newClinic);

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Super Admin',
      action: 'Create Clinic',
      category: 'Clinic Management',
      details: `Created new tenant clinic: ${newClinic.name} (${newClinic.id})`,
      result: 'Success',
    });

    return newClinic;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLINICS_COLLECTION);
    throw error;
  }
}

export async function updateClinic(clinicId: string, updates: Partial<Clinic>, performedBy: string): Promise<void> {
  try {
    const docRef = doc(db, CLINICS_COLLECTION, clinicId);
    await updateDoc(docRef, updates);

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Update Clinic',
      category: 'Clinic Management',
      details: `Updated clinic ${clinicId} settings`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CLINICS_COLLECTION}/${clinicId}`);
    throw error;
  }
}

export async function setClinicStatus(clinicId: string, status: ClinicStatus, performedBy: string): Promise<void> {
  try {
    const docRef = doc(db, CLINICS_COLLECTION, clinicId);
    await updateDoc(docRef, { status });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Super Admin',
      action: `Set Clinic Status: ${status}`,
      category: 'Clinic Management',
      details: `Clinic ${clinicId} status updated to ${status}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CLINICS_COLLECTION}/${clinicId}`);
    throw error;
  }
}
