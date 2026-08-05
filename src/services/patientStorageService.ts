import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { storage, db } from '../firebase/config';
import { PatientDocument, DocumentTypeCategory } from '../types/patient';
import { addTimelineEvent } from './patientService';

export function getStorageFolderPath(category: DocumentTypeCategory): string {
  switch (category) {
    case 'image':
      return 'patient-images';
    case 'xray':
      return 'xrays';
    case 'report':
      return 'medical-reports';
    case 'pdf':
    case 'consent':
    default:
      return 'patient-files';
  }
}

export async function uploadPatientDocument(
  patientDocId: string,
  file: File,
  category: DocumentTypeCategory,
  uploaderName: string,
  uploaderRole: string,
  onProgress?: (progress: number) => void
): Promise<PatientDocument> {
  const folder = getStorageFolderPath(category);
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `${folder}/${patientDocId}/${timestamp}_${sanitizedFileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const nowStr = new Date().toISOString();

          const docData: Omit<PatientDocument, 'id'> = {
            patientId: patientDocId,
            filename: file.name,
            fileURL: downloadURL,
            fileType: category,
            sizeBytes: file.size,
            uploadedBy: uploaderName,
            uploaderRole,
            createdAt: nowStr,
            storagePath,
          };

          const subColRef = collection(db, 'patients', patientDocId, 'documents');
          const docRef = await addDoc(subColRef, docData);

          // Add Timeline item
          await addTimelineEvent(patientDocId, {
            title: `Document Uploaded: ${file.name}`,
            description: `New ${category.toUpperCase()} document uploaded by ${uploaderName}.`,
            category: 'document',
            createdBy: uploaderName,
          });

          resolve({
            id: docRef.id,
            ...docData,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function deletePatientDocument(
  patientDocId: string,
  documentId: string,
  storagePath?: string,
  filename?: string,
  userName?: string
): Promise<void> {
  try {
    // Delete file from Firebase Storage if storagePath exists
    if (storagePath) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Could not delete storage file directly, proceeding with Firestore record deletion:', err);
      }
    }

    // Delete document record from Firestore
    const docRef = doc(db, 'patients', patientDocId, 'documents', documentId);
    await deleteDoc(docRef);

    // Record timeline item
    await addTimelineEvent(patientDocId, {
      title: 'Document Removed',
      description: `Document ${filename || documentId} was deleted.`,
      category: 'document',
      createdBy: userName || 'Staff',
    });
  } catch (err) {
    console.error('Error deleting patient document:', err);
    throw err;
  }
}

export function subscribeToPatientDocuments(
  patientDocId: string,
  callback: (documents: PatientDocument[]) => void
) {
  const subColRef = collection(db, 'patients', patientDocId, 'documents');
  return onSnapshot(
    subColRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PatientDocument[];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to patient documents:', err);
      callback([]);
    }
  );
}
