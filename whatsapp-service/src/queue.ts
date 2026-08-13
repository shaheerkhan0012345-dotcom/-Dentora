import { db } from './firebase.js';
import { sendWhatsAppMessage, getWhatsAppStatus } from './whatsapp.js';
import { renderTemplate, DEFAULT_TEMPLATES, NotificationType } from './messageTemplates.js';
import { logger } from './utils/logger.js';

const MAX_ATTEMPTS = 3;
const POLL_INTERVAL_MS = 5000;

export interface NotificationJob {
  id: string;
  type: NotificationType;
  appointmentId: string;
  clinicId: string;
  patientId?: string;
  phoneNumber: string;
  recipientName: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  treatmentName?: string;
  amount?: string;
  customTemplate?: string;
  message?: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  attempts: number;
  error: string | null;
  whatsappMessageId: string | null;
  createdAt: any;
  processedAt: any | null;
  lastAttemptAt: any | null;
}

export function startNotificationQueueWorker() {
  logger.info('Starting Firestore Notification Queue Worker...');

  setInterval(async () => {
    try {
      await processPendingNotificationQueue();
    } catch (err) {
      logger.error({ err }, 'Error in notification queue processing loop');
    }
  }, POLL_INTERVAL_MS);
}

export async function processPendingNotificationQueue(): Promise<number> {
  if (!db) return 0;

  const statusInfo = getWhatsAppStatus();
  if (statusInfo.status !== 'READY') {
    return 0;
  }

  const snapshot = await db
    .collection('notificationJobs')
    .where('status', '==', 'queued')
    .limit(10)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  let processedCount = 0;

  for (const doc of snapshot.docs) {
    const jobId = doc.id;
    const jobData = doc.data() as Omit<NotificationJob, 'id'>;

    // Idempotency / Atomically acquire lock
    const acquired = await db.runTransaction(async (tx) => {
      const freshDocRef = db.collection('notificationJobs').doc(jobId);
      const freshDoc = await tx.get(freshDocRef);

      if (!freshDoc.exists) return false;
      const currentStatus = freshDoc.data()?.status;

      if (currentStatus !== 'queued') return false;

      tx.update(freshDocRef, {
        status: 'processing',
        lastAttemptAt: new Date(),
        attempts: (freshDoc.data()?.attempts || 0) + 1,
      });

      return true;
    });

    if (!acquired) continue;

    processedCount++;

    try {
      // Build message text
      let textToSend = jobData.message;
      if (!textToSend) {
        const rawTemplate = jobData.customTemplate || DEFAULT_TEMPLATES[jobData.type] || DEFAULT_TEMPLATES.appointment_confirmation;
        textToSend = renderTemplate(rawTemplate, {
          patientName: jobData.recipientName,
          doctorName: jobData.doctorName,
          appointmentDate: jobData.appointmentDate,
          appointmentTime: jobData.appointmentTime,
          treatmentName: jobData.treatmentName,
          amount: jobData.amount,
          clinicName: 'Teethly Practice',
        });
      }

      // Dispatch WhatsApp message
      const msgId = await sendWhatsAppMessage(jobData.phoneNumber, textToSend);

      // Update as SENT
      await db.collection('notificationJobs').doc(jobId).update({
        status: 'sent',
        message: textToSend,
        whatsappMessageId: msgId,
        processedAt: new Date(),
        error: null,
      });

      logger.info({ jobId, appointmentId: jobData.appointmentId }, 'Notification job sent successfully');
    } catch (err: any) {
      const attemptsCount = (jobData.attempts || 0) + 1;
      const isFinalFailure = attemptsCount >= MAX_ATTEMPTS;

      logger.error({ jobId, attempts: attemptsCount, err }, 'Notification job failed');

      await db.collection('notificationJobs').doc(jobId).update({
        status: isFinalFailure ? 'failed' : 'queued',
        error: err.message || 'WhatsApp sending error',
        lastAttemptAt: new Date(),
      });
    }
  }

  return processedCount;
}

export async function createNotificationJobIfNotExists(job: {
  type: NotificationType;
  appointmentId: string;
  clinicId: string;
  patientId?: string;
  phoneNumber: string;
  recipientName: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  treatmentName?: string;
  amount?: string;
  customTemplate?: string;
}): Promise<{ id: string; created: boolean }> {
  if (!db) {
    throw new Error('Firestore DB not initialized');
  }

  // Idempotency check: appointmentId + type
  const query = await db
    .collection('notificationJobs')
    .where('appointmentId', '==', job.appointmentId)
    .where('type', '==', job.type)
    .get();

  if (!query.empty) {
    const existingDoc = query.docs[0];
    return { id: existingDoc.id, created: false };
  }

  const newDocRef = db.collection('notificationJobs').doc();
  const newJobData: NotificationJob = {
    id: newDocRef.id,
    type: job.type,
    appointmentId: job.appointmentId,
    clinicId: job.clinicId || 'clinic-flagship',
    patientId: job.patientId || '',
    phoneNumber: job.phoneNumber,
    recipientName: job.recipientName,
    doctorName: job.doctorName,
    appointmentDate: job.appointmentDate,
    appointmentTime: job.appointmentTime,
    treatmentName: job.treatmentName,
    amount: job.amount,
    customTemplate: job.customTemplate,
    status: 'queued',
    attempts: 0,
    error: null,
    whatsappMessageId: null,
    createdAt: new Date(),
    processedAt: null,
    lastAttemptAt: null,
  };

  await newDocRef.set(newJobData);
  return { id: newDocRef.id, created: true };
}
