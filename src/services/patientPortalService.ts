import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { PatientAccount, PatientPortalDocument, AICareTip } from '../types/patientPortal';
import { logAuditEvent } from './auditLogService';

const PATIENT_ACCOUNTS_COLLECTION = 'patientAccounts';
const PATIENT_DOCUMENTS_COLLECTION = 'patientDocuments';

export const DEFAULT_PATIENT_ACCOUNT: PatientAccount = {
  id: 'pt-acc-8801',
  clinicId: 'clinic-beverly-hills',
  patientId: 'PT-8801',
  userId: 'user-sarah-jenkins',
  email: 'sarah.j@gmail.com',
  name: 'Sarah Jenkins',
  phone: '+1 (310) 555-8901',
  dob: '1992-06-14',
  gender: 'Female',
  medicalAlerts: ['Penicillin Allergy', 'Mild Gingivitis'],
  treatmentProgress: 75,
  outstandingBalance: 180.0,
  lastVisit: '2026-07-28',
  nextVisit: '2026-08-12 at 10:00 AM',
  assignedDoctor: 'Dr. Elena Rostova, MD',
};

export const DEFAULT_PATIENT_DOCUMENTS: PatientPortalDocument[] = [
  {
    id: 'doc-inv-8801',
    patientId: 'PT-8801',
    clinicId: 'clinic-beverly-hills',
    title: 'Invoice #INV-8801 (Clear Aligner Adjustment)',
    category: 'Invoice',
    fileUrl: '#',
    fileSize: '240 KB',
    uploadedDate: '2026-07-28',
    doctorName: 'Dr. Elena Rostova, MD',
  },
  {
    id: 'doc-rx-9002',
    patientId: 'PT-8801',
    clinicId: 'clinic-beverly-hills',
    title: 'Prescription Rx #8801 (Amoxicillin & Pain Care)',
    category: 'Prescription',
    fileUrl: '#',
    fileSize: '180 KB',
    uploadedDate: '2026-07-28',
    doctorName: 'Dr. Elena Rostova, MD',
  },
  {
    id: 'doc-xray-102',
    patientId: 'PT-8801',
    clinicId: 'clinic-beverly-hills',
    title: '3D Panoramic CBCT Dental X-Ray',
    category: 'X-Ray',
    fileUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    fileSize: '4.2 MB',
    uploadedDate: '2026-06-10',
    doctorName: 'Dr. Elena Rostova, MD',
  },
  {
    id: 'doc-consent-01',
    patientId: 'PT-8801',
    clinicId: 'clinic-beverly-hills',
    title: 'Signed Orthodontic Treatment Consent Form',
    category: 'Consent Form',
    fileUrl: '#',
    fileSize: '512 KB',
    uploadedDate: '2026-01-15',
    doctorName: 'Dr. Elena Rostova, MD',
  },
];

export const DEFAULT_AI_CARE_TIPS: AICareTip[] = [
  {
    id: 'tip-1',
    title: 'Aligner Wear Hygiene Guidelines',
    summary: 'Ensure aligner tray #12 is worn 22 hours daily. Rinse only with cool water before reinserting.',
    category: 'Orthodontics',
    date: '2026-08-01',
  },
  {
    id: 'tip-2',
    title: 'Post-Whitening Tooth Sensitivity Shield',
    summary: 'Use prescribed potassium nitrate desensitizing toothpaste twice daily for 5 days post-bleaching.',
    category: 'Post-Op',
    date: '2026-07-29',
  },
  {
    id: 'tip-3',
    title: 'Interdental Flossing Routine',
    summary: 'Floss gently before bedtime to remove subgingival plaque between molar crowns.',
    category: 'Hygiene',
    date: '2026-07-25',
  },
];

export async function fetchPatientPortalAccount(clinicId: string, emailOrPatientId: string): Promise<PatientAccount> {
  try {
    const q = query(
      collection(db, PATIENT_ACCOUNTS_COLLECTION),
      where('clinicId', '==', clinicId),
      where('email', '==', emailOrPatientId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as PatientAccount;
    }
    return DEFAULT_PATIENT_ACCOUNT;
  } catch (error) {
    console.warn('fetchPatientPortalAccount error, using default:', error);
    return DEFAULT_PATIENT_ACCOUNT;
  }
}

export async function uploadPatientPortalDocument(
  clinicId: string,
  patientId: string,
  title: string,
  category: PatientPortalDocument['category'],
  fileSize: string,
  uploadedBy: string
): Promise<PatientPortalDocument> {
  try {
    const docItem: Omit<PatientPortalDocument, 'id'> = {
      patientId,
      clinicId,
      title,
      category,
      fileUrl: '#',
      fileSize,
      uploadedDate: new Date().toISOString().split('T')[0],
      doctorName: uploadedBy,
    };

    const docRef = await addDoc(collection(db, PATIENT_DOCUMENTS_COLLECTION), docItem);

    logAuditEvent({
      userId: uploadedBy,
      userName: uploadedBy,
      userRole: 'Patient',
      action: 'Upload Patient Document',
      category: 'Patient Portal',
      details: `Uploaded document ${title} for patient ${patientId}`,
      result: 'Success',
    });

    return { id: docRef.id, ...docItem };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PATIENT_DOCUMENTS_COLLECTION);
    throw error;
  }
}
