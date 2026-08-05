import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import {
  DentalChartRecord,
  ToothRecord,
  Quadrant,
  TreatmentRecord,
  ClinicalNoteRecord,
  PrescriptionRecord,
  TimelineEventRecord,
  ClinicalAttachmentRecord,
  ToothCondition,
} from '../types/clinical';

export const FDI_TOOTH_MAP: Record<number, { name: string; quadrant: Quadrant }> = {
  // Upper Right (Quadrant 1)
  18: { name: 'Maxillary Right 3rd Molar', quadrant: 'Upper Right' },
  17: { name: 'Maxillary Right 2nd Molar', quadrant: 'Upper Right' },
  16: { name: 'Maxillary Right 1st Molar', quadrant: 'Upper Right' },
  15: { name: 'Maxillary Right 2nd Premolar', quadrant: 'Upper Right' },
  14: { name: 'Maxillary Right 1st Premolar', quadrant: 'Upper Right' },
  13: { name: 'Maxillary Right Canine', quadrant: 'Upper Right' },
  12: { name: 'Maxillary Right Lateral Incisor', quadrant: 'Upper Right' },
  11: { name: 'Maxillary Right Central Incisor', quadrant: 'Upper Right' },

  // Upper Left (Quadrant 2)
  21: { name: 'Maxillary Left Central Incisor', quadrant: 'Upper Left' },
  22: { name: 'Maxillary Left Lateral Incisor', quadrant: 'Upper Left' },
  23: { name: 'Maxillary Left Canine', quadrant: 'Upper Left' },
  24: { name: 'Maxillary Left 1st Premolar', quadrant: 'Upper Left' },
  25: { name: 'Maxillary Left 2nd Premolar', quadrant: 'Upper Left' },
  26: { name: 'Maxillary Left 1st Molar', quadrant: 'Upper Left' },
  27: { name: 'Maxillary Left 2nd Molar', quadrant: 'Upper Left' },
  28: { name: 'Maxillary Left 3rd Molar', quadrant: 'Upper Left' },

  // Lower Left (Quadrant 3)
  38: { name: 'Mandibular Left 3rd Molar', quadrant: 'Lower Left' },
  37: { name: 'Mandibular Left 2nd Molar', quadrant: 'Lower Left' },
  36: { name: 'Mandibular Left 1st Molar', quadrant: 'Lower Left' },
  35: { name: 'Mandibular Left 2nd Premolar', quadrant: 'Lower Left' },
  34: { name: 'Mandibular Left 1st Premolar', quadrant: 'Lower Left' },
  33: { name: 'Mandibular Left Canine', quadrant: 'Lower Left' },
  32: { name: 'Mandibular Left Lateral Incisor', quadrant: 'Lower Left' },
  31: { name: 'Mandibular Left Central Incisor', quadrant: 'Lower Left' },

  // Lower Right (Quadrant 4)
  41: { name: 'Mandibular Right Central Incisor', quadrant: 'Lower Right' },
  42: { name: 'Mandibular Right Lateral Incisor', quadrant: 'Lower Right' },
  43: { name: 'Mandibular Right Canine', quadrant: 'Lower Right' },
  44: { name: 'Mandibular Right 1st Premolar', quadrant: 'Lower Right' },
  45: { name: 'Mandibular Right 2nd Premolar', quadrant: 'Lower Right' },
  46: { name: 'Mandibular Right 1st Molar', quadrant: 'Lower Right' },
  47: { name: 'Mandibular Right 2nd Molar', quadrant: 'Lower Right' },
  48: { name: 'Mandibular Right 3rd Molar', quadrant: 'Lower Right' },
};

export const createDefaultFDITeeth = (): Record<number, ToothRecord> => {
  const teeth: Record<number, ToothRecord> = {};
  Object.keys(FDI_TOOTH_MAP).forEach((numStr) => {
    const toothNum = parseInt(numStr, 10);
    const info = FDI_TOOTH_MAP[toothNum];
    teeth[toothNum] = {
      toothNumber: toothNum,
      fdiCode: String(toothNum),
      quadrant: info.quadrant,
      name: info.name,
      conditions: ['Healthy'],
      surfaces: {},
      notes: '',
      lastTreated: '',
    };
  });
  return teeth;
};

// Initial Seed Charts for default patients
export const getInitialDentalChart = (patientId: string): DentalChartRecord => {
  const teeth = createDefaultFDITeeth();

  // Add realistic mock conditions for demo patient PT-8801 / PT-1001
  if (patientId.includes('8801') || patientId.includes('1001')) {
    teeth[16].conditions = ['Crown'];
    teeth[16].notes = 'PFM Crown fitted 2024';
    teeth[26].conditions = ['Decayed'];
    teeth[26].surfaces = { Occlusal: 'Decayed' };
    teeth[36].conditions = ['Filled'];
    teeth[36].surfaces = { Occlusal: 'Filled' };
    teeth[46].conditions = ['Root Canal'];
    teeth[48].conditions = ['Missing'];
    teeth[18].conditions = ['Missing'];
  } else if (patientId.includes('8802') || patientId.includes('1002')) {
    teeth[11].conditions = ['Whitening'];
    teeth[21].conditions = ['Whitening'];
    teeth[36].conditions = ['Decayed'];
  }

  return {
    patientId,
    teeth,
    generalNotes: 'Patient maintains good oral hygiene. Mild plaque accumulation on lower anteriors.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Dr. Elena Rostova',
  };
};

// ==========================================
// 1. DENTAL CHART SERVICE
// ==========================================

export const subscribeToDentalChart = (
  patientId: string,
  callback: (chart: DentalChartRecord) => void
) => {
  const docRef = doc(db, 'dentalCharts', patientId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DentalChartRecord;
        // Merge missing teeth if schema changed
        const mergedTeeth = createDefaultFDITeeth();
        if (data.teeth) {
          Object.keys(data.teeth).forEach((k) => {
            const num = parseInt(k, 10);
            if (mergedTeeth[num]) {
              mergedTeeth[num] = { ...mergedTeeth[num], ...data.teeth[num] };
            }
          });
        }
        callback({ ...data, teeth: mergedTeeth });
      } else {
        // Fallback default
        const defaultChart = getInitialDentalChart(patientId);
        callback(defaultChart);
      }
    },
    (error) => {
      console.warn('Firestore chart subscription fallback used:', error.message);
      callback(getInitialDentalChart(patientId));
    }
  );
};

export const updateToothConditions = async (
  patientId: string,
  toothNumber: number,
  updates: Partial<ToothRecord>,
  updatedBy: string = 'Doctor'
) => {
  const docRef = doc(db, 'dentalCharts', patientId);

  try {
    const docSnap = await getDoc(docRef);
    let currentChart: DentalChartRecord;

    if (docSnap.exists()) {
      currentChart = docSnap.data() as DentalChartRecord;
    } else {
      currentChart = getInitialDentalChart(patientId);
    }

    const updatedTooth = {
      ...currentChart.teeth[toothNumber],
      ...updates,
      lastTreated: new Date().toISOString().split('T')[0],
    };

    const newTeeth = {
      ...currentChart.teeth,
      [toothNumber]: updatedTooth,
    };

    const payload: DentalChartRecord = {
      patientId,
      teeth: newTeeth,
      generalNotes: currentChart.generalNotes || '',
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `dentalCharts/${patientId}`);
  }
};

// ==========================================
// 2. TREATMENTS SERVICE
// ==========================================

export const subscribeToTreatments = (
  patientId: string,
  callback: (treatments: TreatmentRecord[]) => void
) => {
  const colRef = collection(db, 'treatments');
  const q = query(colRef, where('patientId', '==', patientId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: TreatmentRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TreatmentRecord[];

      // Sort by creation or treatment date
      list.sort((a, b) => new Date(b.treatmentDate || b.createdAt).getTime() - new Date(a.treatmentDate || a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.warn('Treatments subscription fallback used:', error.message);
      callback(getMockTreatments(patientId));
    }
  );
};

export const createTreatmentPlan = async (
  treatment: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'netCost'>,
  performerName: string = 'Doctor'
) => {
  const colRef = collection(db, 'treatments');
  const treatmentId = `TRT-${Math.floor(1000 + Math.random() * 9000)}`;
  const netCost = Math.max(0, treatment.estimatedCost - (treatment.discount || 0));

  const payload = {
    ...treatment,
    treatmentId,
    netCost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const newDoc = await addDoc(colRef, payload);

    // Auto record in patient timeline
    await addTimelineEvent({
      patientId: treatment.patientId,
      type: 'Treatment Created',
      title: `Treatment Plan Created: ${treatment.treatmentType}`,
      description: `Tooth #${treatment.toothNumber} — Est: $${netCost} (${treatment.status})`,
      performedBy: performerName,
      timestamp: new Date().toISOString(),
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'treatments');
  }
};

export const updateTreatmentPlan = async (
  id: string,
  updates: Partial<TreatmentRecord>,
  performerName: string = 'Doctor'
) => {
  const docRef = doc(db, 'treatments', id);

  try {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.estimatedCost !== undefined || updates.discount !== undefined) {
      const est = updates.estimatedCost ?? 0;
      const disc = updates.discount ?? 0;
      (payload as any).netCost = Math.max(0, est - disc);
    }

    await updateDoc(docRef, payload);

    if (updates.patientId) {
      await addTimelineEvent({
        patientId: updates.patientId,
        type: 'Treatment Updated',
        title: `Treatment Status Updated to: ${updates.status || 'Updated'}`,
        description: `Tooth #${updates.toothNumber || 'General'} — ${updates.treatmentType || 'Treatment'}`,
        performedBy: performerName,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `treatments/${id}`);
  }
};

export const deleteTreatmentPlan = async (id: string) => {
  const docRef = doc(db, 'treatments', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `treatments/${id}`);
  }
};

// ==========================================
// 3. CLINICAL & SOAP NOTES SERVICE
// ==========================================

export const subscribeToClinicalNotes = (
  patientId: string,
  callback: (notes: ClinicalNoteRecord[]) => void
) => {
  const colRef = collection(db, 'clinicalNotes');
  const q = query(colRef, where('patientId', '==', patientId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ClinicalNoteRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ClinicalNoteRecord[];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.warn('Clinical Notes subscription fallback used:', error.message);
      callback(getMockClinicalNotes(patientId));
    }
  );
};

export const createClinicalNote = async (
  note: Omit<ClinicalNoteRecord, 'id' | 'noteId' | 'createdAt' | 'updatedAt'>,
  performerName: string = 'Dr. Elena Rostova'
) => {
  const colRef = collection(db, 'clinicalNotes');
  const noteId = `CN-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    ...note,
    noteId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const newDoc = await addDoc(colRef, payload);

    await addTimelineEvent({
      patientId: note.patientId,
      type: 'Clinical Note Added',
      title: `Clinical Consultation Note Added`,
      description: `Chief Complaint: "${note.chiefComplaint.slice(0, 50)}..." by ${note.doctorName}`,
      performedBy: performerName,
      timestamp: new Date().toISOString(),
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'clinicalNotes');
  }
};

// ==========================================
// 4. PRESCRIPTIONS SERVICE
// ==========================================

export const subscribeToPrescriptions = (
  patientId: string,
  callback: (prescriptions: PrescriptionRecord[]) => void
) => {
  const colRef = collection(db, 'prescriptions');
  const q = query(colRef, where('patientId', '==', patientId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: PrescriptionRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PrescriptionRecord[];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.warn('Prescriptions subscription fallback used:', error.message);
      callback(getMockPrescriptions(patientId));
    }
  );
};

export const createPrescription = async (
  prescription: Omit<PrescriptionRecord, 'id' | 'prescriptionId' | 'createdAt'>,
  performerName: string = 'Doctor'
) => {
  const colRef = collection(db, 'prescriptions');
  const prescriptionId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    ...prescription,
    prescriptionId,
    createdAt: new Date().toISOString(),
  };

  try {
    const newDoc = await addDoc(colRef, payload);

    const medNames = prescription.medicines.map((m) => m.medicine).join(', ');

    await addTimelineEvent({
      patientId: prescription.patientId,
      type: 'Prescription Added',
      title: `Prescription ${prescriptionId} Issued`,
      description: `Medicines: ${medNames}`,
      performedBy: performerName,
      timestamp: new Date().toISOString(),
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'prescriptions');
  }
};

// ==========================================
// 5. PATIENT TIMELINE SERVICE
// ==========================================

export const subscribeToPatientTimeline = (
  patientId: string,
  callback: (events: TimelineEventRecord[]) => void
) => {
  const colRef = collection(db, 'patientTimelines');
  const q = query(colRef, where('patientId', '==', patientId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: TimelineEventRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TimelineEventRecord[];
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (error) => {
      console.warn('Patient Timeline subscription fallback used:', error.message);
      callback(getMockTimeline(patientId));
    }
  );
};

export const addTimelineEvent = async (event: Omit<TimelineEventRecord, 'id'>) => {
  const colRef = collection(db, 'patientTimelines');
  try {
    await addDoc(colRef, event);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'patientTimelines');
  }
};

// ==========================================
// 6. ATTACHMENTS SERVICE
// ==========================================

export const subscribeToAttachments = (
  patientId: string,
  callback: (attachments: ClinicalAttachmentRecord[]) => void
) => {
  const colRef = collection(db, 'patientDocuments');
  const q = query(colRef, where('patientId', '==', patientId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ClinicalAttachmentRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ClinicalAttachmentRecord[];
      callback(list);
    },
    (error) => {
      console.warn('Attachments subscription fallback used:', error.message);
      callback(getMockAttachments(patientId));
    }
  );
};

export const uploadClinicalAttachment = async (
  attachment: Omit<ClinicalAttachmentRecord, 'id' | 'createdAt'>,
  performerName: string = 'Doctor'
) => {
  const colRef = collection(db, 'patientDocuments');
  const payload = {
    ...attachment,
    createdAt: new Date().toISOString(),
  };

  try {
    const newDoc = await addDoc(colRef, payload);

    await addTimelineEvent({
      patientId: attachment.patientId,
      type: 'X-ray Uploaded',
      title: `${attachment.fileType} Uploaded: ${attachment.filename}`,
      description: `Uploaded by ${attachment.uploadedBy}`,
      performedBy: performerName,
      timestamp: new Date().toISOString(),
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'patientDocuments');
  }
};

// ==========================================
// MOCK DATA FALLBACKS FOR ROBUST DEMO
// ==========================================

export const getMockTreatments = (patientId: string): TreatmentRecord[] => [
  {
    id: 'trt-1',
    treatmentId: 'TRT-301',
    patientId,
    patientName: 'Eleanor Vance',
    toothNumber: '16',
    treatmentType: 'Root Canal Therapy',
    assignedDoctor: 'Dr. Elena Rostova',
    estimatedCost: 850,
    discount: 50,
    netCost: 800,
    priority: 'High',
    status: 'In Progress',
    notes: 'Access opening done. Canals shaped and irrigated.',
    treatmentDate: '2026-08-01',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 'trt-2',
    treatmentId: 'TRT-302',
    patientId,
    patientName: 'Eleanor Vance',
    toothNumber: '16',
    treatmentType: 'Zirconia Crown Placement',
    assignedDoctor: 'Dr. Elena Rostova',
    estimatedCost: 1200,
    discount: 100,
    netCost: 1100,
    priority: 'Normal',
    status: 'Planned',
    notes: 'Post RCT obturation and crown impression scheduled.',
    treatmentDate: '2026-08-10',
    createdAt: '2026-08-01T10:35:00Z',
    updatedAt: '2026-08-01T10:35:00Z',
  },
  {
    id: 'trt-3',
    treatmentId: 'TRT-303',
    patientId,
    patientName: 'Eleanor Vance',
    toothNumber: '26',
    treatmentType: 'Composite Restoration',
    assignedDoctor: 'Dr. Marcus Vance',
    estimatedCost: 250,
    discount: 0,
    netCost: 250,
    priority: 'Normal',
    status: 'Completed',
    notes: 'Occlusal composite restoration completed without complications.',
    treatmentDate: '2026-07-20',
    createdAt: '2026-07-20T14:00:00Z',
    updatedAt: '2026-07-20T15:00:00Z',
  },
];

export const getMockClinicalNotes = (patientId: string): ClinicalNoteRecord[] => [
  {
    id: 'cn-1',
    noteId: 'CN-801',
    patientId,
    patientName: 'Eleanor Vance',
    doctorName: 'Dr. Elena Rostova',
    chiefComplaint: 'Severe throbbing pain in upper right back tooth upon chewing cold items.',
    diagnosis: 'Symptomatic Irreversible Pulpitis #16',
    findings: 'Deep occlusal caries extending to pulp chamber on tooth #16. Tender to percussion.',
    procedure: 'Pulpectomy and biomechanical preparation performed under local anesthesia (Lignocaine 2%).',
    recommendations: 'Avoid chewing hard food on right side. Complete prescribed antibiotic course.',
    followUp: 'Return in 5 days for canal obturation.',
    soap: {
      subjective: 'Patient reports 8/10 sharp pain in upper right quadrant for 3 days.',
      objective: 'Cold test positive for lingering pain (>30s). Radiograph shows radiolucency reaching pulp #16.',
      assessment: 'Symptomatic Irreversible Pulpitis with Acute Apical Periodontitis #16.',
      plan: 'Root Canal Therapy #16 followed by full coverage crown.',
    },
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-01T11:00:00Z',
  },
];

export const getMockPrescriptions = (patientId: string): PrescriptionRecord[] => [
  {
    id: 'rx-1',
    prescriptionId: 'RX-901',
    patientId,
    patientName: 'Eleanor Vance',
    doctorName: 'Dr. Elena Rostova',
    doctorSignature: 'Dr. Elena Rostova, DDS',
    medicines: [
      {
        medicine: 'Amoxicillin 500mg',
        dosage: '1 Capsule',
        morning: true,
        afternoon: true,
        night: true,
        duration: '5 Days',
        instructions: 'Take after meals with full glass of water',
      },
      {
        medicine: 'Ibuprofen 400mg',
        dosage: '1 Tablet',
        morning: true,
        afternoon: false,
        night: true,
        duration: '3 Days',
        instructions: 'Take if pain persists',
      },
    ],
    createdAt: '2026-08-01T11:15:00Z',
  },
];

export const getMockTimeline = (patientId: string): TimelineEventRecord[] => [
  {
    id: 'tm-1',
    patientId,
    type: 'Clinical Note Added',
    title: 'Clinical Consultation & Root Canal Diagnosis',
    description: 'Diagnosed Symptomatic Irreversible Pulpitis #16',
    performedBy: 'Dr. Elena Rostova',
    timestamp: '2026-08-01T11:00:00Z',
  },
  {
    id: 'tm-2',
    patientId,
    type: 'Prescription Added',
    title: 'Prescription RX-901 Issued',
    description: 'Amoxicillin 500mg, Ibuprofen 400mg',
    performedBy: 'Dr. Elena Rostova',
    timestamp: '2026-08-01T11:15:00Z',
  },
  {
    id: 'tm-3',
    patientId,
    type: 'Treatment Created',
    title: 'Treatment Plan Created: Root Canal Therapy',
    description: 'Tooth #16 — Est: $800 (In Progress)',
    performedBy: 'Dr. Elena Rostova',
    timestamp: '2026-08-01T10:00:00Z',
  },
  {
    id: 'tm-4',
    patientId,
    type: 'X-ray Uploaded',
    title: 'X-ray Uploaded: PA_Tooth_16_PreOp.png',
    description: 'Periapical radiograph showing root apex #16',
    performedBy: 'Assistant Sarah',
    timestamp: '2026-08-01T09:45:00Z',
  },
];

export const getMockAttachments = (patientId: string): ClinicalAttachmentRecord[] => [
  {
    id: 'att-1',
    patientId,
    filename: 'PA_Tooth_16_PreOp.png',
    fileURL: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=60',
    fileType: 'X-ray',
    uploadedBy: 'Assistant Sarah',
    createdAt: '2026-08-01T09:45:00Z',
  },
  {
    id: 'att-2',
    patientId,
    filename: 'Treatment_Consent_Form_Signed.pdf',
    fileURL: '#',
    fileType: 'Consent Form',
    uploadedBy: 'Receptionist Amanda',
    createdAt: '2026-08-01T09:30:00Z',
  },
];
