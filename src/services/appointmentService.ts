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
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import {
  AppointmentRecord,
  AppointmentStatus,
  NotificationTriggerLog,
  StatusLogEntry,
} from '../types/appointment';
import { syncAppointmentToQueue } from './queueService';
import { sendWhatsAppAppointmentNotification } from './whatsappService';

const APPOINTMENTS_COLLECTION = 'appointments';
const NOTIFICATIONS_COLLECTION = 'notifications';

// Error Handler helper according to Firebase Skill guidelines
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
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Mock Seed Data for realistic clinic operation
const SEED_APPOINTMENTS: Omit<AppointmentRecord, 'id'>[] = [
  {
    appointmentId: 'APT-901',
    patientId: 'PT-8801',
    patientName: 'Sarah Jenkins',
    patientPhone: '(555) 234-5678',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Elena Rostova',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    treatment: '3D Aligner Tray Refinement',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:45',
    room: 'Chair 1 - Ortho Wing',
    priority: 'Normal',
    status: 'In Treatment',
    notes: 'Patient tray #12 fitting. Check tracking on upper incisors.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    statusLogs: [
      { status: 'Scheduled', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'Confirmed', updatedBy: 'System Auto-SMS', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'Waiting', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { status: 'In Treatment', updatedBy: 'Dr. Elena Rostova', timestamp: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    appointmentId: 'APT-902',
    patientId: 'PT-8802',
    patientName: 'Marcus Vance',
    patientPhone: '(555) 987-6543',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Marcus Vance',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    treatment: 'Porcelain Crown Placement',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    room: 'Chair 3 - Cosmetic Suite',
    priority: 'VIP',
    status: 'Waiting',
    notes: 'Shade match A2 checked with lab.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    statusLogs: [
      { status: 'Scheduled', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { status: 'Confirmed', updatedBy: 'System Auto-SMS', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'Waiting', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 900000).toISOString() },
    ],
  },
  {
    appointmentId: 'APT-903',
    patientId: 'PT-8803',
    patientName: 'Emily Watson',
    patientPhone: '(555) 456-7890',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Elena Rostova',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    treatment: 'Routine Hygiene & Polishing',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:30',
    endTime: '12:15',
    room: 'Hygiene Bay A',
    priority: 'Normal',
    status: 'Confirmed',
    notes: 'Prophylaxis & intraoral camera photography.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    statusLogs: [
      { status: 'Scheduled', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
      { status: 'Confirmed', updatedBy: 'Patient SMS Reply', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    appointmentId: 'APT-904',
    patientId: 'PT-8804',
    patientName: 'David Kim',
    patientPhone: '(555) 321-7654',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Marcus Vance',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    treatment: 'Root Canal Therapy Stage 2',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    room: 'Endo Studio B',
    priority: 'Emergency',
    status: 'Confirmed',
    notes: 'Obturation of canal 2 and 3.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    statusLogs: [
      { status: 'Scheduled', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'Confirmed', updatedBy: 'Receptionist', timestamp: new Date(Date.now() - 43200000).toISOString() },
    ],
  },
  {
    appointmentId: 'APT-905',
    patientId: 'PT-8805',
    patientName: 'Jessica Taylor',
    patientPhone: '(555) 654-9870',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Elena Rostova',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    treatment: 'Initial Braces Consultation',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:30',
    endTime: '16:15',
    room: 'Consultation Room 2',
    priority: 'Normal',
    status: 'Scheduled',
    notes: '3D cephalometric analysis and cost breakdown.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusLogs: [
      { status: 'Scheduled', updatedBy: 'Receptionist', timestamp: new Date().toISOString() },
    ],
  },
];

// Seed initial appointments if empty
async function seedInitialAppointmentsIfEmpty() {
  try {
    const colRef = collection(db, APPOINTMENTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('Seeding initial appointment database in Firestore...');
      for (const item of SEED_APPOINTMENTS) {
        const docRef = doc(colRef);
        await setDoc(docRef, { ...item, id: docRef.id });
        
        // Also sync waiting/in-treatment to live queue
        if (item.status === 'Waiting' || item.status === 'In Treatment') {
          await syncAppointmentToQueue({ ...item, id: docRef.id });
        }
      }
    }
  } catch (err) {
    console.warn('Error checking/seeding initial appointments:', err);
  }
}

// Subscribe to real-time appointments
export function subscribeToAppointments(callback: (list: AppointmentRecord[]) => void) {
  seedInitialAppointmentsIfEmpty();

  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AppointmentRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AppointmentRecord, 'id'>),
      }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, 'list', APPOINTMENTS_COLLECTION);
    }
  );
}

// Create new appointment
export async function createAppointment(
  data: Omit<AppointmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'statusLogs'> & {
    createdByRole?: string;
    createdByName?: string;
  }
): Promise<string> {
  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const newDocRef = doc(colRef);

  const now = new Date().toISOString();
  const initialLog: StatusLogEntry = {
    status: data.status,
    updatedBy: data.createdByName || 'Receptionist',
    timestamp: now,
    note: 'Initial booking creation',
  };

  const record: AppointmentRecord = {
    ...data,
    id: newDocRef.id,
    createdAt: now,
    updatedAt: now,
    statusLogs: [initialLog],
  };

  try {
    await setDoc(newDocRef, record);

    // Sync to live queue if checked-in or waiting
    if (data.status === 'Waiting' || data.status === 'Called' || data.status === 'In Treatment') {
      await syncAppointmentToQueue(record);
    }

    // Trigger notification logger
    await triggerNotificationEvent('Booked', record);

    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', APPOINTMENTS_COLLECTION);
    throw error;
  }
}

// Update existing appointment
export async function updateAppointment(
  id: string,
  updates: Partial<Omit<AppointmentRecord, 'id' | 'createdAt'>>
) {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  const now = new Date().toISOString();

  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    if (updates.status && ['Waiting', 'Called', 'In Treatment'].includes(updates.status)) {
      // Sync with full document object
      const fullSnap = await getDocs(query(collection(db, APPOINTMENTS_COLLECTION)));
      const targetDoc = fullSnap.docs.find((d) => d.id === id);
      if (targetDoc) {
        const fullApt = { id: targetDoc.id, ...(targetDoc.data() as Omit<AppointmentRecord, 'id'>) };
        await syncAppointmentToQueue(fullApt);
      }
    }
  } catch (error) {
    handleFirestoreError(error, 'update', `${APPOINTMENTS_COLLECTION}/${id}`);
  }
}

// Update status with logging and queue sync
export async function updateAppointmentStatus(
  id: string,
  newStatus: AppointmentStatus,
  updatedBy: string,
  note?: string
) {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  const now = new Date().toISOString();

  const logEntry: StatusLogEntry = {
    status: newStatus,
    updatedBy,
    timestamp: now,
    note: note || `Status changed to ${newStatus}`,
  };

  try {
    const snap = await getDocs(query(collection(db, APPOINTMENTS_COLLECTION)));
    const targetDoc = snap.docs.find((d) => d.id === id);
    let existingLogs: StatusLogEntry[] = [];
    let fullApt: AppointmentRecord | null = null;

    if (targetDoc) {
      const data = targetDoc.data() as AppointmentRecord;
      existingLogs = data.statusLogs || [];
      fullApt = { ...data, id: targetDoc.id, status: newStatus };
    }

    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: now,
      statusLogs: [...existingLogs, logEntry],
    });

    if (fullApt && ['Waiting', 'Called', 'In Treatment', 'Completed', 'Cancelled', 'No Show'].includes(newStatus)) {
      await syncAppointmentToQueue(fullApt);
    }

    // Trigger Notifications
    if (fullApt) {
      if (newStatus === 'Confirmed') await triggerNotificationEvent('Confirmed', fullApt);
      if (newStatus === 'Cancelled') await triggerNotificationEvent('Cancelled', fullApt);
      if (newStatus === 'No Show') await triggerNotificationEvent('NoShow', fullApt);
    }
  } catch (error) {
    handleFirestoreError(error, 'update', `${APPOINTMENTS_COLLECTION}/${id}`);
  }
}

// Delete / Cancel appointment
export async function deleteAppointment(id: string) {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `${APPOINTMENTS_COLLECTION}/${id}`);
  }
}

// Conflict & Double-Booking Validation Helper
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAppointmentBooking(
  data: {
    doctorId: string;
    doctorName: string;
    date: string; // YYYY-MM-DD
    startTime: string; // e.g. "09:00" or "09:00 AM"
    endTime: string; // e.g. "09:30" or "09:30 AM"
    room: string;
    appointmentIdToIgnore?: string; // for edit mode
  },
  existingAppointments: AppointmentRecord[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Past Date Warning / Error
  if (data.date < todayStr) {
    errors.push('Cannot book an appointment in the past.');
  }

  // Parse time helper (HH:MM or HH:MM AM/PM into minutes from midnight)
  const parseTimeToMinutes = (t: string): number => {
    let timeStr = t.trim();
    let hours = 0;
    let minutes = 0;

    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      const isPm = timeStr.toLowerCase().includes('pm');
      const clean = timeStr.replace(/am|pm/gi, '').trim();
      const parts = clean.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      if (isPm && hours < 12) hours += 12;
      if (!isPm && hours === 12) hours = 0;
    } else {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    }

    return hours * 60 + minutes;
  };

  const newStartMin = parseTimeToMinutes(data.startTime);
  const newEndMin = parseTimeToMinutes(data.endTime);

  // 2. Invalid Time Duration
  if (newEndMin <= newStartMin) {
    errors.push('End time must be after the start time.');
  }

  // 3. Working Hours Check (08:00 AM to 08:00 PM)
  if (newStartMin < 8 * 60 || newEndMin > 20 * 60) {
    warnings.push('Booking is outside standard clinic operating hours (08:00 AM - 08:00 PM).');
  }

  // 4. Doctor Conflict & Room Conflict Checks
  const activeAppointmentsOnDate = existingAppointments.filter(
    (apt) =>
      apt.date === data.date &&
      apt.id !== data.appointmentIdToIgnore &&
      apt.status !== 'Cancelled' &&
      apt.status !== 'No Show'
  );

  for (const apt of activeAppointmentsOnDate) {
    const aptStartMin = parseTimeToMinutes(apt.startTime);
    const aptEndMin = parseTimeToMinutes(apt.endTime);

    // Overlap condition
    const isOverlapping = Math.max(newStartMin, aptStartMin) < Math.min(newEndMin, aptEndMin);

    if (isOverlapping) {
      if (apt.doctorName === data.doctorName || apt.doctorId === data.doctorId) {
        errors.push(
          `Doctor Conflict: ${data.doctorName} already has an active appointment (${apt.startTime} - ${apt.endTime}) with ${apt.patientName}.`
        );
      }

      if (apt.room === data.room) {
        warnings.push(
          `Room Conflict Warning: ${data.room} is currently reserved by ${apt.patientName} (${apt.startTime} - ${apt.endTime}).`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Notification Trigger Logging & WhatsApp Dispatch System
export async function triggerNotificationEvent(
  type: NotificationTriggerLog['type'],
  apt: AppointmentRecord
) {
  try {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const newDoc = doc(colRef);

    let message = '';
    switch (type) {
      case 'Booked':
        message = `Hello ${apt.patientName}, your appointment #${apt.appointmentId} for ${apt.treatment} with ${apt.doctorName} on ${apt.date} at ${apt.startTime} is booked.`;
        break;
      case 'Confirmed':
        message = `Dear ${apt.patientName}, your dental visit on ${apt.date} at ${apt.startTime} is confirmed. Please arrive 10 minutes prior.`;
        break;
      case 'Cancelled':
        message = `Dear ${apt.patientName}, your appointment #${apt.appointmentId} has been cancelled. Contact clinic to reschedule.`;
        break;
      case 'Reminder':
        message = `Reminder: Dental appointment today at ${apt.startTime} at Teethly Clinic in ${apt.room}.`;
        break;
      case 'NoShow':
        message = `Dear ${apt.patientName}, we missed you for your scheduled appointment at ${apt.startTime}. Please reach out to reschedule.`;
        break;
    }

    let dispatchStatus: NotificationTriggerLog['status'] = 'Queued';

    // Dispatch automated WhatsApp message via WhatsApp Web bot
    if (apt.patientPhone) {
      try {
        const waResult = await sendWhatsAppAppointmentNotification({
          recipientPhone: apt.patientPhone,
          patientName: apt.patientName,
          doctorName: apt.doctorName,
          treatmentName: apt.treatment,
          date: apt.date,
          timeSlot: apt.startTime,
          clinicName: 'Teethly Practice',
        });
        if (waResult.sentViaApi) {
          dispatchStatus = 'Sent';
        }
      } catch (waErr) {
        console.warn('Auto WhatsApp dispatch attempt encountered error:', waErr);
      }
    }

    const payload: NotificationTriggerLog = {
      id: newDoc.id,
      type,
      appointmentId: apt.appointmentId,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      message,
      timestamp: new Date().toISOString(),
      channel: 'WhatsApp',
      status: dispatchStatus,
    };

    await setDoc(newDoc, payload);
  } catch (err) {
    console.warn('Error recording notification trigger:', err);
  }
}
