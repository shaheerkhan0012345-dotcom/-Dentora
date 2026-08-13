import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  Pill,
  Sparkles,
  Building2,
  X,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { PrescriptionRecord, PrescriptionMedicine } from '../../types/clinical';

interface PrescriptionFormProps {
  prescriptions: PrescriptionRecord[];
  onCreatePrescription: (
    prescription: Omit<PrescriptionRecord, 'id' | 'prescriptionId' | 'createdAt'>
  ) => Promise<void>;
  patientName: string;
  patientId: string;
  doctorName?: string;
}

const COMMON_DRUGS = [
  { medicine: 'Amoxicillin 500mg', dosage: '1 Capsule', duration: '5 Days', instructions: 'Take after meals' },
  { medicine: 'Augmentin 625mg', dosage: '1 Tablet', duration: '5 Days', instructions: 'Take twice daily after food' },
  { medicine: 'Ibuprofen 400mg', dosage: '1 Tablet', duration: '3 Days', instructions: 'Take if pain persists' },
  { medicine: 'Paracetamol 500mg', dosage: '1 Tablet', duration: '3 Days', instructions: 'Take for fever or mild pain' },
  { medicine: 'Metronidazole 400mg', dosage: '1 Tablet', duration: '5 Days', instructions: 'Avoid alcohol during medication' },
  { medicine: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', duration: '7 Days', instructions: 'Rinse mouth for 1 minute twice daily' },
];

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  prescriptions,
  onCreatePrescription,
  patientName,
  patientId,
  doctorName = 'Dr. Elena Rostova, DDS',
}) => {
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      medicine: 'Amoxicillin 500mg',
      dosage: '1 Capsule',
      morning: true,
      afternoon: true,
      night: true,
      duration: '5 Days',
      instructions: 'Take after meals with full glass of water',
    },
  ]);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        medicine: '',
        dosage: '1 Tablet',
        morning: true,
        afternoon: false,
        night: true,
        duration: '3 Days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const removeMedicineRow = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleQuickAddDrug = (drug: typeof COMMON_DRUGS[0]) => {
    setMedicines([
      ...medicines.filter((m) => m.medicine.trim() !== ''),
      {
        medicine: drug.medicine,
        dosage: drug.dosage,
        morning: true,
        afternoon: true,
        night: true,
        duration: drug.duration,
        instructions: drug.instructions,
      },
    ]);
  };

  const handleSavePrescription = async () => {
    if (medicines.some((m) => !m.medicine.trim())) {
      alert('Please fill out all medicine names before saving.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreatePrescription({
        patientId,
        patientName,
        doctorName,
        doctorSignature: doctorName,
        medicines,
      });

      // Reset
      setMedicines([
        {
          medicine: '',
          dosage: '1 Tablet',
          morning: true,
          afternoon: false,
          night: true,
          duration: '3 Days',
          instructions: 'Take after meals',
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = (rx: PrescriptionRecord) => {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(29, 91, 216); // #1d5bd8
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TEETHLY CLINICAL DENTAL SYSTEM', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL DIGITAL PRESCRIPTION', 150, 15);

    // Patient & Doctor Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rx ID: ${rx.prescriptionId}`, 14, 34);
    doc.text(`Date: ${new Date(rx.createdAt).toLocaleDateString()}`, 150, 34);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(10);
    doc.text(`Patient Name: ${rx.patientName} (${rx.patientId})`, 14, 46);
    doc.text(`Attending Doctor: ${rx.doctorName}`, 14, 52);

    // Rx Symbol
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 91, 216);
    doc.text('Rx', 14, 66);

    // Medicines List Table
    let y = 76;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Medication', 14, y);
    doc.text('Dosage', 80, y);
    doc.text('Schedule (M-A-N)', 120, y);
    doc.text('Duration', 165, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    rx.medicines.forEach((m) => {
      doc.setFont('helvetica', 'bold');
      doc.text(m.medicine, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(m.dosage, 80, y);

      const sched = `${m.morning ? '1' : '0'}-${m.afternoon ? '1' : '0'}-${m.night ? '1' : '0'}`;
      doc.text(sched, 120, y);
      doc.text(m.duration, 165, y);

      if (m.instructions) {
        y += 5;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Instructions: ${m.instructions}`, 14, y);
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
      }

      y += 10;
    });

    // Signature Area
    y = Math.max(y + 20, 220);
    doc.line(130, y, 196, y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(rx.doctorName, 130, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Dental Practitioner', 130, y + 11);

    // Save
    doc.save(`Prescription_${rx.prescriptionId}_${rx.patientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#1d5bd8]" />
            <span>Digital Prescriptions & Printable Rx Generator</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create structured medication schedules, instructions, and download official PDF prescriptions
          </p>
        </div>

        {/* QUICK DRUG SUGGESTIONS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Frequent Drugs:</span>
          {COMMON_DRUGS.slice(0, 3).map((d) => (
            <button
              key={d.medicine}
              type="button"
              onClick={() => handleQuickAddDrug(d)}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1d5bd8] border border-blue-200 rounded-xl text-[10px] font-bold cursor-pointer"
            >
              + {d.medicine}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* NEW PRESCRIPTION FORM (COL SPAN 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              New Rx for Patient: {patientName}
            </span>
            <span className="text-xs font-bold text-[#1d5bd8]">Doctor: {doctorName}</span>
          </div>

          <div className="space-y-4">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Medicine #{idx + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicineRow(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove Medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Medicine Name & Strength</label>
                    <input
                      type="text"
                      value={med.medicine}
                      onChange={(e) => {
                        const updated = [...medicines];
                        updated[idx].medicine = e.target.value;
                        setMedicines(updated);
                      }}
                      placeholder="e.g. Amoxicillin 500mg"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Dosage Unit</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => {
                        const updated = [...medicines];
                        updated[idx].dosage = e.target.value;
                        setMedicines(updated);
                      }}
                      placeholder="e.g. 1 Capsule / 10ml"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">
                      Daily Schedule (Morning - Afternoon - Night)
                    </label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 font-bold">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={med.morning}
                          onChange={(e) => {
                            const updated = [...medicines];
                            updated[idx].morning = e.target.checked;
                            setMedicines(updated);
                          }}
                        />
                        <span>Morning</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={med.afternoon}
                          onChange={(e) => {
                            const updated = [...medicines];
                            updated[idx].afternoon = e.target.checked;
                            setMedicines(updated);
                          }}
                        />
                        <span>Noon</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={med.night}
                          onChange={(e) => {
                            const updated = [...medicines];
                            updated[idx].night = e.target.checked;
                            setMedicines(updated);
                          }}
                        />
                        <span>Night</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => {
                        const updated = [...medicines];
                        updated[idx].duration = e.target.value;
                        setMedicines(updated);
                      }}
                      placeholder="e.g. 5 Days / 1 Week"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Special Instructions</label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => {
                      const updated = [...medicines];
                      updated[idx].instructions = e.target.value;
                      setMedicines(updated);
                    }}
                    placeholder="e.g. Take after meals with plenty of water"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={addMedicineRow}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Medicine</span>
            </button>

            <button
              type="button"
              onClick={handleSavePrescription}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Generating Rx...' : 'Issue Prescription'}</span>
            </button>
          </div>

        </div>

        {/* ISSUED PRESCRIPTIONS STREAM (COL SPAN 1) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
            <span>Issued Prescriptions</span>
            <span className="text-xs font-bold text-slate-400">{prescriptions.length} records</span>
          </h4>

          {prescriptions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No prescriptions issued yet.</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-extrabold text-[#1d5bd8]">{rx.prescriptionId}</span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="bg-white p-2 rounded-xl border border-slate-100">
                        <div className="font-extrabold text-slate-900">{m.medicine}</div>
                        <div className="text-[10px] text-slate-500">
                          {m.dosage} • Schedule: ({m.morning ? '1' : '0'}-{m.afternoon ? '1' : '0'}-
                          {m.night ? '1' : '0'}) • {m.duration}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => generatePDF(rx)}
                    className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF Rx</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
