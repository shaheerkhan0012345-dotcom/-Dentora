import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  SkipForward,
  UserCheck,
  Volume2,
  Sparkles,
  Stethoscope,
  DoorOpen,
  AlertCircle,
} from 'lucide-react';
import { QueueRecord, QueueStatus } from '../../types/appointment';
import { Avatar } from '../ui/Avatar';
import { StatusBadge } from '../appointments/StatusBadge';

interface QueueCardProps {
  item: QueueRecord;
  onStatusChange: (id: string, newStatus: QueueStatus) => void;
  onCallNext: (item: QueueRecord) => void;
  isNextInLine?: boolean;
}

export const QueueCard: React.FC<QueueCardProps> = ({
  item,
  onStatusChange,
  onCallNext,
  isNextInLine = false,
}) => {
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // Live timer for elapsed wait duration
  useEffect(() => {
    const calculateWait = () => {
      const arrivedTime = new Date(item.createdAt).getTime();
      const nowTime = Date.now();
      const diffMs = Math.max(0, nowTime - arrivedTime);
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };

    calculateWait();
    const interval = setInterval(calculateWait, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [item.createdAt]);

  const priorityColor = () => {
    switch (item.priority) {
      case 'Emergency':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'VIP':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'Urgent':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div
      className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
        item.status === 'Called'
          ? 'bg-blue-50/90 border-[#1d5bd8] shadow-md ring-2 ring-[#1d5bd8]/30 animate-pulse'
          : item.status === 'In Treatment'
          ? 'bg-purple-50/80 border-purple-200 shadow-xs'
          : isNextInLine
          ? 'bg-teal-50/60 border-teal-200 shadow-xs'
          : priorityColor()
      }`}
    >
      {/* TOP BAR: TOKEN & STATUS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-xs tracking-wider">
            {item.queueNumber}
          </span>
          {isNextInLine && item.status === 'Waiting' && (
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#006666] text-[10px] font-extrabold uppercase">
              ★ Next in Line
            </span>
          )}
        </div>

        <StatusBadge status={item.status} size="sm" />
      </div>

      {/* PATIENT INFO */}
      <div className="flex items-center gap-3">
        <Avatar name={item.patientName} src={item.patientAvatar} size="md" />

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-extrabold text-slate-900 truncate">{item.patientName}</h4>
          <p className="text-xs font-semibold text-slate-600 truncate">{item.treatment}</p>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[#006666] font-extrabold">
              <Clock className="w-3 h-3" />
              <span>Arrived {item.timeArrived} ({elapsedMinutes}m wait)</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Stethoscope className="w-3 h-3 text-[#1d5bd8]" />
              <span>{item.doctorName}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <DoorOpen className="w-3 h-3 text-slate-400" />
              <span>{item.room}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ACTIONS TOOLBAR */}
      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
        
        {item.status === 'Waiting' && (
          <button
            onClick={() => onCallNext(item)}
            className="px-3.5 py-1.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Call Patient</span>
          </button>
        )}

        {item.status === 'Called' && (
          <button
            onClick={() => onStatusChange(item.id, 'In Treatment')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Treatment</span>
          </button>
        )}

        {item.status === 'In Treatment' && (
          <button
            onClick={() => onStatusChange(item.id, 'Completed')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Visit</span>
          </button>
        )}

        {/* SECONDARY CONTROLS: SKIP / CANCEL */}
        {['Waiting', 'Called'].includes(item.status) && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onStatusChange(item.id, 'Skipped')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer"
              title="Skip Patient"
            >
              Skip
            </button>
            <button
              onClick={() => onStatusChange(item.id, 'Cancelled')}
              className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
              title="Cancel Queue Ticket"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
