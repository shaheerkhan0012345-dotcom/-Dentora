import React from 'react';
import { Phone, Mail, Calendar, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { PatientRecord } from '../../types/patient';
import { PatientAvatar } from './PatientAvatar';
import { PatientStatusBadge } from './PatientStatusBadge';
import { UserRole } from '../../types/user';

interface PatientCardProps {
  patient: PatientRecord;
  onViewProfile: (patient: PatientRecord) => void;
  onEdit?: (patient: PatientRecord) => void;
  onSoftDelete?: (patient: PatientRecord) => void;
  userRole: UserRole;
  isSelected?: boolean;
  onSelectToggle?: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onViewProfile,
  onEdit,
  onSoftDelete,
  userRole,
  isSelected = false,
  onSelectToggle,
}) => {
  const canEdit = userRole === 'Admin' || userRole === 'Receptionist';
  const canDelete = userRole === 'Admin';

  return (
    <div className={`bg-white p-5 rounded-2xl border transition-all shadow-2xs space-y-4 ${
      isSelected ? 'border-[#1d5bd8] ring-1 ring-[#1d5bd8]' : 'border-slate-200/90'
    }`}>
      
      {/* HEADER WITH AVATAR & STATUS */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {onSelectToggle && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelectToggle}
              className="rounded border-slate-300 text-[#1d5bd8] focus:ring-[#1d5bd8] cursor-pointer"
            />
          )}
          <PatientAvatar name={patient.fullName} photoURL={patient.photoURL} status={patient.status} size="lg" />
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-tight">{patient.fullName}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mt-0.5">
              <span className="text-[#1d5bd8] font-mono">{patient.patientId}</span>
              <span>•</span>
              <span>{patient.age} yrs</span>
              <span>•</span>
              <span>{patient.gender}</span>
            </div>
          </div>
        </div>

        <PatientStatusBadge status={patient.status} size="sm" />
      </div>

      {/* CONTACT INFO */}
      <div className="space-y-1.5 text-xs font-medium text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-800">{patient.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.email || 'No email provided'}</span>
        </div>
      </div>

      {/* MEDICAL ALERTS */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {patient.allergies.map((alert, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-extrabold flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3 text-rose-500" />
              <span>{alert}</span>
            </span>
          ))}
        </div>
      )}

      {/* CLINICAL SUMMARY METRICS */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
        <div>
          <span className="text-slate-400 font-bold block uppercase text-[9px]">Assigned Doctor</span>
          <span className="font-extrabold text-slate-800">{patient.assignedDoctor}</span>
        </div>

        <div>
          <span className="text-slate-400 font-bold block uppercase text-[9px]">Last Visit</span>
          <span className="font-bold text-slate-700">{patient.lastVisit || 'N/A'}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewProfile(patient)}
          className="flex-1 px-3 py-2 rounded-xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </button>

        {canEdit && onEdit && (
          <button
            onClick={() => onEdit(patient)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Edit Patient"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {canDelete && onSoftDelete && (
          <button
            onClick={() => onSoftDelete(patient)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
            title="Soft Delete (Archive)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
