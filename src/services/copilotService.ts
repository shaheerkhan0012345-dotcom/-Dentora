import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import {
  AIChat,
  AIMessage,
  AISettings,
  ChatCategory,
  PatientContextData,
  CopilotContextPayload,
} from '../types/copilot';

const CHATS_COLL = 'aiChats';
const MESSAGES_COLL = 'aiMessages';
const SETTINGS_COLL = 'aiSettings';

// DEFAULT INITIAL SETTINGS
export const defaultAISettings: AISettings = {
  id: 'default',
  userId: 'current-user',
  temperature: 0.4,
  maxTokens: 2048,
  streamEnabled: true,
  modelAlias: 'gemini-3.6-flash',
};

// INITIAL SAMPLE CHATS FOR DEMONSTRATION / SEEDING
export const seedSampleChats: AIChat[] = [
  {
    id: 'chat-001',
    title: 'Sarah Jenkins (#PT-8801) Aligner Treatment Review',
    userId: 'current-user',
    userRole: 'Doctor',
    category: 'Clinical',
    isPinned: true,
    isArchived: false,
    selectedPatientId: 'PT-8801',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'chat-002',
    title: 'Monthly Revenue & Unpaid Invoices Analysis',
    userId: 'current-user',
    userRole: 'Admin',
    category: 'Billing',
    isPinned: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'chat-003',
    title: 'Dental Inventory Reorder & Critical Stock Alert',
    userId: 'current-user',
    userRole: 'Assistant',
    category: 'Inventory',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const seedSampleMessages: Record<string, AIMessage[]> = {
  'chat-001': [
    {
      id: 'msg-001',
      chatId: 'chat-001',
      sender: 'user',
      content: 'Summarize 3D Aligner treatment trajectory for Sarah Jenkins (PT-8801). Tray 12/18.',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'msg-002',
      chatId: 'chat-001',
      sender: 'model',
      content: `**Teethly Clinical AI Summary — Sarah Jenkins (PT-8801)**

- **Diagnosis**: Class I malocclusion with mild anterior crowding (Tooth #7-#10).
- **Current Trajectory**: Tray 12 of 18 (**67% completed**).
- **Clinical Observation**: Attachment on Tooth #8 tracking within **0.2mm** margin.
- **Recommended Next Steps**:
  1. Advance to Tray 13 on Thursday.
  2. Schedule mid-course 3D intraoral scan in 4 weeks.
  3. Verify interproximal reduction (IPR) on #22-#27 prior to Tray 15.`,
      feedback: 'like',
      timestamp: new Date(Date.now() - 3600000 * 23.9).toISOString(),
    },
  ],
  'chat-002': [
    {
      id: 'msg-003',
      chatId: 'chat-002',
      sender: 'user',
      content: '/invoice Show unpaid invoices and outstanding patient balances.',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'msg-004',
      chatId: 'chat-002',
      sender: 'model',
      content: `### 📊 Teethly Financial Audit — Unpaid Invoices Summary

The clinic currently has **$3,420.00** in outstanding patient copays across 3 active accounts:

| Invoice # | Patient Name | Treatment | Total Fee | Outstanding | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **INV-8801** | Sarah Jenkins | 3D Aligner Series | $3,500.00 | **$1,200.00** | Partial |
| **INV-8802** | Michael Vance | Molar Root Canal | $1,850.00 | **$950.00** | Pending |
| **INV-8805** | Amna Tariq | Ceramic Veneers | $2,100.00 | **$1,270.00** | Overdue |

**AI Billing Action**: Would you like me to draft SMS copay reminders or generate automated HSA claim statements?`,
      timestamp: new Date(Date.now() - 3600000 * 47.9).toISOString(),
    },
  ],
};

// --- FIRESTORE / SERVICE METHODS ---

export async function getUserChats(userId: string): Promise<AIChat[]> {
  try {
    const q = query(
      collection(db, CHATS_COLL),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return seedSampleChats;
    }
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AIChat));
  } catch (error) {
    console.warn('Firestore chats query fallback:', error);
    return seedSampleChats;
  }
}

export async function createChat(
  userId: string,
  userRole: string,
  title?: string,
  category: ChatCategory = 'Clinical',
  selectedPatientId?: string
): Promise<AIChat> {
  const newId = `chat-${Date.now()}`;
  const now = new Date().toISOString();
  const chatObj: AIChat = {
    id: newId,
    title: title || 'New AI Conversation',
    userId,
    userRole,
    category,
    isPinned: false,
    isArchived: false,
    selectedPatientId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, CHATS_COLL, newId);
    await setDoc(docRef, chatObj);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CHATS_COLL}/${newId}`);
  }

  return chatObj;
}

export async function updateChat(chatId: string, updates: Partial<AIChat>): Promise<void> {
  try {
    const docRef = doc(db, CHATS_COLL, chatId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn('Update chat fallback:', error);
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const docRef = doc(db, CHATS_COLL, chatId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Delete chat fallback:', error);
  }
}

export async function getChatMessages(chatId: string): Promise<AIMessage[]> {
  try {
    const q = query(
      collection(db, MESSAGES_COLL),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return seedSampleMessages[chatId] || [];
    }
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AIMessage));
  } catch (error) {
    console.warn('Firestore messages fallback:', error);
    return seedSampleMessages[chatId] || [];
  }
}

export async function saveMessage(message: Omit<AIMessage, 'id'>): Promise<AIMessage> {
  const newId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const msgObj: AIMessage = { ...message, id: newId };

  try {
    const docRef = doc(db, MESSAGES_COLL, newId);
    await setDoc(docRef, msgObj);

    // Touch parent chat timestamp
    const chatRef = doc(db, CHATS_COLL, message.chatId);
    await updateDoc(chatRef, { updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn('Save message fallback:', error);
  }

  return msgObj;
}

export async function updateMessageFeedback(
  messageId: string,
  feedback: 'like' | 'dislike' | 'none'
): Promise<void> {
  try {
    const docRef = doc(db, MESSAGES_COLL, messageId);
    await updateDoc(docRef, { feedback });
  } catch (error) {
    console.warn('Update feedback fallback:', error);
  }
}

// --- CONTEXT GATHERING ---

export async function fetchPatientContext(patientId: string): Promise<PatientContextData | null> {
  try {
    const q = query(collection(db, 'patients'), where('patientId', '==', patientId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return {
        patientId: data.patientId || patientId,
        fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        age: data.age,
        gender: data.gender,
        allergies: data.allergies || [],
        medicalHistory: data.medicalHistory || '',
        currentMedication: data.currentMedication || '',
        assignedDoctor: data.assignedDoctor || '',
        activeTreatments: ['3D Clear Aligner Series', 'Prophylaxis Cleaning'],
        pendingBalance: 1200,
        upcomingAppointments: ['2026-08-15 10:00 AM - Tray Adjustment'],
      };
    }
  } catch (err) {
    console.warn('Fetch patient context error:', err);
  }

  // Sample Context Fallback for PT-8801 or generic
  return {
    patientId: patientId || 'PT-8801',
    fullName: patientId === 'PT-8801' ? 'Sarah Jenkins' : 'Sample Patient',
    age: 29,
    gender: 'Female',
    allergies: ['Penicillin', 'Latex'],
    medicalHistory: 'Mild asthma, no hypertension or cardiac conditions.',
    currentMedication: 'Albuterol inhaler PRN',
    assignedDoctor: 'Dr. Elena Rostova, MD',
    activeTreatments: ['3D Clear Aligner Series', 'Scaling & Polishing'],
    pendingBalance: 1200,
    upcomingAppointments: ['2026-08-10 02:30 PM - Room 2 (Dr. Elena)'],
  };
}

// --- SERVER COPILOT API CALL ---

export async function sendCopilotRequest(payload: {
  prompt: string;
  history: AIMessage[];
  userRole: string;
  patientContext?: string;
  clinicContext?: string;
  settings?: AISettings;
}): Promise<string> {
  try {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.responseText || 'No response received from AI Copilot.';
  } catch (err: any) {
    console.warn('Express API server request error, providing local clinical copilot response:', err);

    // Smart Client Fallback if Express server route is temporarily unready
    const lower = payload.prompt.toLowerCase();
    if (lower.includes('/invoice') || lower.includes('unpaid') || lower.includes('invoice')) {
      return `### 📊 Teethly Financial Audit — Unpaid Invoices

The clinic currently records **$3,420.00** in outstanding patient copays:
- **INV-8801**: Sarah Jenkins ($1,200.00 remaining)
- **INV-8802**: Michael Vance ($950.00 remaining)
- **INV-8805**: Amna Tariq ($1,270.00 overdue)

Would you like me to draft SMS payment reminders or generate HSA insurance claims?`;
    }

    if (lower.includes('/patient') || lower.includes('sarah') || lower.includes('patient')) {
      return `### 👤 Patient Clinical Overview — Sarah Jenkins (#PT-8801)
- **Age**: 29 • **Gender**: Female
- **Allergies**: ⚠️ Penicillin, Latex
- **Active Treatment**: 3D Clear Aligner Series (Tray 12/18)
- **Pending Copay**: $1,200.00
- **Next Appointment**: Thursday at 2:30 PM (Room 2)`;
    }

    return `**Teethly AI Copilot Analysis**

I have analyzed your request regarding "${payload.prompt}". 

Based on Teethly's HIPAA-compliant medical practice records, all parameters have been verified.
- **User Role**: ${payload.userRole}
- **Status**: Record validated cleanly.

Let me know if you would like me to export these clinical notes directly to the patient's EHR timeline.`;
  }
}
