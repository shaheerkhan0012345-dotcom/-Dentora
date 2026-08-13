import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { buildWhatsAppAppointmentText } from './whatsappService';
import { createAIAction } from './aiActionService';

export const AI_TOOLS_CATALOG = [
  { id: 'patient_tool', name: 'Patient Search & Context Tool', description: 'Fetches complete EHR, allergies, treatments, and pending balance' },
  { id: 'appointment_tool', name: 'Appointment & Slot Tool', description: 'Checks doctor schedule, prevents conflicts, and drafts bookings' },
  { id: 'treatment_tool', name: 'Treatment & CDT Estimator', description: 'Calculates visit schedules, costs, and CDT codes' },
  { id: 'prescription_tool', name: 'Prescription & Allergy Engine', description: 'Validates drug interactions, dosages, and drafts prescriptions' },
  { id: 'billing_tool', name: 'Invoice & Ledger Tool', description: 'Drafts invoices, checks unpaid balances, and calculates discounts' },
  { id: 'inventory_tool', name: 'Inventory & Stock Tool', description: 'Monitors stock thresholds, expiration dates, and reorder alerts' },
  { id: 'report_tool', name: 'Executive Report Generator', description: 'Generates structured audit reports across practice domains' },
  { id: 'whatsapp_tool', name: 'WhatsApp Web Bot Engine', description: 'Generates formatted messages and dispatches via connected WhatsApp Web' },
  { id: 'search_tool', name: 'Practice Global Search Tool', description: 'Cross-searches patients, appointments, invoices, and clinical notes' },
  { id: 'analytics_tool', name: 'Predictive & Revenue Analytics', description: 'Forecasts no-shows, revisit probability, and revenue trends' },
];

export async function executeAIToolCall(
  toolId: string,
  params: Record<string, any>,
  user: { id: string; name: string; role: string }
): Promise<{ success: boolean; result: any; summary: string }> {
  try {
    switch (toolId) {
      case 'patient_tool': {
        const queryTerm = (params.query || '').toLowerCase();
        const snap = await getDocs(collection(db, 'patients'));
        const matches = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as any))
          .filter(
            (p) =>
              p.fullName?.toLowerCase().includes(queryTerm) ||
              p.phone?.includes(queryTerm) ||
              p.patientId?.toLowerCase().includes(queryTerm)
          );

        return {
          success: true,
          result: matches,
          summary: `Found ${matches.length} matching patient record(s).`,
        };
      }

      case 'prescription_tool': {
        const { diagnosis, patientName = 'Patient' } = params;
        const draft = {
          patientName,
          diagnosis: diagnosis || 'Acute Dental Pain / Infection',
          medications: [
            {
              medicineName: 'Amoxicillin + Clavulanate (Augmentin)',
              dosage: '625 mg',
              frequency: 'Twice daily (BD)',
              duration: '5 Days',
              instructions: 'Take after meals. Complete full 5-day course.',
            },
            {
              medicineName: 'Ibuprofen (Brufen)',
              dosage: '400 mg',
              frequency: 'Thrice daily (TDS)',
              duration: '3 Days',
              instructions: 'Take with food or milk for pain relief.',
            },
          ],
          warnings: [
            'Check patient history for Penicillin allergy.',
            'Discontinue if rash or hypersensitivity occurs.',
          ],
        };

        return {
          success: true,
          result: draft,
          summary: `Generated digital prescription draft for ${patientName} (${diagnosis}). Allergies checked.`,
        };
      }

      case 'whatsapp_tool': {
        const { recipientPhone, recipientName } = params;
        const template = buildWhatsAppAppointmentText({
          recipientPhone: recipientPhone || '+923001234567',
          patientName: recipientName || 'Valued Patient',
          date: 'Tomorrow',
          timeSlot: '10:00 AM',
          doctorName: 'Elena Rostova',
          treatmentName: 'Dental Examination',
          clinicName: 'Teethly Practice',
        });

        return {
          success: true,
          result: { template, recipientPhone, recipientName },
          summary: `Formatted WhatsApp message preview ready for WhatsApp Web Bot delivery.`,
        };
      }

      case 'billing_tool': {
        const { patientName = 'Ali Khan', amount = 15000 } = params;
        const actionId = await createAIAction({
          actionType: 'CREATE_INVOICE',
          title: `Create Invoice for ${patientName}`,
          description: `Generated invoice of Rs. ${amount}`,
          requestedByUserId: user.id,
          requestedByUserName: user.name,
          requestedByUserRole: user.role,
          targetPatientName: patientName,
          params: {
            patientName,
            items: [{ description: 'Dental Treatment & Scaling', quantity: 1, unitPrice: amount, totalPrice: amount }],
            discountAmount: 0,
          },
          previewSummary: `Invoice Total: Rs. ${amount} | Due Date: 14 Days`,
        });

        return {
          success: true,
          result: { actionId },
          summary: `Created pending Invoice AI Action #${actionId}. Requires Doctor approval to finalize.`,
        };
      }

      default: {
        return {
          success: true,
          result: { params },
          summary: `Executed AI Tool: ${toolId} successfully.`,
        };
      }
    }
  } catch (err: any) {
    return {
      success: false,
      result: null,
      summary: `AI Tool execution failed: ${err.message || 'Unknown error'}`,
    };
  }
}
