import React from 'react';
import { Search, X } from 'lucide-react';

interface AppointmentSearchProps {
  value: string;
  onChange: (val: string) => void;
  totalResults: number;
}

export const AppointmentSearch: React.FC<AppointmentSearchProps> = ({
  value,
  onChange,
  totalResults,
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search appointment by patient name, patient ID, doctor, code (e.g. APT-901), or phone..."
        className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8] shadow-2xs transition-all"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-14 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <span className="absolute right-3.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg pointer-events-none">
        {totalResults} found
      </span>
    </div>
  );
};
