import React from 'react';
import { Users, Plus, RefreshCw } from 'lucide-react';

interface PatientEmptyStateProps {
  onAddPatient?: () => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export const PatientEmptyState: React.FC<PatientEmptyStateProps> = ({
  onAddPatient,
  onResetFilters,
  isFiltered = false,
}) => {
  return (
    <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center shadow-2xs space-y-4 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1d5bd8] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
        <Users className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-slate-900">
          {isFiltered ? 'No Patients Matched Your Criteria' : 'No Patients Registered Yet'}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {isFiltered
            ? 'Try adjusting your search keywords, doctor assignment, or status filter to view clinical records.'
            : 'Get started by creating your first patient electronic health record in the Dentora system.'}
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        {isFiltered && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}

        {onAddPatient && (
          <button
            onClick={onAddPatient}
            className="px-4 py-2 rounded-2xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Patient</span>
          </button>
        )}
      </div>
    </div>
  );
};
