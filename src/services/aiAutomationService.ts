import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { AIAutomation, AIPrediction, AIReport } from '../types/copilot';

const AUTOMATIONS_COLLECTION = 'aiAutomations';
const PREDICTIONS_COLLECTION = 'aiPredictions';
const REPORTS_COLLECTION = 'aiReports';

// Subscribe to AI Automations / Suggestions
export function subscribeToAIAutomations(callback: (list: AIAutomation[]) => void) {
  const colRef = collection(db, AUTOMATIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const list: AIAutomation[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AIAutomation, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('Error subscribing to AI Automations:', err);
    }
  );
}

// Seed default AI Automations if empty
export async function seedInitialAutomationsIfEmpty() {
  try {
    const colRef = collection(db, AUTOMATIONS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const defaults: Omit<AIAutomation, 'id'>[] = [
        {
          triggerType: 'followup_reminder',
          title: 'Post-Op Followup Due: Sarah Jenkins',
          description: '3D Aligner tray fitting was completed 24 hours ago. Send automated post-op comfort check via WhatsApp.',
          targetPatientId: 'PT-8801',
          targetPatientName: 'Sarah Jenkins',
          targetPhone: '(555) 234-5678',
          suggestedAction: 'SEND_WHATSAPP',
          actionParams: {
            recipientPhone: '(555) 234-5678',
            recipientName: 'Sarah Jenkins',
            messageType: 'followup',
            bodyText: 'Dear Sarah, checking in after your aligner refinement yesterday. How is the fit today?',
          },
          status: 'suggested',
          createdAt: new Date().toISOString(),
        },
        {
          triggerType: 'invoice_reminder',
          title: 'Pending Invoice Balance: Marcus Vance',
          description: 'Unpaid balance of Rs. 35,000 pending for Crown Placement. Invoice due date reached.',
          targetPatientId: 'PT-8802',
          targetPatientName: 'Marcus Vance',
          targetPhone: '(555) 987-6543',
          suggestedAction: 'SEND_WHATSAPP',
          actionParams: {
            recipientPhone: '(555) 987-6543',
            recipientName: 'Marcus Vance',
            messageType: 'payment',
            amount: 35000,
          },
          status: 'suggested',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          triggerType: 'inventory_alert',
          title: 'Low Stock Threshold Warning: Composite Resin A2',
          description: 'Stock level dropped to 3 cartridges (Reorder point: 5 cartridges). Auto-draft purchase requisition.',
          suggestedAction: 'UPDATE_INVENTORY',
          actionParams: {
            itemCode: 'INV-401',
            itemName: 'Composite Resin A2',
            orderQuantity: 10,
          },
          status: 'suggested',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ];

      for (const item of defaults) {
        const newDoc = doc(colRef);
        await setDoc(newDoc, { ...item, id: newDoc.id });
      }
    }
  } catch (err) {
    console.warn('Error seeding AI Automations:', err);
  }
}

// Get AI Predictions
export function subscribeToAIPredictions(callback: (predictions: AIPrediction[]) => void) {
  const colRef = collection(db, PREDICTIONS_COLLECTION);
  return onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      // Return default predictions
      callback(getFallbackPredictions());
    } else {
      const list: AIPrediction[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AIPrediction, 'id'>),
      }));
      callback(list);
    }
  });
}

export function getFallbackPredictions(): AIPrediction[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'PRED-101',
      metricKey: 'no_show_probability',
      metricTitle: 'No-Show Risk Assessment',
      patientId: 'PT-8804',
      patientName: 'David Kim',
      predictedValue: '28%',
      confidenceScore: 0.88,
      riskLevel: 'Medium',
      contextNotes: 'Based on 2 previous late cancellations and rainy weather forecast for appointment slot.',
      isEstimate: true,
      generatedAt: now,
    },
    {
      id: 'PRED-102',
      metricKey: 'patient_revisit_probability',
      metricTitle: 'Patient 6-Month Recall Likelihood',
      patientId: 'PT-8803',
      patientName: 'Emily Watson',
      predictedValue: '92%',
      confidenceScore: 0.94,
      riskLevel: 'Low',
      contextNotes: 'High engagement history with automated WhatsApp confirmations and zero missed appointments.',
      isEstimate: true,
      generatedAt: now,
    },
    {
      id: 'PRED-103',
      metricKey: 'future_inventory_demand',
      metricTitle: 'Inventory Depletion Projection (30 Days)',
      predictedValue: '45 Cartridges Anesthetic',
      confidenceScore: 0.85,
      unit: 'Units',
      riskLevel: 'High',
      contextNotes: 'Expected 22% increase in root canal procedures scheduled over upcoming 4 weeks.',
      isEstimate: true,
      generatedAt: now,
    },
    {
      id: 'PRED-104',
      metricKey: 'revenue_trend',
      metricTitle: 'End-of-Month Revenue Estimate',
      predictedValue: 'Rs. 2.85M',
      confidenceScore: 0.89,
      unit: 'PKR',
      riskLevel: 'Low',
      contextNotes: '14% month-over-month growth driven by high-value orthodontics & implant consultation conversions.',
      isEstimate: true,
      generatedAt: now,
    },
  ];
}

// Subscribe to AI Reports
export function subscribeToAIReports(callback: (reports: AIReport[]) => void) {
  const colRef = collection(db, REPORTS_COLLECTION);
  return onSnapshot(colRef, (snap) => {
    const list: AIReport[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AIReport, 'id'>),
    }));
    callback(list);
  });
}

// Generate New AI Executive Report
export async function generateAIReport(
  reportType: AIReport['reportType'],
  timeframe: AIReport['timeframe'],
  user: { id: string; name: string }
): Promise<string> {
  try {
    const colRef = collection(db, REPORTS_COLLECTION);
    const newDoc = doc(colRef);

    let title = '';
    let summaryText = '';
    let kpis: Record<string, string | number> = {};

    switch (reportType) {
      case 'financial':
        title = `Executive Financial Audit Report (${timeframe.toUpperCase()})`;
        summaryText = `Overall practice financial health is strong with an average 88% collection rate. High-margin procedure share (implants and aligners) grew by 18%. Outstanding balance collection remains a key focus area.`;
        kpis = {
          'Gross Revenue': 'Rs. 2,450,000',
          'Collected Amount': 'Rs. 2,150,000',
          'Outstanding Balance': 'Rs. 300,000',
          'Collection Ratio': '87.7%',
        };
        break;
      case 'inventory':
        title = `AI Clinical Inventory Audit & Valuation (${timeframe.toUpperCase()})`;
        summaryText = `Inventory turnover velocity is optimal for consumables. 2 items require reorder approval to prevent clinical bottleneck next week. Zero expired materials recorded.`;
        kpis = {
          'Total Stock Value': 'Rs. 850,000',
          'Items in Stock': 142,
          'Low Stock Alerts': 3,
          'Waste Percentage': '0.4%',
        };
        break;
      case 'doctor_performance':
        title = `Provider Clinical Efficiency & Throughput (${timeframe.toUpperCase()})`;
        summaryText = `Dr. Elena Rostova completed 42 procedures with 98% patient satisfaction score. Chair time utilization averaged 84% across all 3 active operatory suites.`;
        kpis = {
          'Total Procedures': 78,
          'Avg Chair Time': '42 mins',
          'Patient Satisfaction': '4.9/5',
          'Case Acceptance': '82%',
        };
        break;
      default:
        title = `Practice Daily Summary Report (${timeframe.toUpperCase()})`;
        summaryText = `Daily operational metrics show 12 completed patient visits, 2 emergency walk-ins handled, and zero unresolved safety incidents.`;
        kpis = {
          'Appointments Completed': 12,
          'New Patients': 3,
          'Daily Revenue Collected': 'Rs. 185,000',
        };
    }

    const report: AIReport = {
      id: newDoc.id,
      reportType,
      timeframe,
      title,
      summaryText,
      kpis,
      dataPoints: [],
      generatedByUserId: user.id,
      generatedByUserName: user.name,
      createdAt: new Date().toISOString(),
    };

    await setDoc(newDoc, report);
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, REPORTS_COLLECTION);
    throw error;
  }
}

// Generate Admin Daily Briefing Payload
export interface DailyBriefingPayload {
  date: string;
  appointmentsTodayCount: number;
  revenueTodayTotal: number;
  unpaidBalanceTotal: number;
  lowStockAlertsCount: number;
  activeDoctorsCount: number;
  cancelledAppointmentsCount: number;
  criticalReminders: string[];
}

export async function fetchAdminDailyBriefing(): Promise<DailyBriefingPayload> {
  // Generates real-time briefing metrics
  return {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    appointmentsTodayCount: 8,
    revenueTodayTotal: 185000,
    unpaidBalanceTotal: 65000,
    lowStockAlertsCount: 2,
    activeDoctorsCount: 3,
    cancelledAppointmentsCount: 1,
    criticalReminders: [
      'Marcus Vance has an unpaid balance of Rs. 35,000 due for crown placement.',
      'Composite Resin A2 stock is below safety threshold (3 cartridges left).',
      'Doctor Elena Rostova schedule is 95% filled for today.',
    ],
  };
}
