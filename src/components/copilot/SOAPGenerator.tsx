import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle, Save, X, AlertCircle, Loader2 } from 'lucide-react';
import { PatientRecord } from '../../types/patient';
import { createClinicalNote } from '../../services/clinicalService';
import { SOAPNoteData } from '../../types/copilot';

interface SOAPGeneratorProps {
  patient: PatientRecord;
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
}

export const SOAPGenerator: React.FC<SOAPGeneratorProps> = ({
  patient,
  isOpen,
  onClose,
  doctorName,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [soapData, setSoapData] = useState<SOAPNoteData>({
    patientId: patient.id,
    patientName: patient.fullName,
    doctorId: 'DOC-101',
    doctorName,
    subjective: 'Patient presents with severe throbbing pain in lower right quadrant (Tooth #46) for 3 days, aggravated by cold and hot stimuli.',
    objective: 'Clinical exam reveals deep occluso-distal caries on #46. Tender to percussion (+). Cold test produces lingering sharp pain (>15s). Radiograph shows radiolucency approaching pulp chamber.',
    assessment: 'Symptomatic Irreversible Pulpitis with Symptomatic Apical Periodontitis (#46). ICD-10: K04.01.',
    plan: '1. Local Anesthesia (2% Lignocaine with 1:100k Epinephrine).\n2. Endodontic Access Cavity & Pulpectomy #46.\n3. Canal Instrumentation & Irrigation (5.25% NaOCl).\n4. Intra-canal Medication (CaOH2) + Temporary Restoration (Cavit).\n5. Prescription: Augmentin 625mg BD x 5 days, Brufen 400mg TDS x 3 days.\n6. Recall in 7 days for obturation.',
    icdCode: 'K04.01',
    cdtCodes: ['D3330', 'D0140', 'D0220'],
  });

  if (!isOpen) return null;

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSoapData((prev) => ({
        ...prev,
        subjective: `Patient (${patient.fullName}, ${patient.age}y) reports: ${quickInput || 'Routine checkup with localized sensitivity.'}`,
        objective: 'Soft tissue normal. Probing depths 2-3mm. No visible swelling. Occlusal surfaces evaluated.',
        assessment: 'Localized dental caries / Moderate Gingivitis. Standard restorative therapy indicated.',
        plan: '1. Composite Restoration / Prophylaxis.\n2. Oral Hygiene Instruction (flossing & brushing technique).\n3. Re-evaluate in 6 months.',
      }));
      setIsGenerating(false);
    }, 1200);
  };

  const handleSaveToEHR = async () => {
    setIsSaving(true);
    try {
      await createClinicalNote({
        patientId: patient.id,
        patientName: patient.fullName,
        doctorName,
        chiefComplaint: soapData.subjective,
        diagnosis: soapData.assessment,
        findings: soapData.objective,
        procedure: soapData.plan,
        recommendations: 'Maintain oral hygiene, complete course of medication if prescribed',
        followUp: '2 weeks',
        soap: {
          subjective: soapData.subjective,
          objective: soapData.objective,
          assessment: soapData.assessment,
          plan: soapData.plan,
        },
      }, doctorName);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save SOAP Note to EHR:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI SOAP Notes Generator
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  EHR Integration
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <strong className="text-slate-700 dark:text-slate-200">{patient.fullName}</strong> ({patient.id}) | Attending: {doctorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Quick Note Prompt */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Enter Rough Clinical Dictation / Quick Notes
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="e.g., Patient complaining of toothache lower right, deep cavity on 46, pain on biting..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-cyan-500/20"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate SOAP
            </button>
          </div>
        </div>

        {/* Editable SOAP Sections */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {/* Subjective */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
              S – Subjective (Chief Complaint & History)
            </label>
            <textarea
              value={soapData.subjective}
              onChange={(e) => setSoapData({ ...soapData, subjective: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
              rows={2}
            />
          </div>

          {/* Objective */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
              O – Objective (Clinical Exam & Diagnostics)
            </label>
            <textarea
              value={soapData.objective}
              onChange={(e) => setSoapData({ ...soapData, objective: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
              rows={2}
            />
          </div>

          {/* Assessment */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
              A – Assessment (Diagnosis & ICD Codification)
            </label>
            <textarea
              value={soapData.assessment}
              onChange={(e) => setSoapData({ ...soapData, assessment: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
              rows={2}
            />
          </div>

          {/* Plan */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
              P – Plan (Treatment Given & Followup)
            </label>
            <textarea
              value={soapData.plan}
              onChange={(e) => setSoapData({ ...soapData, plan: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
              rows={4}
            />
          </div>
        </div>

        {/* Disclaimer & Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>SOAP notes require final doctor verification before saving to EHR.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToEHR}
              disabled={isSaving || savedSuccess}
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md ${
                savedSuccess
                  ? 'bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20'
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savedSuccess ? 'Saved to EHR!' : 'Save to Patient EHR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
