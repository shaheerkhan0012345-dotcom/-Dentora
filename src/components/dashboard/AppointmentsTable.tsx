import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  MoreVertical, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge, BadgeVariant } from '../ui/Badge';
import { AppointmentItem, AppointmentStatus } from '../../types/dashboard';
import { subscribeToAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { AppointmentRecord, AppointmentStatus as RecordStatus } from '../../types/appointment';

const initialAppointments: AppointmentItem[] = [
  {
    id: 'apt-1',
    patientName: 'Sarah Jenkins',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    patientId: 'PT-8801',
    doctorName: 'Dr. Elena Rostova',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    time: '09:00 AM',
    date: 'Today',
    status: 'In Chair',
    treatment: '3D Aligner Tray Refinement',
    room: 'Chair 1 - Ortho Wing',
    phone: '(555) 234-5678',
  },
  {
    id: 'apt-2',
    patientName: 'Marcus Vance',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    patientId: 'PT-8802',
    doctorName: 'Dr. Marcus Vance',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    time: '10:15 AM',
    date: 'Today',
    status: 'Waiting',
    treatment: 'Porcelain Crown Placement',
    room: 'Chair 3 - Cosmetic Suite',
    phone: '(555) 987-6543',
  },
];

interface AppointmentsTableProps {
  onViewAll?: () => void;
  onSelectAppointment?: (apt: AppointmentItem) => void;
  userRole?: string;
  userName?: string;
  filterDoctorName?: string;
  filterPatientName?: string;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  onViewAll,
  onSelectAppointment,
  userRole,
  userName,
  filterDoctorName,
  filterPatientName,
}) => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Doctor filter toggle: default to doctor view if role is Doctor or filterDoctorName provided
  const initialDoctorOnly = userRole === 'Doctor' || !!filterDoctorName;
  const [doctorOnly, setDoctorOnly] = useState<boolean>(initialDoctorOnly);

  const activeDoctorName = filterDoctorName || (userRole === 'Doctor' ? userName : '');
  const activePatientName = filterPatientName || (userRole === 'Patient' ? userName : '');

  useEffect(() => {
    const unsub = subscribeToAppointments((liveList) => {
      if (liveList && liveList.length > 0) {
        const mapped: AppointmentItem[] = liveList.map((a) => {
          let mappedStatus: AppointmentStatus = 'Confirmed';
          if (a.status === 'In Treatment') mappedStatus = 'In Chair';
          else if (a.status === 'Waiting') mappedStatus = 'Waiting';
          else if (a.status === 'Completed') mappedStatus = 'Completed';
          else if (a.status === 'Cancelled') mappedStatus = 'Cancelled';
          else mappedStatus = 'Confirmed';

          let timeStr = a.startTime || '10:00';
          if (!timeStr.includes('M')) {
            const [h, m] = timeStr.split(':');
            const hourNum = parseInt(h, 10);
            if (!isNaN(hourNum)) {
              const ampm = hourNum >= 12 ? 'PM' : 'AM';
              const displayH = hourNum % 12 || 12;
              timeStr = `${displayH}:${m || '00'} ${ampm}`;
            }
          }

          return {
            id: a.id,
            patientName: a.patientName,
            patientAvatar: a.patientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            patientId: a.patientId || 'PT-8801',
            doctorName: a.doctorName,
            doctorAvatar: a.doctorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
            time: timeStr,
            date: a.date,
            status: mappedStatus,
            treatment: a.treatment,
            room: a.room || 'Chair 1 - Main Suite',
            phone: a.patientPhone || '',
          };
        });
        setAppointments(mapped);
      }
    });

    return () => unsub();
  }, []);

  const getStatusBadgeVariant = (status: AppointmentStatus): BadgeVariant => {
    switch (status) {
      case 'In Chair': return 'brand';
      case 'Waiting': return 'amber';
      case 'Confirmed': return 'sky';
      case 'Completed': return 'emerald';
      case 'Cancelled': return 'rose';
      default: return 'slate';
    }
  };

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    try {
      let firestoreStatus: RecordStatus = 'Confirmed';
      if (newStatus === 'In Chair') firestoreStatus = 'In Treatment';
      else if (newStatus === 'Waiting') firestoreStatus = 'Waiting';
      else if (newStatus === 'Completed') firestoreStatus = 'Completed';
      else if (newStatus === 'Cancelled') firestoreStatus = 'Cancelled';

      await updateAppointmentStatus(id, firestoreStatus, 'Doctor / Receptionist');
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const filtered = appointments.filter((apt) => {
    const matchesFilter = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.treatment.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(search.toLowerCase());

    // Role-specific filtering
    let matchesRole = true;
    if (activePatientName) {
      const pNameLower = activePatientName.toLowerCase().trim();
      const aptPLower = apt.patientName.toLowerCase().trim();
      matchesRole = aptPLower.includes(pNameLower) || pNameLower.includes(aptPLower);
    } else if (doctorOnly && activeDoctorName) {
      const docClean = activeDoctorName.toLowerCase().replace('dr.', '').trim();
      const isGeneric = !docClean || docClean === 'doctor' || docClean === 'admin' || docClean === 'user';
      if (!isGeneric) {
        const hasSpecificDoctorMatches = appointments.some((a) => {
          const aDoc = a.doctorName.toLowerCase().replace('dr.', '').trim();
          return aDoc.includes(docClean) || docClean.includes(aDoc);
        });

        if (hasSpecificDoctorMatches) {
          const aptDocClean = apt.doctorName.toLowerCase().replace('dr.', '').trim();
          matchesRole = aptDocClean.includes(docClean) || docClean.includes(aptDocClean);
        } else {
          // Fallback to showing all clinic appointments if no appointments match logged-in user name
          matchesRole = true;
        }
      }
    }

    return matchesFilter && matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
      
      {/* HEADER & FILTERS */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-[#1d5bd8]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Today's Appointment Schedule</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activePatientName
                  ? `Showing personal appointments for ${activePatientName}`
                  : doctorOnly && activeDoctorName
                  ? `Filtered for ${activeDoctorName}'s patients`
                  : 'Real-time patient visit status & room assignments'}
              </p>
            </div>
          </div>

          {/* Doctor filter toggle button */}
          {activeDoctorName && !activePatientName && (
            <button
              onClick={() => setDoctorOnly(!doctorOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                doctorOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {doctorOnly ? `Showing: My Patients (${activeDoctorName})` : 'Showing: All Clinic Doctors'}
            </button>
          )}

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-[#1d5bd8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or treatment..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
            />
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold text-slate-600 bg-slate-100 p-1 rounded-xl">
            {(['all', 'In Chair', 'Waiting', 'Confirmed', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Visits' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Time & Room</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Treatment</th>
              <th className="py-3 px-4">Attending Doctor</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                  No appointments found matching search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1d5bd8]" />
                      <span>{apt.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{apt.room}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={apt.patientName} src={apt.patientAvatar} size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{apt.patientId}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block truncate max-w-xs">{apt.treatment}</span>
                    <span className="text-[10px] text-slate-400">{apt.phone}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar name={apt.doctorName} src={apt.doctorAvatar} size="xs" />
                      <span className="font-semibold text-slate-800">{apt.doctorName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(apt.status)} size="sm">
                      {apt.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {apt.status === 'Waiting' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'In Chair')}
                          className="px-2.5 py-1 rounded-lg bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Seat in Chair
                        </button>
                      )}
                      {apt.status === 'In Chair' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {apt.status === 'Confirmed' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'Waiting')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                      {onSelectAppointment && (
                        <button
                          onClick={() => onSelectAppointment(apt)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER SUMMARY */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Showing {filtered.length} of {appointments.length} appointments for today</span>
      </div>

    </div>
  );
};
