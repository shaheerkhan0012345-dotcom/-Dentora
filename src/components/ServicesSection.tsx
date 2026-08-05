import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
import { 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Scissors, 
  Smile, 
  Layers, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Award,
  ChevronRight
} from 'lucide-react';

import cavityImg from '../assets/images/cavity_protection_dental_1785580927681.jpg';
import rootCanalImg from '../assets/images/root_canal_treatment_1785580949652.jpg';
import oralSurgeryImg from '../assets/images/oral_surgery_dental_1785580964039.jpg';

export interface ServiceItem {
  id: string;
  title: string;
  category: 'General' | 'Endodontics' | 'Surgical' | 'Cosmetic';
  shortDesc: string;
  fullDesc: string;
  image: string;
  icon: React.ElementType;
  duration: string;
  recovery: string;
  highlights: string[];
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'cavity-protection',
    title: 'Cavity Protection',
    category: 'General',
    shortDesc: 'Enhance the appearance and strength of your smile with tailored treatments designed to prevent decay and boost confidence.',
    fullDesc: 'Our advanced cavity protection program combines non-invasive remineralization, precision composite sealants, and early laser detection to safeguard enamel before cavities develop.',
    image: cavityImg,
    icon: ShieldCheck,
    duration: '30 - 45 Mins',
    recovery: 'Immediate',
    highlights: [
      'Painless laser fluorescence caries scanning',
      'Bio-compatible fluoridating remineralization',
      'Invisible micro-thin protective sealants',
      'Custom preventative home care blueprint'
    ]
  },
  {
    id: 'root-canal',
    title: 'Root Canal Treatment',
    category: 'Endodontics',
    shortDesc: 'Our skilled endodontists use micro-guided techniques to eliminate infected pulp, leaving your teeth clean, pain-free, and refreshed.',
    fullDesc: 'Experience zero-pain endodontics utilizing 3D CBCT imaging and motorized rotary instruments to gently sterilize and preserve your natural tooth structure.',
    image: rootCanalImg,
    icon: Activity,
    duration: '60 Mins',
    recovery: '1 - 2 Days',
    highlights: [
      '3D Cone Beam CT digital root mapping',
      'Gentle local anesthesia with zero discomfort',
      'Microscope-guided canal sterilization',
      'High-durability bio-ceramic sealing'
    ]
  },
  {
    id: 'oral-surgery',
    title: 'Oral Surgery',
    category: 'Surgical',
    shortDesc: 'Immediate relief and structural restoration for complex dental conditions, wisdom teeth extractions, and jaw alignment.',
    fullDesc: 'Specialized surgical care performed in a sterile, calming boutique environment equipped with laser scalpels and ultrasonic piezo surgery for minimal swelling and fast healing.',
    image: oralSurgeryImg,
    icon: Scissors,
    duration: '45 - 90 Mins',
    recovery: '3 - 5 Days',
    highlights: [
      'Ultrasonic Piezo-surgery for painless bone care',
      'Platelet-Rich Fibrin (PRF) for accelerated healing',
      'Sedation options tailored to patient anxiety',
      'Comprehensive post-operative care hotline'
    ]
  },
  {
    id: 'laser-whitening',
    title: 'Laser Whitening',
    category: 'Cosmetic',
    shortDesc: 'Transform dull or discolored teeth up to 8 shades brighter in a single luxurious, sensitivity-free treatment session.',
    fullDesc: 'Utilizing cold-laser technology alongside medical-grade whitening formulas, we eliminate stubborn stains from coffee, wine, and aging while reinforcing enamel strength.',
    image: cavityImg,
    icon: Sparkles,
    duration: '45 Mins',
    recovery: 'Immediate',
    highlights: [
      'Up to 8 shades lighter in just one visit',
      'Desensitizing blue light cold-laser beam',
      'Enamel-safe peroxide formulations',
      'Includes custom touch-up maintenance kit'
    ]
  },
  {
    id: 'clear-aligners',
    title: 'Orthodontic Aligners',
    category: 'Cosmetic',
    shortDesc: 'Discreetly straighten your teeth using ultra-clear 3D-customized aligners designed for maximum comfort and speed.',
    fullDesc: 'Say goodbye to metal wires with state-of-the-art transparent aligner technology. View your simulated 3D smile transformation before treatment even begins.',
    image: rootCanalImg,
    icon: Smile,
    duration: 'Checkup 15 Mins',
    recovery: 'None',
    highlights: [
      'Virtually invisible medical-grade polymer',
      'Predictable 3D AI smile simulation',
      'Fewer in-clinic visits required',
      'Removable for effortless eating and brushing'
    ]
  },
  {
    id: 'dental-implants',
    title: '3D Dental Implants',
    category: 'Surgical',
    shortDesc: 'Permanent, natural-looking tooth replacements anchored with biocompatible titanium for full functional restoration.',
    fullDesc: 'Guided computer-designed implant surgery ensures flawless placement accuracy, restoring natural chewing force and aesthetic facial balance for a lifetime.',
    image: oralSurgeryImg,
    icon: Layers,
    duration: '60 Mins',
    recovery: '2 - 4 Days',
    highlights: [
      'Computer-guided keyhole placement',
      'Grade-5 bio-compatible titanium posts',
      'Custom handcrafted zirconia crowns',
      'Lifetime warranty on structural implants'
    ]
  }
];

export const ServicesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const categories = ['All', 'General', 'Endodontics', 'Surgical', 'Cosmetic'];

  const filteredServices = activeCategory === 'All'
    ? SERVICES_DATA
    : SERVICES_DATA.filter(service => service.category === activeCategory);

  const handleBookService = (serviceName: string) => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setSelectedService(null);
    }, 2500);
  };

  return (
    <section id="services" className="w-full min-h-screen flex flex-col justify-center bg-[#FAFAFC] text-slate-900 py-16 sm:py-20 md:py-24 px-5 sm:px-8 lg:px-16 selection:bg-blue-100 selection:text-blue-900 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Top Eyebrow Accent Line */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-8 sm:w-10 h-[2px] bg-[#2073e5] rounded-full" />
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#2073e5] uppercase font-sans">
            Professional and Trained
          </span>
        </motion.div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B2E78] leading-[1.1]">
              Services We Provide
            </h2>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#5C6984] leading-relaxed font-normal max-w-xl">
              Transform your smile with our General & Cosmetic Dentistry services. From routine exams to smile makeovers, our expert team ensures comprehensive care for a confident and radiant smile.
            </p>
          </motion.div>

          {/* Category Filter Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 lg:pt-0"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#0B2E78] text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Service Cards Grid - Smooth hardware-accelerated Framer Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Banner with Image Notch cutout */}
                <div>
                  <div className="relative w-full h-32 sm:h-36 -mt-6 -mx-6 mb-6 overflow-hidden bg-slate-100 rounded-t-3xl border-b border-slate-100">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                    
                    {/* Category Tag on Image */}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#0B2E78] font-bold text-[11px] tracking-wider uppercase border border-white/80 shadow-xs">
                      {service.category}
                    </span>
                  </div>

                  {/* Icon Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-[#0B2E78] text-white flex items-center justify-center mb-5 shadow-md group-hover:bg-[#2073e5] transition-colors duration-300">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B2E78] tracking-tight mb-2.5 group-hover:text-[#2073e5] transition-colors duration-200">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6 line-clamp-3">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Read More Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#2073e5] transition-colors duration-200 cursor-pointer py-1"
                  >
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-[#2073e5] transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <span className="text-[11px] font-semibold text-slate-400">
                    {service.duration}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* READ MORE DETAILED SERVICE MODAL DIALOG */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-colors shadow-md cursor-pointer border border-slate-200/80"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Top Banner Image */}
              <div className="relative w-full h-48 sm:h-56 bg-slate-100">
                <img 
                  src={selectedService.image} 
                  alt={selectedService.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                
                <div className="absolute bottom-5 left-6 right-6 flex flex-col space-y-1 text-white">
                  <span className="inline-self-start px-3 py-1 rounded-full bg-[#2073e5] text-white font-bold text-xs uppercase tracking-wider shadow-sm w-max">
                    {selectedService.category} Care
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Description */}
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {selectedService.fullDesc}
                </p>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0B2E78] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Duration</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{selectedService.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0B2E78] flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Recovery</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{selectedService.recovery}</p>
                    </div>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#0B2E78] uppercase tracking-wider">
                    Treatment Highlights & Standards
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedService.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#2073e5] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 font-medium">
                    Questions? Consult with our specialists today.
                  </span>

                  <button
                    onClick={() => handleBookService(selectedService.title)}
                    disabled={isBooked}
                    className={`w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      isBooked 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#0B2E78] hover:bg-[#2073e5] text-white'
                    }`}
                  >
                    {isBooked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Appointment Requested!</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 text-white" />
                        <span>Book This Treatment</span>
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
