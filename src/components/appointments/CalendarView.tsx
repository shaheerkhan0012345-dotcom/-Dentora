import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  DoorOpen,
  Filter,
  CheckCircle2,
  Stethoscope,
  Move,
} from 'lucide-react';
import {
  AppointmentRecord,
  CalendarViewMode,
  AppointmentStatus,
} from '../../types/appointment';
import { StatusBadge } from './StatusBadge';
import { Avatar } from '../ui/Avatar';

interface CalendarViewProps {
  appointments: AppointmentRecord[];
  onSelectAppointment: (apt: AppointmentRecord) => void;
  onBookNew: (prefilledDate?: string, prefilledTime?: string) => void;
  onQuickReschedule: (id: string, newDate: string, newTime: string) => void;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onBookNew,
  onQuickReschedule,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [quickRescheduleItem, setQuickRescheduleItem] = useState<AppointmentRecord | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>('');

  // Date formatting helpers
  const formatDateISO = (d: Date) => d.toISOString().split('T')[0];

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 7);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => setCurrentDate(new Date());

  // Generate week days starting from Monday
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(curr.setDate(diff));

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  // Generate month days
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const statusColorClass = (status: AppointmentStatus) => {
    switch (status) {
      case 'In Treatment':
        return 'bg-purple-600 text-white border-purple-700 shadow-xs';
      case 'Waiting':
        return 'bg-amber-500 text-white border-amber-600 shadow-xs';
      case 'Confirmed':
        return 'bg-sky-600 text-white border-sky-700 shadow-xs';
      case 'Completed':
        return 'bg-emerald-600 text-white border-emerald-700 opacity-90';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-300 line-through';
      default:
        return 'bg-[#1d5bd8] text-white border-[#154dbf] shadow-xs';
    }
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const todayIso = formatDateISO(new Date());

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      
      {/* CALENDAR CONTROLS & HEADER */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        
        {/* LEFT: TODAY & NAV */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-extrabold rounded-xl shadow-2xs hover:bg-slate-100 cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-extrabold text-slate-900 ml-2">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              day: viewMode === 'day' ? 'numeric' : undefined,
            })}
          </span>
        </div>

        {/* RIGHT: VIEW TOGGLE & BOOK BUTTON */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
            {(['day', 'week', 'month', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => onBookNew(formatDateISO(currentDate))}
            className="px-3.5 py-1.5 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
        </div>

      </div>

      {/* VIEW CONTENT */}

      {/* 1. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* WEEK HEADER */}
            <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50 text-center text-xs font-bold text-slate-600">
              <div className="py-2.5 px-2 border-r border-slate-100 text-slate-400 text-[10px] uppercase">
                Time Slot
              </div>
              {weekDays.map((d) => {
                const dateStr = formatDateISO(d);
                const isToday = dateStr === todayIso;
                return (
                  <div
                    key={dateStr}
                    className={`py-2.5 px-2 border-r border-slate-100 ${
                      isToday ? 'bg-blue-50/80 text-[#1d5bd8]' : ''
                    }`}
                  >
                    <div className="text-[10px] uppercase text-slate-400">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-xs font-extrabold ${isToday ? 'text-[#1d5bd8]' : 'text-slate-900'}`}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WEEK BODY HOURLY GRID */}
            <div className="divide-y divide-slate-100 text-xs">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[72px]">
                  {/* Hour Column */}
                  <div className="py-2 px-3 border-r border-slate-100 font-extrabold text-slate-400 text-[10px] bg-slate-50/40">
                    {hour}
                  </div>

                  {/* 7 Days Columns */}
                  {weekDays.map((d) => {
                    const dateStr = formatDateISO(d);
                    const hourPrefix = hour.split(':')[0]; // e.g. "09"

                    // Find appointments for this date and hour
                    const cellAppointments = appointments.filter(
                      (apt) =>
                        apt.date === dateStr &&
                        apt.startTime &&
                        apt.startTime.startsWith(hourPrefix)
                    );

                    return (
                      <div
                        key={dateStr}
                        onClick={() => onBookNew(dateStr, hour)}
                        className="p-1 border-r border-slate-100 hover:bg-blue-50/20 transition-colors relative group cursor-pointer space-y-1"
                      >
                        {cellAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAppointment(apt);
                            }}
                            className={`p-1.5 rounded-xl border text-[10px] font-semibold transition-all hover:scale-[1.02] cursor-pointer ${statusColorClass(
                              apt.status
                            )}`}
                          >
                            <div className="flex items-center justify-between font-extrabold truncate">
                              <span className="truncate">{apt.patientName}</span>
                              <span className="text-[9px] opacity-80">{apt.startTime}</span>
                            </div>
                            <div className="text-[9px] opacity-90 truncate">{apt.treatment}</div>
                            <div className="text-[8px] opacity-80 truncate">{apt.doctorName}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 2. DAY VIEW */}
      {viewMode === 'day' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-xs font-extrabold text-slate-900">
                Daily Operatory Schedule ({formatDateISO(currentDate)})
              </span>
              <p className="text-[11px] text-slate-500">
                {appointments.filter((a) => a.date === formatDateISO(currentDate)).length} appointments scheduled
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {HOURS.map((hour) => {
              const hourPrefix = hour.split(':')[0];
              const dateStr = formatDateISO(currentDate);
              const hourApts = appointments.filter(
                (apt) => apt.date === dateStr && apt.startTime.startsWith(hourPrefix)
              );

              return (
                <div key={hour} className="py-3 flex items-start gap-4 hover:bg-slate-50/50 p-2 rounded-2xl transition-colors">
                  <div className="w-16 text-xs font-black text-[#1d5bd8] shrink-0 pt-1">
                    {hour}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {hourApts.length === 0 ? (
                      <button
                        onClick={() => onBookNew(dateStr, hour)}
                        className="py-2 px-3 border border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 text-xs font-bold transition-all text-left cursor-pointer"
                      >
                        + Book at {hour}
                      </button>
                    ) : (
                      hourApts.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onSelectAppointment(apt)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-xs space-y-1 ${statusColorClass(
                            apt.status
                          )}`}
                        >
                          <div className="flex items-center justify-between font-extrabold text-xs">
                            <span>{apt.patientName}</span>
                            <span className="text-[10px] opacity-90">{apt.startTime} - {apt.endTime}</span>
                          </div>
                          <p className="text-[11px] opacity-90 truncate">{apt.treatment}</p>
                          <div className="flex items-center justify-between text-[10px] opacity-80 pt-1">
                            <span>{apt.doctorName}</span>
                            <span>{apt.room}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((d) => {
              const dateStr = formatDateISO(d);
              const dayApts = appointments.filter((a) => a.date === dateStr);
              const isToday = dateStr === todayIso;

              return (
                <div
                  key={dateStr}
                  onClick={() => onBookNew(dateStr)}
                  className={`min-h-[90px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isToday
                      ? 'bg-blue-50/80 border-[#1d5bd8]/40 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold ${
                        isToday ? 'text-[#1d5bd8] bg-[#1d5bd8]/10 px-2 py-0.5 rounded-lg' : 'text-slate-800'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="text-[10px] font-bold text-[#1d5bd8] bg-blue-100 px-1.5 py-0.5 rounded-full">
                        {dayApts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayApts.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold truncate ${statusColorClass(
                          apt.status
                        )}`}
                      >
                        {apt.startTime} {apt.patientName}
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-bold text-center">
                        +{dayApts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="p-5 space-y-4">
          <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Chronological Agenda List
          </div>

          <div className="space-y-2.5">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No scheduled appointments found in the agenda.
              </div>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onSelectAppointment(apt)}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-[#1d5bd8]/40 hover:bg-slate-50 transition-all flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-[#1d5bd8] font-black text-center shrink-0">
                      <div className="text-xs">{apt.startTime}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{apt.date}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                        <span className="text-xs text-slate-400 font-semibold">({apt.patientId})</span>
                        <StatusBadge status={apt.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">{apt.treatment}</p>
                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 mt-1">
                        <span>{apt.doctorName}</span>
                        <span>•</span>
                        <span>{apt.room}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickRescheduleItem(apt);
                      setNewRescheduleDate(apt.date);
                      setNewRescheduleTime(apt.startTime);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK RESCHEDULE MODAL */}
      {quickRescheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Quick Reschedule Appointment #{quickRescheduleItem.appointmentId}
            </h3>

            <p className="text-xs text-slate-600 font-medium">
              Rescheduling visit for <strong className="text-slate-900">{quickRescheduleItem.patientName}</strong> with {quickRescheduleItem.doctorName}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  New Start Time
                </label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setQuickRescheduleItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (quickRescheduleItem) {
                    onQuickReschedule(quickRescheduleItem.id, newRescheduleDate, newRescheduleTime);
                    setQuickRescheduleItem(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
