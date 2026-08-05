import { UserRole } from './user';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Waiting'
  | 'Called'
  | 'In Treatment'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Rescheduled';

export type AppointmentPriority = 'Normal' | 'High' | 'Urgent' | 'Emergency' | 'VIP';

export interface StatusLogEntry {
  status: AppointmentStatus;
  updatedBy: string;
  timestamp: string;
  note?: string;
}

export interface AppointmentRecord {
  id: string; // Firestore document ID
  appointmentId: string; // Auto code e.g. APT-9001
  patientId: string; // e.g. PT-8801
  patientName: string;
  patientPhone: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  treatment: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm format e.g. "09:00" or "09:00 AM"
  endTime: string; // HH:mm format e.g. "09:30" or "09:30 AM"
  room: string; // e.g. "Chair 1 - Operatory A"
  priority: AppointmentPriority;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusLogs?: StatusLogEntry[];
}

export type QueueStatus = 'Waiting' | 'Called' | 'In Treatment' | 'Completed' | 'Skipped' | 'Cancelled';

export interface QueueRecord {
  id: string; // Firestore document ID
  queueNumber: string; // Token code e.g. Q-101
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorName: string;
  room: string;
  treatment: string;
  priority: AppointmentPriority;
  status: QueueStatus;
  timeArrived: string; // e.g. "09:45 AM"
  calledAt?: string | null;
  completedAt?: string | null;
  createdAt: string; // ISO string for wait time calculations
}

export interface DoctorScheduleRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  workingDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  startTime: string; // '09:00'
  endTime: string; // '17:00'
  lunchStart: string; // '13:00'
  lunchEnd: string; // '14:00'
  leaves: Array<{
    id: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    reason: string;
  }>;
  updatedAt: string;
}

export interface AppointmentFilterOptions {
  doctor: string; // 'All' or specific doctor
  status: string; // 'All' or specific status
  treatment: string; // 'All' or specific treatment
  room: string; // 'All' or specific room
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  priority: string; // 'All' or specific priority
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';

export interface NotificationTriggerLog {
  id: string;
  type: 'Booked' | 'Confirmed' | 'Cancelled' | 'Reminder' | 'NoShow';
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  message: string;
  timestamp: string;
  channel: 'WhatsApp' | 'SMS' | 'System';
  status: 'Queued' | 'Sent';
}
