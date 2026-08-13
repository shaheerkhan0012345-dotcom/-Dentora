import React, { useState } from 'react';
import {
  X,
  Plus,
  Stethoscope,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileImage,
  DollarSign,
  Edit3,
} from 'lucide-react';
import {
  ToothRecord,
  ToothCondition,
  SurfaceKey,
  TreatmentRecord,
  ClinicalNoteRecord,
  ClinicalAttachmentRecord,
} from '../../types/clinical';
import { CONDITION_COLORS } from './Tooth';

interface ToothDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tooth: ToothRecord | null;
  patientName: string;
  onUpdateCondition: (toothNumber: number, updates: Partial<ToothRecord>) => Promise<void>;
  treatments: TreatmentRecord[];
  clinicalNotes: ClinicalNoteRecord[];
  attachments: ClinicalAttachmentRecord[];
  onAddTreatmentForTooth: (toothNumber: string) => void;
}

const ALL_CONDITIONS: ToothCondition[] = [
  'Healthy',
  'Decayed',
  'Missing',
  'Filled',
  'Root Canal',
  'Crown',
  'Bridge',
  'Implant',
  'Extraction',
  'Fractured',
  'Sealant',
  'Whitening',
  'Scaling',
  'Orthodontic',
  'Temporary Crown',
];

const ALL_SURFACES: SurfaceKey[] = ['Mesial', 'Occlusal', 'Distal', 'Buccal', 'Lingual'];

export const ToothDetailsDrawer: React.FC<ToothDetailsDrawerProps> = ({
  isOpen,
  onClose,
  tooth,
  patientName,
  onUpdateCondition,
  treatments,
  clinicalNotes,
  attachments,
  onAddTreatmentForTooth,
}) => {
  const [noteText, setNoteText] = useState<string>(tooth?.notes || '');
  const [saving, setSaving] = useState<boolean>(false);

  if (!isOpen || !tooth) return null;

  const toothTreatments = treatments.filter(
    (t) => String(t.toothNumber) === String(tooth.toothNumber)
  );

  const handleToggleCondition = async (cond: ToothCondition) => {
    let newConditions: ToothCondition[];
    if (cond === 'Healthy') {
      newConditions = ['Healthy'];
    } else {
      if (tooth.conditions.includes(cond)) {
        newConditions = tooth.conditions.filter((c) => c !== cond);
        if (newConditions.length === 0) newConditions = ['Healthy'];
      } else {
        newConditions = [...tooth.conditions.filter((c) => c !== 'Healthy'), cond];
      }
    }

    setSaving(true);
    try {
      await onUpdateCondition(tooth.toothNumber, { conditions: newConditions });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSurface = async (surface: SurfaceKey) => {
    const currentSurfaces = { ...(tooth.surfaces || {}) };
    if (currentSurfaces[surface]) {
      delete currentSurfaces[surface];
    } else {
      currentSurfaces[surface] = 'Decayed';
    }

    setSaving(true);
    try {
      await onUpdateCondition(tooth.toothNumber, { surfaces: currentSurfaces });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      await onUpdateCondition(tooth.toothNumber, { notes: noteText });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-200 overflow-hidden">
        
        {/* DRAWER HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white font-black text-sm font-mono">
              #{tooth.fdiCode}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">{tooth.name}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {tooth.quadrant} • Patient: {patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* QUICK CREATE TREATMENT BUTTON */}
          <button
            onClick={() => {
              onClose();
              onAddTreatmentForTooth(String(tooth.toothNumber));
            }}
            className="w-full py-2.5 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Treatment Plan for Tooth #{tooth.fdiCode}</span>
          </button>

          {/* ACTIVE CONDITIONS CHECKBOX TILES */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Tooth Conditions & Diagnostics
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {ALL_CONDITIONS.map((cond) => {
                const isPresent = tooth.conditions.includes(cond);
                const color = CONDITION_COLORS[cond];
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleToggleCondition(cond)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-all text-left flex items-center justify-between cursor-pointer ${
                      isPresent
                        ? 'bg-[#1d5bd8] text-white border-[#1d5bd8] shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate">{cond}</span>
                    {isPresent && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOOTH SURFACES SPECIFIER */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="text-xs font-bold text-slate-800 block">
              Affected Anatomical Surfaces
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {ALL_SURFACES.map((surf) => {
                const isAffected = !!tooth.surfaces?.[surf];
                return (
                  <button
                    key={surf}
                    type="button"
                    onClick={() => handleToggleSurface(surf)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isAffected
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {surf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CLINICAL OBSERVATION NOTES */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Tooth Notes & Observations
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Sensitivity to cold, mesial cavity, check x-ray..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Tooth Note'}
            </button>
          </div>

          {/* TREATMENT HISTORY FOR THIS TOOTH */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#1d5bd8]" />
                <span>Treatments on Tooth #{tooth.fdiCode}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {toothTreatments.length} logged
              </span>
            </h4>

            {toothTreatments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No specific treatment plans recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {toothTreatments.map((trt) => (
                  <div
                    key={trt.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-extrabold text-slate-900">
                      <span>{trt.treatmentType}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1d5bd8] text-[10px]">
                        {trt.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Doctor: {trt.assignedDoctor} • Cost: ${trt.netCost}
                    </p>
                    {trt.notes && (
                      <p className="text-[11px] text-slate-600 italic mt-1">"{trt.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ATTACHED X-RAYS / IMAGES */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-[#1d5bd8]" />
              <span>Patient X-rays & Records</span>
            </h4>

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No attachments uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 border border-slate-200 rounded-2xl bg-slate-50 flex items-center gap-2 overflow-hidden"
                  >
                    <FileImage className="w-4 h-4 text-[#1d5bd8] shrink-0" />
                    <span className="text-[11px] font-bold text-slate-700 truncate">
                      {att.filename}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* DRAWER FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
