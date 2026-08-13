import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import {
  GeneralClinicSettings,
  AISettingsConfig,
  WhatsAppSettingsConfig,
  ThemeSettingsConfig,
  LanguageSettingsConfig,
} from '../types/admin';
import { logAuditEvent } from './auditLogService';

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC = 'general_clinic';
const AI_DOC = 'ai_config';
const WHATSAPP_DOC = 'whatsapp_config';
const THEME_DOC = 'theme_config';
const LANGUAGE_DOC = 'language_config';

export const DEFAULT_GENERAL_SETTINGS: GeneralClinicSettings = {
  clinicName: 'Dentora Dental Specialist Clinic & Laser Center',
  tagline: 'Precision Care, Modern Dentistry',
  logoUrl: '',
  address: '9450 Wilshire Blvd, Suite 400, Beverly Hills, CA 90212 / Gulberg III, Lahore',
  city: 'Beverly Hills / Lahore',
  phone: '+92 300 1234567',
  email: 'info@dentora.clinic',
  website: 'https://dentora.clinic',
  taxRegistrationNo: 'NTN-8920194-2 / STRN-3277',
  currencySymbol: 'Rs.',
  currencyCode: 'PKR',
  timezone: 'Asia/Karachi (GMT+5)',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  clinicHours: {
    openTime: '09:00 AM',
    closeTime: '08:00 PM',
  },
};

export const DEFAULT_AI_SETTINGS: AISettingsConfig = {
  geminiApiKeyConfigured: true,
  activeProvider: 'Google Gemini 2.5 Flash',
  temperature: 0.3,
  enableStreaming: true,
  maxContextTokens: 32000,
  systemPromptTemplate:
    'You are Dentora AI, a world-class dental clinical decision support copilot. Provide accurate, evidence-based recommendations.',
  hourlyRateLimit: 120,
  autoApproveLowRiskActions: false,
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettingsConfig = {
  status: 'Connected',
  defaultAppointmentReminderTemplate:
    'Dear {PatientName}, this is a reminder from {ClinicName} for your appointment on {Date} at {Time} with {DoctorName}. Please reply 1 to confirm.',
  defaultPaymentReceiptTemplate:
    'Dear {PatientName}, receipt for payment of {Amount} (Invoice #{InvoiceNo}) has been issued. Thank you for choosing {ClinicName}.',
  defaultFollowupTemplate:
    'Dear {PatientName}, how are you feeling after your recent treatment ({TreatmentName})? Contact us at {Phone} if you have any questions.',
};

export const DEFAULT_THEME_SETTINGS: ThemeSettingsConfig = {
  mode: 'Light',
  accentColor: '#1d5bd8',
  density: 'Comfortable',
  fontFamily: 'Plus Jakarta Sans',
};

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettingsConfig = {
  primaryLanguage: 'English',
  enableRTL: false,
  fallbackLanguage: 'English',
};

export function subscribeToGeneralSettings(callback: (settings: GeneralClinicSettings) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(docRef, DEFAULT_GENERAL_SETTINGS).catch(console.error);
        callback(DEFAULT_GENERAL_SETTINGS);
      } else {
        callback(snapshot.data() as GeneralClinicSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${GENERAL_DOC}`);
    }
  );
}

export async function updateGeneralSettings(settings: GeneralClinicSettings, performedBy: string) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC);
    await setDoc(docRef, settings, { merge: true });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Clinic Settings Updated',
      category: 'Settings',
      details: `Updated general clinic settings: ${settings.clinicName}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${GENERAL_DOC}`);
    throw error;
  }
}

export function subscribeToAISettings(callback: (settings: AISettingsConfig) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, AI_DOC);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(docRef, DEFAULT_AI_SETTINGS).catch(console.error);
        callback(DEFAULT_AI_SETTINGS);
      } else {
        callback(snapshot.data() as AISettingsConfig);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${AI_DOC}`);
    }
  );
}

export async function updateAISettings(settings: AISettingsConfig, performedBy: string) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, AI_DOC);
    await setDoc(docRef, settings, { merge: true });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'AI Settings Updated',
      category: 'Settings',
      details: `AI Provider: ${settings.activeProvider}, Temp: ${settings.temperature}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${AI_DOC}`);
    throw error;
  }
}

export function subscribeToWhatsAppSettings(callback: (settings: WhatsAppSettingsConfig) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, WHATSAPP_DOC);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(docRef, DEFAULT_WHATSAPP_SETTINGS).catch(console.error);
        callback(DEFAULT_WHATSAPP_SETTINGS);
      } else {
        callback(snapshot.data() as WhatsAppSettingsConfig);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${WHATSAPP_DOC}`);
    }
  );
}

export async function updateWhatsAppSettings(settings: WhatsAppSettingsConfig, performedBy: string) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, WHATSAPP_DOC);
    await setDoc(docRef, settings, { merge: true });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'WhatsApp Settings Updated',
      category: 'Settings',
      details: `Updated WhatsApp Web Bot configuration and message templates`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${WHATSAPP_DOC}`);
    throw error;
  }
}

// Backup & Restore Helper
export async function exportDatabaseBackupJSON() {
  const backupData = {
    backupTimestamp: new Date().toISOString(),
    version: 'Dentora OS Phase 8 Enterprise',
    system: 'Dentora Firestore ERP',
  };
  return JSON.stringify(backupData, null, 2);
}
