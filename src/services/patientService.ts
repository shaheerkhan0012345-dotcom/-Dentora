import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { PatientRecord, TimelineItem, MedicalNote, PatientStatus } from '../types/patient';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Patient Service Error:', JSON.stringify(errInfo));
}

export const initialSeedPatients: PatientRecord[] = [
  {
    id: 'PT-8801',
    patientId: 'PT-8801',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    fullName: 'Sarah Jenkins',
    gender: 'Female',
    dob: '1998-04-12',
    age: 28,
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    cnic: '42201-1234567-1',
    maritalStatus: 'Single',
    occupation: 'Software Designer',
    phone: '(555) 234-5678',
    whatsapp: '+15552345678',
    email: 'sarah.j@example.com',
    address: '142 Market Street, Suite 2B',
    city: 'Beverly Hills',
    postalCode: '90210',
    emergencyContact: 'David Jenkins (Father)',
    emergencyPhone: '(555) 999-1234',
    bloodGroup: 'O+',
    allergies: ['Penicillin Allergy', 'Latex Sensitivity'],
    medicalHistory: 'Mild asthma, seasonal pollen allergy.',
    currentMedication: 'Albuterol inhaler PRN',
    chronicDiseases: ['Mild Asthma'],
    smoking: 'Non-Smoker',
    pregnancyStatus: 'N/A',
    notes: 'Patient is on 3D Aligner Tray 12/18. Very compliant.',
    assignedDoctor: 'Dr. Elena Rostova',
    primaryDentist: 'Dr. Elena Rostova, MD',
    firstVisitDate: '2025-01-10',
    lastVisit: 'Aug 2, 2026',
    nextAppointment: 'Aug 16, 2026',
    preferredTime: 'Morning (9 AM - 12 PM)',
    status: 'Active',
    balance: 180,
    totalVisits: 14,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'PT-8802',
    patientId: 'PT-8802',
    firstName: 'Marcus',
    lastName: 'Vance',
    fullName: 'Marcus Vance',
    gender: 'Male',
    dob: '1984-09-22',
    age: 42,
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    cnic: '42201-8765432-3',
    maritalStatus: 'Married',
    occupation: 'Financial Analyst',
    phone: '(555) 987-6543',
    whatsapp: '+15559876543',
    email: 'm.vance@example.com',
    address: '780 Sunset Blvd',
    city: 'Los Angeles',
    postalCode: '90028',
    emergencyContact: 'Claire Vance (Wife)',
    emergencyPhone: '(555) 888-4321',
    bloodGroup: 'A+',
    allergies: ['High Blood Pressure'],
    medicalHistory: 'Hypertension under Lisinopril 10mg.',
    currentMedication: 'Lisinopril 10mg daily',
    chronicDiseases: ['Hypertension'],
    smoking: 'Non-Smoker',
    pregnancyStatus: 'N/A',
    notes: 'Requires blood pressure check prior to local anesthesia.',
    assignedDoctor: 'Dr. Marcus Vance',
    primaryDentist: 'Dr. Marcus Vance, DDS',
    firstVisitDate: '2024-06-15',
    lastVisit: 'Jul 28, 2026',
    nextAppointment: 'Aug 5, 2026',
    preferredTime: 'Afternoon (2 PM - 5 PM)',
    status: 'Active',
    balance: 0,
    totalVisits: 8,
    createdAt: '2024-06-15T14:30:00Z',
    updatedAt: '2026-07-28T16:00:00Z',
  },
  {
    id: 'PT-8803',
    patientId: 'PT-8803',
    firstName: 'Emily',
    lastName: 'Watson',
    fullName: 'Emily Watson',
    gender: 'Female',
    dob: '1995-03-18',
    age: 31,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    cnic: '42201-4567890-5',
    maritalStatus: 'Single',
    occupation: 'Architect',
    phone: '(555) 456-7890',
    whatsapp: '+15554567890',
    email: 'emily.w@example.com',
    address: '505 Wilshire Blvd',
    city: 'Santa Monica',
    postalCode: '90401',
    emergencyContact: 'Anna Watson (Sister)',
    emergencyPhone: '(555) 333-7890',
    bloodGroup: 'B+',
    allergies: [],
    medicalHistory: 'No chronic conditions reported.',
    currentMedication: 'None',
    chronicDiseases: [],
    smoking: 'Non-Smoker',
    pregnancyStatus: 'No',
    notes: 'Undergoing porcelain crown restoration on Tooth #3.',
    assignedDoctor: 'Dr. Elena Rostova',
    primaryDentist: 'Dr. Elena Rostova, MD',
    firstVisitDate: '2023-11-20',
    lastVisit: 'Aug 1, 2026',
    nextAppointment: 'Sep 12, 2026',
    preferredTime: 'Morning (9 AM - 12 PM)',
    status: 'Active',
    balance: 570,
    totalVisits: 22,
    createdAt: '2023-11-20T10:15:00Z',
    updatedAt: '2026-08-01T11:00:00Z',
  },
  {
    id: 'PT-8804',
    patientId: 'PT-8804',
    firstName: 'David',
    lastName: 'Kim',
    fullName: 'David Kim',
    gender: 'Male',
    dob: '1990-11-05',
    age: 36,
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    cnic: '42201-3217654-7',
    maritalStatus: 'Married',
    occupation: 'Civil Engineer',
    phone: '(555) 321-7654',
    whatsapp: '+15553217654',
    email: 'dkim@example.com',
    address: '1200 Rodeo Drive',
    city: 'Beverly Hills',
    postalCode: '90212',
    emergencyContact: 'Grace Kim (Wife)',
    emergencyPhone: '(555) 222-6543',
    bloodGroup: 'AB+',
    allergies: ['Asthma'],
    medicalHistory: 'Childhood asthma.',
    currentMedication: 'Inhaler',
    chronicDiseases: ['Asthma'],
    smoking: 'Non-Smoker',
    pregnancyStatus: 'N/A',
    notes: 'Regular 6-month prophylaxis and whitening cleaning.',
    assignedDoctor: 'Dr. Marcus Vance',
    primaryDentist: 'Dr. Marcus Vance, DDS',
    firstVisitDate: '2025-03-01',
    lastVisit: 'Jun 15, 2026',
    nextAppointment: 'Aug 2, 2026',
    preferredTime: 'Afternoon (2 PM - 5 PM)',
    status: 'Active',
    balance: 0,
    totalVisits: 5,
    createdAt: '2025-03-01T11:00:00Z',
    updatedAt: '2026-06-15T12:00:00Z',
  },
  {
    id: 'PT-8805',
    patientId: 'PT-8805',
    firstName: 'Jessica',
    lastName: 'Taylor',
    fullName: 'Jessica Taylor',
    gender: 'Female',
    dob: '2002-06-14',
    age: 24,
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    cnic: '42201-6549870-9',
    maritalStatus: 'Single',
    occupation: 'Student',
    phone: '(555) 654-9870',
    whatsapp: '+15556549870',
    email: 'jtaylor@example.com',
    address: '404 Westwood Blvd',
    city: 'Los Angeles',
    postalCode: '90024',
    emergencyContact: 'Mark Taylor (Father)',
    emergencyPhone: '(555) 111-9870',
    bloodGroup: 'O-',
    allergies: [],
    medicalHistory: 'None.',
    currentMedication: 'None',
    chronicDiseases: [],
    smoking: 'Non-Smoker',
    pregnancyStatus: 'No',
    notes: 'Consultation for cosmetic bonding on anterior central incisors.',
    assignedDoctor: 'Dr. Elena Rostova',
    primaryDentist: 'Dr. Elena Rostova, MD',
    firstVisitDate: '2026-05-10',
    lastVisit: 'Aug 2, 2026',
    nextAppointment: 'Aug 30, 2026',
    preferredTime: 'Morning (9 AM - 12 PM)',
    status: 'Active',
    balance: 0,
    totalVisits: 3,
    createdAt: '2026-05-10T15:00:00Z',
    updatedAt: '2026-08-02T09:00:00Z',
  },
];

// Helper to seed initial patients into Firestore if empty
export async function seedPatientsIfEmpty(): Promise<PatientRecord[]> {
  try {
    const colRef = collection(db, 'patients');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Seeding initial patients into Firestore...');
      for (const p of initialSeedPatients) {
        await setDoc(doc(db, 'patients', p.id), p);
      }
      return initialSeedPatients;
    } else {
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PatientRecord));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'patients');
    return initialSeedPatients;
  }
}

// Fetch all patients with optional live listener fallback
export function subscribeToPatients(callback: (patients: PatientRecord[]) => void) {
  const colRef = collection(db, 'patients');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger seed
        seedPatientsIfEmpty().then(callback);
      } else {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as PatientRecord[];
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'patients');
      callback(initialSeedPatients);
    }
  );
}

// Create new patient
export async function createPatient(patientData: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const colRef = collection(db, 'patients');
    const nowStr = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      ...patientData,
      createdAt: nowStr,
      updatedAt: nowStr,
    });

    // Automatically create initial timeline event
    await addTimelineEvent(docRef.id, {
      title: 'Patient Record Created',
      description: `Patient registration record created for ${patientData.fullName} (#${patientData.patientId}).`,
      category: 'registration',
      createdBy: patientData.assignedDoctor || 'Clinic Front Desk',
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'patients');
    throw err;
  }
}

// Update existing patient
export async function updatePatient(id: string, updates: Partial<PatientRecord>): Promise<void> {
  try {
    const docRef = doc(db, 'patients', id);
    const nowStr = new Date().toISOString();
    await updateDoc(docRef, {
      ...updates,
      updatedAt: nowStr,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `patients/${id}`);
    throw err;
  }
}

// Soft delete patient (status = Archived)
export async function softDeletePatient(id: string, patientName: string): Promise<void> {
  try {
    const docRef = doc(db, 'patients', id);
    await updateDoc(docRef, {
      status: 'Archived',
      updatedAt: new Date().toISOString(),
    });

    await addTimelineEvent(id, {
      title: 'Patient Archived',
      description: `Patient record status updated to Archived by administrative action.`,
      category: 'registration',
      createdBy: 'System Admin',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `patients/${id}`);
    throw err;
  }
}

// Timeline Subcollection
export async function addTimelineEvent(
  patientDocId: string,
  event: Omit<TimelineItem, 'id' | 'patientId' | 'timestamp'>
): Promise<string> {
  try {
    const subColRef = collection(db, 'patients', patientDocId, 'timeline');
    const nowStr = new Date().toISOString();
    const docRef = await addDoc(subColRef, {
      ...event,
      patientId: patientDocId,
      timestamp: nowStr,
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `patients/${patientDocId}/timeline`);
    throw err;
  }
}

export function subscribeToPatientTimeline(patientDocId: string, callback: (items: TimelineItem[]) => void) {
  const subColRef = collection(db, 'patients', patientDocId, 'timeline');
  return onSnapshot(
    subColRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TimelineItem[];
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `patients/${patientDocId}/timeline`);
      callback([]);
    }
  );
}

// Notes Subcollection
export async function addMedicalNote(
  patientDocId: string,
  noteData: Omit<MedicalNote, 'id' | 'patientId' | 'createdAt'>
): Promise<string> {
  try {
    const subColRef = collection(db, 'patients', patientDocId, 'notes');
    const nowStr = new Date().toISOString();
    const docRef = await addDoc(subColRef, {
      ...noteData,
      patientId: patientDocId,
      createdAt: nowStr,
    });

    await addTimelineEvent(patientDocId, {
      title: 'Clinical Note Added',
      description: `${noteData.category} clinical note recorded by ${noteData.authorName}.`,
      category: 'note',
      createdBy: noteData.authorName,
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `patients/${patientDocId}/notes`);
    throw err;
  }
}

export function subscribeToPatientNotes(patientDocId: string, callback: (notes: MedicalNote[]) => void) {
  const subColRef = collection(db, 'patients', patientDocId, 'notes');
  return onSnapshot(
    subColRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as MedicalNote[];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `patients/${patientDocId}/notes`);
      callback([]);
    }
  );
}
