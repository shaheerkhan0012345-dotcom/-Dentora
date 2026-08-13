import React, { useState } from 'react';
import { Calendar, Sparkles, CheckCircle2, Clock, DollarSign, Plus, Trash2, X, Save, ArrowRight, Loader2 } from 'lucide-react';
import { PatientRecord } from '../../types/patient';
import { TreatmentPlanDraftData } from '../../types/copilot';

interface TreatmentPlannerProps {
  patient: PatientRecord;
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
}

export const TreatmentPlanner: React.FC<TreatmentPlannerProps> = ({
  patient,
  isOpen,
  onClose,
  doctorName,
}) => {
  const [chiefComplaint, setChiefComplaint] = useState('Severe pain and fractured crown on Tooth #14');
  const [isGenerating, setIsGenerating] = useState(false);

  const [plan, setPlan] = useState<TreatmentPlanDraftData>({
    patientId: patient.id,
    patientName: patient.fullName,
    chiefComplaint: 'Fractured Tooth #14 with periapical involvement',
    diagnosis: 'Non-vital Tooth #14 with irreversible pulpitis',
    totalEstimatedVisits: 3,
    totalEstimatedCost: 45000,
    procedures: [
      {
        stepNumber: 1,
        cdtCode: 'D3310',
        description: 'Endodontic Therapy - Anterior/Bicuspid (Canal cleaning & CaOH2 placement)',
        toothNumber: '14',
        estimatedCost: 18000,
        status: 'In Progress',
      },
      {
        stepNumber: 2,
        cdtCode: 'D3330',
        description: 'Endodontic Obturation & Core Buildup with Post',
        toothNumber: '14',
        estimatedCost: 12000,
        status: 'Planned',
      },
      {
        stepNumber: 3,
        cdtCode: 'D2740',
        description: 'Porcelain/Ceramic Crown Placement (Shade Match A2)',
        toothNumber: '14',
        estimatedCost: 15000,
        status: 'Planned',
      },
    ],
  });

  if (!isOpen) return null;

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPlan((prev) => ({
        ...prev,
        chiefComplaint,
        diagnosis: 'Generalized Moderate Periodontitis with Multi-Surface Caries',
        totalEstimatedVisits: 2,
        totalEstimatedCost: 32000,
        procedures: [
          {
            stepNumber: 1,
            cdtCode: 'D4341',
            description: 'Periodontal Scaling & Root Planing (Four Quarters)',
            estimatedCost: 16000,
            status: 'Planned',
          },
          {
            stepNumber: 2,
            cdtCode: 'D2392',
            description: 'Resin-based Composite - Two Surfaces (Posterior #24, #25)',
            estimatedCost: 16000,
            status: 'Planned',
          },
        ],
      }));
      setIsGenerating(false);
    }, 1200);
  };

  const handleSavePlan = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Treatment Planner & Cost Estimator
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  CDT Sequence
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <strong className="text-slate-700 dark:text-slate-200">{patient.fullName}</strong> ({patient.id}) | Doctor: Dr. {doctorName}
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

        {/* Input */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Chief Complaint / Clinical Objective
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-indigo-500/20"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate Plan
            </button>
          </div>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Estimated Visits</span>
            <p className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1 flex items-center gap-1">
              <Clock className="w-5 h-5 text-indigo-500" />
              {plan.totalEstimatedVisits} Visits
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Total Cost Estimate</span>
            <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1 flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Rs. {plan.totalEstimatedCost.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 col-span-2 sm:col-span-1">
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Procedures Planned</span>
            <p className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
              {plan.procedures.length} Steps
            </p>
          </div>
        </div>

        {/* Procedures Sequence */}
        <div className="space-y-2.5 max-h-[40vh] overflow-y-auto my-4">
          {plan.procedures.map((proc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {proc.stepNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{proc.description}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      CDT {proc.cdtCode}
                    </span>
                    {proc.toothNumber ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Tooth #{proc.toothNumber}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        proc.status === 'Completed'
                          ? 'text-emerald-600'
                          : proc.status === 'In Progress'
                          ? 'text-indigo-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {proc.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Rs. {proc.estimatedCost.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Estimates are calculated based on practice fee schedule.</span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlan}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20"
            >
              <Save className="w-4 h-4" />
              Attach Plan to Patient Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
