import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { initFirebaseAdmin, auth, db } from './firebase.js';
import {
  initializeWhatsAppClient,
  getWhatsAppStatus,
  getWhatsAppQr,
  sendWhatsAppMessage,
  disconnectWhatsAppClient,
  simulatePairWhatsAppClient,
} from './whatsapp.js';
import {
  startNotificationQueueWorker,
  processPendingNotificationQueue,
  createNotificationJobIfNotExists,
} from './queue.js';
import { normalizePhoneNumber } from './utils/phone.js';
import { renderTemplate, DEFAULT_TEMPLATES, NotificationType } from './messageTemplates.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const SERVICE_SECRET = process.env.WHATSAPP_SERVICE_SECRET || 'Teethly_secret';

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = (req.headers.origin as string) || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-service-secret');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Initialize Firebase Admin
initFirebaseAdmin();

// Authentication Middleware
async function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const secretHeader = req.headers['x-service-secret'];

  if (secretHeader && secretHeader === SERVICE_SECRET) {
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    try {
      if (auth) {
        const decodedToken = await auth.verifyIdToken(idToken);
        (req as any).user = decodedToken;
        return next();
      }
    } catch (err) {
      logger.warn({ err }, 'Invalid Firebase ID Token');
    }
  }

  // Allow unauthenticated status/health checks for demo/dev mode if configured
  if (req.path === '/health' || req.path === '/whatsapp/status' || req.path === '/whatsapp/qr') {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized. Valid Firebase ID token or service secret required.' });
}

app.use(authenticateRequest);

// HEALTH ENDPOINT
app.get('/health', (_req: Request, res: Response) => {
  const waStatus = getWhatsAppStatus();
  res.json({
    status: waStatus.status === 'READY' ? 'ok' : 'degraded',
    service: 'Teethly-whatsapp',
    whatsapp: waStatus.status,
    firebase: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// GET WHATSAPP CONNECTION STATUS
app.get('/whatsapp/status', (_req: Request, res: Response) => {
  res.json(getWhatsAppStatus());
});

// GET WHATSAPP QR CODE
app.get('/whatsapp/qr', (_req: Request, res: Response) => {
  res.json(getWhatsAppQr());
});

// INITIALIZE / CONNECT WHATSAPP CLIENT
app.post('/whatsapp/connect', async (req: Request, res: Response) => {
  const clinicId = req.body.clinicId || 'clinic-flagship';
  const status = await initializeWhatsAppClient(clinicId);
  res.json(status);
});

// SIMULATE PAIR DEVICE
app.post('/whatsapp/simulate-pair', async (req: Request, res: Response) => {
  const clinicId = req.body.clinicId || 'clinic-flagship';
  const status = simulatePairWhatsAppClient(clinicId);
  res.json(status);
});

// DISCONNECT / LOGOUT WHATSAPP CLIENT
app.post('/whatsapp/disconnect', async (req: Request, res: Response) => {
  const clinicId = req.body.clinicId || 'clinic-flagship';
  const success = await disconnectWhatsAppClient(clinicId);
  res.json({ success, message: success ? 'WhatsApp client disconnected' : 'Disconnect failed' });
});

// SEND TEST MESSAGE
app.post('/whatsapp/send-test', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message are required' });
    }

    const normalized = normalizePhoneNumber(phoneNumber);
    const msgId = await sendWhatsAppMessage(normalized, message);

    res.json({
      success: true,
      whatsappMessageId: msgId,
      message: 'Test WhatsApp message sent successfully!',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to send test message',
    });
  }
});

// ENQUEUE NOTIFICATION JOB
app.post('/whatsapp/enqueue-job', async (req: Request, res: Response) => {
  try {
    const {
      type = 'appointment_confirmation',
      appointmentId,
      clinicId = 'clinic-flagship',
      phoneNumber,
      recipientName,
      doctorName,
      appointmentDate,
      appointmentTime,
      treatmentName,
      amount,
      customTemplate,
    } = req.body;

    if (!appointmentId || !phoneNumber || !recipientName) {
      return res.status(400).json({ error: 'appointmentId, phoneNumber, and recipientName are required' });
    }

    const result = await createNotificationJobIfNotExists({
      type: type as NotificationType,
      appointmentId,
      clinicId,
      phoneNumber,
      recipientName,
      doctorName,
      appointmentDate,
      appointmentTime,
      treatmentName,
      amount,
      customTemplate,
    });

    // Trigger immediate background processing
    processPendingNotificationQueue().catch((e) => logger.error({ e }, 'Error triggering immediate queue process'));

    res.json({
      success: true,
      jobId: result.id,
      created: result.created,
      message: result.created ? 'Notification job queued successfully' : 'Duplicate job ignored (idempotent)',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to enqueue job' });
  }
});

// PROCESS QUEUE MANUALLY
app.post('/whatsapp/process-job', async (_req: Request, res: Response) => {
  try {
    const count = await processPendingNotificationQueue();
    res.json({ success: true, processedCount: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed processing queue' });
  }
});

// GET NOTIFICATION HISTORY / LOGS
app.get('/whatsapp/notifications', async (req: Request, res: Response) => {
  try {
    const clinicId = (req.query.clinicId as string) || 'clinic-flagship';
    const statusFilter = req.query.status as string;

    let query: any = db.collection('notificationJobs').where('clinicId', '==', clinicId);

    if (statusFilter && statusFilter !== 'all') {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();

    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notification history' });
  }
});

// RETRY FAILED NOTIFICATION JOB
app.post('/whatsapp/retry-job', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId is required' });

    await db.collection('notificationJobs').doc(jobId).update({
      status: 'queued',
      attempts: 0,
      error: null,
      lastAttemptAt: new Date(),
    });

    processPendingNotificationQueue().catch((e) => logger.error({ e }, 'Queue process after retry error'));

    res.json({ success: true, message: 'Notification job requeued for retry' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retry job' });
  }
});

// Start Server & Queue Worker
app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`Teethly Persistent WhatsApp Service running on port ${PORT} (0.0.0.0)`);

  // Auto-initialize WhatsApp client & start background worker
  initializeWhatsAppClient().catch((e) => logger.error({ e }, 'Auto init error'));
  startNotificationQueueWorker();
});
