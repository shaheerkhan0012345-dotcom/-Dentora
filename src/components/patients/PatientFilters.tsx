import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { PatientFilterOptions } from '../../types/patient';

interface PatientFiltersProps {
  filters: PatientFilterOptions;
  onFilterChange: (updated: PatientFilterOptions) => void;
  onReset: () => void;
  doctorOptions: string[];
}

export const PatientFilters: React.FC<PatientFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  doctorOptions,
}) => {
  const handleChange = (key: keyof PatientFilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.gender !== 'All' ||
    filters.doctor !== 'All' ||
    filters.status !== 'Active' ||
    filters.bloodGroup !== 'All' ||
    filters.minAge !== null ||
    filters.maxAge !== null ||
    filters.regDateFrom !== '' ||
    filters.regDateTo !== '';

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1d5bd8]" />
          <h3 className="text-xs font-black text-slate-900 tracking-tight">Advanced Directory Filters</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] font-extrabold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        
        {/* STATUS */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
            <option value="Archived">Archived (Soft Deleted)</option>
          </select>
        </div>

        {/* GENDER */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* DOCTOR */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Assigned Doctor
          </label>
          <select
            value={filters.doctor}
            onChange={(e) => handleChange('doctor', e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Doctors</option>
            {doctorOptions.map((docName) => (
              <option key={docName} value={docName}>
                {docName}
              </option>
            ))}
          </select>
        </div>

        {/* BLOOD GROUP */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Blood Group
          </label>
          <select
            value={filters.bloodGroup}
            onChange={(e) => handleChange('bloodGroup', e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        {/* AGE RANGE */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Min Age
          </label>
          <input
            type="number"
            placeholder="Min Age"
            value={filters.minAge ?? ''}
            onChange={(e) => handleChange('minAge', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Max Age
          </label>
          <input
            type="number"
            placeholder="Max Age"
            value={filters.maxAge ?? ''}
            onChange={(e) => handleChange('maxAge', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:outline-none"
          />
        </div>

      </div>
    </div>
  );
};
