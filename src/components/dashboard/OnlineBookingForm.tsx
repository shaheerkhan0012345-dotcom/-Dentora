import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { fetchDoctorProfiles } from '../../services/doctorPortalService';
import { getAvailableTimeSlots, submitOnlineBooking } from '../../services/onlineBookingService';
import { DoctorProfile } from '../../types/doctorPortal';
import { BookingSlot } from '../../types/onlineBooking';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, AlertCircle, Stethoscope, ChevronRight, Sparkles, Building2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TREATMENTS_LIST = [
  'Comprehensive Dental Examination',
  'Teeth Whitening & Laser Care',
  'Clear Aligner / Invisalign Consultation',
  'Root Canal Treatment (Endodontics)',
  'Dental Implant Consultation',
  'Tooth Extraction & Surgical Care',
  'Pediatric Dental Checkup',
  'Crowns, Veneers & Cosmetic Dentistry',
];

export const OnlineBookingForm: React.FC<{
  onBookingSuccess?: () => void;
  isStandalonePage?: boolean;
}> = ({ onBookingSuccess, isStandalonePage = false }) => {
  const { clinics, currentClinic } = useClinic();

  const [step, setStep] = useState<number>(1); // 1: Clinic & Doctor & Treatment, 2: Date & Time, 3: Patient Info, 4: Confirmation
  const [selectedClinicId, setSelectedClinicId] = useState<string>(currentClinic.id);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string>(TREATMENTS_LIST[0]);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<BookingSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Load doctors when selectedClinicId changes
  useEffect(() => {
    let isMounted = true;
    fetchDoctorProfiles(selectedClinicId).then((docs) => {
      if (isMounted) {
        setDoctors(docs);
        if (docs.length > 0) setSelectedDoctor(docs[0]);
      }
    });
    return () => { isMounted = false; };
  }, [selectedClinicId]);

  // Load available time slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      getAvailableTimeSlots(selectedClinicId, selectedDoctor.id, selectedDate).then((slots) => {
        setTimeSlots(slots);
        const availableFirst = slots.find((s) => s.isAvailable);
        if (availableFirst) setSelectedTimeSlot(availableFirst.time);
        else setSelectedTimeSlot('');
        setLoadingSlots(false);
      });
    }
  }, [selectedClinicId, selectedDoctor, selectedDate]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedTimeSlot) {
      setErrorMessage('Please select a doctor and available time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const activeClinic = clinics.find((c) => c.id === selectedClinicId) || currentClinic;

      const result = await submitOnlineBooking({
        clinicId: selectedClinicId,
        clinicName: activeClinic.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        treatmentName: selectedTreatment,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        patientName,
        patientEmail,
        patientPhone,
        notes,
      });

      setBookingRef(result.id);
      setStep(4);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to submit booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 ${isStandalonePage ? 'my-8' : ''}`}>
      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1d5bd8] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Instant 24/7 Dental Booking
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Book an Appointment Online</h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className={step >= 1 ? 'text-[#1d5bd8]' : ''}>1</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-[#1d5bd8]' : ''}>2</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-[#1d5bd8]' : ''}>3</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SELECT CLINIC, DOCTOR & TREATMENT */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1d5bd8]" />
              Select Clinic Location
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {clinics.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClinicId(c.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedClinicId === c.id
                      ? 'bg-blue-50/60 border-[#1d5bd8] ring-2 ring-[#1d5bd8]/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{c.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.address}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#1d5bd8]" />
              Select Specialist Doctor
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    selectedDoctor?.id === doc.id
                      ? 'bg-blue-50/60 border-[#1d5bd8] ring-2 ring-[#1d5bd8]/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Treatment Care</label>
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
            >
              {TREATMENTS_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-3.5 rounded-2xl bg-[#1d5bd8] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            Continue to Choose Date & Time
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#1d5bd8]" />
              Select Appointment Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1d5bd8]" />
              Select Available Time Slot (Real-time Anti-Double-Booking Guard)
            </label>

            {loadingSlots ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">Checking slot availability...</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !slot.isAvailable
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                        : selectedTimeSlot === slot.time
                        ? 'bg-[#1d5bd8] text-white border-[#1d5bd8] shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!selectedTimeSlot}
              onClick={() => setStep(3)}
              className="w-2/3 py-3.5 rounded-2xl bg-[#1d5bd8] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Enter Patient Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: PATIENT DETAILS & CONFIRM */}
      {step === 3 && (
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-slate-800 space-y-1 mb-4">
            <p className="font-bold text-[#1d5bd8]">Appointment Summary:</p>
            <p>
              Doctor: <span className="font-bold">{selectedDoctor?.name}</span> ({selectedTreatment})
            </p>
            <p>
              Schedule: <span className="font-bold">{selectedDate}</span> at <span className="font-bold">{selectedTimeSlot}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="eleanor@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Notes or Tooth Complaints (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mention any allergies or dental pain..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              {submitting ? 'Confirming Booking...' : 'Confirm & Book Visit'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Appointment Confirmed!</h3>
          <p className="text-slate-600 text-xs max-w-md mx-auto">
            Thank you <span className="font-bold text-slate-900">{patientName}</span>. Your booking reference is{' '}
            <span className="font-extrabold text-[#1d5bd8]">{bookingRef || 'BOOK-8901'}</span>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2">
            <p>
              <strong>Clinic:</strong> {clinics.find((c) => c.id === selectedClinicId)?.name}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedDoctor?.name}
            </p>
            <p>
              <strong>Time:</strong> {selectedDate} at {selectedTimeSlot}
            </p>
            <p className="text-emerald-700 font-semibold pt-2 border-t border-slate-200">
              ✓ SMS & WhatsApp confirmation sent to {patientPhone}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setPatientName('');
              setPatientEmail('');
              setPatientPhone('');
              setNotes('');
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Book Another Visit
          </button>
        </motion.div>
      )}
    </div>
  );
};
