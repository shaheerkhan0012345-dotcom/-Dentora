import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { AuditLogRecord } from '../types/admin';

const AUDIT_COLLECTION = 'auditLogs';

// Initial audit events seed if empty
const INITIAL_AUDITS: AuditLogRecord[] = [
  {
    id: 'audit-1',
    userId: 'DOC-1',
    userName: 'Dr. Elena Rostova',
    userRole: 'Admin',
    action: 'User Login',
    category: 'Auth',
    details: 'Logged into Dentora Operating System via Secure Session',
    ipAddress: '192.168.1.45',
    timestamp: new Date().toISOString(),
    result: 'Success',
  },
  {
    id: 'audit-2',
    userId: 'DOC-1',
    userName: 'Dr. Elena Rostova',
    userRole: 'Admin',
    action: 'Patient Created',
    category: 'Patient',
    details: 'Added patient #PT-8801 (Fatima Zahra)',
    ipAddress: '192.168.1.45',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    result: 'Success',
  },
  {
    id: 'audit-3',
    userId: 'ACC-1',
    userName: 'Alex Rivera',
    userRole: 'Receptionist',
    action: 'Invoice Updated',
    category: 'Billing',
    details: 'Generated Invoice #INV-2026-004 for Rs. 18,500',
    ipAddress: '192.168.1.88',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    result: 'Success',
  },
];

export async function logAuditEvent(event: Omit<AuditLogRecord, 'id' | 'timestamp' | 'ipAddress'> & { timestamp?: string; ipAddress?: string }) {
  try {
    const docRef = doc(collection(db, AUDIT_COLLECTION));
    const record: AuditLogRecord = {
      ...event,
      id: docRef.id,
      timestamp: event.timestamp || new Date().toISOString(),
      ipAddress: event.ipAddress || '192.168.1.100', // Simulated local IP
    };

    await setDoc(docRef, record);
  } catch (error) {
    console.warn('Failed to record audit log:', error);
  }
}

export function subscribeToAuditLogs(callback: (logs: AuditLogRecord[]) => void) {
  const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_AUDITS.forEach((aud) => {
          setDoc(doc(db, AUDIT_COLLECTION, aud.id), aud).catch(console.error);
        });
        callback(INITIAL_AUDITS);
      } else {
        const list: AuditLogRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AuditLogRecord);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, AUDIT_COLLECTION);
    }
  );
}
