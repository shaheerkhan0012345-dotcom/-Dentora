import React, { useState, useEffect } from 'react';
import { Stethoscope, User, Sparkles, AlertCircle, FileText, Pill, Calendar, Globe, Send, ShieldCheck, ChevronRight } from 'lucide-react';
import { PatientRecord } from '../../types/patient';
import { subscribeToPatients } from '../../services/patientService';
import { AILanguage, PatientContextData } from '../../types/copilot';

interface DoctorCopilotProps {
  onSelectPatient: (patient: PatientRecord) => void;
  onOpenSOAP: (patient: PatientRecord) => void;
  onOpenPrescription: (patient: PatientRecord) => void;
  onOpenTreatmentPlan: (patient: PatientRecord) => void;
  onSendMessage: (text: string, lang: AILanguage) => void;
}

export const DoctorCopilot: React.FC<DoctorCopilotProps> = ({
  onSelectPatient,
  onOpenSOAP,
  onOpenPrescription,
  onOpenTreatmentPlan,
  onSendMessage,
}) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [language, setLanguage] = useState<AILanguage>('English');

  useEffect(() => {
    const unsub = subscribeToPatients((list) => {
      setPatients(list);
      if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(list[0].id);
        setSelectedPatient(list[0]);
        onSelectPatient(list[0]);
      }
    });
    return () => unsub();
  }, []);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    const p = patients.find((item) => item.id === pId) || null;
    setSelectedPatient(p);
    if (p) onSelectPatient(p);
  };

  const handleQuickPrompt = (promptText: string) => {
    const finalPrompt = selectedPatient
      ? `[Patient: ${selectedPatient.fullName} | ID: ${selectedPatient.id} | Age: ${selectedPatient.age} | Allergies: ${selectedPatient.allergies?.join(', ') || 'None'}] ${promptText}`
      : promptText;
    onSendMessage(finalPrompt, language);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#1d5bd8] dark:bg-blue-500/20 dark:text-blue-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Teethly Clinical Copilot
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#1d5bd8] dark:bg-blue-950 dark:text-blue-300">
                Doctor Edition
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time patient record context, ADA CDT codification, and clinical drafting assistance.
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <Globe className="w-4 h-4 text-slate-500 ml-2" />
          {(['English', 'Urdu', 'Roman Urdu'] as AILanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === lang
                  ? 'bg-[#1d5bd8] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Patient selector & live context card */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#1d5bd8]" /> Active Patient Context
          </label>
          <select
            value={selectedPatientId}
            onChange={handlePatientChange}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#1d5bd8]"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.id}) - {p.gender}, {p.age}y
              </option>
            ))}
          </select>

          {selectedPatient ? (
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Allergies:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0
                    ? selectedPatient.allergies.join(', ')
                    : 'None Reported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium">{selectedPatient.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Balance:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Rs. {(selectedPatient as any).pendingBalance || 0}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Clinical Prompts */}
        <div className="md:col-span-2 flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> One-Click Doctor AI Prompts
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickPrompt("Summarize complete patient history, allergies, and recent procedures.")}
                className="p-2 text-left rounded-lg bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Summarize Patient</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleQuickPrompt("Continue today's treatment plan and recommend CDT procedure codes.")}
                className="p-2 text-left rounded-lg bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Continue Treatment</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleQuickPrompt("Check drug allergies and list safe antibiotic and analgesic dosages.")}
                className="p-2 text-left rounded-lg bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Check Allergies</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleQuickPrompt("Explain procedure steps and post-operative care in simple patient language.")}
                className="p-2 text-left rounded-lg bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Explain Procedure</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleQuickPrompt("Draft post-op home care instructions for tooth extraction.")}
                className="p-2 text-left rounded-lg bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Post-Op Guide</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Specialized Clinical Generators */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
            <button
              onClick={() => selectedPatient && onOpenSOAP(selectedPatient)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate SOAP Note
            </button>
            <button
              onClick={() => selectedPatient && onOpenPrescription(selectedPatient)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Pill className="w-3.5 h-3.5" />
              Draft Prescription
            </button>
            <button
              onClick={() => selectedPatient && onOpenTreatmentPlan(selectedPatient)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              Build Treatment Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
