import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
import { 
  ArrowUpRight, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Users,
  MessageCircle,
} from 'lucide-react';

import bookingBgImg from '../assets/images/booking_left_dentist_bg_1785583239768.jpg';
import drPeterImg from '../assets/images/dr_peter_portrait_1785582655484.jpg';
import drAnnaImg from '../assets/images/dr_anna_portrait_1785582674572.jpg';
import drRobertImg from '../assets/images/dr_robert_portrait_1785582694998.jpg';

import { submitOnlineBooking } from '../services/onlineBookingService';
import { sendWhatsAppAppointmentNotification, getWhatsAppDeepLink } from '../services/whatsappService';


export const BookingSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    service: 'Cosmetic & Aesthetic Dentistry'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const card = sectionRef.current?.querySelector('.gsap-team-card');
      const form = sectionRef.current?.querySelector('.gsap-booking-form');

      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: -40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (form) {
        gsap.fromTo(
          form,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [whatsappStatusMessage, setWhatsappStatusMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError(null);

    const bookingDate = formData.date || new Date().toISOString().split('T')[0];
    const bookingTime = '10:00 AM';
    const doctorName = 'Dr. Elena Rostova';

    try {
      await submitOnlineBooking({
        clinicId: 'clinic-flagship',
        clinicName: 'Teethly Flagship Practice',
        doctorId: 'DOC-101',
        doctorName: doctorName,
        treatmentName: formData.service,
        date: bookingDate,
        timeSlot: bookingTime,
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        notes: 'Requested via Teethly Online Booking Banner',
      });

      // Dispatch automated WhatsApp notification or prepare 1-click wa.me link
      const waResult = await sendWhatsAppAppointmentNotification({
        recipientPhone: formData.phone,
        patientName: formData.name,
        doctorName: doctorName,
        treatmentName: formData.service,
        date: bookingDate,
        timeSlot: bookingTime,
        clinicName: 'Teethly Flagship Practice',
      });

      setWhatsappLink(waResult.whatsappDeepLink);
      setWhatsappStatusMessage(waResult.message);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting online booking:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to process online booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setWhatsappLink('');
    setWhatsappStatusMessage('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      service: 'Cosmetic & Aesthetic Dentistry'
    });
  };

  return (
    <section id="booking" className="w-full bg-slate-50/50 text-slate-900 py-16 sm:py-20 md:py-24 px-5 sm:px-8 lg:px-16 selection:bg-blue-100 selection:text-blue-900 border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Main Banner Container with Relative Padding for Overlapping Floating Card */}
        <div ref={sectionRef} className="relative w-full pt-24 sm:pt-28 lg:pt-32">
          
          {/* FLOATING DEDICATED TEAM CARD: Shifted higher up so doctor is completely visible */}
          <motion.div 
            className="gsap-team-card absolute top-0 left-4 sm:left-10 lg:left-14 z-30 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 space-y-3"
          >
            <h3 className="text-base sm:text-lg font-bold text-[#0B2E78] tracking-tight">
              Dedicated Team
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Our team believes in accessible dental care. We offer straightforward pricing, clear estimates, and an unprecedented dental warranty.
            </p>

            {/* Avatar Row + Circle Button + 7k Stat */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Overlapping Doctor Avatars */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img 
                    src={drPeterImg} 
                    alt="Dr. Peter" 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                  <img 
                    src={drAnnaImg} 
                    alt="Dr. Anna" 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                  <img 
                    src={drRobertImg} 
                    alt="Dr. Robert" 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                </div>

                {/* Arrow Action Circle */}
                <div className="w-8 h-8 rounded-full bg-[#0B2E78] text-white flex items-center justify-center shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Stat metric */}
              <span className="text-lg font-extrabold text-[#0B2E78] tracking-tight">
                7,500+
              </span>
            </div>
          </motion.div>

          {/* Main Banner Image Box */}
          <div className="relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden bg-slate-900 shadow-2xl border border-slate-200/80 min-h-[620px] lg:min-h-[680px] flex flex-col justify-end lg:justify-between p-6 sm:p-10 lg:p-12 pt-32 sm:pt-36">
            
            {/* Background Image - Doctor situated clearly on the LEFT */}
            <img 
              src={bookingBgImg} 
              alt="Teethly Doctor Booking Banner" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-left-top sm:object-left brightness-100"
            />

            {/* Subtle Gradient Overlay for Text & Form Legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-slate-950/30 to-slate-950/70 lg:to-slate-950/50" />

            {/* Empty Spacer Div to push content cleanly on desktop */}
            <div className="hidden lg:block h-12" />

            {/* BOTTOM RIGHT OVERLAPPING GLASSMORPHISM BOOKING FORM */}
            <div className="gsap-booking-form relative z-20 self-end w-full lg:max-w-lg mt-8 lg:mt-0">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div 
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-6 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-[#0B2E78]">
                      Appointment Requested!
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
                      Thank you, <span className="font-semibold text-slate-900">{formData.name}</span>. Your appointment has been recorded.
                    </p>

                    {whatsappLink && (
                      <div className="pt-2 space-y-2">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                          <span>Send WhatsApp Confirmation</span>
                        </a>
                        <p className="text-[11px] text-slate-400">
                          {whatsappStatusMessage || 'Click above to open WhatsApp directly with pre-filled appointment details.'}
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleReset}
                        className="px-6 py-2.5 rounded-full bg-[#0B2E78] hover:bg-[#2073e5] text-white font-semibold text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
                      >
                        Book Another Appointment
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form key="booking-form" onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0B2E78] tracking-tight">
                        Instant Booking
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Select your preferred date & specialist
                      </p>
                    </div>

                    {bookingError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {bookingError}
                      </div>
                    )}

                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Jane Smith"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5] focus:border-transparent transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="jane@dental.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5] focus:border-transparent transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Phone & Date Side-by-Side (exact reference styling) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            required
                            placeholder="+1 8144028379"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5] focus:border-transparent transition-all shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5] focus:border-transparent transition-all shadow-xs"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Service Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Selected Specialty
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2073e5] focus:border-transparent transition-all shadow-xs"
                      >
                        <option value="Cosmetic & Aesthetic Dentistry">Cosmetic Veneers & Whitening</option>
                        <option value="3D Dental Implantology">3D Dental Implants</option>
                        <option value="Invisalign & Clear Aligners">Invisalign & Orthodontics</option>
                        <option value="Microscopic Root Canal Therapy">Endodontic Micro-Surgery</option>
                        <option value="General & Preventive Hygiene">General Hygiene & Checkup</option>
                      </select>
                    </div>

                    {/* Submit Pill Button (matching blue theme) */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-full bg-[#0B2E78] hover:bg-[#2073e5] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Book an appointment</span>
                        )}
                      </button>
                    </div>

                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
);
};
