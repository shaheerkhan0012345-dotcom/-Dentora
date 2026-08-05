import React from 'react';
import { AppointmentStatus, QueueStatus } from '../../types/appointment';

interface StatusBadgeProps {
  status: AppointmentStatus | QueueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Confirmed':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'Waiting':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse';
      case 'Called':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-black';
      case 'In Treatment':
        return 'bg-purple-50 text-purple-700 border-purple-200/80 font-black';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'No Show':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Rescheduled':
        return 'bg-orange-50 text-orange-700 border-orange-200/80';
      case 'Skipped':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1 text-xs'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xl font-bold border ${getStyle()} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{status}</span>
    </span>
  );
};
