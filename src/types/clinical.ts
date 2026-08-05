export type ToothCondition =
  | 'Healthy'
  | 'Decayed'
  | 'Missing'
  | 'Filled'
  | 'Root Canal'
  | 'Crown'
  | 'Bridge'
  | 'Implant'
  | 'Extraction'
  | 'Fractured'
  | 'Sealant'
  | 'Whitening'
  | 'Scaling'
  | 'Orthodontic'
  | 'Temporary Crown';

export type Quadrant = 'Upper Right' | 'Upper Left' | 'Lower Left' | 'Lower Right';

export type SurfaceKey = 'Mesial' | 'Distal' | 'Occlusal' | 'Buccal' | 'Lingual';

export interface ToothRecord {
  toothNumber: number; // 11 - 48 FDI
  fdiCode: string;     // e.g. "16"
  quadrant: Quadrant;
  name: string;
  conditions: ToothCondition[];
  surfaces?: Partial<Record<SurfaceKey, ToothCondition>>;
  notes?: string;
  lastTreated?: string;
}

export interface DentalChartRecord {
  id?: string;
  patientId: string;
  teeth: Record<number, ToothRecord>;
  generalNotes?: string;
  updatedAt: string;
  updatedBy?: string;
}

export type TreatmentStatus = 'Planned' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';
export type TreatmentPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface TreatmentRecord {
  id: string;
  treatmentId: string; // TRT-1001
  patientId: string;
  patientName: string;
  toothNumber: string; // FDI Tooth number e.g. "16" or "General"
  treatmentType: string;
  assignedDoctor: string;
  estimatedCost: number;
  discount: number;
  netCost: number;
  priority: TreatmentPriority;
  status: TreatmentStatus;
  notes?: string;
  treatmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ClinicalNoteRecord {
  id: string;
  noteId: string; // CN-2001
  patientId: string;
  patientName: string;
  doctorName: string;
  chiefComplaint: string;
  diagnosis: string;
  findings: string;
  procedure: string;
  recommendations: string;
  followUp: string;
  soap: SOAPNotes;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedicine {
  medicine: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  duration: string;
  instructions: string;
}

export interface PrescriptionRecord {
  id: string;
  prescriptionId: string; // RX-3001
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorSignature: string;
  medicines: PrescriptionMedicine[];
  createdAt: string;
}

export type EventType =
  | 'Treatment Created'
  | 'Treatment Updated'
  | 'Prescription Added'
  | 'X-ray Uploaded'
  | 'Clinical Note Added'
  | 'Appointment Scheduled';

export interface TimelineEventRecord {
  id: string;
  patientId: string;
  type: EventType;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export type AttachmentCategory =
  | 'X-ray'
  | 'Clinical Image'
  | 'PDF Report'
  | 'Treatment Photo'
  | 'Consent Form';

export interface ClinicalAttachmentRecord {
  id: string;
  patientId: string;
  filename: string;
  fileURL: string;
  fileType: AttachmentCategory;
  uploadedBy: string;
  createdAt: string;
}
