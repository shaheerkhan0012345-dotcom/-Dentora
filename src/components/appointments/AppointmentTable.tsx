import React, { useState } from 'react';
import {
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  History,
  Eye,
  Edit2,
  Trash2,
  MessageCircle,
} from 'lucide-react';
import { AppointmentRecord, AppointmentStatus } from '../../types/appointment';
import { StatusBadge } from './StatusBadge';
import { Avatar } from '../ui/Avatar';
import { getWhatsAppDeepLink } from '../../services/whatsappService';

interface AppointmentTableProps {
  appointments: AppointmentRecord[];
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onEdit: (apt: AppointmentRecord) => void;
  onDelete: (id: string) => void;
  userRole?: string;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  onStatusChange,
  onEdit,
  onDelete,
  userRole = 'Admin',
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'patientName' | 'doctorName' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'date' | 'patientName' | 'doctorName' | 'status') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedList = [...appointments].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (sortField === 'date') {
      valA = `${a.date} ${a.startTime}`;
      valB = `${b.date} ${b.startTime}`;
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalRecords = sortedList.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedList = sortedList.slice(startIndex, startIndex + rowsPerPage);

  // Bulk Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedList.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const exportToCSV = () => {
    const listToExport = selectedIds.length > 0
      ? appointments.filter((a) => selectedIds.includes(a.id))
      : sortedList;

    const headers = [
      'Appointment ID',
      'Patient ID',
      'Patient Name',
      'Doctor Name',
      'Treatment',
      'Date',
      'Start Time',
      'End Time',
      'Room',
      'Priority',
      'Status',
      'Phone',
    ];

    const rows = listToExport.map((a) => [
      a.appointmentId,
      a.patientId,
      `"${a.patientName}"`,
      `"${a.doctorName}"`,
      `"${a.treatment}"`,
      a.date,
      a.startTime,
      a.endTime,
      `"${a.room}"`,
      a.priority,
      a.status,
      a.patientPhone,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dentora_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
      
      {/* TOOLBAR FOR BULK ACTIONS & EXPORT */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {selectedIds.length > 0
              ? `${selectedIds.length} appointments selected`
              : `Total ${appointments.length} Appointments`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1d5bd8]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                  className="rounded-md border-slate-300 text-[#1d5bd8] focus:ring-[#1d5bd8]"
                />
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-slate-700"
              >
                Code & Time {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('patientName')}
                className="py-3 px-4 cursor-pointer hover:text-slate-700"
              >
                Patient {sortField === 'patientName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4">Treatment</th>
              <th
                onClick={() => handleSort('doctorName')}
                className="py-3 px-4 cursor-pointer hover:text-slate-700"
              >
                Attending Doctor {sortField === 'doctorName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4">Chair / Room</th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:text-slate-700"
              >
                Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                  No appointment records match the current view or filter criteria.
                </td>
              </tr>
            ) : (
              paginatedList.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* CHECKBOX */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(apt.id)}
                      onChange={() => handleSelectOne(apt.id)}
                      className="rounded-md border-slate-300 text-[#1d5bd8] focus:ring-[#1d5bd8]"
                    />
                  </td>

                  {/* CODE & TIME */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1d5bd8]" />
                      <span>{apt.startTime} - {apt.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-[#1d5bd8] bg-blue-50 px-1.5 py-0.5 rounded-md">
                        {apt.appointmentId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{apt.date}</span>
                    </div>
                  </td>

                  {/* PATIENT */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={apt.patientName} src={apt.patientAvatar} size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {apt.patientId} • {apt.patientPhone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* TREATMENT */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block truncate max-w-xs">
                      {apt.treatment}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                      {apt.priority}
                    </span>
                  </td>

                  {/* DOCTOR */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar name={apt.doctorName} src={apt.doctorAvatar} size="xs" />
                      <span className="font-bold text-slate-800">{apt.doctorName}</span>
                    </div>
                  </td>

                  {/* ROOM */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-600">
                    {apt.room}
                  </td>

                  {/* STATUS & AUDIT LOG POPOVER */}
                  <td className="py-3.5 px-4 whitespace-nowrap relative">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={apt.status} size="sm" />

                      {/* Quick Status Dropdown */}
                      <select
                        value={apt.status}
                        onChange={(e) => onStatusChange(apt.id, e.target.value as AppointmentStatus)}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer"
                      >
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

                      {/* Log History Icon */}
                      {apt.statusLogs && apt.statusLogs.length > 0 && (
                        <button
                          onClick={() => setActiveLogId(activeLogId === apt.id ? null : apt.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="View Status Change Trail"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* STATUS HISTORY POPUP */}
                    {activeLogId === apt.id && (
                      <div className="absolute right-0 top-12 z-20 w-64 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-[11px] space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-extrabold text-blue-400">Status History Log</span>
                          <button
                            onClick={() => setActiveLogId(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            ×
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {apt.statusLogs?.map((log, idx) => (
                            <div key={idx} className="border-b border-slate-800/60 pb-1">
                              <div className="flex items-center justify-between font-bold text-slate-200">
                                <span>{log.status}</span>
                                <span className="text-[9px] text-slate-400">{log.updatedBy}</span>
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Send WhatsApp Confirmation Button */}
                      <a
                        href={getWhatsAppDeepLink({
                          recipientPhone: apt.patientPhone || '',
                          patientName: apt.patientName,
                          doctorName: apt.doctorName,
                          treatmentName: apt.treatment,
                          date: apt.date,
                          timeSlot: apt.startTime,
                          clinicName: 'Dentora Practice',
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Send WhatsApp Confirmation"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => onEdit(apt)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-[#1d5bd8] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Appointment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {userRole === 'Admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel/remove appointment #${apt.appointmentId}?`)) {
                              onDelete(apt.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* FOOTER PAGINATION */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2">
            Showing {totalRecords === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + rowsPerPage, totalRecords)} of {totalRecords} records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
