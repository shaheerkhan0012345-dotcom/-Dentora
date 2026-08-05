import React, { useState, useEffect } from 'react';
import {
  Smile,
  Stethoscope,
  FileText,
  Pill,
  FileImage,
  Clock,
  User,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { subscribeToPatients } from '../../../services/patientService';
import { PatientRecord } from '../../../types/patient';
import {
  DentalChartRecord,
  ToothRecord,
  TreatmentRecord,
  ClinicalNoteRecord,
  PrescriptionRecord,
  TimelineEventRecord,
  ClinicalAttachmentRecord,
} from '../../../types/clinical';
import {
  subscribeToDentalChart,
  updateToothConditions,
  subscribeToTreatments,
  createTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  subscribeToClinicalNotes,
  createClinicalNote,
  subscribeToPrescriptions,
  createPrescription,
  subscribeToPatientTimeline,
  subscribeToAttachments,
  uploadClinicalAttachment,
} from '../../../services/clinicalService';

import { DentalChart } from '../../clinical/DentalChart';
import { TreatmentPlanTable } from '../../clinical/TreatmentPlanTable';
import { ClinicalNotesEditor } from '../../clinical/ClinicalNotesEditor';
import { PrescriptionForm } from '../../clinical/PrescriptionForm';
import { AttachmentUploader } from '../../clinical/AttachmentUploader';
import { Timeline } from '../../clinical/Timeline';

interface DentalChartTabProps {
  activeTabName?: string;
  initialSubTab?: 'Chart' | 'Treatments' | 'Notes' | 'Prescriptions' | 'Attachments' | 'Timeline';
}

export const DentalChartTab: React.FC<DentalChartTabProps> = ({
  activeTabName,
  initialSubTab,
}) => {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'Doctor';
  const userName = currentUser?.displayName || 'Dr. Elena Rostova';

  // Determine initial sub-tab based on prop or activeTabName
  const getInitialSubTab = (): 'Chart' | 'Treatments' | 'Notes' | 'Prescriptions' | 'Attachments' | 'Timeline' => {
    if (initialSubTab) return initialSubTab;
    if (activeTabName === 'treatments') return 'Treatments';
    if (activeTabName === 'prescriptions') return 'Prescriptions';
    return 'Chart';
  };

  // Sub-tab navigation
  const [activeSubTab, setActiveSubTab] = useState<
    'Chart' | 'Treatments' | 'Notes' | 'Prescriptions' | 'Attachments' | 'Timeline'
  >(getInitialSubTab);

  // Sync activeSubTab whenever activeTabName changes (e.g. user clicks Treatments or Prescriptions in sidebar)
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    } else if (activeTabName === 'treatments') {
      setActiveSubTab('Treatments');
    } else if (activeTabName === 'prescriptions') {
      setActiveSubTab('Prescriptions');
    } else if (activeTabName === 'dental-chart') {
      setActiveSubTab('Chart');
    }
  }, [activeTabName, initialSubTab]);

  // Patients & Selection
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [patientSearch, setPatientSearch] = useState<string>('');

  // Clinical Data State
  const [chart, setChart] = useState<DentalChartRecord | null>(null);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNoteRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [attachments, setAttachments] = useState<ClinicalAttachmentRecord[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventRecord[]>([]);

  // Prefilled tooth for treatment creation modal
  const [prefilledTooth, setPrefilledTooth] = useState<string>('General');

  // 1. Subscribe to Patients with Privacy Filtering
  useEffect(() => {
    const unsub = subscribeToPatients((list) => {
      setPatients(list);
      if (userRole === 'Patient') {
        const pClean = (userName || '').toLowerCase().trim();
        const emailClean = (currentUser?.email || '').toLowerCase().trim();
        const myPatient = list.find((p) => {
          const fn = (p.fullName || '').toLowerCase().trim();
          const em = (p.email || '').toLowerCase().trim();
          return (pClean && (fn.includes(pClean) || pClean.includes(fn))) || (emailClean && em.includes(emailClean));
        });
        if (myPatient) {
          setSelectedPatient(myPatient);
        } else if (list.length > 0) {
          setSelectedPatient(list[0]);
        }
      } else if (!selectedPatient && list.length > 0) {
        setSelectedPatient(list[0]);
      }
    });
    return () => unsub();
  }, [userRole, userName, currentUser?.email]);

  // 2. Subscribe to Selected Patient's Clinical Records
  useEffect(() => {
    if (!selectedPatient) return;

    const patientId = selectedPatient.patientId || selectedPatient.id;

    const unsubChart = subscribeToDentalChart(patientId, (c) => setChart(c));
    const unsubTrt = subscribeToTreatments(patientId, (t) => setTreatments(t));
    const unsubNotes = subscribeToClinicalNotes(patientId, (n) => setClinicalNotes(n));
    const unsubRx = subscribeToPrescriptions(patientId, (r) => setPrescriptions(r));
    const unsubAtt = subscribeToAttachments(patientId, (a) => setAttachments(a));
    const unsubTimeline = subscribeToPatientTimeline(patientId, (tm) => setTimelineEvents(tm));

    return () => {
      unsubChart();
      unsubTrt();
      unsubNotes();
      unsubRx();
      unsubAtt();
      unsubTimeline();
    };
  }, [selectedPatient?.id, selectedPatient?.patientId]);

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.patientId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleUpdateToothCondition = async (toothNumber: number, updates: Partial<ToothRecord>) => {
    if (!selectedPatient) return;
    const patientId = selectedPatient.patientId || selectedPatient.id;
    await updateToothConditions(patientId, toothNumber, updates, userName);
  };

  const handleAddTreatmentForTooth = (toothNumberStr: string) => {
    setPrefilledTooth(toothNumberStr);
    setActiveSubTab('Treatments');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & PATIENT SELECTOR STRIP */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Smile className="w-6 h-6 text-[#1d5bd8]" />
              <span>Dental Clinical Hub & Interactive FDI Chart</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Phase 5 Dental Chart, Treatment Plans, SOAP Consultation Notes, Prescriptions & Timeline
            </p>
          </div>

          {/* ACTIVE ROLE BADGE */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase flex items-center gap-1.5 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1d5bd8]" />
              <span>Role: {userRole}</span>
            </span>
          </div>
        </div>

        {/* PATIENT SELECTOR ROW */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {userRole === 'Patient' ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personal Patient Record: {selectedPatient?.fullName || userName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patient..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const found = patients.find((p) => p.id === e.target.value);
                  if (found) setSelectedPatient(found);
                }}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-extrabold text-[#1d5bd8] cursor-pointer"
              >
                {filteredPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SELECTED PATIENT QUICK CARD */}
          {selectedPatient && (
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 w-full sm:w-auto justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    selectedPatient.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                  }
                  alt={selectedPatient.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1d5bd8]"
                />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    {selectedPatient.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    #{selectedPatient.patientId} • Age: {selectedPatient.age} • Doctor: {selectedPatient.assignedDoctor}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Allergies</span>
                <span className="text-[11px] font-extrabold text-rose-600">
                  {selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'None'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* CLINICAL NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('Chart')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'Chart'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>FDI Dental Chart</span>
          </button>

          <button
            onClick={() => setActiveSubTab('Treatments')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'Treatments'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Treatment Plans ({treatments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('Notes')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'Notes'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SOAP Clinical Notes ({clinicalNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('Prescriptions')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'Prescriptions'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Prescriptions Rx ({prescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('Attachments')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'Attachments'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>X-rays & Files ({attachments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('Timeline')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'Timeline'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline Audit ({timelineEvents.length})</span>
          </button>
        </div>

      </div>

      {/* ACTIVE CLINICAL SUB-MODULE VIEW */}
      {!selectedPatient || !chart ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <Smile className="w-8 h-8 text-[#1d5bd8] mx-auto animate-pulse" />
          <p className="text-xs font-extrabold text-slate-700">Loading Patient Clinical Chart...</p>
        </div>
      ) : (
        <>
          {activeSubTab === 'Chart' && (
            <DentalChart
              chart={chart}
              patientName={selectedPatient.fullName}
              onUpdateCondition={handleUpdateToothCondition}
              treatments={treatments}
              clinicalNotes={clinicalNotes}
              attachments={attachments}
              onAddTreatmentForTooth={handleAddTreatmentForTooth}
              userRole={userRole}
            />
          )}

          {activeSubTab === 'Treatments' && (
            <TreatmentPlanTable
              treatments={treatments}
              onAddTreatment={async (trt) => {
                const pId = selectedPatient.patientId || selectedPatient.id;
                await createTreatmentPlan({ ...trt, patientId: pId }, userName);
              }}
              onUpdateTreatment={async (id, updates) => {
                await updateTreatmentPlan(id, updates, userName);
              }}
              onDeleteTreatment={async (id) => {
                await deleteTreatmentPlan(id);
              }}
              patientName={selectedPatient.fullName}
              patientId={selectedPatient.patientId || selectedPatient.id}
              prefilledTooth={prefilledTooth}
              userRole={userRole}
            />
          )}

          {activeSubTab === 'Notes' && (
            <ClinicalNotesEditor
              notes={clinicalNotes}
              onAddNote={async (note) => {
                await createClinicalNote(note, userName);
              }}
              patientName={selectedPatient.fullName}
              patientId={selectedPatient.patientId || selectedPatient.id}
              doctorName={userName}
            />
          )}

          {activeSubTab === 'Prescriptions' && (
            <PrescriptionForm
              prescriptions={prescriptions}
              onCreatePrescription={async (rx) => {
                await createPrescription(rx, userName);
              }}
              patientName={selectedPatient.fullName}
              patientId={selectedPatient.patientId || selectedPatient.id}
              doctorName={userName}
            />
          )}

          {activeSubTab === 'Attachments' && (
            <AttachmentUploader
              attachments={attachments}
              onUploadAttachment={async (att) => {
                await uploadClinicalAttachment(att, userName);
              }}
              patientName={selectedPatient.fullName}
              patientId={selectedPatient.patientId || selectedPatient.id}
              uploaderName={userName}
            />
          )}

          {activeSubTab === 'Timeline' && (
            <Timeline
              events={timelineEvents}
              patientName={selectedPatient.fullName}
            />
          )}
        </>
      )}

    </div>
  );
};
