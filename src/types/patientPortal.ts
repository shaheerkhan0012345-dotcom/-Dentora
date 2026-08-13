export interface PatientAccount {
  id: string;
  clinicId: string;
  patientId: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  dob: string;
  gender: string;
  medicalAlerts: string[];
  treatmentProgress: number; // percentage 0-100
  outstandingBalance: number;
  lastVisit?: string;
  nextVisit?: string;
  assignedDoctor?: string;
}

export interface PatientPortalDocument {
  id: string;
  patientId: string;
  clinicId: string;
  title: string;
  category: 'Invoice' | 'Prescription' | 'X-Ray' | 'Report' | 'Clinical Document' | 'Consent Form';
  fileUrl: string;
  fileSize: string;
  uploadedDate: string;
  doctorName?: string;
}

export interface AICareTip {
  id: string;
  title: string;
  summary: string;
  category: 'Hygiene' | 'Post-Op' | 'Orthodontics' | 'General';
  date: string;
  urgentNotice?: boolean;
}

export interface PortalSession {
  id: string;
  userId: string;
  userRole: string;
  clinicId: string;
  ipAddress: string;
  device: string;
  lastActive: string;
}
