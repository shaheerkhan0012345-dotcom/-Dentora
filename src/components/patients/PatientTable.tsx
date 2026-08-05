import React, { useState } from 'react';
import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Phone,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { PatientRecord, PatientSortOption } from '../../types/patient';
import { PatientAvatar } from './PatientAvatar';
import { PatientStatusBadge } from './PatientStatusBadge';
import { UserRole } from '../../types/user';

interface PatientTableProps {
  patients: PatientRecord[];
  onViewProfile: (patient: PatientRecord) => void;
  onEditPatient: (patient: PatientRecord) => void;
  onSoftDeletePatient: (patient: PatientRecord) => void;
  userRole: UserRole;
  sortOption: PatientSortOption;
  onSortChange: (option: PatientSortOption) => void;
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onBulkArchive: () => void;
  onExportCSV: (exportList?: PatientRecord[]) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onViewProfile,
  onEditPatient,
  onSoftDeletePatient,
  userRole,
  sortOption,
  onSortChange,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onBulkArchive,
  onExportCSV,
}) => {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(patients.length / pageSize) || 1;

  const currentPatients = patients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const canEdit = userRole === 'Admin' || userRole === 'Receptionist';
  const canDelete = userRole === 'Admin';

  const isAllSelected = patients.length > 0 && selectedIds.length === patients.length;

  return (
    <div className="space-y-4">
      
      {/* BULK ACTION BAR WHEN ITEMS ARE SELECTED */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-blue-900 shadow-2xs">
          <span>{selectedIds.length} patient records selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const selectedList = patients.filter((p) => selectedIds.includes(p.id));
                onExportCSV(selectedList);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#1d5bd8]" />
              <span>Export Selected CSV</span>
            </button>

            {canDelete && (
              <button
                onClick={onBulkArchive}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TABLE CONTENT CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-300 text-[#1d5bd8] focus:ring-[#1d5bd8] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => onSortChange(sortOption === 'alphabetical' ? 'newest' : 'alphabetical')}
                    className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer font-black"
                  >
                    <span>Patient Info</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Medical Alerts</th>
                <th className="py-3.5 px-4">Assigned Doctor</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => onSortChange(sortOption === 'lastVisit' ? 'newest' : 'lastVisit')}
                    className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer font-black"
                  >
                    <span>Last Visit</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Next Appointment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {currentPatients.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/90 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectOne(p.id)}
                        className="rounded border-slate-300 text-[#1d5bd8] focus:ring-[#1d5bd8] cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <PatientAvatar name={p.fullName} photoURL={p.photoURL} status={p.status} size="md" />
                        <div>
                          <button
                            onClick={() => onViewProfile(p)}
                            className="font-black text-slate-900 hover:text-[#1d5bd8] text-left block text-xs cursor-pointer"
                          >
                            {p.fullName}
                          </button>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
                            <span className="text-[#1d5bd8] font-mono">{p.patientId}</span>
                            <span>•</span>
                            <span>{p.age} yrs</span>
                            <span>•</span>
                            <span>{p.gender}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800 font-bold">{p.phone}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{p.email || 'No email'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.allergies && p.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {p.allergies.map((alert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-extrabold flex items-center gap-1"
                            >
                              <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                              <span>{alert}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None Reported</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-slate-800">{p.assignedDoctor}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{p.lastVisit || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {p.totalVisits || 1} total visits
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.nextAppointment ? (
                        <span className="font-bold text-[#1d5bd8] flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{p.nextAppointment}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unscheduled</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PatientStatusBadge status={p.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProfile(p)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#1d5bd8] hover:text-white text-slate-800 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditPatient(p)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="Edit Patient"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && p.status !== 'Archived' && (
                          <button
                            onClick={() => onSoftDeletePatient(p)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                            title="Soft Delete (Archive)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{Math.min(patients.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(patients.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-bold text-slate-900">{patients.length}</span> patient entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-800 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
