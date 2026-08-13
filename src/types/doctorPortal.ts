export interface DoctorScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DoctorProfile {
  id: string;
  clinicId: string;
  userId: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  qualification: string;
  avatar?: string;
  schedule: DoctorScheduleSlot[];
  canViewRevenue: boolean;
  status: 'active' | 'inactive';
  createdDate: string;
}

export interface ClinicalNoteInput {
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  diagnosis: string;
  findings: string;
  procedure: string;
  recommendations: string;
  followUp: string;
}
