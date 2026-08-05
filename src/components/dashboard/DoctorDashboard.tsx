import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { fetchDoctorProfiles, saveClinicalNote } from '../../services/doctorPortalService';
import { DoctorProfile } from '../../types/doctorPortal';
import { Stethoscope, Calendar, Users, FileText, DollarSign, Clock, CheckCircle2, Plus, Sparkles, Activity, ShieldAlert, Award, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToAppointments } from '../../services/appointmentService';
import { AppointmentRecord } from '../../types/appointment';

interface DoctorDashboardProps {
  doctorName?: string;
  userRole?: string;
}

interface PatientLineupItem {
  id: string;
  patientId: string;
  name: string;
  time: string;
  treatment: string;
  status: string;
  doctorName: string;
}

const MOCK_TODAYS_PATIENTS: PatientLineupItem[] = [
  { id: 'apt-mock-1', patientId: 'PT-8801', name: 'Sarah Jenkins', time: '10:00 AM', treatment: 'Clear Aligner Adjustment', status: 'Waiting', doctorName: 'Dr. Elena Rostova' },
  { id: 'apt-mock-2', patientId: 'PT-8802', name: 'Michael Chang', time: '11:30 AM', treatment: 'Crown Preparation (#14)', status: 'In Chair', doctorName: 'Dr. Elena Rostova' },
];

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorName = 'Dr. Elena Rostova, MD',
}) => {
  const { currentClinic } = useClinic();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'patients' | 'notes' | 'prescriptions'>('schedule');

  // Clinical note form
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState({
    patientId: 'PT-8801',
    patientName: 'Sarah Jenkins',
    chiefComplaint: 'Aligner tray tightness and minor lower molar tenderness',
    diagnosis: 'Class I Malocclusion progressing as planned',
    findings: 'Good oral hygiene. Minimal plaque on molar margins.',
    procedure: 'Delivered aligner sets #12 through #14. Instructions reinforced.',
    recommendations: 'Wear set #12 for 14 days, 22 hrs daily.',
    followUp: '2 weeks for progress verification',
  });

  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedSuccess, setNoteSavedSuccess] = useState(false);

  const [allApts, setAllApts] = useState<PatientLineupItem[]>(MOCK_TODAYS_PATIENTS);
  const [filterDoctorOnly, setFilterDoctorOnly] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchDoctorProfiles(currentClinic.id).then((docs) => {
      if (isMounted && docs.length > 0) {
        const matched = docs.find((d) => d.name.toLowerCase().includes(doctorName.toLowerCase())) || docs[0];
        setDoctorProfile(matched);
      }
    });
    return () => { isMounted = false; };
  }, [currentClinic.id, doctorName]);

  useEffect(() => {
    const unsub = subscribeToAppointments((liveApts) => {
      if (liveApts && liveApts.length > 0) {
        const mapped: PatientLineupItem[] = liveApts.map((a) => {
          let displayTime = a.startTime || '10:00 AM';
          if (!displayTime.includes('M')) {
            const [h, m] = displayTime.split(':');
            const hourNum = parseInt(h, 10);
            if (!isNaN(hourNum)) {
              const ampm = hourNum >= 12 ? 'PM' : 'AM';
              const displayH = hourNum % 12 || 12;
              displayTime = `${displayH}:${m || '00'} ${ampm}`;
            }
          }

          let displayStatus: string = a.status;
          if (a.status === 'In Treatment') displayStatus = 'In Chair';

          return {
            id: a.id,
            patientId: a.patientId || 'PT-8801',
            name: a.patientName,
            time: displayTime,
            treatment: a.treatment,
            status: displayStatus,
            doctorName: a.doctorName,
          };
        });

        setAllApts(mapped);
      }
    });

    return () => unsub();
  }, []);

  const cleanDoc = doctorName.toLowerCase().replace('dr.', '').trim();
  const isGenericDoc = !cleanDoc || cleanDoc === 'doctor' || cleanDoc === 'admin' || cleanDoc === 'user';

  const matchingApts = filterDoctorOnly && !isGenericDoc
    ? allApts.filter((p) => {
        const pDoc = p.doctorName.toLowerCase().replace('dr.', '').trim();
        return pDoc.includes(cleanDoc) || cleanDoc.includes(pDoc);
      })
    : allApts;

  // Fallback: if filterDoctorOnly yields 0 results (e.g., user name doesn't match booked doctor), show all appointments so no booked appointment is hidden
  const todaysPatients = (matchingApts.length > 0 || !filterDoctorOnly) ? matchingApts : allApts;

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNote(true);
    try {
      await saveClinicalNote(currentClinic.id, doctorName, noteInput, doctorName);
      setNoteSavedSuccess(true);
      setTimeout(() => {
        setNoteSavedSuccess(false);
        setIsNoteModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to save clinical note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const canViewRevenue = doctorProfile?.canViewRevenue ?? true;

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-blue-900 via-[#1d5bd8] to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={doctorProfile?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
              alt={doctorName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-blue-300" />
                  Doctor Clinical Portal
                </span>
                <span className="text-blue-200 text-xs font-semibold">{currentClinic.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{doctorName}</h1>
              <p className="text-blue-100 text-xs mt-0.5">{doctorProfile?.specialty || 'Orthodontist Specialist'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#1d5bd8]" />
            Write Clinical SOAP Note
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Calendar className="w-4 h-4 text-[#1d5bd8]" />
            Today's Appointments
          </div>
          <div className="text-2xl font-black text-slate-900">{todaysPatients.length} Visits</div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Scheduled for today</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Users className="w-4 h-4 text-indigo-500" />
            Assigned Patients
          </div>
          <div className="text-2xl font-black text-slate-900">142 EHR</div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Active orthodontic cases</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <FileText className="w-4 h-4 text-emerald-500" />
            SOAP Notes Written
          </div>
          <div className="text-2xl font-black text-slate-900">18 Notes</div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">This week</p>
        </div>

        {canViewRevenue ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Doctor Share Revenue
            </div>
            <div className="text-2xl font-black text-slate-900">$3,450.00</div>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Permission Allowed</p>
          </div>
        ) : (
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Doctor Revenue View
            </div>
            <div className="text-xs font-bold text-slate-400 mt-2">Restricted by Admin</div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Contact Clinic Owner to enable</p>
          </div>
        )}
      </div>

      {/* TODAY'S SCHEDULE & CLINICAL PATIENT LIST */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1d5bd8]" />
            Today's Clinical Lineup ({currentClinic.name})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDoctorOnly(!filterDoctorOnly)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                filterDoctorOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {filterDoctorOnly ? `Filter: My Patients (${doctorName})` : 'Showing: All Clinic Patients'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {todaysPatients.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No appointments scheduled for today yet.
            </div>
          ) : (
            todaysPatients.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 px-2 py-1 rounded-xl bg-blue-50 text-[#1d5bd8] font-black text-[11px] text-center shrink-0 leading-tight">
                    {p.time}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{p.name} <span className="text-slate-400 font-normal">({p.patientId})</span></p>
                    <p className="text-[10px] text-slate-500">{p.treatment} • <span className="font-semibold text-slate-700">{p.doctorName}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      p.status === 'In Chair' || p.status === 'In Treatment'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : p.status === 'Waiting'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {p.status}
                  </span>

                  <button
                    onClick={() => {
                      setNoteInput((prev) => ({ ...prev, patientId: p.patientId, patientName: p.name }));
                      setIsNoteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    SOAP Note
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SOAP NOTE MODAL */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Clinical Consultation SOAP Note</h3>
                  <p className="text-xs text-slate-500">
                    Patient: <span className="font-bold text-slate-800">{noteInput.patientName}</span> ({noteInput.patientId})
                  </p>
                </div>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {noteSavedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Clinical note saved securely to patient EHR & audit log.
                </div>
              )}

              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chief Complaint (Subjective)</label>
                  <textarea
                    rows={2}
                    value={noteInput.chiefComplaint}
                    onChange={(e) => setNoteInput({ ...noteInput, chiefComplaint: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Findings (Objective)</label>
                  <textarea
                    rows={2}
                    value={noteInput.findings}
                    onChange={(e) => setNoteInput({ ...noteInput, findings: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis (Assessment)</label>
                    <input
                      type="text"
                      value={noteInput.diagnosis}
                      onChange={(e) => setNoteInput({ ...noteInput, diagnosis: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Procedure Performed (Plan)</label>
                    <input
                      type="text"
                      value={noteInput.procedure}
                      onChange={(e) => setNoteInput({ ...noteInput, procedure: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-6 py-2 rounded-xl bg-[#1d5bd8] text-white text-xs font-bold shadow-md"
                  >
                    {savingNote ? 'Saving...' : 'Save Clinical Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
