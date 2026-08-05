import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { OnlineBooking, BookingSlot } from '../types/onlineBooking';
import { logAuditEvent } from './auditLogService';
import { createAppointment } from './appointmentService';

const ONLINE_BOOKINGS_COLLECTION = 'onlineBookings';

export const TIME_SLOTS: string[] = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

export async function getAvailableTimeSlots(
  clinicId: string,
  doctorId: string,
  date: string
): Promise<BookingSlot[]> {
  try {
    const q = query(
      collection(db, ONLINE_BOOKINGS_COLLECTION),
      where('clinicId', '==', clinicId),
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const snap = await getDocs(q);
    const bookedTimes = new Set(snap.docs.map((d) => (d.data() as OnlineBooking).timeSlot));

    return TIME_SLOTS.map((slot) => ({
      time: slot,
      isAvailable: !bookedTimes.has(slot),
    }));
  } catch (error) {
    console.warn('getAvailableTimeSlots error, fallback slots:', error);
    return TIME_SLOTS.map((slot, idx) => ({
      time: slot,
      isAvailable: idx !== 2 && idx !== 5, // Mock unavailable slots if offline
    }));
  }
}

export async function submitOnlineBooking(
  bookingData: Omit<OnlineBooking, 'id' | 'createdAt' | 'status'>
): Promise<OnlineBooking> {
  try {
    // 1. Prevent double booking check
    const existingQ = query(
      collection(db, ONLINE_BOOKINGS_COLLECTION),
      where('clinicId', '==', bookingData.clinicId),
      where('doctorId', '==', bookingData.doctorId),
      where('date', '==', bookingData.date),
      where('timeSlot', '==', bookingData.timeSlot),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      throw new Error(`The selected time slot ${bookingData.timeSlot} on ${bookingData.date} is already booked. Please choose another time.`);
    }

    // 2. Create online booking document
    const newBooking: Omit<OnlineBooking, 'id'> = {
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, ONLINE_BOOKINGS_COLLECTION), newBooking);
    const createdBooking: OnlineBooking = { id: docRef.id, ...newBooking };

    // 3. Immediately sync and create in main Doctor & Clinic 'appointments' collection
    try {
      const aptNum = Math.floor(1000 + Math.random() * 9000);
      const timePart = bookingData.timeSlot.includes(':') 
        ? bookingData.timeSlot.split(' ')[0] 
        : '10:00';

      await createAppointment({
        appointmentId: `APT-ONL-${aptNum}`,
        patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: bookingData.patientName,
        patientPhone: bookingData.patientPhone || '(555) 123-4567',
        patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        doctorId: bookingData.doctorId || 'DOC-101',
        doctorName: bookingData.doctorName || 'Dr. Elena Rostova',
        doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
        treatment: bookingData.treatmentName || 'Dental Examination',
        date: bookingData.date || new Date().toISOString().split('T')[0],
        startTime: timePart,
        endTime: '10:45',
        room: 'Chair 1 - Main Operatory Suite',
        priority: 'Normal',
        status: 'Confirmed',
        notes: `24/7 Patient Online Booking (${bookingData.patientEmail || 'No email'}). Notes: ${bookingData.notes || 'None'}`,
        createdByName: 'Patient Online Portal',
        createdByRole: 'Patient',
      });
    } catch (syncErr) {
      console.error('Error syncing online booking to primary appointments ledger:', syncErr);
    }

    logAuditEvent({
      userId: 'public-patient',
      userName: bookingData.patientName,
      userRole: 'Patient',
      action: 'Public Online Booking Created',
      category: 'Appointments',
      details: `Booked appointment with ${bookingData.doctorName} for ${bookingData.treatmentName} at ${bookingData.date} ${bookingData.timeSlot}`,
      result: 'Success',
    });

    return createdBooking;
  } catch (error) {
    if (error instanceof Error && error.message.includes('already booked')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, ONLINE_BOOKINGS_COLLECTION);
    throw error;
  }
}

