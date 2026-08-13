import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Guard against unhandled Baileys / WebSocket process crashes
process.on('uncaughtException', (err: any) => {
  if (err?.message?.includes('socket') || err?.message?.includes('Baileys') || err?.message?.includes('WebSocket') || err?.code === 'ECONNRESET') {
    console.warn('Handled background WhatsApp socket error:', err.message);
  } else {
    console.error('Uncaught Exception:', err);
  }
});

process.on('unhandledRejection', (reason: any) => {
  console.warn('Unhandled Rejection in background task:', reason?.message || reason);
});

let waSocket: any = null;
let currentQrCodeDataUrl: string | null = null;
let connectionState: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' = 'disconnected';
let connectedUser: { id?: string; name?: string } | null = null;
let lastError: string | null = null;

const AUTH_FOLDER = path.join(process.cwd(), '.whatsapp_auth');

async function syncStatusToFirestore() {
  try {
    if (!db) return;
    const docRef = doc(db, 'whatsappConnections', 'clinic-flagship');
    await setDoc(
      docRef,
      {
        status: connectionState === 'qr_ready' ? 'QR_REQUIRED' : connectionState === 'connected' ? 'READY' : connectionState === 'connecting' ? 'INITIALIZING' : 'DISCONNECTED',
        qrDataUrl: currentQrCodeDataUrl,
        user: connectedUser,
        phoneNumber: connectedUser?.id ? connectedUser.id.split('@')[0] : null,
        updatedAt: new Date(),
        error: lastError,
      },
      { merge: true }
    );
  } catch (err: any) {
    console.warn('Failed to sync WhatsApp status to Firestore:', err?.message || err);
  }
}

export function getWhatsAppStatus() {
  return {
    status: connectionState,
    qrDataUrl: currentQrCodeDataUrl,
    qr: currentQrCodeDataUrl,
    available: connectionState === 'qr_ready' && !!currentQrCodeDataUrl,
    user: connectedUser,
    error: lastError,
  };
}

export async function initWhatsAppBot(forceRestart = false) {
  if (!forceRestart && (connectionState === 'connecting' || connectionState === 'connected' || connectionState === 'qr_ready')) {
    return getWhatsAppStatus();
  }

  try {
    if (forceRestart && connectionState !== 'connected') {
      try {
        if (waSocket) {
          waSocket.end(undefined);
          waSocket = null;
        }
        if (fs.existsSync(AUTH_FOLDER)) {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        }
      } catch (cleanErr) {
        console.warn('Error clearing previous session files:', cleanErr);
      }
    }

    connectionState = 'connecting';
    currentQrCodeDataUrl = null;
    lastError = null;
    syncStatusToFirestore();

    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const qrTimeout = setTimeout(() => {
      if (connectionState === 'connecting' && !currentQrCodeDataUrl) {
        connectionState = 'disconnected';
        lastError = 'WhatsApp Web server connection timed out. Click "Retry QR Generation" to try again.';
        syncStatusToFirestore();
      }
    }, 25000);

    // Initialize Baileys socket asynchronously
    useMultiFileAuthState(AUTH_FOLDER).then(async ({ state, saveCreds }) => {
      const { version } = await fetchLatestBaileysVersion().catch(() => ({
        version: [2, 3000, 1015901307] as [number, number, number],
      }));
      console.log(`📡 Connecting WhatsApp Web via Baileys (protocol v${version.join('.')})...`);

      waSocket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }) as any,
        browser: Browsers.ubuntu('Chrome'),
        connectTimeoutMs: 30000,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 15000,
      });

      waSocket.ev.on('creds.update', saveCreds);

      waSocket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          clearTimeout(qrTimeout);
          try {
            console.log('📱 Official Baileys WhatsApp QR Code generated!');
            currentQrCodeDataUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              width: 280,
              color: { dark: '#0b2e78', light: '#ffffff' },
            });
            connectionState = 'qr_ready';
            lastError = null;
            syncStatusToFirestore();
          } catch (qrErr: any) {
            console.error('Error generating QR Data URL from Baileys string:', qrErr);
          }
        }

        if (connection === 'open') {
          clearTimeout(qrTimeout);
          connectionState = 'connected';
          currentQrCodeDataUrl = null;
          connectedUser = waSocket.user || { name: 'Dentora Main Practice WhatsApp (+1 555-DENTORA)', id: waSocket.user?.id || '15553368672@s.whatsapp.net' };
          console.log('✅ WhatsApp Web (Baileys) Bot Connected Successfully!');
          syncStatusToFirestore();
        }

        if (connection === 'close') {
          clearTimeout(qrTimeout);
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect && connectionState === 'connected') {
            console.log('WhatsApp connection temporarily closed, reconnecting...');
            initWhatsAppBot(true);
          } else if (statusCode === DisconnectReason.loggedOut) {
            connectionState = 'disconnected';
            currentQrCodeDataUrl = null;
            connectedUser = null;
            lastError = 'Logged out from phone or session expired. Please scan QR code again.';
            syncStatusToFirestore();
          }
        }
      });
    }).catch(err => {
      clearTimeout(qrTimeout);
      console.warn('Baileys socket background init warning:', err.message);
      connectionState = 'disconnected';
      lastError = err.message || 'Failed to initialize WhatsApp Web gateway';
      syncStatusToFirestore();
    });

  } catch (err: any) {
    console.error('Failed to initialize WhatsApp Web bot:', err);
    connectionState = 'disconnected';
    lastError = err.message || 'Failed to initialize WhatsApp Web bot';
  }

  return getWhatsAppStatus();
}

export function simulatePairWhatsAppDevice() {
  connectionState = 'connected';
  currentQrCodeDataUrl = null;
  connectedUser = {
    id: '15553368672@s.whatsapp.net',
    name: 'Dentora Main Clinic (+1 555-DENTORA)',
  };
  lastError = null;
  syncStatusToFirestore();
  return getWhatsAppStatus();
}

export async function logoutWhatsAppBot() {
  try {
    if (waSocket) {
      try {
        await waSocket.logout();
      } catch (e) {
        // Ignore logout errors
      }
      waSocket = null;
    }

    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    }

    connectionState = 'disconnected';
    currentQrCodeDataUrl = null;
    connectedUser = null;
    lastError = null;
    syncStatusToFirestore();

    return { success: true, message: 'Logged out and WhatsApp session cleared.' };
  } catch (err: any) {
    console.error('Error logging out WhatsApp bot:', err);
    return { success: false, error: err.message || 'Logout failed' };
  }
}

export async function sendWhatsAppMessageViaWeb(phone: string, text: string) {
  if (connectionState !== 'connected' || !waSocket) {
    throw new Error('WhatsApp Web bot is not connected. Please scan the QR code in Settings > WhatsApp to pair your device.');
  }

  let cleaned = (phone || '').replace(/[^\d]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.length === 11 && cleaned.startsWith('07')) {
    cleaned = '44' + cleaned.substring(1);
  } else if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }

  if (!cleaned) {
    throw new Error('Invalid recipient phone number.');
  }

  const jid = `${cleaned}@s.whatsapp.net`;

  await waSocket.sendMessage(jid, { text });
  return { success: true, jid };
}
