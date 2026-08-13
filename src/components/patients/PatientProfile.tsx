import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Activity,
  Calendar,
  FileText,
  CreditCard,
  DollarSign,
  FolderOpen,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Plus,
  Printer,
  Edit,
  ShieldCheck,
  Smile,
  CheckCircle2,
  Download
} from 'lucide-react';
import { PatientRecord, MedicalNote } from '../../types/patient';
import { PatientAvatar } from './PatientAvatar';
import { PatientStatusBadge } from './PatientStatusBadge';
import { DocumentUploader } from './DocumentUploader';
import { TimelineCard } from './TimelineCard';
import { subscribeToPatientNotes, addMedicalNote } from '../../services/patientService';
import { UserRole } from '../../types/user';

interface PatientProfileProps {
  patient: PatientRecord;
  onBack: () => void;
  onEditPatient: (patient: PatientRecord) => void;
  userRole: UserRole;
  userName: string;
}

type ProfileTab =
  | 'overview'
  | 'medical'
  | 'dental-chart'
  | 'appointments'
  | 'treatments'
  | 'prescriptions'
  | 'invoices'
  | 'payments'
  | 'documents'
  | 'timeline'
  | 'notes';

export const PatientProfile: React.FC<PatientProfileProps> = ({
  patient,
  onBack,
  onEditPatient,
  userRole,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState<MedicalNote['category']>('Clinical');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const canEdit = userRole === 'Admin' || userRole === 'Receptionist';
  const canAddNotes = userRole === 'Admin' || userRole === 'Doctor' || userRole === 'Receptionist';

  useEffect(() => {
    const unsubscribe = subscribeToPatientNotes(patient.id, (noteList) => {
      setNotes(noteList);
    });
    return () => unsubscribe();
  }, [patient.id]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      await addMedicalNote(patient.id, {
        authorName: userName || 'Doctor',
        authorRole: userRole,
        note: newNoteText,
        category: noteCategory,
      });
      setNewNoteText('');
    } catch (err) {
      console.error('Error adding medical note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOP NAVIGATION BAR & PROFILE HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1d5bd8]" />
            <span>Back to Patient Directory</span>
          </button>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => onEditPatient(patient)}
                className="px-4 py-2 rounded-2xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit EHR Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* PATIENT INFO CARD */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <PatientAvatar name={patient.fullName} photoURL={patient.photoURL} status={patient.status} size="xl" />
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{patient.fullName}</h1>
                <PatientStatusBadge status={patient.status} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-bold">
                <span className="text-[#1d5bd8] font-mono">{patient.patientId}</span>
                <span>•</span>
                <span>{patient.age} yrs</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span>Blood: <strong className="text-slate-900">{patient.bloodGroup || 'O+'}</strong></span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{patient.phone}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.email || 'No email registered'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.city || 'Beverly Hills'}, {patient.postalCode || '90210'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* QUICK METRIC BADGES */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Outstanding</span>
              <span className={`text-base font-black ${patient.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${patient.balance.toFixed(2)}
              </span>
            </div>

            <div className="flex-1 md:flex-none p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Total Visits</span>
              <span className="text-base font-black text-slate-900">{patient.totalVisits || 1} Visits</span>
            </div>

            <div className="flex-1 md:flex-none p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-extrabold text-[#1d5bd8] block">Assigned Doctor</span>
              <span className="text-xs font-black text-slate-900 truncate block">{patient.assignedDoctor}</span>
            </div>
          </div>
        </div>

        {/* TABS HEADER BAR (11 TABS) */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'medical' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Medical History</span>
          </button>

          <button
            onClick={() => setActiveTab('dental-chart')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'dental-chart' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Dental Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'appointments' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('treatments')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'treatments' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Treatments</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'prescriptions' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Prescriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'invoices' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'payments' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'documents' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'timeline' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notes' ? 'bg-white text-[#1d5bd8] shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Clinical Notes ({notes.length})</span>
          </button>

        </div>

      </div>

      {/* TAB CONTENT AREA */}
      <div className="space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* DEMOGRAPHICS & CONTACT */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 md:col-span-2">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1d5bd8]" />
                <span>Patient EHR Summary & Demographics</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Full Name</span>
                  <span className="font-bold text-slate-900">{patient.fullName}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Patient ID</span>
                  <span className="font-mono font-bold text-[#1d5bd8]">{patient.patientId}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">CNIC / Govt ID</span>
                  <span className="font-bold text-slate-800">{patient.cnic || '42201-1234567-1'}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Date of Birth</span>
                  <span className="font-bold text-slate-800">{patient.dob} ({patient.age} years)</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Marital Status</span>
                  <span className="font-bold text-slate-800">{patient.maritalStatus || 'Single'}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Occupation</span>
                  <span className="font-bold text-slate-800">{patient.occupation || 'Software Professional'}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Emergency Contact</span>
                  <span className="font-bold text-slate-900">{patient.emergencyContact || 'Family Member'}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Emergency Phone</span>
                  <span className="font-bold text-slate-800">{patient.emergencyPhone || '(555) 999-1234'}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Preferred Visit Time</span>
                  <span className="font-bold text-slate-800">{patient.preferredTime || 'Morning'}</span>
                </div>
              </div>

              {/* MEDICAL ALERTS HIGHLIGHT */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-400 font-bold block uppercase text-[9px] mb-1.5">Medical Alerts & Allergies</span>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((alert, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>{alert}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs font-semibold">No critical medical allergies recorded.</span>
                )}
              </div>
            </div>

            {/* SIDE METRICS & DENTAL APPOINTMENT STATUS */}
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-400">
                  Appointment Schedule
                </h3>

                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-[#1d5bd8]">Next Appointment</span>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1d5bd8]" />
                    <span>{patient.nextAppointment || 'Aug 16, 2026 @ 10:30 AM'}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Clear Aligner Progress Checkup with {patient.assignedDoctor}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400">Last Visit Date</span>
                  <p className="text-xs font-bold text-slate-800">{patient.lastVisit || 'Aug 2, 2026'}</p>
                </div>
              </div>

              {/* SPECIAL TREATMENT NOTES */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-400">
                  Doctor Clinical Directives
                </h3>
                <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                  "{patient.notes || 'Patient is compliant with 3D aligner tray protocol. Scheduled for mid-treatment prophylaxis.'}"
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MEDICAL HISTORY */}
        {activeTab === 'medical' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Comprehensive Health & Medical Questionnaire</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-extrabold uppercase">Blood Group</span>
                <p className="text-base font-black text-slate-900">{patient.bloodGroup || 'O+'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-extrabold uppercase">Smoking Habit</span>
                <p className="text-base font-black text-slate-900">{patient.smoking || 'Non-Smoker'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-extrabold uppercase">Pregnancy Status</span>
                <p className="text-base font-black text-slate-900">{patient.pregnancyStatus || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-extrabold uppercase">Assigned Dentist</span>
                <p className="text-base font-black text-slate-900 truncate">{patient.primaryDentist || patient.assignedDoctor}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs">Reported Chronic Illnesses</h4>
                <p className="text-xs text-slate-700 font-medium">
                  {patient.chronicDiseases && patient.chronicDiseases.length > 0
                    ? patient.chronicDiseases.join(', ')
                    : 'No chronic diseases reported by patient.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs">Current Active Medications</h4>
                <p className="text-xs text-slate-700 font-medium">
                  {patient.currentMedication || 'None currently declared.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs">Medical & Surgical History Notes</h4>
                <p className="text-xs text-slate-700 font-medium">
                  {patient.medicalHistory || 'No major surgical history recorded.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DENTAL CHART */}
        {activeTab === 'dental-chart' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#1d5bd8]" />
                  <span>3D Interactive Dental Arch Chart - {patient.fullName}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Adult FDI notation (Teeth 11-48) condition inspection for patient #{patient.patientId}
                </p>
              </div>
            </div>

            {/* DENTAL MAP INTERACTIVE REPRESENTATION */}
            <div className="p-8 bg-slate-900 rounded-3xl text-white text-center space-y-6">
              <div className="inline-block px-3 py-1 bg-[#1d5bd8]/30 text-[#60a5fa] rounded-full text-xs font-bold border border-[#1d5bd8]/40">
                Upper Maxillary Arch (Teeth 18 - 28)
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((tNum) => (
                  <div
                    key={tNum}
                    className="w-10 h-14 bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center justify-between p-1.5 hover:border-[#1d5bd8] hover:bg-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="text-[10px] font-mono text-slate-400">#{tNum}</span>
                    <div className="w-4 h-4 rounded-md bg-emerald-500/80 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] text-emerald-400 font-bold">Healthy</span>
                  </div>
                ))}
              </div>

              <div className="inline-block px-3 py-1 bg-[#1d5bd8]/30 text-[#60a5fa] rounded-full text-xs font-bold border border-[#1d5bd8]/40">
                Lower Mandibular Arch (Teeth 48 - 38)
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((tNum) => (
                  <div
                    key={tNum}
                    className="w-10 h-14 bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center justify-between p-1.5 hover:border-[#1d5bd8] hover:bg-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="text-[10px] font-mono text-slate-400">#{tNum}</span>
                    <div
                      className={`w-4 h-4 rounded-md ${
                        tNum === 36 ? 'bg-amber-500' : tNum === 46 ? 'bg-indigo-500' : 'bg-emerald-500/80'
                      }`}
                    />
                    <span className="text-[8px] text-slate-300 font-bold">
                      {tNum === 36 ? 'Crown' : tNum === 46 ? 'Filled' : 'Healthy'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1d5bd8]" />
                <span>Appointment Schedule History</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1d5bd8] font-bold text-[10px] uppercase">
                    Upcoming Confirmed
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">3D Aligner Adjustment & Progress Scan</h4>
                  <p className="text-xs text-slate-500 font-medium">Aug 16, 2026 at 10:30 AM with {patient.assignedDoctor}</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-2xs">
                  Confirmed
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                    Past Visit
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">Comprehensive Hygiene & Intraoral Exam</h4>
                  <p className="text-xs text-slate-500 font-medium">Aug 2, 2026 at 09:00 AM</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold">
                  Completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TREATMENTS */}
        {activeTab === 'treatments' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Active Treatment Plans & Clinical Procedures</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900">Clear Aligner Orthodontic Treatment (18 Trays)</h4>
                  <p className="text-slate-500 font-medium mt-0.5">Tooth Range: Arch 11-28, 31-48 • Step 12/18 Active</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 text-sm">$3,200.00</span>
                  <span className="block text-[10px] text-emerald-600 font-bold">In Progress (70% Paid)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Porcelain Crown Restoration (Tooth #36)</h4>
                  <p className="text-slate-500 font-medium mt-0.5">Completed on Jul 15, 2026 by Dr. Elena Rostova</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 text-sm">$850.00</span>
                  <span className="block text-[10px] text-emerald-600 font-bold">Completed & Paid</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Prescription Records (Rx)</span>
              </h3>
              <button
                onClick={() => alert(`Printing prescription records for ${patient.fullName}...`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rx</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">Amoxicillin 500mg Capsules</span>
                <span className="text-slate-400 font-semibold text-[10px]">Prescribed Aug 2, 2026</span>
              </div>
              <p className="text-slate-600 font-medium">Dosage: 1 capsule every 8 hours for 7 days post-procedure.</p>
              <p className="text-slate-400 text-[10px]">Doctor: {patient.assignedDoctor}</p>
            </div>
          </div>
        )}

        {/* TAB 7: INVOICES */}
        {activeTab === 'invoices' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Billing Invoices & Patient Statements</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[#1d5bd8] font-bold">INV-2026-0802</span>
                <h4 className="font-extrabold text-slate-900 text-sm">Aligner Step 12 + Prophylaxis</h4>
                <p className="text-slate-400 text-[10px]">Issued Aug 2, 2026</p>
              </div>

              <div className="text-right">
                <span className="font-black text-slate-900 text-sm">$180.00</span>
                <span className="block text-rose-600 font-bold text-[10px]">Pending Payment</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Payment Transaction Ledger</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-emerald-600 font-bold">PAY-9821</span>
                <h4 className="font-extrabold text-slate-900">Visa ending in •••• 4242</h4>
                <p className="text-slate-400 text-[10px]">Processed Jul 15, 2026</p>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-600 text-sm">$850.00</span>
                <span className="block text-slate-400 font-bold text-[10px]">Cleared</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DOCUMENTS */}
        {activeTab === 'documents' && (
          <DocumentUploader
            patientDocId={patient.id}
            uploaderName={userName}
            uploaderRole={userRole}
            canUpload={userRole === 'Admin' || userRole === 'Doctor' || userRole === 'Receptionist'}
            canDelete={userRole === 'Admin'}
          />
        )}

        {/* TAB 10: TIMELINE */}
        {activeTab === 'timeline' && (
          <TimelineCard
            patientDocId={patient.id}
            userName={userName}
            canAddEvent={userRole === 'Admin' || userRole === 'Doctor' || userRole === 'Receptionist'}
          />
        )}

        {/* TAB 11: NOTES */}
        {activeTab === 'notes' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1d5bd8]" />
                <span>Doctor & Staff Clinical Progress Notes ({notes.length})</span>
              </h3>
            </div>

            {/* CREATE NOTE FORM */}
            {canAddNotes ? (
              <form onSubmit={handleCreateNote} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-extrabold text-slate-800">Add New Clinical Note</span>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Clinical">Clinical Observation</option>
                    <option value="Surgical">Surgical / Anesthesia</option>
                    <option value="Hygiene">Hygiene & Cleaning</option>
                    <option value="Administrative">Administrative Note</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record treatment progress, patient compliance, or anesthesia observations..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteText.trim()}
                    className="px-4 py-2 rounded-xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Saving Note...' : 'Save Clinical Note'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500 font-medium italic">
                Note: Read-only mode for Assistant role. Clinical note addition requires Doctor or Admin permission.
              </p>
            )}

            {/* LIST OF CLINICAL NOTES */}
            {notes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-medium">
                No clinical notes added yet for this patient.
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{n.authorName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1d5bd8] text-[10px] font-bold">
                          {n.authorRole}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {n.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(n.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
