import { UserRole } from './user';

export type DashboardTab = 
  | 'overview'
  | 'clinics'
  | 'subscriptions'
  | 'portal-doctor'
  | 'portal-patient'
  | 'online-booking'
  | 'messages'
  | 'patients'
  | 'appointments'
  | 'queue'
  | 'dental-chart'
  | 'treatments'
  | 'prescriptions'
  | 'invoices'
  | 'payments'
  | 'inventory'
  | 'reports'
  | 'staff'
  | 'notifications'
  | 'settings'
  | 'ai-assistant';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  subValue?: string;
  unit?: string;
  trend: string;
  trendDirection: TrendDirection;
  iconName: string;
  sparklineData?: number[];
  category: 'clinical' | 'financial' | 'operations';
  allowedRoles?: UserRole[];
}

export type AppointmentStatus = 'Confirmed' | 'In Chair' | 'Waiting' | 'Completed' | 'Cancelled';

export interface AppointmentItem {
  id: string;
  patientName: string;
  patientAvatar: string;
  patientId: string;
  doctorName: string;
  doctorAvatar: string;
  time: string;
  date: string;
  status: AppointmentStatus;
  treatment: string;
  room: string;
  phone: string;
  note?: string;
}

export type QueueStatus = 'Checked In' | 'With Doctor' | 'In Hygiene' | 'Ready for Billing' | 'Completed';
export type QueuePriority = 'Normal' | 'VIP' | 'Emergency';

export interface QueueItem {
  id: string;
  patientName: string;
  patientAvatar: string;
  timeArrived: string;
  waitTimeMinutes: number;
  status: QueueStatus;
  assignedDoctor: string;
  room: string;
  priority: QueuePriority;
  treatment: string;
}

export interface ActivityItem {
  id: string;
  type: 'patient' | 'appointment' | 'treatment' | 'invoice' | 'prescription' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  avatar?: string;
  category: 'clinical' | 'financial' | 'operations';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: 'appointment' | 'payment' | 'inventory' | 'patient' | 'system';
  priority: 'low' | 'medium' | 'high';
}

export interface PatientRecord {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'Active' | 'Inactive';
  medicalAlerts: string[];
  balance: number;
  totalVisits: number;
  assignedDoctor: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  patientName: string;
  patientAvatar: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  doctorName: string;
  treatmentSummary: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  minThreshold: number;
  unit: string;
  reorderStatus: 'In Stock' | 'Low Stock' | 'Critical';
  lastRestocked: string;
  unitCost: number;
}

export interface StaffRecord {
  id: string;
  name: string;
  role: 'Doctor' | 'Hygienist' | 'Receptionist' | 'Assistant' | 'Admin';
  specialty: string;
  status: 'Active' | 'On Break' | 'Off Duty' | 'In Surgery';
  appointmentsToday: number;
  phone: string;
  avatar: string;
}
