import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { DoctorScheduleRecord } from '../types/appointment';

const SCHEDULES_COLLECTION = 'doctorSchedules';

function handleFirestoreError(error: unknown, operationType: string, path: string) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.error('DoctorSchedule Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Seed Schedules for clinic doctors
const SEED_DOCTOR_SCHEDULES: Omit<DoctorScheduleRecord, 'id'>[] = [
  {
    doctorId: 'DOC-101',
    doctorName: 'Dr. Elena Rostova',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    startTime: '09:00',
    endTime: '17:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    leaves: [
      {
        id: 'leave-1',
        startDate: '2026-08-20',
        endDate: '2026-08-22',
        reason: 'Annual Dental Orthodontic Conference',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    doctorId: 'DOC-102',
    doctorName: 'Dr. Marcus Vance',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:30',
    endTime: '18:00',
    lunchStart: '13:30',
    lunchEnd: '14:30',
    leaves: [
      {
        id: 'leave-2',
        startDate: '2026-08-28',
        endDate: '2026-08-29',
        reason: 'Personal Leave',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

async function seedSchedulesIfEmpty() {
  try {
    const colRef = collection(db, SCHEDULES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const item of SEED_DOCTOR_SCHEDULES) {
        const d = doc(colRef, item.doctorId);
        await setDoc(d, { ...item, id: d.id });
      }
    }
  } catch (err) {
    console.warn('Doctor Schedule seed error:', err);
  }
}

export function subscribeToDoctorSchedules(callback: (list: DoctorScheduleRecord[]) => void) {
  seedSchedulesIfEmpty();

  const colRef = collection(db, SCHEDULES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: DoctorScheduleRecord[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<DoctorScheduleRecord, 'id'>),
      }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, 'list', SCHEDULES_COLLECTION);
    }
  );
}

export async function updateDoctorSchedule(id: string, updates: Partial<DoctorScheduleRecord>) {
  const docRef = doc(db, SCHEDULES_COLLECTION, id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${SCHEDULES_COLLECTION}/${id}`);
  }
}

export async function addDoctorLeave(
  doctorId: string,
  leave: { startDate: string; endDate: string; reason: string }
) {
  const docRef = doc(db, SCHEDULES_COLLECTION, doctorId);
  try {
    const snap = await getDocs(collection(db, SCHEDULES_COLLECTION));
    const target = snap.docs.find((d) => d.id === doctorId);
    let currentLeaves = [];
    if (target) {
      currentLeaves = target.data().leaves || [];
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      ...leave,
    };

    await updateDoc(docRef, {
      leaves: [...currentLeaves, newLeave],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${SCHEDULES_COLLECTION}/${doctorId}`);
  }
}
