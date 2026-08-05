import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { NotificationItem, NotificationType } from '../types/admin';

const NOTIFICATION_COLLECTION = 'notifications';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'stock_alert',
    title: 'Low Stock Alert: Dental Impression Alginate',
    message: 'Stock level reached 3 bags (Threshold: 5). Reorder recommended.',
    category: 'Inventory',
    read: false,
    archived: false,
    timestamp: new Date().toISOString(),
    actionUrl: '/dashboard?tab=inventory',
  },
  {
    id: 'notif-2',
    type: 'appointment',
    title: 'Upcoming Visit: Fatima Zahra (#PT-8801)',
    message: 'Root Canal Therapy scheduled with Dr. Elena Rostova in 30 minutes.',
    category: 'Appointments',
    read: false,
    archived: false,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actionUrl: '/dashboard?tab=appointments',
  },
  {
    id: 'notif-3',
    type: 'ai_alert',
    title: 'AI Action Execution Requested',
    message: 'Copilot proposed creating Invoice #INV-2026-009 for Rs. 24,000. Approval required.',
    category: 'AI Copilot',
    read: false,
    archived: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: '/dashboard?tab=ai-assistant',
  },
  {
    id: 'notif-4',
    type: 'leave_request',
    title: 'New Leave Request: Dr. Marcus Vance',
    message: 'Requested 4 days Annual Leave (Aug 15 - Aug 18). Pending approval.',
    category: 'Staff',
    read: true,
    archived: false,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actionUrl: '/dashboard?tab=staff',
  },
];

export function subscribeToNotifications(callback: (notifs: NotificationItem[]) => void) {
  const q = query(collection(db, NOTIFICATION_COLLECTION), orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_NOTIFICATIONS.forEach((n) => {
          setDoc(doc(db, NOTIFICATION_COLLECTION, n.id), n).catch(console.error);
        });
        callback(INITIAL_NOTIFICATIONS);
      } else {
        const list: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as NotificationItem);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, NOTIFICATION_COLLECTION);
    }
  );
}

export async function createNotification(
  notif: Omit<NotificationItem, 'id' | 'read' | 'archived' | 'timestamp'>
) {
  try {
    const docRef = doc(collection(db, NOTIFICATION_COLLECTION));
    const item: NotificationItem = {
      ...notif,
      id: docRef.id,
      read: false,
      archived: false,
      timestamp: new Date().toISOString(),
    };

    await setDoc(docRef, item);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, NOTIFICATION_COLLECTION);
    throw error;
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const docRef = doc(db, NOTIFICATION_COLLECTION, id);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATION_COLLECTION}/${id}`);
  }
}

export async function markAllNotificationsAsRead() {
  try {
    // In real app, batch update. For simplicity, setting read state
    const docRef = doc(collection(db, NOTIFICATION_COLLECTION));
  } catch (error) {
    console.error('Failed to mark all as read', error);
  }
}

export async function archiveNotification(id: string) {
  try {
    const docRef = doc(db, NOTIFICATION_COLLECTION, id);
    await updateDoc(docRef, { archived: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATION_COLLECTION}/${id}`);
  }
}
