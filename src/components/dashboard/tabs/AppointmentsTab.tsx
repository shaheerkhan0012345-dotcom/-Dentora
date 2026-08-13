import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  User,
  CheckCircle2,
  Table as TableIcon,
  CalendarDays,
  UserCheck,
  Sparkles,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import {
  AppointmentRecord,
  AppointmentFilterOptions,
  AppointmentStatus,
  DoctorScheduleRecord,
} from '../../../types/appointment';
import { PatientRecord } from '../../../types/patient';
import {
  subscribeToAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from '../../../services/appointmentService';
import { subscribeToPatients } from '../../../services/patientService';
import {
  subscribeToDoctorSchedules,
  updateDoctorSchedule,
  addDoctorLeave,
} from '../../../services/doctorScheduleService';

import { AppointmentTable } from '../../appointments/AppointmentTable';
import { CalendarView } from '../../appointments/CalendarView';
import { AppointmentSearch } from '../../appointments/AppointmentSearch';
import { AppointmentFilters } from '../../appointments/AppointmentFilters';
import { AppointmentFormModal } from '../../appointments/AppointmentFormModal';
import { DoctorScheduleModal } from '../../appointments/DoctorScheduleModal';

const DEFAULT_FILTERS: AppointmentFilterOptions = {
  doctor: 'All',
  status: 'All',
  treatment: 'All',
  room: 'All',
  dateFrom: '',
  dateTo: '',
  priority: 'All',
};

interface AppointmentsTabProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  userRole,
  userName = '',
  userEmail = '',
}) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorScheduleRecord[]>([]);

  const [activeView, setActiveView] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<AppointmentFilterOptions>(DEFAULT_FILTERS);

  // Role toggle mode
  const [roleOnlyFilter, setRoleOnlyFilter] = useState<boolean>(
    userRole === 'Doctor' || userRole === 'Patient'
  );

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  // Prefilled date/time for calendar click booking
  const [prefilledBooking, setPrefilledBooking] = useState<{ date?: string; time?: string }>({});

  // Subscriptions
  useEffect(() => {
    const unsubApts = subscribeToAppointments(setAppointments);
    const unsubPts = subscribeToPatients(setPatients);
    const unsubSched = subscribeToDoctorSchedules(setDoctorSchedules);

    return () => {
      unsubApts();
      unsubPts();
      unsubSched();
    };
  }, []);

  // Filter & Search Logic
  const filteredAppointments = appointments.filter((apt) => {
    // Role level restriction
    if (userRole === 'Patient') {
      const pClean = (userName || '').toLowerCase().trim();
      const emailClean = (userEmail || '').toLowerCase().trim();
      const aptPClean = apt.patientName.toLowerCase().trim();
      const aptNotes = (apt.notes || '').toLowerCase().trim();

      const matchesName = pClean ? (aptPClean.includes(pClean) || pClean.includes(aptPClean)) : false;
      const matchesEmail = emailClean ? aptNotes.includes(emailClean) : false;

      if (!matchesName && !matchesEmail) {
        return false;
      }
    } else if (roleOnlyFilter && userRole === 'Doctor' && userName) {
      const dClean = userName.toLowerCase().replace('dr.', '').trim();
      const aptDClean = apt.doctorName.toLowerCase().replace('dr.', '').trim();
      if (!aptDClean.includes(dClean) && !dClean.includes(aptDClean)) {
        return false;
      }
    }

    // Search matching
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = apt.patientName.toLowerCase().includes(q);
      const matchId = apt.patientId.toLowerCase().includes(q);
      const matchAptCode = apt.appointmentId.toLowerCase().includes(q);
      const matchDoc = apt.doctorName.toLowerCase().includes(q);
      const matchPhone = apt.patientPhone.toLowerCase().includes(q);
      const matchTreatment = apt.treatment.toLowerCase().includes(q);

      if (!matchName && !matchId && !matchAptCode && !matchDoc && !matchPhone && !matchTreatment) {
        return false;
      }
    }

    // Filter matching
    if (filters.doctor !== 'All' && apt.doctorName !== filters.doctor) return false;
    if (filters.status !== 'All' && apt.status !== filters.status) return false;
    if (filters.room !== 'All' && apt.room !== filters.room) return false;
    if (filters.priority !== 'All' && apt.priority !== filters.priority) return false;

    if (filters.dateFrom && apt.date < filters.dateFrom) return false;
    if (filters.dateTo && apt.date > filters.dateTo) return false;

    return true;
  });

  // Extract unique options for filter dropdowns
  const uniqueDoctors = Array.from(new Set(appointments.map((a) => a.doctorName))).filter(Boolean);
  const uniqueRooms = Array.from(new Set(appointments.map((a) => a.room))).filter(Boolean);
  const uniqueTreatments = Array.from(new Set(appointments.map((a) => a.treatment))).filter(Boolean);

  // Handlers
  const handleOpenNewForm = (prefilledDate?: string, prefilledTime?: string) => {
    setEditingAppointment(null);
    if (prefilledDate || prefilledTime) {
      setPrefilledBooking({ date: prefilledDate, time: prefilledTime });
    } else {
      setPrefilledBooking({});
    }
    setIsFormOpen(true);
  };

  const handleEditAppointment = (apt: AppointmentRecord) => {
    setEditingAppointment(apt);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, data);
    } else {
      await createAppointment(data);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    await updateAppointmentStatus(id, newStatus, 'Receptionist / Doctor');
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
  };

  const handleQuickReschedule = async (id: string, newDate: string, newTime: string) => {
    await updateAppointment(id, { date: newDate, startTime: newTime });
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter((a) => a.date === todayStr);
  const confirmedCount = todayApts.filter((a) => a.status === 'Confirmed').length;
  const waitingCount = todayApts.filter((a) => a.status === 'Waiting').length;
  const completedCount = todayApts.filter((a) => a.status === 'Completed').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#1d5bd8]" />
            <span>Clinic Appointment Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage daily appointments, room chairs, and doctor shift schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* DOCTOR SCHEDULES MODAL TRIGGER (ADMIN/STAFF ONLY) */}
          {userRole !== 'Patient' && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-[#1d5bd8]" />
              <span>Doctor Schedules</span>
            </button>
          )}

          {/* BOOK NEW VISIT BUTTON */}
          <button
            onClick={() => handleOpenNewForm()}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Visit</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#1d5bd8] text-white">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{todayApts.length}</span>
            <span className="text-[11px] font-extrabold text-[#1d5bd8] uppercase">Today's Visits</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-sky-50/70 border border-sky-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-600 text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{confirmedCount}</span>
            <span className="text-[11px] font-extrabold text-sky-700 uppercase">Confirmed</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{waitingCount}</span>
            <span className="text-[11px] font-extrabold text-amber-700 uppercase">Checked In Waiting</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{completedCount}</span>
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase">Completed</span>
          </div>
        </div>
      </div>

      {/* SEARCH, FILTERS & VIEW MODE SWITCHER */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex-1">
            <AppointmentSearch
              value={searchQuery}
              onChange={setSearchQuery}
              totalResults={filteredAppointments.length}
            />
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl font-bold text-xs text-slate-600 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4 text-[#1d5bd8]" />
              <span>Table View</span>
            </button>

            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-[#1d5bd8]" />
              <span>Calendar View</span>
            </button>
          </div>

        </div>

        {/* FILTERS */}
        <AppointmentFilters
          filters={filters}
          onChange={setFilters}
          doctors={uniqueDoctors}
          rooms={uniqueRooms}
          treatments={uniqueTreatments}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {/* MAIN VIEW CONTENT */}
      {activeView === 'table' ? (
        <AppointmentTable
          appointments={filteredAppointments}
          onStatusChange={handleStatusChange}
          onEdit={handleEditAppointment}
          onDelete={handleDelete}
        />
      ) : (
        <CalendarView
          appointments={filteredAppointments}
          onSelectAppointment={handleEditAppointment}
          onBookNew={(d, t) => handleOpenNewForm(d, t)}
          onQuickReschedule={handleQuickReschedule}
        />
      )}

      {/* BOOKING / EDIT MODAL */}
      <AppointmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        existingAppointment={editingAppointment}
        allAppointments={appointments}
        allPatients={patients}
        doctorSchedules={doctorSchedules}
      />

      {/* DOCTOR SCHEDULES MODAL */}
      <DoctorScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedules={doctorSchedules}
        onUpdateSchedule={updateDoctorSchedule}
        onAddLeave={addDoctorLeave}
      />

    </div>
  );
};
