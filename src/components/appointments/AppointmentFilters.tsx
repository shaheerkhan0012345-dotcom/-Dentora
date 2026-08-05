import React from 'react';
import { Filter, RotateCcw, Calendar as CalendarIcon, User, Stethoscope, DoorOpen } from 'lucide-react';
import { AppointmentFilterOptions } from '../../types/appointment';

interface AppointmentFiltersProps {
  filters: AppointmentFilterOptions;
  onChange: (newFilters: AppointmentFilterOptions) => void;
  doctors: string[];
  rooms: string[];
  treatments: string[];
  onReset: () => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filters,
  onChange,
  doctors,
  rooms,
  treatments,
  onReset,
}) => {
  const isFiltered =
    filters.doctor !== 'All' ||
    filters.status !== 'All' ||
    filters.treatment !== 'All' ||
    filters.room !== 'All' ||
    filters.priority !== 'All' ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-[#1d5bd8]" />
          <span>Filter Appointments</span>
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* DOCTOR FILTER */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
            Doctor
          </label>
          <select
            value={filters.doctor}
            onChange={(e) => onChange({ ...filters, doctor: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Doctors</option>
            {doctors.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS FILTER */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waiting">Waiting</option>
            <option value="Called">Called</option>
            <option value="In Treatment">In Treatment</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
        </div>

        {/* ROOM FILTER */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
            Chair / Room
          </label>
          <select
            value={filters.room}
            onChange={(e) => onChange({ ...filters, room: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Rooms</option>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* PRIORITY FILTER */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ ...filters, priority: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
            <option value="Emergency">Emergency</option>
            <option value="VIP">VIP</option>
          </select>
        </div>

        {/* DATE FROM */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          />
        </div>

        {/* DATE TO */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
          />
        </div>
      </div>
    </div>
  );
};
