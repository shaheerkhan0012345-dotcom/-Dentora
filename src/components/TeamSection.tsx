import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
import { 
  ArrowUpRight, 
  Star, 
  Award, 
  GraduationCap, 
  Calendar, 
  Clock, 
  X, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

import drPeterImg from '../assets/images/dr_peter_portrait_1785582655484.jpg';
import drAnnaImg from '../assets/images/dr_anna_portrait_1785582674572.jpg';
import drRobertImg from '../assets/images/dr_robert_portrait_1785582694998.jpg';

export interface DoctorMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  education: string;
  rating: number;
  reviewsCount: number;
  image: string;
  bio: string;
  nextSlot: string;
  certifications: string[];
  procedures: string[];
  dailyDuties: string;
  keyTechnologies: string[];
}

const TEAM_MEMBERS: DoctorMember[] = [
  {
    id: 'dr-peter-malloy',
    name: 'Dr. Peter Malloy',
    role: 'Lead General & Implant Surgeon',
    specialty: 'Restorative & Implantology',
    experience: '14+ Years Experience',
    education: 'DDS, Harvard School of Dental Medicine',
    rating: 4.98,
    reviewsCount: 342,
    image: drPeterImg,
    bio: 'Dr. Peter Malloy specializes in full-mouth reconstructions and micro-guided implant surgery. Known for his compassionate approach and meticulous precision, he has successfully restored over 4,500 patient smiles.',
    nextSlot: 'Today, 2:30 PM',
    certifications: [
      'Diplomate, International Congress of Oral Implantologists',
      'Advanced 3D CBCT Guided Surgery Specialist',
      'Member, American Dental Association (ADA)'
    ],
    procedures: [
      '3D CBCT Micro-Guided Dental Implants',
      'Full-Mouth Permanent Restorations',
      'Sinus Lifts & Bone Ridge Augmentation',
      'Painless Same-Day Tooth Extractions'
    ],
    dailyDuties: 'Performs precision titanium implant placements, evaluates 3D bone density scans, and leads full complex oral rehabilitation procedures.',
    keyTechnologies: ['3D iTero Scanner', 'CBCT Guided Implants', 'Piezo Ultrasonic Surgery']
  },
  {
    id: 'dr-anna-whitmore',
    name: 'Dr. Anna Whitmore',
    role: 'Chief Endodontic Specialist',
    specialty: 'Microscopic Endodontics',
    experience: '12+ Years Experience',
    education: 'DMD, Columbia University College of Dental Medicine',
    rating: 5.0,
    reviewsCount: 489,
    image: drAnnaImg,
    bio: 'Dr. Anna Whitmore is an industry pioneer in zero-pain microscopic root canal therapy and bio-ceramic tooth preservation. She lectures internationally on advanced endodontic sterilization and gentle dental care.',
    nextSlot: 'Tomorrow, 10:00 AM',
    certifications: [
      'Board Certified Endodontist (ABE)',
      'Micro-Surgical Laser Endodontic Instructor',
      'Fellow, International College of Dentists'
    ],
    procedures: [
      'Zero-Pain Microscopic Root Canal Therapy',
      'Bio-Ceramic Root Regeneration & Sealing',
      'Endodontic Retreatment & Apicoectomy',
      'Dental Trauma Emergency Preservation'
    ],
    dailyDuties: 'Utilizes 20x magnification surgical microscopes to treat deep nerve infections and save natural teeth without discomfort.',
    keyTechnologies: ['20x Zeiss Surgical Microscope', 'Laser Sterilization', 'Bio-Ceramic Sealers']
  },
  {
    id: 'dr-robert-lewis',
    name: 'Dr. Robert Lewis',
    role: 'Aesthetic Orthodontist & Cosmetic Dentist',
    specialty: 'Clear Aligners & Veneers',
    experience: '10+ Years Experience',
    education: 'DDS, UPenn School of Dental Medicine',
    rating: 4.96,
    reviewsCount: 295,
    image: drRobertImg,
    bio: 'Dr. Robert Lewis blends artistic design with cutting-edge 3D orthodontic simulation. He crafts custom porcelain veneers and invisible aligner treatments that deliver natural, harmonious facial symmetry.',
    nextSlot: 'Today, 4:15 PM',
    certifications: [
      'Diamond Top 1% Clear Aligner Provider',
      'American Academy of Cosmetic Dentistry (AACD)',
      'Digital Smile Design (DSD) Master Certified'
    ],
    procedures: [
      'Custom 3D Aligner Sequence Planning',
      'Handcrafted Ultra-Thin Porcelain Veneers',
      'Laser Teeth Whitening Sessions',
      'Digital Facial & Smile Symmetry Mapping'
    ],
    dailyDuties: 'Captures 3D digital impressions, customizes invisible aligner trays, and shapes hand-crafted porcelain veneers for aesthetic perfection.',
    keyTechnologies: ['iTero Element 5D', 'Digital Smile Design AI', 'Laser Gum Contouring']
  }
];

// Doctor Card with 3D Flip Rotation & Clean Scope Reveal
const DoctorFlipCard: React.FC<{
  doctor: DoctorMember;
  onSelect: (doc: DoctorMember) => void;
}> = ({ doctor, onSelect }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsFlipped(true);
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        rotationY: 180,
        duration: 0.7,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = () => {
    setIsFlipped(false);
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        rotationY: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(doctor)}
      className="gsap-doctor-card relative w-full h-[520px] sm:h-[560px] lg:h-[600px] [perspective:1200px] cursor-pointer group"
    >
      <div
        ref={innerRef}
        className="w-full h-full relative rounded-3xl transition-shadow duration-300 [transform-style:preserve-3d] shadow-sm hover:shadow-2xl border border-slate-200/90 bg-white"
      >
        {/* FRONT SIDE (Portrait & Badges) */}
        <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-slate-100 [backface-visibility:hidden]">
          <img
            src={doctor.image}
            alt={doctor.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-85" />

          {/* Top Right Floating Doctor Name Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#0B2E78] text-white font-bold text-xs sm:text-sm tracking-tight shadow-md border border-white/20">
              {doctor.name}
            </span>
          </div>

          {/* Bottom Details on Image */}
          <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200 bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 inline-block">
              {doctor.specialty}
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="text-xs font-semibold text-white">
                {doctor.rating} ({doctor.reviewsCount} reviews) • {doctor.experience}
              </span>
            </div>
          </div>
        </div>

        {/* BACK SIDE (Clinical Scope & Duties - Clean Light Theme matching website) */}
        <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-800 p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] border border-slate-200/90 shadow-2xl">
          
          <div className="space-y-4 text-left">
            {/* Header */}
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2073e5] block">
                  Clinical Scope & Duties
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0B2E78]">
                  {doctor.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                {doctor.experience}
              </span>
            </div>

            {/* Daily Duties Quote Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
              "{doctor.dailyDuties}"
            </div>

            {/* Key Procedures */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2E78] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2073e5]" />
                <span>Primary Procedures & Treatments</span>
              </h4>
              <div className="space-y-1.5">
                {doctor.procedures.map((proc, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2073e5] shrink-0" />
                    <span className="font-semibold">{proc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment & Technology */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Equipment & Technology
              </span>
              <div className="flex flex-wrap gap-1.5">
                {doctor.keyTechnologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(doctor);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#0B2E78] hover:bg-[#2073e5] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-300" />
              <span>Book Consultation with {doctor.name.split(' ')[1]}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export const TeamSection: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorMember | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const teamGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teamGridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = teamGridRef.current?.querySelectorAll('.gsap-doctor-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 60,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: teamGridRef.current,
              start: 'top 80%',
              once: true
            }
          }
        );
      }
    }, teamGridRef);

    return () => ctx.revert();
  }, []);

  const handleBookConsultation = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setSelectedDoctor(null);
    }, 2500);
  };

  return (
    <section id="team" className="w-full min-h-screen flex flex-col justify-center bg-[#FAFAFC] text-slate-900 py-16 sm:py-20 md:py-24 px-5 sm:px-8 lg:px-16 selection:bg-blue-100 selection:text-blue-900 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Top Eyebrow Accent Line */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4 text-center"
        >
          <div className="w-8 sm:w-10 h-[2px] bg-[#2073e5] rounded-full" />
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#2073e5] uppercase font-sans">
            EXPERIENCED AND SKILLED
          </span>
          <div className="w-8 sm:w-10 h-[2px] bg-[#2073e5] rounded-full" />
        </motion.div>

        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B2E78] leading-[1.12]">
            Meet Our Expert Team
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-[#5C6984] leading-relaxed font-normal">
            Hover over any specialist card to inspect their clinical scope, primary procedures, advanced dental equipment, and daily duties.
          </p>
        </motion.div>

        {/* Doctors Grid - 3D Interactive Rotating Cards */}
        <div ref={teamGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-10">
          {TEAM_MEMBERS.map((doctor) => (
            <DoctorFlipCard
              key={doctor.id}
              doctor={doctor}
              onSelect={setSelectedDoctor}
            />
          ))}
        </div>

      </div>

      {/* DOCTOR DETAILED PROFILE & BOOKING MODAL */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-colors shadow-md cursor-pointer border border-slate-200/80"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Top Doctor Banner */}
              <div className="relative w-full h-56 sm:h-64 bg-slate-100 flex items-end p-6">
                <img 
                  src={selectedDoctor.image} 
                  alt={selectedDoctor.name} 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                <div className="relative z-10 text-white space-y-1">
                  <span className="px-3 py-1 rounded-full bg-[#2073e5] text-white font-bold text-xs uppercase tracking-wider shadow-xs">
                    {selectedDoctor.specialty}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight pt-1">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {selectedDoctor.role}
                  </p>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                    <p className="text-xs sm:text-sm font-bold text-[#0B2E78] mt-0.5">{selectedDoctor.experience}</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-slate-800">{selectedDoctor.rating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next Slot</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">{selectedDoctor.nextSlot}</p>
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <h4 className="text-xs font-bold text-[#0B2E78] uppercase tracking-wider mb-2">
                    Doctor Biography
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {selectedDoctor.bio}
                  </p>
                </div>

                {/* Education & Certifications */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#0B2E78] uppercase tracking-wider">
                    Education & Credentials
                  </h4>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <GraduationCap className="w-4 h-4 text-[#2073e5] shrink-0 mt-0.5" />
                    <span className="font-semibold">{selectedDoctor.education}</span>
                  </div>
                  <ul className="space-y-2 pt-1">
                    {selectedDoctor.certifications.map((cert, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2073e5] shrink-0 mt-0.5" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-[#2073e5]" />
                    <span>Average consult: 30 minutes</span>
                  </div>

                  <button
                    onClick={handleBookConsultation}
                    disabled={isBooked}
                    className={`w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      isBooked 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#0B2E78] hover:bg-[#2073e5] text-white'
                    }`}
                  >
                    {isBooked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Consultation Booked!</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 text-white" />
                        <span>Book Consultation</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
