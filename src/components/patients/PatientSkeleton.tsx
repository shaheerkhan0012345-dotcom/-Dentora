import React from 'react';

export const PatientSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4 animate-pulse">
      <div className="h-6 bg-slate-100 rounded-xl w-1/4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-100 rounded-md w-32" />
                <div className="h-3 bg-slate-100 rounded-md w-24" />
              </div>
            </div>
            <div className="h-4 bg-slate-100 rounded-md w-28 hidden sm:block" />
            <div className="h-4 bg-slate-100 rounded-md w-20 hidden md:block" />
            <div className="h-6 bg-slate-100 rounded-xl w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};
