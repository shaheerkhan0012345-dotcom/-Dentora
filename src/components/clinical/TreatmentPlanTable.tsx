import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { TreatmentRecord, TreatmentStatus, TreatmentPriority } from '../../types/clinical';

interface TreatmentPlanTableProps {
  treatments: TreatmentRecord[];
  onAddTreatment: (treatment: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'netCost'>) => Promise<void>;
  onUpdateTreatment: (id: string, updates: Partial<TreatmentRecord>) => Promise<void>;
  onDeleteTreatment: (id: string) => Promise<void>;
  patientName: string;
  patientId: string;
  prefilledTooth?: string;
  userRole?: string;
}

const STATUS_COLORS: Record<TreatmentStatus, { bg: string; text: string; border: string }> = {
  Planned: { bg: 'bg-blue-50', text: 'text-[#1d5bd8]', border: 'border-blue-200' },
  Approved: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  'In Progress': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
};

export const TreatmentPlanTable: React.FC<TreatmentPlanTableProps> = ({
  treatments,
  onAddTreatment,
  onUpdateTreatment,
  onDeleteTreatment,
  patientName,
  patientId,
  prefilledTooth = 'General',
  userRole = 'Doctor',
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [toothNumber, setToothNumber] = useState<string>(prefilledTooth || 'General');
  const [treatmentType, setTreatmentType] = useState<string>('Composite Restoration');
  const [assignedDoctor, setAssignedDoctor] = useState<string>('Dr. Elena Rostova');
  const [estimatedCost, setEstimatedCost] = useState<number>(350);
  const [discount, setDiscount] = useState<number>(0);
  const [priority, setPriority] = useState<TreatmentPriority>('Normal');
  const [status, setStatus] = useState<TreatmentStatus>('Planned');
  const [treatmentDate, setTreatmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredTreatments = treatments.filter(
    (t) => statusFilter === 'All' || t.status === statusFilter
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddTreatment({
        treatmentId: `TRT-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId,
        patientName,
        toothNumber: toothNumber.trim() || 'General',
        treatmentType,
        assignedDoctor,
        estimatedCost: Number(estimatedCost),
        discount: Number(discount),
        priority,
        status,
        treatmentDate,
        notes,
      });

      setIsModalOpen(false);
      // Reset form
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  const totalEstimated = filteredTreatments.reduce((sum, t) => sum + (t.netCost || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#1d5bd8]" />
            <span>Comprehensive Treatment Plans & History</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sequential tooth procedures, cost estimates, and clinical approval status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Treatment Plan</span>
          </button>
        </div>
      </div>

      {/* COST METRICS & STATUS FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1d5bd8]">
            <DollarSign className="w-4 h-4" />
            <span>Total Estimated Cost: <strong>${totalEstimated}</strong></span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{filteredTreatments.length} Procedures Logged</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#1d5bd8]" />
            <span>Status:</span>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* TREATMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredTreatments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            No treatment plans recorded for this patient yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Tooth #</th>
                  <th className="px-5 py-3">Treatment / Procedure</th>
                  <th className="px-5 py-3">Assigned Doctor</th>
                  <th className="px-5 py-3">Est. Cost</th>
                  <th className="px-5 py-3">Net Cost</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredTreatments.map((trt) => {
                  const style = STATUS_COLORS[trt.status] || STATUS_COLORS.Planned;
                  return (
                    <tr key={trt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-500 font-bold">
                        {trt.treatmentId}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900">
                        {trt.toothNumber === 'General' ? 'General' : `#${trt.toothNumber}`}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900">
                        <div>{trt.treatmentType}</div>
                        {trt.notes && (
                          <span className="text-[10px] text-slate-400 font-normal block truncate max-w-xs">
                            {trt.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        {trt.assignedDoctor}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 line-through">
                        ${trt.estimatedCost}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900">
                        ${trt.netCost}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            trt.priority === 'Urgent' || trt.priority === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {trt.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={trt.status}
                          onChange={(e) =>
                            onUpdateTreatment(trt.id, {
                              status: e.target.value as TreatmentStatus,
                            })
                          }
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                        >
                          <option value="Planned">Planned</option>
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onDeleteTreatment(trt.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Treatment Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TO CREATE TREATMENT PLAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#1d5bd8]" />
                <span>Create Treatment Plan</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Tooth FDI Number</label>
                  <input
                    type="text"
                    value={toothNumber}
                    onChange={(e) => setToothNumber(e.target.value)}
                    placeholder="e.g. 16 or General"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Assigned Doctor</label>
                  <select
                    value={assignedDoctor}
                    onChange={(e) => setAssignedDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                    <option value="Dr. Marcus Vance">Dr. Marcus Vance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Treatment Type / Procedure</label>
                <input
                  type="text"
                  value={treatmentType}
                  onChange={(e) => setTreatmentType(e.target.value)}
                  placeholder="e.g. Root Canal Therapy, Composite Restoration, Zirconia Crown"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={treatmentDate}
                    onChange={(e) => setTreatmentDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Clinical Notes & Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional procedure notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl"
                >
                  {submitting ? 'Creating...' : 'Save Treatment Plan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
