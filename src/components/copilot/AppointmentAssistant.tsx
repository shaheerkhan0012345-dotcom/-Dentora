import React, { useState } from 'react';
import { Calendar, Sparkles, CheckCircle2, AlertTriangle, Clock, User, ShieldCheck, X, Loader2 } from 'lucide-react';
import { createAIAction } from '../../services/aiActionService';

interface AppointmentAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}

export const AppointmentAssistant: React.FC<AppointmentAssistantProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
}) => {
  const [nlInput, setNlInput] = useState('Book Ali Khan next Monday afternoon for scaling');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposedBooking, setProposedBooking] = useState<{
    patientName: string;
    patientPhone: string;
    doctorName: string;
    date: string;
    timeSlot: string;
    treatment: string;
    room: string;
    conflictCheck: 'Pass' | 'Warning' | 'Fail';
    conflictMessage?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeBooking = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const nextMonday = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      setProposedBooking({
        patientName: 'Ali Khan',
        patientPhone: '(555) 234-5678',
        doctorName: 'Dr. Elena Rostova',
        date: nextMonday,
        timeSlot: '02:30 PM - 03:00 PM',
        treatment: 'Ultrasonic Scaling & Polishing',
        room: 'Chair 1 - Main Suite',
        conflictCheck: 'Pass',
        conflictMessage: 'Slot is open. Dr. Elena Rostova and Chair 1 are free.',
      });
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleConfirmAction = async () => {
    if (!proposedBooking) return;
    await createAIAction({
      actionType: 'BOOK_APPOINTMENT',
      title: `Book Appointment for ${proposedBooking.patientName}`,
      description: `Schedules ${proposedBooking.treatment} with ${proposedBooking.doctorName}`,
      requestedByUserId: currentUserId,
      requestedByUserName: currentUserName,
      requestedByUserRole: currentUserRole,
      targetPatientName: proposedBooking.patientName,
      params: {
        patientName: proposedBooking.patientName,
        patientPhone: proposedBooking.patientPhone,
        doctorName: proposedBooking.doctorName,
        date: proposedBooking.date,
        startTime: '02:30 PM',
        endTime: '03:00 PM',
        treatment: proposedBooking.treatment,
        room: proposedBooking.room,
      },
      previewSummary: `Date: ${proposedBooking.date} at 02:30 PM | Doctor: ${proposedBooking.doctorName} | Room: ${proposedBooking.room}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Natural Language Booking Assistant
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  Smart Scheduling
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type booking requests naturally. The AI checks patient records and doctor calendars automatically.
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
        <div className="my-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Natural Language Booking Command
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder='e.g., "Book Ali next Monday afternoon with Dr. Rostova"'
              className="flex-1 text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            />
            <button
              onClick={handleAnalyzeBooking}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-cyan-500/20"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze Slot
            </button>
          </div>
        </div>

        {/* Booking Preview */}
        {proposedBooking ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 my-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AI Schedule Resolution Proposal
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Calendar Conflicts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-slate-400">Patient:</span>
                <p className="font-bold text-slate-900 dark:text-white">{proposedBooking.patientName}</p>
              </div>
              <div>
                <span className="text-slate-400">Attending Doctor:</span>
                <p className="font-bold text-slate-900 dark:text-white">{proposedBooking.doctorName}</p>
              </div>
              <div>
                <span className="text-slate-400">Date & Slot:</span>
                <p className="font-bold text-cyan-600 dark:text-cyan-400">
                  {proposedBooking.date} ({proposedBooking.timeSlot})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Treatment & Suite:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {proposedBooking.treatment} ({proposedBooking.room})
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              {proposedBooking.conflictMessage}
            </p>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Requires human confirmation before writing to appointment ledger.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              disabled={!proposedBooking}
              onClick={handleConfirmAction}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Propose Booking Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
