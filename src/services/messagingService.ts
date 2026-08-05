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
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { SecureMessage, ConversationParticipant } from '../types/messaging';
import { logAuditEvent } from './auditLogService';

const MESSAGES_COLLECTION = 'messages';

export const DEFAULT_MESSAGES: SecureMessage[] = [
  {
    id: 'msg-101',
    clinicId: 'clinic-beverly-hills',
    senderId: 'doc-elena-rostova',
    senderName: 'Dr. Elena Rostova, MD',
    senderRole: 'Doctor',
    recipientId: 'user-sarah-jenkins',
    recipientName: 'Sarah Jenkins',
    recipientRole: 'Patient',
    content: 'Hello Sarah, please remember to wear your aligner tray #12 consistently today before your checkup.',
    timestamp: '2026-08-02T10:15:00Z',
    read: true,
  },
  {
    id: 'msg-102',
    clinicId: 'clinic-beverly-hills',
    senderId: 'user-sarah-jenkins',
    senderName: 'Sarah Jenkins',
    senderRole: 'Patient',
    recipientId: 'doc-elena-rostova',
    recipientName: 'Dr. Elena Rostova, MD',
    recipientRole: 'Doctor',
    content: 'Thank you Dr. Elena! I have been wearing it 22 hours daily. Looking forward to tomorrow.',
    timestamp: '2026-08-02T10:30:00Z',
    read: true,
  },
  {
    id: 'msg-103',
    clinicId: 'clinic-beverly-hills',
    senderId: 'receptionist-1',
    senderName: 'Beverly Hills Reception',
    senderRole: 'Receptionist',
    recipientId: 'user-sarah-jenkins',
    recipientName: 'Sarah Jenkins',
    recipientRole: 'Patient',
    content: 'Your appointment for tomorrow at 10:00 AM has been confirmed. Please bring your aligner case.',
    timestamp: '2026-08-02T16:00:00Z',
    read: false,
  },
];

export function subscribeToMessages(
  clinicId: string,
  userId: string,
  callback: (messages: SecureMessage[]) => void
) {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('clinicId', '==', clinicId)
    );

    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback(DEFAULT_MESSAGES.filter((m) => m.clinicId === clinicId));
        } else {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SecureMessage));
          // Filter messages where user is sender or recipient
          const userMsgs = list.filter((m) => m.senderId === userId || m.recipientId === userId);
          callback(userMsgs);
        }
      },
      (error) => {
        console.warn('subscribeToMessages error, fallback to defaults:', error);
        callback(DEFAULT_MESSAGES.filter((m) => m.clinicId === clinicId));
      }
    );
  } catch (err) {
    console.warn('subscribeToMessages catch:', err);
    callback(DEFAULT_MESSAGES.filter((m) => m.clinicId === clinicId));
    return () => {};
  }
}

export async function sendSecureMessage(
  msg: Omit<SecureMessage, 'id' | 'timestamp' | 'read'>
): Promise<SecureMessage> {
  try {
    const newMsg: Omit<SecureMessage, 'id'> = {
      ...msg,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), newMsg);
    const createdMsg = { id: docRef.id, ...newMsg };

    logAuditEvent({
      userId: msg.senderId,
      userName: msg.senderName,
      userRole: msg.senderRole as any,
      action: 'Send Message',
      category: 'Messaging',
      details: `Sent secure message to ${msg.recipientName} (${msg.recipientRole})`,
      result: 'Success',
    });

    return createdMsg;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, MESSAGES_COLLECTION);
    throw error;
  }
}

export async function markMessageRead(messageId: string): Promise<void> {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.warn('markMessageRead failed:', error);
  }
}
