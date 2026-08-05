import React from 'react';
import { PatientStatus } from '../../types/patient';

interface PatientStatusBadgeProps {
  status: PatientStatus;
  size?: 'sm' | 'md';
}

export const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    Blocked: 'bg-rose-50 text-rose-700 border-rose-200/90',
    Archived: 'bg-amber-50 text-amber-700 border-amber-200/90',
  };

  const dots = {
    Active: 'bg-emerald-500',
    Inactive: 'bg-slate-400',
    Blocked: 'bg-rose-500',
    Archived: 'bg-amber-500',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-xl border ${styles[status] || styles.Active} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.Active}`} />
      <span>{status}</span>
    </span>
  );
};
