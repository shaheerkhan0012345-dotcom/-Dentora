export type OnlineBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface OnlineBooking {
  id: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  treatmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  status: OnlineBookingStatus;
  createdAt: string;
}

export interface BookingSlot {
  time: string;
  isAvailable: boolean;
}
