export type ChatCategory = 'Clinical' | 'Billing' | 'General' | 'Patient Care' | 'Inventory' | 'Analytics';

export type MessageSender = 'user' | 'model' | 'system';

export type FeedbackType = 'like' | 'dislike' | 'none';

export interface AIChat {
  id: string;
  title: string;
  userId: string;
  userRole: string;
  category: ChatCategory;
  isPinned: boolean;
  isArchived: boolean;
  selectedPatientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  chatId: string;
  sender: MessageSender;
  content: string;
  contextSummary?: string;
  tokens?: number;
  feedback?: FeedbackType;
  timestamp: string;
}

export interface AIPrompt {
  id: string;
  category: ChatCategory;
  title: string;
  promptText: string;
  role?: string;
  isCustom?: boolean;
}

export interface AISettings {
  id: string;
  userId: string;
  temperature: number;
  maxTokens: number;
  systemPromptOverride?: string;
  streamEnabled: boolean;
  modelAlias: string;
}

export interface SlashCommand {
  command: string;
  description: string;
  category: string;
}

export type AILanguage = 'English' | 'Urdu' | 'Roman Urdu';

export type AIActionType = 
  | 'CREATE_INVOICE'
  | 'BOOK_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'GENERATE_PRESCRIPTION'
  | 'CREATE_TREATMENT_PLAN'
  | 'SEND_WHATSAPP'
  | 'SAVE_SOAP_NOTE'
  | 'GENERATE_REPORT'
  | 'UPDATE_INVENTORY'
  | 'NAVIGATE_PROFILE';

export type AIActionStatus = 'pending' | 'approved' | 'executed' | 'rejected' | 'failed';

export interface AIAction {
  id: string;
  actionType: AIActionType;
  title: string;
  description: string;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedByUserRole: string;
  targetPatientId?: string;
  targetPatientName?: string;
  params: Record<string, any>;
  previewSummary: string;
  status: AIActionStatus;
  approvedByUserId?: string;
  approvedByUserName?: string;
  executedAt?: string;
  resultMessage?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface AIAutomation {
  id: string;
  triggerType: 'followup_reminder' | 'invoice_reminder' | 'inventory_alert' | 'recall_campaign' | 'birthday_greeting';
  title: string;
  description: string;
  targetPatientId?: string;
  targetPatientName?: string;
  targetPhone?: string;
  suggestedAction: AIActionType;
  actionParams: Record<string, any>;
  messageTemplate?: string;
  status: 'suggested' | 'approved' | 'dismissed' | 'executed';
  createdAt: string;
}

export interface AIPrediction {
  id: string;
  metricKey: 'no_show_probability' | 'patient_revisit_probability' | 'future_inventory_demand' | 'revenue_trend' | 'treatment_demand';
  metricTitle: string;
  patientId?: string;
  patientName?: string;
  predictedValue: string | number;
  confidenceScore: number; // e.g. 0.85 (85%)
  unit?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  contextNotes: string;
  isEstimate: true; // Always true for compliance
  generatedAt: string;
}

export interface AIReport {
  id: string;
  reportType: 'financial' | 'inventory' | 'doctor_performance' | 'patient_analytics' | 'daily_summary';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  title: string;
  summaryText: string;
  kpis: Record<string, string | number>;
  dataPoints: Array<Record<string, any>>;
  generatedByUserId: string;
  generatedByUserName: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType: string;
  promptOrTrigger: string;
  status: 'success' | 'warning' | 'error';
  approvalRequired: boolean;
  approvedBy?: string;
  detailsSummary: string;
  timestamp: string;
}

export interface SOAPNoteData {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icdCode?: string;
  cdtCodes?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    pulseRate?: string;
    temperature?: string;
  };
  createdAt?: string;
}

export interface PrescriptionDraftData {
  patientId: string;
  patientName: string;
  age?: number;
  allergies?: string[];
  diagnosis: string;
  medications: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  warnings: string[];
  specialInstructions?: string;
}

export interface TreatmentPlanDraftData {
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  diagnosis: string;
  totalEstimatedVisits: number;
  totalEstimatedCost: number;
  procedures: Array<{
    stepNumber: number;
    cdtCode: string;
    description: string;
    toothNumber?: string;
    estimatedCost: number;
    status: 'Planned' | 'In Progress' | 'Completed';
  }>;
}

export interface WhatsAppMessageData {
  recipientPhone: string;
  recipientName: string;
  messageType: 'confirmation' | 'reminder' | 'followup' | 'review' | 'payment' | 'treatment' | 'birthday' | 'recall';
  bodyText: string;
  scheduledTime?: string;
  status?: 'draft' | 'pending_approval' | 'sent' | 'failed';
}

export interface PatientContextData {
  patientId: string;
  fullName: string;
  age?: number;
  gender?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedication?: string;
  assignedDoctor?: string;
  activeTreatments?: string[];
  pendingBalance?: number;
  upcomingAppointments?: string[];
}

export interface CopilotContextPayload {
  patient?: PatientContextData | null;
  clinicOverview?: {
    todayAppointmentsCount?: number;
    queueWaitingCount?: number;
    lowStockItemCount?: number;
    unpaidInvoiceCount?: number;
    pendingRevenueTotal?: number;
  } | null;
}

export interface DocumentAnalysisResult {
  fileName: string;
  fileType: 'PDF' | 'Prescription' | 'Medical Report' | 'Consent Form' | 'Clinical Note' | 'Other';
  fileSize: string;
  summary: string;
  keyFindings: string[];
  medicinesMentioned: string[];
  warningsAndRisks: string[];
  suggestedActions: string[];
  extractedAt: string;
}

export interface XRayAnalysisResult {
  imageId: string;
  imageName: string;
  patientId?: string;
  patientName?: string;
  toothRegion?: string;
  radiographType: 'Bitewing' | 'Periapical' | 'Panoramic (OPG)' | 'Cephalometric';
  aiObservations: string[];
  suspectedFindings: string[]; // e.g. "Mild radiolucency distal #14"
  disclaimer: string; // "AI observations are informational only and are not a diagnosis."
  analyzedAt: string;
}
