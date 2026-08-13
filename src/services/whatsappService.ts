import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import QRCode from 'qrcode';
import { db as firestoreDb } from '../firebase/config';

// Single source of truth for WhatsApp API URL
export function getWhatsAppApiUrl(): string {
  let raw = (
    import.meta.env.VITE_WHATSAPP_API_URL ||
    import.meta.env.VITE_WHATSAPP_SERVICE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  ).trim();
  raw = raw.replace(/\/$/, '');
  if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw;
}

const WHATSAPP_API_URL = getWhatsAppApiUrl();
const SERVICE_SECRET = import.meta.env.VITE_WHATSAPP_SERVICE_SECRET || 'dentora_secret_key_2026';

function getServiceHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-service-secret': SERVICE_SECRET,
  };
}

export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_confirmed'
  | 'appointment_rescheduled'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'payment_reminder';

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
  message?: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  attempts: number;
  error?: string | null;
  whatsappMessageId?: string | null;
  createdAt: any;
  processedAt?: any;
  lastAttemptAt?: any;
}

export interface WhatsAppMessageOptions {
  recipientPhone: string;
  patientName: string;
  doctorName: string;
  treatmentName: string;
  date: string;
  timeSlot: string;
  clinicName?: string;
  appointmentId?: string;
}

export interface SendWhatsAppResponse {
  success: boolean;
  sentViaApi: boolean;
  whatsappDeepLink: string;
  message: string;
  jobId?: string;
}

export interface WhatsAppWebStatus {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'auth_failure' | 'error';
  qrDataUrl: string | null;
  rawQr?: string | null;
  user: { id?: string; name?: string } | null;
  error: string | null;
}

/**
 * Normalizes phone numbers into clean digit-only format for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  // Pakistan local 11-digit mobile (03XX XXXXXXX -> 923XX XXXXXXX)
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  }
  // UK local 11-digit mobile (07XXX XXXXXX -> 447XXX XXXXXX)
  else if (cleaned.length === 11 && cleaned.startsWith('07')) {
    cleaned = '44' + cleaned.substring(1);
  }
  // US/Canada 10-digit number
  else if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  return cleaned;
}

/**
 * Builds a friendly, formatted WhatsApp confirmation text
 */
export function buildWhatsAppAppointmentText(opts: WhatsAppMessageOptions): string {
  const clinic = opts.clinicName || 'Dentora Flagship Practice';
  return (
    `*Appointment Confirmation - ${clinic}*\n\n` +
    `Hello *${opts.patientName}*,\n` +
    `Your appointment has been successfully scheduled!\n\n` +
    `📅 *Date:* ${opts.date}\n` +
    `⏰ *Time:* ${opts.timeSlot}\n` +
    `👨‍⚕️ *Doctor:* ${opts.doctorName}\n` +
    `🦷 *Treatment:* ${opts.treatmentName}\n` +
    `📍 *Location:* ${clinic}\n\n` +
    `If you need to reschedule or have any questions, please reply directly to this message. We look forward to seeing you!`
  );
}

/**
 * Generates a direct wa.me WhatsApp URL for 1-click messaging
 */
export function getWhatsAppDeepLink(opts: WhatsAppMessageOptions): string {
  const phone = formatPhoneForWhatsApp(opts.recipientPhone);
  const text = buildWhatsAppAppointmentText(opts);
  const encodedText = encodeURIComponent(text);

  if (phone) {
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Helper to ensure raw QR string is converted to image Data URL if needed
 */
async function processQrToDataUrl(qrInput: string | null): Promise<string | null> {
  if (!qrInput) return null;
  if (qrInput.startsWith('data:image/')) return qrInput;
  try {
    return await QRCode.toDataURL(qrInput, {
      margin: 2,
      width: 280,
      color: { dark: '#0b2e78', light: '#ffffff' },
    });
  } catch (err) {
    return null;
  }
}

/**
 * Real-time subscription to WhatsApp Web status via Firestore with silent fallback
 */
export function subscribeToWhatsAppStatus(callback: (status: WhatsAppWebStatus) => void) {
  const docRef = doc(firestoreDb, 'whatsappConnections', 'clinic-flagship');

  return onSnapshot(
    docRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const mappedStatus =
          data.status === 'READY' || data.status === 'connected'
            ? 'connected'
            : data.status === 'QR_REQUIRED' || data.status === 'qr_ready'
            ? 'qr_ready'
            : data.status === 'INITIALIZING' || data.status === 'AUTHENTICATING' || data.status === 'connecting'
            ? 'connecting'
            : data.status === 'AUTH_FAILURE'
            ? 'auth_failure'
            : 'disconnected';

        let finalQrDataUrl = data.qrDataUrl || null;
        if (!finalQrDataUrl && data.rawQr) {
          finalQrDataUrl = await processQrToDataUrl(data.rawQr);
        }

        callback({
          status: mappedStatus,
          qrDataUrl: finalQrDataUrl,
          rawQr: data.rawQr || null,
          user: data.user || (data.phoneNumber ? { name: `Dentora Clinic (+${data.phoneNumber})`, id: data.phoneNumber } : null),
          error: data.error || null,
        });
      } else {
        callback({ status: 'disconnected', qrDataUrl: null, user: null, error: null });
      }
    },
    (_err) => {
      callback({ status: 'disconnected', qrDataUrl: null, user: null, error: null });
    }
  );
}

/**
 * Fetch status and live QR code from Railway WhatsApp API with Firestore fallback
 */
export async function getWhatsAppWebStatus(): Promise<WhatsAppWebStatus> {
  // 1. Try Railway Service
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/whatsapp/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const rawStatus = data.status || 'disconnected';

      let mappedStatus: WhatsAppWebStatus['status'] = 'disconnected';
      if (rawStatus === 'READY' || rawStatus === 'ready' || rawStatus === 'connected') {
        mappedStatus = 'connected';
      } else if (rawStatus === 'QR_REQUIRED' || rawStatus === 'qr_required' || rawStatus === 'qr_ready') {
        mappedStatus = 'qr_ready';
      } else if (rawStatus === 'INITIALIZING' || rawStatus === 'AUTHENTICATING' || rawStatus === 'initializing' || rawStatus === 'authenticating' || rawStatus === 'connecting') {
        mappedStatus = 'connecting';
      } else if (rawStatus === 'AUTH_FAILURE' || rawStatus === 'auth_failure') {
        mappedStatus = 'auth_failure';
      }

      let qrDataUrl = data.qrDataUrl || null;
      let rawQr = data.qr || null;

      // If status is QR required and we don't have QR image, fetch from /whatsapp/qr
      if (mappedStatus === 'qr_ready' && !qrDataUrl) {
        try {
          const qrRes = await fetch(`${WHATSAPP_API_URL}/whatsapp/qr`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (qrRes.ok) {
            const qrData = await qrRes.json();
            if (qrData.available && qrData.qr) {
              rawQr = qrData.qr;
              qrDataUrl = await processQrToDataUrl(qrData.qr);
            }
          }
        } catch (qrErr) {
          // Ignore QR fetch error
        }
      }

      return {
        status: mappedStatus,
        qrDataUrl,
        rawQr,
        user: data.user || (data.phoneNumber ? { name: `Dentora Clinic (+${data.phoneNumber})`, id: data.phoneNumber } : null),
        error: data.error || null,
      };
    }
  } catch (err) {
    // Railway offline / CORS issue -> fallback to Firestore
  }

  // 2. Read directly from Firestore doc whatsappConnections/clinic-flagship
  try {
    const docRef = doc(firestoreDb, 'whatsappConnections', 'clinic-flagship');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const mappedStatus =
        data.status === 'READY' || data.status === 'connected'
          ? 'connected'
          : data.status === 'QR_REQUIRED' || data.status === 'qr_ready'
          ? 'qr_ready'
          : data.status === 'INITIALIZING' || data.status === 'AUTHENTICATING' || data.status === 'connecting'
          ? 'connecting'
          : data.status === 'AUTH_FAILURE'
          ? 'auth_failure'
          : 'disconnected';

      let finalQrDataUrl = data.qrDataUrl || null;
      if (!finalQrDataUrl && data.rawQr) {
        finalQrDataUrl = await processQrToDataUrl(data.rawQr);
      }

      return {
        status: mappedStatus,
        qrDataUrl: finalQrDataUrl,
        rawQr: data.rawQr || null,
        user: data.user || (data.phoneNumber ? { name: `Dentora Clinic (+${data.phoneNumber})`, id: data.phoneNumber } : null),
        error: data.error || null,
      };
    }
  } catch (err) {
    //
  }

  return { status: 'disconnected', qrDataUrl: null, user: null, error: null };
}

/**
 * Trigger fresh QR code generation or connection attempt via Railway API
 */
export async function initializeWhatsAppWeb(): Promise<WhatsAppWebStatus> {
  // 1. Update Firestore state
  try {
    const docRef = doc(firestoreDb, 'whatsappConnections', 'clinic-flagship');
    await setDoc(
      docRef,
      {
        status: 'INITIALIZING',
        updatedAt: serverTimestamp(),
        error: null,
      },
      { merge: true }
    );
  } catch (e) {
    //
  }

  // 2. Call Railway connect endpoint
  try {
    await fetch(`${WHATSAPP_API_URL}/whatsapp/connect`, {
      method: 'POST',
      headers: getServiceHeaders(),
      body: JSON.stringify({ clinicId: 'clinic-flagship' }),
    });
  } catch (e) {
    // Direct fetch error handling
  }

  return await getWhatsAppWebStatus();
}

/**
 * Instantly pair a simulated WhatsApp device for testing
 */
export async function simulatePairWhatsAppWeb(): Promise<WhatsAppWebStatus> {
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/whatsapp/simulate-pair`, {
      method: 'POST',
      headers: getServiceHeaders(),
      body: JSON.stringify({ clinicId: 'clinic-flagship' }),
    });
    if (res.ok) return await getWhatsAppWebStatus();
  } catch (e) {
    //
  }

  // Fallback direct write to Firestore for instant link
  try {
    const docRef = doc(firestoreDb, 'whatsappConnections', 'clinic-flagship');
    await setDoc(
      docRef,
      {
        status: 'READY',
        qrDataUrl: null,
        phoneNumber: '15553368672',
        user: { id: '15553368672@s.whatsapp.net', name: 'Dentora Main Clinic (+1 555-DENTORA)' },
        updatedAt: new Date(),
        error: null,
      },
      { merge: true }
    );
  } catch (err) {
    //
  }

  return {
    status: 'connected',
    qrDataUrl: null,
    user: { id: '15553368672@s.whatsapp.net', name: 'Dentora Main Clinic (+1 555-DENTORA)' },
    error: null,
  };
}

/**
 * Unlink phone and clear WhatsApp session
 */
export async function logoutWhatsAppWeb(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/whatsapp/disconnect`, {
      method: 'POST',
      headers: getServiceHeaders(),
      body: JSON.stringify({ clinicId: 'clinic-flagship' }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    //
  }

  // Fallback set in Firestore
  try {
    const docRef = doc(firestoreDb, 'whatsappConnections', 'clinic-flagship');
    await setDoc(docRef, { status: 'DISCONNECTED', qrDataUrl: null, phoneNumber: null, user: null, updatedAt: new Date() }, { merge: true });
    return { success: true, message: 'Disconnected in Firestore' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Enqueue notification job into Firestore with idempotency check
 */
export async function createNotificationJobIfNotExists(job: {
  type: NotificationType;
  appointmentId: string;
  clinicId?: string;
  phoneNumber: string;
  recipientName: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  treatmentName?: string;
}): Promise<string> {
  const clinicId = job.clinicId || 'clinic-flagship';
  const normPhone = formatPhoneForWhatsApp(job.phoneNumber);

  try {
    // Idempotency check: look for existing job with same appointmentId and type
    const q = query(
      collection(firestoreDb, 'notificationJobs'),
      where('appointmentId', '==', job.appointmentId),
      where('type', '==', job.type)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    const newDocRef = doc(collection(firestoreDb, 'notificationJobs'));
    const jobId = newDocRef.id;

    await setDoc(newDocRef, {
      id: jobId,
      type: job.type,
      appointmentId: job.appointmentId,
      clinicId,
      phoneNumber: normPhone || job.phoneNumber,
      recipientName: job.recipientName,
      doctorName: job.doctorName || '',
      appointmentDate: job.appointmentDate || '',
      appointmentTime: job.appointmentTime || '',
      treatmentName: job.treatmentName || '',
      status: 'queued',
      attempts: 0,
      error: null,
      whatsappMessageId: null,
      createdAt: serverTimestamp(),
      processedAt: null,
      lastAttemptAt: null,
    });

    return jobId;
  } catch (err) {
    console.warn('Error creating Firestore notification job:', err);
    return `job_${Date.now()}`;
  }
}

/**
 * Real-time subscription to Notification Jobs queue history for Admin Dashboard
 */
export function subscribeToNotificationJobs(
  clinicId: string = 'clinic-flagship',
  onUpdate: (jobs: NotificationJob[]) => void
) {
  const q = query(
    collection(firestoreDb, 'notificationJobs'),
    where('clinicId', '==', clinicId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs: NotificationJob[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<NotificationJob, 'id'>),
      }));
      onUpdate(jobs);
    },
    (_err) => {
      onUpdate([]);
    }
  );
}

/**
 * Retry a failed notification job in Firestore
 */
export async function retryNotificationJob(jobId: string): Promise<boolean> {
  try {
    const docRef = doc(firestoreDb, 'notificationJobs', jobId);
    await updateDoc(docRef, {
      status: 'queued',
      attempts: 0,
      error: null,
      lastAttemptAt: serverTimestamp(),
    });

    // Notify Railway worker to process
    fetch(`${WHATSAPP_API_URL}/whatsapp/retry-job`, {
      method: 'POST',
      headers: getServiceHeaders(),
      body: JSON.stringify({ jobId }),
    }).catch(() => {});

    return true;
  } catch (err) {
    console.error('Error retrying notification job:', err);
    return false;
  }
}

/**
 * Sends automated WhatsApp notification via WhatsApp Web bot,
 * enqueues job in Firestore, and returns 1-click WhatsApp deep link.
 */
export async function sendWhatsAppAppointmentNotification(
  opts: WhatsAppMessageOptions
): Promise<SendWhatsAppResponse> {
  const deepLink = getWhatsAppDeepLink(opts);
  const appointmentId = opts.appointmentId || `apt_${Date.now()}`;

  // 1. Enqueue job into Firestore with idempotency check
  const jobId = await createNotificationJobIfNotExists({
    type: 'appointment_confirmation',
    appointmentId,
    clinicId: 'clinic-flagship',
    phoneNumber: opts.recipientPhone,
    recipientName: opts.patientName,
    doctorName: opts.doctorName,
    appointmentDate: opts.date,
    appointmentTime: opts.timeSlot,
    treatmentName: opts.treatmentName,
  });

  // 2. Call Railway backend endpoint to trigger immediate dispatch
  try {
    const res = await fetch(`${WHATSAPP_API_URL}/whatsapp/enqueue-job`, {
      method: 'POST',
      headers: getServiceHeaders(),
      body: JSON.stringify({
        type: 'appointment_confirmation',
        appointmentId,
        clinicId: 'clinic-flagship',
        phoneNumber: opts.recipientPhone,
        recipientName: opts.patientName,
        doctorName: opts.doctorName,
        appointmentDate: opts.date,
        appointmentTime: opts.timeSlot,
        treatmentName: opts.treatmentName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        sentViaApi: true,
        whatsappDeepLink: deepLink,
        message: data.message || 'Automated WhatsApp message dispatched via Railway bot!',
        jobId,
      };
    }
  } catch (err) {
    // Railway offline / network error
  }

  return {
    success: true,
    sentViaApi: false,
    whatsappDeepLink: deepLink,
    message: 'Notification job queued in Firestore. Generated 1-click WhatsApp deep link.',
    jobId,
  };
}
