import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { QueueRecord, QueueStatus, AppointmentRecord } from '../types/appointment';

const QUEUE_COLLECTION = 'queue';

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
  console.error('Queue Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Seed Queue for waiting room
const SEED_QUEUE: Omit<QueueRecord, 'id'>[] = [
  {
    queueNumber: 'Q-101',
    appointmentId: 'APT-901',
    patientId: 'PT-8801',
    patientName: 'Sarah Jenkins',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    doctorName: 'Dr. Elena Rostova',
    room: 'Chair 1 - Ortho Wing',
    treatment: '3D Aligner Tray Refinement',
    priority: 'Normal',
    status: 'In Treatment',
    timeArrived: '08:50 AM',
    calledAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    queueNumber: 'Q-102',
    appointmentId: 'APT-902',
    patientId: 'PT-8802',
    patientName: 'Marcus Vance',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    doctorName: 'Dr. Marcus Vance',
    room: 'Chair 3 - Cosmetic Suite',
    treatment: 'Porcelain Crown Placement',
    priority: 'VIP',
    status: 'Waiting',
    timeArrived: '09:45 AM',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    queueNumber: 'Q-103',
    patientId: 'PT-8804',
    patientName: 'David Kim',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    doctorName: 'Dr. Marcus Vance',
    room: 'Endo Studio B',
    treatment: 'Severe Toothache Emergency',
    priority: 'Emergency',
    status: 'Waiting',
    timeArrived: '10:05 AM',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

async function seedQueueIfEmpty() {
  try {
    const colRef = collection(db, QUEUE_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const item of SEED_QUEUE) {
        const d = doc(colRef);
        await setDoc(d, { ...item, id: d.id });
      }
    }
  } catch (err) {
    console.warn('Queue seed check error:', err);
  }
}

// Subscribe to real-time live queue
export function subscribeToQueue(callback: (list: QueueRecord[]) => void) {
  seedQueueIfEmpty();

  const colRef = collection(db, QUEUE_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: QueueRecord[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<QueueRecord, 'id'>),
      }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, 'list', QUEUE_COLLECTION);
    }
  );
}

// Sync appointment status into queue
export async function syncAppointmentToQueue(apt: AppointmentRecord) {
  try {
    const colRef = collection(db, QUEUE_COLLECTION);
    const snap = await getDocs(colRef);
    const existing = snap.docs.find((d) => d.data().appointmentId === apt.id || d.data().appointmentId === apt.appointmentId);

    const nowIso = new Date().toISOString();
    const timeArrivedStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Map appointment status to queue status
    let queueStatus: QueueStatus = 'Waiting';
    if (apt.status === 'Called') queueStatus = 'Called';
    if (apt.status === 'In Treatment') queueStatus = 'In Treatment';
    if (apt.status === 'Completed') queueStatus = 'Completed';
    if (apt.status === 'Cancelled') queueStatus = 'Cancelled';

    if (existing) {
      // Update existing queue item
      const docRef = doc(db, QUEUE_COLLECTION, existing.id);
      await updateDoc(docRef, {
        status: queueStatus,
        doctorName: apt.doctorName,
        room: apt.room,
        treatment: apt.treatment,
        priority: apt.priority,
        ...(queueStatus === 'Called' || queueStatus === 'In Treatment' ? { calledAt: nowIso } : {}),
        ...(queueStatus === 'Completed' ? { completedAt: nowIso } : {}),
      });
    } else if (['Waiting', 'Called', 'In Treatment'].includes(apt.status)) {
      // Create new queue item
      const nextNum = 100 + snap.docs.length + 1;
      const qNum = `Q-${nextNum}`;

      const newRef = doc(colRef);
      const queueRecord: QueueRecord = {
        id: newRef.id,
        queueNumber: qNum,
        appointmentId: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        patientAvatar: apt.patientAvatar,
        doctorName: apt.doctorName,
        room: apt.room,
        treatment: apt.treatment,
        priority: apt.priority,
        status: queueStatus,
        timeArrived: timeArrivedStr,
        createdAt: nowIso,
        calledAt: queueStatus !== 'Waiting' ? nowIso : null,
      };

      await setDoc(newRef, queueRecord);
    }
  } catch (err) {
    console.warn('Error syncing appointment to queue:', err);
  }
}

// Add Walk-In Patient directly to Queue
export async function addWalkInToQueue(data: {
  patientName: string;
  patientId?: string;
  doctorName: string;
  room: string;
  treatment: string;
  priority: QueueRecord['priority'];
}): Promise<string> {
  const colRef = collection(db, QUEUE_COLLECTION);
  const snap = await getDocs(colRef);
  const nextNum = 100 + snap.docs.length + 1;
  const qNum = `Q-${nextNum}`;

  const newRef = doc(colRef);
  const nowIso = new Date().toISOString();
  const timeArrivedStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const record: QueueRecord = {
    id: newRef.id,
    queueNumber: qNum,
    patientId: data.patientId || `PT-WALKIN-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: data.patientName,
    doctorName: data.doctorName,
    room: data.room,
    treatment: data.treatment,
    priority: data.priority,
    status: 'Waiting',
    timeArrived: timeArrivedStr,
    createdAt: nowIso,
  };

  try {
    await setDoc(newRef, record);
    return newRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', QUEUE_COLLECTION);
    throw error;
  }
}

// Update queue status
export async function updateQueueStatus(queueId: string, status: QueueStatus) {
  const docRef = doc(db, QUEUE_COLLECTION, queueId);
  const nowIso = new Date().toISOString();

  const updates: Partial<QueueRecord> = { status };
  if (status === 'Called' || status === 'In Treatment') {
    updates.calledAt = nowIso;
  }
  if (status === 'Completed' || status === 'Skipped' || status === 'Cancelled') {
    updates.completedAt = nowIso;
  }

  try {
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, 'update', `${QUEUE_COLLECTION}/${queueId}`);
  }
}

// Remove from queue
export async function removeFromQueue(queueId: string) {
  const docRef = doc(db, QUEUE_COLLECTION, queueId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `${QUEUE_COLLECTION}/${queueId}`);
  }
}
