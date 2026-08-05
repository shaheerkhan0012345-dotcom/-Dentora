import React from 'react';
import {
  Clock,
  Stethoscope,
  Pill,
  FileImage,
  FileText,
  Calendar,
  CheckCircle2,
  Sparkles,
  User,
} from 'lucide-react';
import { TimelineEventRecord, EventType } from '../../types/clinical';

interface TimelineProps {
  events: TimelineEventRecord[];
  patientName: string;
}

const EVENT_ICONS: Record<EventType, { icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  'Treatment Created': { icon: Stethoscope, color: 'text-[#1d5bd8]', bg: 'bg-blue-50' },
  'Treatment Updated': { icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
  'Prescription Added': { icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'X-ray Uploaded': { icon: FileImage, color: 'text-amber-600', bg: 'bg-amber-50' },
  'Clinical Note Added': { icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
  'Appointment Scheduled': { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export const Timeline: React.FC<TimelineProps> = ({ events, patientName }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1d5bd8]" />
            <span>Automatic Patient Clinical Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time chronological audit trail of consultations, procedures, prescriptions, and uploads
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
          {events.length} Recorded Events
        </span>
      </div>

      {/* TIMELINE STREAM */}
      {events.length === 0 ? (
        <p className="text-xs text-slate-400 italic text-center py-8">
          No clinical timeline events recorded yet.
        </p>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {events.map((evt) => {
            const config = EVENT_ICONS[evt.type] || EVENT_ICONS['Treatment Created'];
            const IconComp = config.icon;

            return (
              <div key={evt.id} className="relative flex items-start gap-4 group">
                
                {/* ICON NODE */}
                <div
                  className={`absolute -left-6 top-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center ${config.bg} ${config.color} shadow-2xs group-hover:scale-110 transition-transform`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>

                {/* CONTENT CARD */}
                <div className="flex-1 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1 group-hover:border-[#1d5bd8] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900">{evt.title}</span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{evt.description}</p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-200/50 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Performed by: <strong>{evt.performedBy}</strong></span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 font-bold">
                      {evt.type}
                    </span>
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
