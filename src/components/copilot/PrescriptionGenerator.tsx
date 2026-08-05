import React, { useState } from 'react';
import { Pill, Sparkles, AlertTriangle, ShieldCheck, Plus, Trash2, CheckCircle, Save, X, Printer, Loader2 } from 'lucide-react';
import { PatientRecord } from '../../types/patient';
import { PrescriptionDraftData } from '../../types/copilot';

interface PrescriptionGeneratorProps {
  patient: PatientRecord;
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
}

export const PrescriptionGenerator: React.FC<PrescriptionGeneratorProps> = ({
  patient,
  isOpen,
  onClose,
  doctorName,
}) => {
  const [diagnosis, setDiagnosis] = useState('Acute Periapical Abscess (#46)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const [prescription, setPrescription] = useState<PrescriptionDraftData>({
    patientId: patient.id,
    patientName: patient.fullName,
    age: patient.age,
    allergies: patient.allergies || [],
    diagnosis: 'Acute Periapical Abscess (#46)',
    medications: [
      {
        medicineName: 'Amoxicillin + Clavulanic Acid (Augmentin 625mg)',
        dosage: '1 Tablet (625mg)',
        frequency: 'Twice daily (BD)',
        duration: '5 Days',
        instructions: 'Take after meals with water. Complete 5-day course.',
      },
      {
        medicineName: 'Ibuprofen (Brufen 400mg)',
        dosage: '1 Tablet (400mg)',
        frequency: 'Thrice daily (TDS)',
        duration: '3 Days',
        instructions: 'Take after food for pain relief as needed.',
      },
      {
        medicineName: 'Omeprazole (Risek 20mg)',
        dosage: '1 Capsule (20mg)',
        frequency: 'Once daily (OD)',
        duration: '5 Days',
        instructions: 'Take 30 minutes before breakfast.',
      },
    ],
    warnings: [
      'Patient allergy check: No Penicillin allergy recorded.',
      'Ensure adequate fluid intake during antibiotic course.',
    ],
    specialInstructions: 'Warm saline rinses 4 times daily. Avoid chewing hard food on right side.',
  });

  if (!isOpen) return null;

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPrescription((prev) => ({
        ...prev,
        diagnosis,
        medications: [
          {
            medicineName: 'Metronidazole (Flagyl 400mg)',
            dosage: '1 Tablet',
            frequency: 'Thrice daily (TDS)',
            duration: '5 Days',
            instructions: 'Take after meals. Strictly avoid alcohol.',
          },
          {
            medicineName: 'Paracetamol + Tramadol (Zaldiar)',
            dosage: '1 Tablet',
            frequency: 'As needed for severe pain (PRN)',
            duration: '3 Days',
            instructions: 'Maximum 4 tablets in 24 hours.',
          },
        ],
        warnings: ['Avoid alcohol consumption while taking Metronidazole.'],
      }));
      setIsGenerating(false);
    }, 1000);
  };

  const handleAddMedication = () => {
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        {
          medicineName: 'New Medicine Name',
          dosage: '500mg',
          frequency: 'Twice daily (BD)',
          duration: '5 Days',
          instructions: 'Take after meals',
        },
      ],
    });
  };

  const handleRemoveMedication = (index: number) => {
    const updated = prescription.medications.filter((_, i) => i !== index);
    setPrescription({ ...prescription, medications: updated });
  };

  const handleApproveAndPrint = () => {
    setIsApproved(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Prescription Assistant
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Doctor Approval
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <strong className="text-slate-700 dark:text-slate-200">{patient.fullName}</strong> ({patient.age}y, {patient.gender}) | Prescriber: Dr. {doctorName}
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

        {/* Diagnosis & Allergy Check */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Diagnosis
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-500/20"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Draft RX
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Drug Allergy Check
            </p>
            <p className="text-amber-900 dark:text-amber-200 text-[11px]">
              {patient.allergies && patient.allergies.length > 0
                ? `Patient allergic to: ${patient.allergies.join(', ')}`
                : 'No known drug allergies reported.'}
            </p>
          </div>
        </div>

        {/* Medications Table */}
        <div className="my-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Prescribed Medications ({prescription.medications.length})
            </span>
            <button
              onClick={handleAddMedication}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Drug
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[35vh] overflow-y-auto">
            {prescription.medications.map((med, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input
                  type="text"
                  value={med.medicineName}
                  onChange={(e) => {
                    const updated = [...prescription.medications];
                    updated[idx].medicineName = e.target.value;
                    setPrescription({ ...prescription, medications: updated });
                  }}
                  className="flex-1 text-xs font-semibold text-slate-900 dark:text-white p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={med.dosage}
                  onChange={(e) => {
                    const updated = [...prescription.medications];
                    updated[idx].dosage = e.target.value;
                    setPrescription({ ...prescription, medications: updated });
                  }}
                  className="w-28 text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  placeholder="Dosage"
                />
                <input
                  type="text"
                  value={med.frequency}
                  onChange={(e) => {
                    const updated = [...prescription.medications];
                    updated[idx].frequency = e.target.value;
                    setPrescription({ ...prescription, medications: updated });
                  }}
                  className="w-28 text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  placeholder="Frequency"
                />
                <input
                  type="text"
                  value={med.duration}
                  onChange={(e) => {
                    const updated = [...prescription.medications];
                    updated[idx].duration = e.target.value;
                    setPrescription({ ...prescription, medications: updated });
                  }}
                  className="w-20 text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  placeholder="Duration"
                />
                <button
                  onClick={() => handleRemoveMedication(idx)}
                  className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Special Instructions / Dietary Advice
          </label>
          <input
            type="text"
            value={prescription.specialInstructions}
            onChange={(e) => setPrescription({ ...prescription, specialInstructions: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Approval & Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Prescription with Doctor Electronic Stamp</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveAndPrint}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Printer className="w-4 h-4" />
              Approve & Print RX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
