export type PatientStatus = 'Active' | 'Inactive' | 'Blocked' | 'Archived';

export type GenderType = 'Male' | 'Female' | 'Other' | 'Unspecified';

export interface PatientRecord {
  id: string; // Firestore Doc ID
  patientId: string; // e.g. PT-8801
  firstName: string;
  lastName: string;
  fullName: string;
  gender: GenderType;
  dob: string; // YYYY-MM-DD
  age: number;
  photoURL?: string;
  cnic?: string;
  maritalStatus?: string;
  occupation?: string;
  
  // Contact
  phone: string;
  whatsapp?: string;
  email: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Medical
  bloodGroup?: string;
  allergies: string[];
  medicalHistory?: string;
  currentMedication?: string;
  chronicDiseases: string[];
  smoking?: 'Non-Smoker' | 'Smoker' | 'Former Smoker';
  pregnancyStatus?: string;
  notes?: string;
  
  // Dental & Admin
  assignedDoctor: string;
  primaryDentist?: string;
  firstVisitDate?: string;
  lastVisit: string;
  nextAppointment?: string;
  preferredTime?: string;
  status: PatientStatus;
  balance: number;
  totalVisits: number;
  
  createdAt: string;
  updatedAt: string;
}

export type DocumentTypeCategory = 'image' | 'pdf' | 'xray' | 'consent' | 'report' | 'other';

export interface PatientDocument {
  id: string;
  patientId: string;
  filename: string;
  fileURL: string;
  fileType: DocumentTypeCategory;
  sizeBytes: number;
  uploadedBy: string;
  uploaderRole: string;
  createdAt: string;
  storagePath?: string;
}

export interface TimelineItem {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: 'registration' | 'appointment' | 'treatment' | 'prescription' | 'invoice' | 'payment' | 'document' | 'note';
  timestamp: string;
  createdBy: string;
  iconType?: string;
}

export interface MedicalNote {
  id: string;
  patientId: string;
  authorName: string;
  authorRole: string;
  note: string;
  category: 'General' | 'Clinical' | 'Surgical' | 'Hygiene' | 'Administrative';
  createdAt: string;
}

export interface PatientFilterOptions {
  gender: string;
  doctor: string;
  status: string; // 'All' | 'Active' | 'Inactive' | 'Blocked' | 'Archived'
  bloodGroup: string;
  minAge: number | null;
  maxAge: number | null;
  regDateFrom: string;
  regDateTo: string;
}

export type PatientSortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastVisit';
