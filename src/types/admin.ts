export type StaffRoleType =
  | 'Admin'
  | 'Doctor'
  | 'Receptionist'
  | 'Dental Assistant'
  | 'Accountant'
  | 'Inventory Manager'
  | 'Custom';

export type StaffStatus = 'Active' | 'On Leave' | 'Suspended' | 'Inactive';

export interface WeeklyScheduleDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  designation: string;
  department: string;
  role: StaffRoleType;
  customRoleName?: string;
  joiningDate: string;
  salary: number; // Controlled by role-based visibility
  workingHours: string;
  weeklySchedule: WeeklyScheduleDay[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  status: StaffStatus;
  photoUrl?: string;
  biometricId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionItem {
  key: string;
  label: string;
  category: 'Patients' | 'Clinical' | 'Billing' | 'Inventory' | 'Staff' | 'AI & Copilot' | 'Reports' | 'Settings';
  description: string;
}

export interface RoleDefinition {
  id: string;
  roleName: string;
  isSystemRole: boolean;
  description: string;
  permissions: string[]; // List of permission keys granted
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM AM/PM
  checkOut?: string; // HH:MM AM/PM
  breakStart?: string;
  breakEnd?: string;
  status: AttendanceStatus;
  lateArrivalMinutes: number;
  overtimeHours: number;
  biometricDeviceId?: string;
  notes?: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Emergency' | 'Maternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  rejectionReason?: string;
  doctorAvailabilitySynced: boolean;
}

export type NotificationType =
  | 'in_app'
  | 'stock_alert'
  | 'appointment'
  | 'payment'
  | 'payment_due'
  | 'ai_alert'
  | 'system'
  | 'birthday'
  | 'leave_request';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category: string;
  targetRole?: string;
  read: boolean;
  archived: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface GeneralClinicSettings {
  clinicName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  taxRegistrationNo: string; // NTN / STRN
  currencySymbol: string; // PKR, $, €, etc.
  currencyCode: string; // PKR, USD, EUR
  timezone: string;
  workingDays: string[];
  clinicHours: {
    openTime: string;
    closeTime: string;
  };
}

export interface AISettingsConfig {
  geminiApiKeyConfigured: boolean;
  activeProvider: 'Google Gemini 2.5 Flash' | 'OpenAI GPT-4o' | 'Claude 3.5 Sonnet';
  temperature: number; // 0.0 - 1.0
  enableStreaming: boolean;
  maxContextTokens: number;
  systemPromptTemplate: string;
  hourlyRateLimit: number;
  autoApproveLowRiskActions: boolean;
}

export interface WhatsAppSettingsConfig {
  status: 'Connected' | 'Disconnected' | 'Testing';
  defaultAppointmentReminderTemplate: string;
  defaultPaymentReceiptTemplate: string;
  defaultFollowupTemplate: string;
}

export interface ThemeSettingsConfig {
  mode: 'Light' | 'Dark' | 'System';
  accentColor: string; // hex string e.g. '#1d5bd8'
  density: 'Compact' | 'Comfortable' | 'Spacious';
  fontFamily: string;
}

export interface LanguageSettingsConfig {
  primaryLanguage: 'English' | 'Urdu' | 'Roman Urdu';
  enableRTL: boolean;
  fallbackLanguage: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'Auth' | 'Patient' | 'Billing' | 'Inventory' | 'AI' | 'Staff' | 'Settings' | 'Export' | 'Clinic Management' | 'SaaS Billing' | 'Clinical' | 'Permissions' | 'Messaging' | 'Appointments' | 'Patient Portal';
  details: string;
  ipAddress: string;
  timestamp: string;
  result: 'Success' | 'Failed' | 'Warning';
}

export interface ReportFilter {
  timeframe: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';
  startDate?: string;
  endDate?: string;
  category:
    | 'Revenue'
    | 'Expenses'
    | 'Inventory'
    | 'Patient Growth'
    | 'Appointment Stats'
    | 'Treatment Performance'
    | 'Doctor Performance'
    | 'No-show Analysis'
    | 'AI Usage';
  doctorId?: string;
}
