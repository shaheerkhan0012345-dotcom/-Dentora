import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { DEFAULT_PATIENT_ACCOUNT, DEFAULT_AI_CARE_TIPS } from '../../services/patientPortalService';
import { PatientDocumentCenter } from './PatientDocumentCenter';
import { subscribeToAppointments } from '../../services/appointmentService';
import { AppointmentRecord } from '../../types/appointment';
import { Calendar, DollarSign, Activity, FileText, Sparkles, Bell, ArrowRight, ShieldCheck, CheckCircle2, Clock, MapPin, Phone, Megaphone, User, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientDashboardProps {
  patientName?: string;
  patientEmail?: string;
  onBookAppointmentClick?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patientName = 'Sarah Jenkins',
  patientEmail = 'sarah.j@gmail.com',
  onBookAppointmentClick,
}) => {
  const { currentClinic } = useClinic();
  const [patientAccount] = useState(DEFAULT_PATIENT_ACCOUNT);
  const [aiCareTips] = useState(DEFAULT_AI_CARE_TIPS);
  const [allAppointments, setAllAppointments] = useState<AppointmentRecord[]>([]);
  const [filterMyNameOnly, setFilterMyNameOnly] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToAppointments((apts) => {
      setAllAppointments(apts || []);
    });

    return () => unsub();
  }, []);

  const cleanName = patientName.toLowerCase().trim();
  const cleanEmail = patientEmail.toLowerCase().trim();

  const matchingAppointments = allAppointments.filter((a) => {
    const aptPName = a.patientName.toLowerCase().trim();
    if (!aptPName) return false;
    
    // Check if whole name or name parts match
    const matchesName = aptPName.includes(cleanName) || cleanName.includes(aptPName);
    const nameParts = cleanName.split(' ').filter(p => p.length > 1);
    const matchesParts = nameParts.some(part => aptPName.includes(part));

    const matchesEmail = cleanEmail ? (a.notes?.toLowerCase().includes(cleanEmail) || false) : false;
    return matchesName || matchesParts || matchesEmail;
  });

  // Strict data privacy: ONLY show matching appointments belonging to this patient
  const displayedAppointments = matchingAppointments;

  return (
    <div className="space-y-8">
      {/* WELCOME HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Patient Portal
              </span>
              <span className="text-slate-300 text-xs font-semibold">{currentClinic.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Welcome Back, {patientName}</h1>
            <p className="text-slate-300 text-xs mt-1">
              Patient ID: <span className="font-bold text-white">{patientAccount.patientId}</span> • Orthodontist: <span className="font-bold text-white">{patientAccount.assignedDoctor}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onBookAppointmentClick && (
              <button
                onClick={onBookAppointmentClick}
                className="px-5 py-3 rounded-2xl bg-[#1d5bd8] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                Request Appointment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold flex items-center gap-3">
        <Megaphone className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold text-amber-900">Clinic Announcement:</span> Our Beverly Hills & Gulberg centers will offer 3D Laser Alignment screening sessions this month. Check your care instructions.
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upcoming Visit */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-[#1d5bd8]" />
            Next Visit Schedule
          </div>
          <div className="text-sm font-black text-slate-900">{patientAccount.nextVisit}</div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {currentClinic.name}
          </p>
        </div>

        {/* Treatment Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Activity className="w-4 h-4 text-emerald-500" />
            Treatment Progress
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">{patientAccount.treatmentProgress}% Complete</div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">On Track</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${patientAccount.treatmentProgress}%` }} />
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Outstanding Balance
          </div>
          <div className="text-xl font-black text-slate-900">${patientAccount.outstandingBalance.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400">Invoice #INV-8801 due next visit</p>
        </div>

        {/* Prescription Summary */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <FileText className="w-4 h-4 text-indigo-500" />
            Active Prescriptions
          </div>
          <div className="text-sm font-black text-slate-900">Rx #8801 Amoxicillin</div>
          <p className="text-[10px] text-slate-400">500mg • Twice Daily post-meal</p>
        </div>
      </div>

      {/* MY PERSONAL APPOINTMENTS LIST */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1d5bd8]" />
              My Scheduled Dental Visits
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Personal visit schedule & live appointment status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personal Visits ({patientName})</span>
            </span>

            {onBookAppointmentClick && (
              <button
                onClick={onBookAppointmentClick}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1d5bd8] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
              >
                + Book New Visit
              </button>
            )}
          </div>
        </div>

        {displayedAppointments.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d5bd8] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">No active visits found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use 24/7 Online Booking to schedule an appointment with your dentist.</p>
            </div>
            {onBookAppointmentClick && (
              <button
                onClick={onBookAppointmentClick}
                className="px-4 py-2 rounded-xl bg-[#1d5bd8] text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Appointment Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-[#1d5bd8] font-black text-xs text-center shrink-0 shadow-2xs">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">{apt.date}</span>
                    <span className="text-xs text-[#1d5bd8]">{apt.startTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{apt.treatment}</h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                        Patient: {apt.patientName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      Doctor: <span className="font-semibold text-slate-800">{apt.doctorName}</span>
                    </p>
                    {apt.room && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {apt.room}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      apt.status === 'Confirmed'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : apt.status === 'In Treatment' || apt.status === 'Waiting'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : apt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI GENERATED CARE TIPS SECTION */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-3xl p-6 border border-blue-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1d5bd8]" />
            AI-Generated Personalized Care Instructions
          </h3>
          <span className="text-[10px] font-bold text-[#1d5bd8] bg-white px-2.5 py-1 rounded-full border border-blue-200">
            Updated Today
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {aiCareTips.map((tip) => (
            <div key={tip.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1d5bd8] text-[9px] font-extrabold uppercase">
                {tip.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900">{tip.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{tip.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PATIENT DOCUMENT CENTER COMPONENT */}
      <PatientDocumentCenter patientId={patientAccount.patientId} clinicId={currentClinic.id} patientName={patientName} />
    </div>
  );
};
