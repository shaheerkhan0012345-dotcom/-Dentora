import React, { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, User, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { DoctorScheduleRecord } from '../../types/appointment';

interface DoctorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: DoctorScheduleRecord[];
  onUpdateSchedule: (doctorId: string, updates: Partial<DoctorScheduleRecord>) => Promise<void>;
  onAddLeave: (doctorId: string, leave: { startDate: string; endDate: string; reason: string }) => Promise<void>;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DoctorScheduleModal: React.FC<DoctorScheduleModalProps> = ({
  isOpen,
  onClose,
  schedules,
  onUpdateSchedule,
  onAddLeave,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(schedules[0]?.doctorId || 'DOC-101');
  const [leaveStartDate, setLeaveStartDate] = useState<string>('');
  const [leaveEndDate, setLeaveEndDate] = useState<string>('');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSchedule = schedules.find((s) => s.doctorId === selectedDocId) || schedules[0];

  const handleToggleDay = async (day: string) => {
    if (!currentSchedule) return;
    const days = currentSchedule.workingDays.includes(day)
      ? currentSchedule.workingDays.filter((d) => d !== day)
      : [...currentSchedule.workingDays, day];

    await onUpdateSchedule(currentSchedule.doctorId, { workingDays: days });
  };

  const handleTimeChange = async (field: keyof DoctorScheduleRecord, val: string) => {
    if (!currentSchedule) return;
    await onUpdateSchedule(currentSchedule.doctorId, { [field]: val });
  };

  const handleAddLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;
    setSaving(true);
    try {
      await onAddLeave(selectedDocId, {
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason,
      });
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Doctor Availability & Shift Schedule</h2>
              <p className="text-xs text-slate-400 font-medium">
                Configure doctor working hours, breaks, and leave dates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* DOCTOR SELECTOR TABS */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
            {schedules.map((docItem) => (
              <button
                key={docItem.doctorId}
                onClick={() => setSelectedDocId(docItem.doctorId)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDocId === docItem.doctorId
                    ? 'bg-[#1d5bd8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {docItem.doctorName}
              </button>
            ))}
          </div>

          {currentSchedule && (
            <div className="space-y-5">
              
              {/* WORKING DAYS */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Working Days
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ALL_DAYS.map((day) => {
                    const isWorking = currentSchedule.workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isWorking
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SHIFT & LUNCH HOURS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    value={currentSchedule.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    value={currentSchedule.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Lunch Break Start
                  </label>
                  <input
                    type="time"
                    value={currentSchedule.lunchStart}
                    onChange={(e) => handleTimeChange('lunchStart', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Lunch Break End
                  </label>
                  <input
                    type="time"
                    value={currentSchedule.lunchEnd}
                    onChange={(e) => handleTimeChange('lunchEnd', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* SCHEDULED LEAVES */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#1d5bd8]" />
                  <span>Scheduled Leaves & Out-of-Office</span>
                </h4>

                {/* Leaves List */}
                <div className="space-y-2">
                  {(!currentSchedule.leaves || currentSchedule.leaves.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No scheduled leaves for this doctor.</p>
                  ) : (
                    currentSchedule.leaves.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-amber-900 block">{l.reason}</span>
                          <span className="text-[11px] text-amber-700 font-medium">
                            {l.startDate} to {l.endDate}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold">
                          On Leave
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Leave Form */}
                <form onSubmit={handleAddLeaveSubmit} className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Add New Planned Leave
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      required
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                    <input
                      type="date"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      required
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Reason for leave"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      required
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Leave</span>
                  </button>
                </form>

              </div>

            </div>
          )}

          {/* FOOTER CLOSE */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold rounded-2xl cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
