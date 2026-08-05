import React from 'react';
import { Search, X } from 'lucide-react';

interface PatientSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  totalResults: number;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search by Name, Patient ID (PT-XXXX), Phone, CNIC, or Email...',
  totalResults,
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="text-xs text-slate-500 font-semibold shrink-0">
        Showing <span className="font-extrabold text-slate-900">{totalResults}</span> records
      </div>
    </div>
  );
};
