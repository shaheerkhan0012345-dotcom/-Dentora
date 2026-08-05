import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  FileText,
  Activity,
  CreditCard,
  UserCheck,
  FilePlus,
  MessageSquare
} from 'lucide-react';
import { TimelineItem } from '../../types/patient';
import { subscribeToPatientTimeline, addTimelineEvent } from '../../services/patientService';

interface TimelineCardProps {
  patientDocId: string;
  userName: string;
  canAddEvent?: boolean;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  patientDocId,
  userName,
  canAddEvent = true,
}) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TimelineItem['category']>('note');

  useEffect(() => {
    const unsubscribe = subscribeToPatientTimeline(patientDocId, (items) => {
      setTimeline(items);
    });
    return () => unsubscribe();
  }, [patientDocId]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addTimelineEvent(patientDocId, {
        title,
        description,
        category,
        createdBy: userName,
      });

      setTitle('');
      setDescription('');
      setIsAdding(false);
    } catch (err) {
      console.error('Add timeline event error:', err);
    }
  };

  const getCategoryBadge = (cat: TimelineItem['category']) => {
    switch (cat) {
      case 'registration':
        return { icon: <UserCheck className="w-3.5 h-3.5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' };
      case 'appointment':
        return { icon: <Calendar className="w-3.5 h-3.5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-200' };
      case 'treatment':
        return { icon: <Activity className="w-3.5 h-3.5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' };
      case 'prescription':
        return { icon: <FileText className="w-3.5 h-3.5 text-purple-600" />, bg: 'bg-purple-50 border-purple-200' };
      case 'invoice':
      case 'payment':
        return { icon: <CreditCard className="w-3.5 h-3.5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' };
      case 'document':
        return { icon: <FilePlus className="w-3.5 h-3.5 text-cyan-600" />, bg: 'bg-cyan-50 border-cyan-200' };
      case 'note':
      default:
        return { icon: <MessageSquare className="w-3.5 h-3.5 text-slate-600" />, bg: 'bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1d5bd8]" />
            <span>Clinical Timeline & Activity Log</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Chronological log of appointments, procedures, notes, and records
          </p>
        </div>

        {canAddEvent && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Milestone</span>
          </button>
        )}
      </div>

      {/* FORM TO ADD MILESTONE */}
      {isAdding && (
        <form onSubmit={handleAddEvent} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scaling & Polishing Session Completed"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none"
              >
                <option value="treatment">Treatment / Surgery</option>
                <option value="appointment">Appointment Event</option>
                <option value="prescription">Prescription Issued</option>
                <option value="note">Staff Note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Details / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical observation or patient feedback..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-600 font-bold border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#1d5bd8] text-white font-bold"
            >
              Save Milestone
            </button>
          </div>
        </form>
      )}

      {/* TIMELINE ITEMS */}
      {timeline.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs font-medium">
          No activity logs recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((item) => {
            const badge = getCategoryBadge(item.category);
            return (
              <div key={item.id} className="relative group">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border ${badge.bg} flex items-center justify-center shadow-xs`}
                >
                  {badge.icon}
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 font-medium">{item.description}</p>
                  )}

                  <div className="text-[10px] text-slate-400 font-bold pt-1">
                    Logged by <span className="text-slate-700">{item.createdBy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
