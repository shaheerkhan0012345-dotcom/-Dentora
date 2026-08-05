import React, { useState } from 'react';
import { 
  Clock, 
  UserCheck, 
  AlertCircle, 
  ChevronRight, 
  Play, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge, BadgeVariant } from '../ui/Badge';
import { QueueItem } from '../../types/dashboard';

const initialQueue: QueueItem[] = [
  {
    id: 'q-1',
    patientName: 'David Kim',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    timeArrived: '09:45 AM',
    waitTimeMinutes: 22,
    status: 'Checked In',
    assignedDoctor: 'Dr. Marcus Vance',
    room: 'Chair 2',
    priority: 'Emergency',
    treatment: 'Severe Toothache & Fracture',
  },
  {
    id: 'q-2',
    patientName: 'Marcus Vance',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    timeArrived: '10:00 AM',
    waitTimeMinutes: 14,
    status: 'Checked In',
    assignedDoctor: 'Dr. Marcus Vance',
    room: 'Chair 3',
    priority: 'VIP',
    treatment: 'Crown Placement Consultation',
  },
  {
    id: 'q-3',
    patientName: 'Emily Watson',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    timeArrived: '10:10 AM',
    waitTimeMinutes: 8,
    status: 'Checked In',
    assignedDoctor: 'Dr. Elena Rostova',
    room: 'Hygiene Suite',
    priority: 'Normal',
    treatment: 'Routine Aligner Checkup',
  },
  {
    id: 'q-4',
    patientName: 'Jessica Taylor',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    timeArrived: '10:15 AM',
    waitTimeMinutes: 3,
    status: 'In Hygiene',
    assignedDoctor: 'Hygienist Maya',
    room: 'Hygiene Bay 1',
    priority: 'Normal',
    treatment: 'Deep Cleaning & Fluoride',
  },
];

interface LiveQueueWidgetProps {
  onOpenFullQueue?: () => void;
}

export const LiveQueueWidget: React.FC<LiveQueueWidgetProps> = ({ onOpenFullQueue }) => {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);

  const callNextPatient = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'With Doctor' as const } : item
      )
    );
  };

  const getPriorityBadgeVariant = (priority: QueueItem['priority']): BadgeVariant => {
    switch (priority) {
      case 'Emergency': return 'rose';
      case 'VIP': return 'amber';
      default: return 'slate';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-[#006666]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Live Waiting Room Queue</h3>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#006666] text-[10px] font-extrabold">
                {queue.length} Waiting
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Real-time patient wait time monitor</p>
          </div>
        </div>

        {onOpenFullQueue && (
          <button
            onClick={onOpenFullQueue}
            className="text-xs font-bold text-[#006666] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* QUEUE LIST */}
      <div className="space-y-2.5">
        {queue.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <UserCheck className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
            <p className="font-semibold text-slate-700">Waiting room is empty</p>
            <p className="text-[11px]">All checked-in patients have been seated.</p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.priority === 'Emergency'
                  ? 'bg-rose-50/40 border-rose-200/80'
                  : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={item.patientName} src={item.patientAvatar} size="md" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.patientName}</h4>
                    <Badge variant={getPriorityBadgeVariant(item.priority)} size="sm">
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.treatment}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-slate-400">
                    <span>Arrived {item.timeArrived}</span>
                    <span>•</span>
                    <span className="text-[#006666] font-bold">Wait: {item.waitTimeMinutes} mins</span>
                    <span>•</span>
                    <span>{item.assignedDoctor}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="shrink-0">
                {item.status === 'Checked In' ? (
                  <button
                    onClick={() => callNextPatient(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Seat Now</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>With Doctor</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
