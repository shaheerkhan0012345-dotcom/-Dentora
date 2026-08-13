import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import {
  AppointmentRecord,
  AppointmentPriority,
  AppointmentStatus,
  DoctorScheduleRecord,
} from '../../types/appointment';
import { validateAppointmentBooking } from '../../services/appointmentService';
import { PatientRecord } from '../../types/patient';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  existingAppointment?: AppointmentRecord | null;
  allAppointments: AppointmentRecord[];
  allPatients: PatientRecord[];
  doctorSchedules: DoctorScheduleRecord[];
}

const CLINIC_DOCTORS = [
  { id: 'DOC-101', name: 'Dr. Elena Rostova', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80' },
  { id: 'DOC-102', name: 'Dr. Marcus Vance', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80' },
  { id: 'DOC-103', name: 'Dr. Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1594824813566-888242a8b66a?auto=format&fit=crop&w=150&q=80' },
];

const CLINIC_ROOMS = [
  'Chair 1 - Operatory A',
  'Chair 2 - Operatory B',
  'Chair 3 - Cosmetic Suite',
  'Chair 4 - Ortho Bay',
  'Endo Studio B',
  'Hygiene Bay A',
  'Surgical Suite 1',
];

const DENTAL_TREATMENTS = [
  'Tooth Extraction & Surgical Removal',
  'Dental Checkup & Oral Hygiene',
  'Root Canal Therapy Stage 1',
  'Root Canal Therapy Stage 2',
  '3D Aligner Tray Refinement',
  'Porcelain Crown Placement',
  'Teeth Whitening & Aesthetics',
  'Composite Filling Restoration',
  'Pediatric Dental Cleaning',
  'Emergency Toothache Treatment',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingAppointment,
  allAppointments,
  allPatients,
  doctorSchedules,
}) => {
  const [patientMode, setPatientMode] = useState<'existing' | 'manual'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');

  const [doctorId, setDoctorId] = useState<string>(CLINIC_DOCTORS[0].id);
  const [doctorName, setDoctorName] = useState<string>(CLINIC_DOCTORS[0].name);
  const [treatment, setTreatment] = useState<string>(DENTAL_TREATMENTS[1]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('09:45');
  const [room, setRoom] = useState<string>(CLINIC_ROOMS[0]);
  const [priority, setPriority] = useState<AppointmentPriority>('Normal');
  const [status, setStatus] = useState<AppointmentStatus>('Scheduled');
  const [notes, setNotes] = useState<string>('');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Populate form if editing
  useEffect(() => {
    if (existingAppointment) {
      setSelectedPatientId(existingAppointment.patientId || '');
      setPatientName(existingAppointment.patientName || '');
      setPatientPhone(existingAppointment.patientPhone || '');
      setDoctorId(existingAppointment.doctorId || CLINIC_DOCTORS[0].id);
      setDoctorName(existingAppointment.doctorName || CLINIC_DOCTORS[0].name);
      setTreatment(existingAppointment.treatment || DENTAL_TREATMENTS[0]);
      setDate(existingAppointment.date || new Date().toISOString().split('T')[0]);
      setStartTime(existingAppointment.startTime || '09:00');
      setEndTime(existingAppointment.endTime || '09:45');
      setRoom(existingAppointment.room || CLINIC_ROOMS[0]);
      setPriority(existingAppointment.priority || 'Normal');
      setStatus(existingAppointment.status || 'Scheduled');
      setNotes(existingAppointment.notes || '');
    } else {
      // Reset defaults for fresh booking
      setSelectedPatientId('');
      setPatientName('');
      setPatientPhone('');
      setDoctorId(CLINIC_DOCTORS[0].id);
      setDoctorName(CLINIC_DOCTORS[0].name);
      setTreatment(DENTAL_TREATMENTS[1]);
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('09:45');
      setRoom(CLINIC_ROOMS[0]);
      setPriority('Normal');
      setStatus('Scheduled');
      setNotes('');
    }
  }, [existingAppointment, isOpen]);

  // When patient dropdown changes
  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    const found = allPatients.find((p) => p.id === id || p.patientId === id);
    if (found) {
      setPatientName(found.fullName || `${found.firstName} ${found.lastName}`);
      setPatientPhone(found.phone || '');
    }
  };

  // When doctor changes
  const handleSelectDoctor = (docId: string) => {
    setDoctorId(docId);
    const docObj = CLINIC_DOCTORS.find((d) => d.id === docId);
    if (docObj) setDoctorName(docObj.name);
  };

  // Live Conflict Validation
  useEffect(() => {
    if (!isOpen) return;

    const res = validateAppointmentBooking(
      {
        doctorId,
        doctorName,
        date,
        startTime,
        endTime,
        room,
        appointmentIdToIgnore: existingAppointment?.id,
      },
      allAppointments
    );

    // Check doctor leaves
    const docSchedule = doctorSchedules.find((s) => s.doctorId === doctorId || s.doctorName === doctorName);
    if (docSchedule && docSchedule.leaves) {
      const onLeave = docSchedule.leaves.find((l) => date >= l.startDate && date <= l.endDate);
      if (onLeave) {
        res.errors.push(`Doctor Leave: ${doctorName} is on scheduled leave (${onLeave.reason}) from ${onLeave.startDate} to ${onLeave.endDate}.`);
      }
    }

    setValidationErrors(res.errors);
    setValidationWarnings(res.warnings);
  }, [doctorId, doctorName, date, startTime, endTime, room, isOpen, existingAppointment, allAppointments, doctorSchedules]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert('Please enter or select a patient.');
      return;
    }

    if (validationErrors.length > 0) {
      alert('Please resolve schedule conflicts before saving booking.');
      return;
    }

    setSubmitting(true);
    try {
      const aptIdCode = existingAppointment
        ? existingAppointment.appointmentId
        : `APT-${Math.floor(900 + Math.random() * 9000)}`;

      const selectedDoc = CLINIC_DOCTORS.find((d) => d.id === doctorId || d.name === doctorName);

      await onSubmit({
        appointmentId: aptIdCode,
        patientId: selectedPatientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName,
        patientPhone,
        doctorId,
        doctorName,
        doctorAvatar: selectedDoc?.avatar || '',
        treatment,
        date,
        startTime,
        endTime,
        room,
        priority,
        status,
        notes,
      });

      onClose();
    } catch (err) {
      console.error('Error submitting appointment:', err);
      alert('Failed to save appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-[#1d5bd8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {existingAppointment ? 'Edit Dental Visit Booking' : 'Book New Dental Visit'}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Real-time conflict verification & chair room assignment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* CONFLICT ERRORS & WARNINGS BANNER */}
          {validationErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Schedule Conflict Detected</span>
              </div>
              <ul className="text-xs list-disc list-inside space-y-0.5 text-rose-700 font-medium">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && validationErrors.length === 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Booking Warning</span>
              </div>
              <ul className="text-xs list-disc list-inside space-y-0.5 text-amber-700 font-medium">
                {validationWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 1: PATIENT SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#1d5bd8]" />
                <span>Patient Details</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    patientMode === 'existing'
                      ? 'bg-[#1d5bd8] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Select Existing Patient
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('manual')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    patientMode === 'manual'
                      ? 'bg-[#1d5bd8] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Manual Name Entry
                </button>
              </div>
            </div>

            {patientMode === 'existing' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Select Patient from Directory
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                  >
                    <option value="">-- Choose Patient --</option>
                    {allPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName || `${p.firstName} ${p.lastName}`} ({p.patientId || p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Patient Contact Telephone
                  </label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. (555) 234-5678"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Johnathan Doe"
                    required
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Patient Telephone
                  </label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. (555) 000-1122"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CLINICIAN & TREATMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-[#1d5bd8]" />
                <span>Attending Dentist *</span>
              </label>
              <select
                value={doctorId}
                onChange={(e) => handleSelectDoctor(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                {CLINIC_DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <span>Planned Dental Treatment *</span>
              </label>
              <select
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                {DENTAL_TREATMENTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 3: DATE & TIME */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#1d5bd8]" />
                <span>Appointment Date *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#1d5bd8]" />
                <span>Start Time *</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time *</span>
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 4: ROOM, PRIORITY, STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <DoorOpen className="w-3.5 h-3.5 text-[#1d5bd8]" />
                <span>Chair / Operatory Room *</span>
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                {CLINIC_ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                Triage Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AppointmentPriority)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                <option value="Normal">Normal</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency Case</option>
                <option value="VIP">VIP Patient</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Waiting">Waiting (Checked In)</option>
                <option value="Called">Called to Chair</option>
                <option value="In Treatment">In Treatment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No Show">No Show</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          {/* SECTION 5: CLINICAL NOTES */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Clinical / Visit Notes</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add special instructions, medical conditions, or patient requests..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || validationErrors.length > 0}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                validationErrors.length > 0 || submitting
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#1d5bd8] hover:bg-[#154dbf]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving Visit...' : existingAppointment ? 'Update Booking' : 'Confirm & Book Visit'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
