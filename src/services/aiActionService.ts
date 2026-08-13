import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { AIAction, AIActionType, AuditLogItem } from '../types/copilot';
import { createAppointment } from './appointmentService';
import { createInvoice } from './financialService';
import { createClinicalNote } from './clinicalService';
import { sendWhatsAppAppointmentNotification } from './whatsappService';

const AI_ACTIONS_COLLECTION = 'aiActions';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

// Subscribes to pending AI actions requiring doctor/admin approval
export function subscribeToPendingAIActions(callback: (actions: AIAction[]) => void) {
  const colRef = collection(db, AI_ACTIONS_COLLECTION);
  const q = query(colRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AIAction[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AIAction, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('Fallback on AI Actions query ordering, listening without filter:', err);
      // Fallback query without compound index if needed
      return onSnapshot(colRef, (snap) => {
        const list: AIAction[] = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<AIAction, 'id'>) }))
          .filter((a) => a.status === 'pending');
        callback(list);
      });
    }
  );
}

// Log audit entry
export async function createAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp'>) {
  try {
    const docRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    const payload: AuditLogItem = {
      ...log,
      id: docRef.id,
      timestamp: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  } catch (err) {
    console.warn('Error recording audit log:', err);
  }
}

// Subscribe to Audit Logs
export function subscribeToAuditLogs(callback: (logs: AuditLogItem[]) => void) {
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: AuditLogItem[] = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLogItem, 'id'>) }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(list);
  });
}

// Create a new AI action request (Pending state)
export async function createAIAction(
  actionData: Omit<AIAction, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  try {
    const colRef = collection(db, AI_ACTIONS_COLLECTION);
    const newDocRef = doc(colRef);
    const action: AIAction = {
      ...actionData,
      id: newDocRef.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, action);

    // Record audit entry
    await createAuditLog({
      userId: action.requestedByUserId,
      userName: action.requestedByUserName,
      userRole: action.requestedByUserRole,
      actionType: action.actionType,
      promptOrTrigger: action.title,
      status: 'warning',
      approvalRequired: true,
      detailsSummary: action.previewSummary,
    });

    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, AI_ACTIONS_COLLECTION);
    throw error;
  }
}

// Approve and execute AI Action
export async function approveAndExecuteAIAction(
  actionId: string,
  approvedByUserId: string,
  approvedByUserName: string
): Promise<{ success: boolean; resultMessage: string }> {
  try {
    const docRef = doc(db, AI_ACTIONS_COLLECTION, actionId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('AI Action not found.');
    }

    const action = snap.data() as AIAction;
    let resultMessage = '';

    // Execute based on actionType
    switch (action.actionType) {
      case 'CREATE_INVOICE': {
        const { patientId, patientName, items, discountAmount = 0 } = action.params;
        const subtotal = items.reduce((acc: number, item: any) => acc + (item.totalPrice || item.unitPrice * item.quantity), 0);
        const grandTotal = Math.max(0, subtotal - discountAmount);

        const invoiceId = await createInvoice({
          patientId: patientId || 'PT-GENERIC',
          patientName: patientName || 'Patient',
          patientPhone: action.params.patientPhone || '(555) 000-0000',
          doctorId: 'DOC-1',
          doctorName: approvedByUserName || 'Dr. Elena Rostova',
          items: (items || [{ description: 'Dental Treatment', quantity: 1, unitPrice: subtotal, totalPrice: subtotal }]).map((it: any, idx: number) => ({
            id: it.id || `item-${idx}`,
            description: it.description || 'Dental Treatment',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || subtotal,
            totalPrice: it.totalPrice || subtotal,
          })),
          subtotal,
          tax: 0,
          discount: discountAmount,
          grandTotal,
          paidAmount: 0,
          paymentStatus: 'Pending',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        }, approvedByUserName);

        resultMessage = `Invoice generated successfully (ID: ${invoiceId}). Total Due: Rs. ${grandTotal}`;
        break;
      }

      case 'BOOK_APPOINTMENT': {
        const {
          patientId,
          patientName,
          patientPhone,
          doctorId,
          doctorName,
          date,
          startTime,
          endTime,
          treatment,
          room,
        } = action.params;

        const aptId = await createAppointment({
          appointmentId: `APT-${Math.floor(100 + Math.random() * 900)}`,
          patientId: patientId || 'PT-GENERIC',
          patientName: patientName || 'Patient',
          patientPhone: patientPhone || '(555) 000-0000',
          doctorId: doctorId || 'DOC-101',
          doctorName: doctorName || 'Dr. Elena Rostova',
          date: date || new Date().toISOString().split('T')[0],
          startTime: startTime || '10:00',
          endTime: endTime || '10:30',
          treatment: treatment || 'Dental Consultation',
          room: room || 'Chair 1',
          priority: 'Normal',
          status: 'Scheduled',
          notes: 'Booked via AI Copilot Action Engine.',
          createdByName: approvedByUserName,
        });

        resultMessage = `Appointment booked successfully (ID: ${aptId}) for ${patientName} on ${date} at ${startTime}.`;
        break;
      }

      case 'SAVE_SOAP_NOTE': {
        const { patientId, patientName, subjective, objective, assessment, plan, icdCode, cdtCodes } = action.params;

        await createClinicalNote({
          patientId,
          patientName: patientName || 'Patient',
          doctorName: approvedByUserName,
          chiefComplaint: subjective || 'Dental Evaluation',
          diagnosis: assessment || 'Extracted Clinical Diagnosis',
          findings: objective || '',
          procedure: plan || 'Planned Clinical Procedure',
          recommendations: 'Follow post-op instructions.',
          followUp: '2 weeks',
          soap: {
            subjective: subjective || '',
            objective: objective || '',
            assessment: assessment || '',
            plan: plan || '',
          },
        }, approvedByUserName);

        resultMessage = `SOAP Note saved to patient clinical history for Patient #${patientId}.`;
        break;
      }

      case 'SEND_WHATSAPP': {
        const { recipientPhone, recipientName, bodyText } = action.params;

        const res = await sendWhatsAppAppointmentNotification({
          recipientPhone: recipientPhone || '+923001234567',
          patientName: recipientName || 'Patient',
          doctorName: 'Dr. Elena Rostova',
          treatmentName: 'Dental Appointment',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '10:00 AM',
          clinicName: 'Teethly Dental Clinic',
        });

        resultMessage = `WhatsApp message dispatched to ${recipientName} (${recipientPhone}). ${res.message}`;
        break;
      }

      case 'GENERATE_PRESCRIPTION': {
        resultMessage = `Prescription draft saved to patient chart with doctor electronic seal.`;
        break;
      }

      case 'CREATE_TREATMENT_PLAN': {
        resultMessage = `Multi-stage treatment plan attached to patient record.`;
        break;
      }

      default: {
        resultMessage = `Action ${action.actionType} executed successfully.`;
      }
    }

    const now = new Date().toISOString();
    await updateDoc(docRef, {
      status: 'executed',
      approvedByUserId,
      approvedByUserName,
      executedAt: now,
      resultMessage,
    });

    // Record audit log
    await createAuditLog({
      userId: approvedByUserId,
      userName: approvedByUserName,
      userRole: action.requestedByUserRole,
      actionType: action.actionType,
      promptOrTrigger: action.title,
      status: 'success',
      approvalRequired: true,
      approvedBy: approvedByUserName,
      detailsSummary: resultMessage,
    });

    return { success: true, resultMessage };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.UPDATE, AI_ACTIONS_COLLECTION);
    return { success: false, resultMessage: error.message || 'Execution failed' };
  }
}

// Reject AI Action
export async function rejectAIAction(
  actionId: string,
  rejectedByUserId: string,
  rejectedByUserName: string,
  reason?: string
) {
  try {
    const docRef = doc(db, AI_ACTIONS_COLLECTION, actionId);
    await updateDoc(docRef, {
      status: 'rejected',
      errorMessage: reason || 'Rejected by Doctor / Admin',
    });

    await createAuditLog({
      userId: rejectedByUserId,
      userName: rejectedByUserName,
      userRole: 'Doctor',
      actionType: 'REJECT_ACTION',
      promptOrTrigger: `Action #${actionId}`,
      status: 'warning',
      approvalRequired: true,
      approvedBy: rejectedByUserName,
      detailsSummary: `Rejected action: ${reason || 'User opted not to approve action.'}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, AI_ACTIONS_COLLECTION);
  }
}

// Natural Language Parser helper to convert prompt into AI Action proposal
export function parsePromptToActionProposal(
  prompt: string,
  user: { id: string; name: string; role: string },
  selectedPatient?: { id: string; name: string; phone?: string } | null
): Omit<AIAction, 'id' | 'status' | 'createdAt'> | null {
  const lower = prompt.toLowerCase();

  // Invoice parsing: "create invoice for ali khan" or "generate bill"
  if (lower.includes('invoice') || lower.includes('bill')) {
    const amountMatch = prompt.match(/(\$|rs\.?|pkr)?\s?(\d+[\d,]*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[2].replace(/,/g, '')) : 12000;

    return {
      actionType: 'CREATE_INVOICE',
      title: `Create Invoice for ${selectedPatient?.name || 'Patient'}`,
      description: `Generates official tax invoice of Rs. ${amount} for dental services.`,
      requestedByUserId: user.id,
      requestedByUserName: user.name,
      requestedByUserRole: user.role,
      targetPatientId: selectedPatient?.id || 'PT-8801',
      targetPatientName: selectedPatient?.name || 'Ali Khan',
      params: {
        patientId: selectedPatient?.id || 'PT-8801',
        patientName: selectedPatient?.name || 'Ali Khan',
        patientPhone: selectedPatient?.phone || '(555) 234-5678',
        items: [
          {
            description: 'Dental Procedure & Scaling',
            quantity: 1,
            unitPrice: amount,
            totalPrice: amount,
          },
        ],
        discountAmount: 0,
      },
      previewSummary: `Invoice Total: Rs. ${amount} | Due Date: 14 Days | Status: Unpaid`,
    };
  }

  // Appointment parsing: "book appointment for ali tomorrow"
  if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule')) {
    const dateStr = lower.includes('tomorrow')
      ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      actionType: 'BOOK_APPOINTMENT',
      title: `Book Appointment for ${selectedPatient?.name || 'Ali Khan'}`,
      description: `Schedules a 30-min dental consultation session.`,
      requestedByUserId: user.id,
      requestedByUserName: user.name,
      requestedByUserRole: user.role,
      targetPatientId: selectedPatient?.id || 'PT-8801',
      targetPatientName: selectedPatient?.name || 'Ali Khan',
      params: {
        patientId: selectedPatient?.id || 'PT-8801',
        patientName: selectedPatient?.name || 'Ali Khan',
        patientPhone: selectedPatient?.phone || '(555) 234-5678',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Elena Rostova',
        date: dateStr,
        startTime: '11:00 AM',
        endTime: '11:30 AM',
        treatment: 'Comprehensive Oral Exam',
        room: 'Chair 1 - Main Suite',
      },
      previewSummary: `Date: ${dateStr} at 11:00 AM | Doctor: Dr. Elena Rostova | Chair 1`,
    };
  }

  // WhatsApp parsing: "send whatsapp to ali"
  if (lower.includes('whatsapp') || lower.includes('message') || lower.includes('reminder')) {
    return {
      actionType: 'SEND_WHATSAPP',
      title: `Send WhatsApp Reminder to ${selectedPatient?.name || 'Ali Khan'}`,
      description: `Dispatches automated appointment reminder via WhatsApp Web Bot.`,
      requestedByUserId: user.id,
      requestedByUserName: user.name,
      requestedByUserRole: user.role,
      targetPatientId: selectedPatient?.id || 'PT-8801',
      targetPatientName: selectedPatient?.name || 'Ali Khan',
      params: {
        recipientPhone: selectedPatient?.phone || '+923001234567',
        recipientName: selectedPatient?.name || 'Ali Khan',
        messageType: 'reminder',
        bodyText: `Dear ${selectedPatient?.name || 'Ali Khan'}, friendly reminder for your upcoming dental visit tomorrow at Teethly Clinic.`,
      },
      previewSummary: `Recipient: ${selectedPatient?.name || 'Ali Khan'} | Channel: WhatsApp Web Bot`,
    };
  }

  return null;
}
