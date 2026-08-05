import React, { useState } from 'react';
import {
  Smile,
  Sparkles,
  Info,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Stethoscope,
  Filter,
} from 'lucide-react';
import {
  DentalChartRecord,
  ToothRecord,
  ToothCondition,
  TreatmentRecord,
  ClinicalNoteRecord,
  ClinicalAttachmentRecord,
} from '../../types/clinical';
import { Tooth, CONDITION_COLORS } from './Tooth';
import { ToothDetailsDrawer } from './ToothDetailsDrawer';

interface DentalChartProps {
  chart: DentalChartRecord;
  patientName: string;
  onUpdateCondition: (toothNumber: number, updates: Partial<ToothRecord>) => Promise<void>;
  treatments: TreatmentRecord[];
  clinicalNotes: ClinicalNoteRecord[];
  attachments: ClinicalAttachmentRecord[];
  onAddTreatmentForTooth: (toothNumber: string) => void;
  userRole?: string;
}

export const DentalChart: React.FC<DentalChartProps> = ({
  chart,
  patientName,
  onUpdateCondition,
  treatments,
  clinicalNotes,
  attachments,
  onAddTreatmentForTooth,
  userRole = 'Doctor',
}) => {
  const [selectedToothNum, setSelectedToothNum] = useState<number | null>(null);

  // FDI Quadrant arrays
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeft = [38, 37, 36, 35, 34, 33, 32, 31];
  const lowerRight = [41, 42, 43, 44, 45, 46, 47, 48];

  const selectedTooth = selectedToothNum ? chart.teeth[selectedToothNum] || null : null;

  // Legend conditions
  const legendConditions: ToothCondition[] = [
    'Healthy',
    'Decayed',
    'Missing',
    'Filled',
    'Root Canal',
    'Crown',
    'Bridge',
    'Implant',
    'Orthodontic',
  ];

  return (
    <div className="space-y-6">
      
      {/* CHART HEADER & SUMMARY */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Smile className="w-5 h-5 text-[#1d5bd8]" />
            <span>FDI 32-Tooth Interactive Dental Chart</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click any tooth to inspect anatomical surfaces, update conditions, and log treatments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1d5bd8] border border-blue-200 text-xs font-black uppercase">
            Patient: {patientName}
          </span>
        </div>
      </div>

      {/* DENTAL ARCH CONTAINER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-8 overflow-x-auto">
        
        {/* UPPER ARCH (MAXILLARY) */}
        <div className="space-y-3 min-w-[640px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d5bd8]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Maxillary Arch (Upper Jaw — Quadrants 1 & 2)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Teeth 18 to 28</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quadrant 1: Upper Right (18 -> 11) */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 block text-right pr-2 uppercase">
                Quadrant 1 (Upper Right)
              </span>
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                {upperRight.map((num) => {
                  const toothData = chart.teeth[num];
                  if (!toothData) return null;
                  return (
                    <Tooth
                      key={num}
                      tooth={toothData}
                      isSelected={selectedToothNum === num}
                      onClick={() => setSelectedToothNum(num)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quadrant 2: Upper Left (21 -> 28) */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 block pl-2 uppercase">
                Quadrant 2 (Upper Left)
              </span>
              <div className="flex items-center justify-start gap-1 sm:gap-2">
                {upperLeft.map((num) => {
                  const toothData = chart.teeth[num];
                  if (!toothData) return null;
                  return (
                    <Tooth
                      key={num}
                      tooth={toothData}
                      isSelected={selectedToothNum === num}
                      onClick={() => setSelectedToothNum(num)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MID ARCH MIDLINE SEPARATOR */}
        <div className="relative py-1 flex items-center justify-center">
          <div className="w-full border-t border-dashed border-slate-200" />
          <span className="absolute px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
            Occlusal Plane / Midline
          </span>
        </div>

        {/* LOWER ARCH (MANDIBULAR) */}
        <div className="space-y-3 min-w-[640px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006666]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Mandibular Arch (Lower Jaw — Quadrants 4 & 3)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Teeth 48 to 38</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quadrant 4: Lower Right (48 -> 41) */}
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                {lowerRight.map((num) => {
                  const toothData = chart.teeth[num];
                  if (!toothData) return null;
                  return (
                    <Tooth
                      key={num}
                      tooth={toothData}
                      isSelected={selectedToothNum === num}
                      onClick={() => setSelectedToothNum(num)}
                      isLowerArch
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 block text-right pr-2 uppercase pt-1">
                Quadrant 4 (Lower Right)
              </span>
            </div>

            {/* Quadrant 3: Lower Left (31 -> 38) */}
            <div className="space-y-1">
              <div className="flex items-center justify-start gap-1 sm:gap-2">
                {lowerLeft.map((num) => {
                  const toothData = chart.teeth[num];
                  if (!toothData) return null;
                  return (
                    <Tooth
                      key={num}
                      tooth={toothData}
                      isSelected={selectedToothNum === num}
                      onClick={() => setSelectedToothNum(num)}
                      isLowerArch
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 block pl-2 uppercase pt-1">
                Quadrant 3 (Lower Left)
              </span>
            </div>
          </div>
        </div>

        {/* CHART LEGEND STRIP */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs font-extrabold text-slate-700">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mr-2">
            Condition Legend:
          </span>
          {legendConditions.map((cond) => {
            const style = CONDITION_COLORS[cond];
            return (
              <div key={cond} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                <span className="text-[11px]">{cond}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* SIDE DRAWER FOR SELECTED TOOTH */}
      <ToothDetailsDrawer
        isOpen={!!selectedToothNum}
        onClose={() => setSelectedToothNum(null)}
        tooth={selectedTooth}
        patientName={patientName}
        onUpdateCondition={onUpdateCondition}
        treatments={treatments}
        clinicalNotes={clinicalNotes}
        attachments={attachments}
        onAddTreatmentForTooth={onAddTreatmentForTooth}
      />

    </div>
  );
};
