import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { DoctorProfile, ClinicalNoteInput } from '../types/doctorPortal';
import { logAuditEvent } from './auditLogService';

const DOCTOR_PROFILES_COLLECTION = 'doctorProfiles';
const CLINICAL_NOTES_COLLECTION = 'clinicalNotes';

export const DEFAULT_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-elena-rostova',
    clinicId: 'clinic-beverly-hills',
    userId: 'user-elena',
    name: 'Dr. Elena Rostova, MD',
    specialty: 'Orthodontics & Invisalign Specialist',
    email: 'elena.rostova@Teethly.clinic',
    phone: '+1 (310) 555-0101',
    qualification: 'DDS, Harvard School of Dental Medicine / MS Ortho',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    schedule: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
      { day: 'Friday', startTime: '09:00 AM', endTime: '02:00 PM', isAvailable: true },
    ],
    canViewRevenue: true,
    status: 'active',
    createdDate: '2026-01-15',
  },
  {
    id: 'doc-marcus-vance',
    clinicId: 'clinic-beverly-hills',
    userId: 'user-marcus',
    name: 'Dr. Marcus Vance, DDS',
    specialty: 'Prosthodontist & Implant Surgeon',
    email: 'marcus.vance@Teethly.clinic',
    phone: '+1 (310) 555-0102',
    qualification: 'DDS, UCLA Dentistry / Fellow ICOI',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    schedule: [
      { day: 'Monday', startTime: '08:30 AM', endTime: '04:30 PM', isAvailable: true },
      { day: 'Tuesday', startTime: '08:30 AM', endTime: '04:30 PM', isAvailable: true },
      { day: 'Thursday', startTime: '08:30 AM', endTime: '04:30 PM', isAvailable: true },
      { day: 'Friday', startTime: '08:30 AM', endTime: '04:30 PM', isAvailable: true },
    ],
    canViewRevenue: false,
    status: 'active',
    createdDate: '2026-01-20',
  },
  {
    id: 'doc-tariq-mahmood',
    clinicId: 'clinic-lahore-gulberg',
    userId: 'user-tariq',
    name: 'Dr. Tariq Mahmood, BDS, FCPS',
    specialty: 'Oral & Maxillofacial Surgeon',
    email: 'tariq.m@Teethly.clinic',
    phone: '+92 300 8899112',
    qualification: 'BDS (KEMU), FCPS (Oral & Maxillofacial Surgery)',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    schedule: [
      { day: 'Monday', startTime: '10:00 AM', endTime: '08:00 PM', isAvailable: true },
      { day: 'Wednesday', startTime: '10:00 AM', endTime: '08:00 PM', isAvailable: true },
      { day: 'Friday', startTime: '10:00 AM', endTime: '08:00 PM', isAvailable: true },
      { day: 'Saturday', startTime: '10:00 AM', endTime: '05:00 PM', isAvailable: true },
    ],
    canViewRevenue: true,
    status: 'active',
    createdDate: '2026-02-01',
  }
];

export async function fetchDoctorProfiles(clinicId: string): Promise<DoctorProfile[]> {
  try {
    const q = query(collection(db, DOCTOR_PROFILES_COLLECTION), where('clinicId', '==', clinicId));
    const snap = await getDocs(q);
    if (snap.empty) {
      const filteredDefaults = DEFAULT_DOCTORS.filter((d) => d.clinicId === clinicId);
      if (filteredDefaults.length === 0) return DEFAULT_DOCTORS;
      return filteredDefaults;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DoctorProfile));
  } catch (error) {
    console.warn('fetchDoctorProfiles error, returning fallback:', error);
    return DEFAULT_DOCTORS.filter((d) => d.clinicId === clinicId);
  }
}

export async function saveClinicalNote(
  clinicId: string,
  doctorName: string,
  input: ClinicalNoteInput,
  performedBy: string
) {
  try {
    const noteData = {
      noteId: `CN-${Date.now().toString().slice(-6)}`,
      clinicId,
      patientId: input.patientId,
      patientName: input.patientName,
      doctorName,
      chiefComplaint: input.chiefComplaint,
      diagnosis: input.diagnosis,
      findings: input.findings,
      procedure: input.procedure,
      recommendations: input.recommendations,
      followUp: input.followUp,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, CLINICAL_NOTES_COLLECTION), noteData);

    logAuditEvent({
      userId: performedBy,
      userName: doctorName,
      userRole: 'Doctor',
      action: 'Write Clinical Note',
      category: 'Clinical',
      details: `Created clinical note for patient ${input.patientName} (${input.patientId})`,
      result: 'Success',
    });

    return noteData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLINICAL_NOTES_COLLECTION);
    throw error;
  }
}

export async function updateDoctorRevenuePermission(
  doctorId: string,
  canViewRevenue: boolean,
  performedBy: string
) {
  try {
    const docRef = doc(db, DOCTOR_PROFILES_COLLECTION, doctorId);
    await updateDoc(docRef, { canViewRevenue });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Update Doctor Revenue Access',
      category: 'Permissions',
      details: `Set doctor ${doctorId} canViewRevenue = ${canViewRevenue}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${DOCTOR_PROFILES_COLLECTION}/${doctorId}`);
    throw error;
  }
}
