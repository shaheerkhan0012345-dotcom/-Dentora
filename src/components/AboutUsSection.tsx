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
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Building2, 
  HeartHandshake, 
  Cpu, 
  Clock 
} from 'lucide-react';

import xrayImg from '../assets/images/about_us_xray_consultation_1785582492932.jpg';
import teamImg from '../assets/images/about_us_clinic_team_1785582510749.jpg';

export const AboutUsSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const statsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statsContainerRef.current) return;

    const ctx = gsap.context(() => {
      const counters = statsContainerRef.current?.querySelectorAll('.gsap-stat-counter');
      counters?.forEach((el) => {
        const targetValue = parseFloat(el.getAttribute('data-target') || '0');
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        const suffix = el.getAttribute('data-suffix') || '';

        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetValue,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsContainerRef.current,
            start: 'top 80%',
            once: true
          },
          onUpdate: () => {
            el.textContent = isDecimal 
              ? `${obj.val.toFixed(1)}${suffix}`
              : `${Math.floor(obj.val).toLocaleString()}${suffix}`;
          }
        });
      });
    }, statsContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="w-full min-h-screen flex flex-col justify-center bg-[#FAFAFC] text-slate-900 py-16 sm:py-20 md:py-24 px-5 sm:px-8 lg:px-16 selection:bg-blue-100 selection:text-blue-900 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* TOP TAG BADGES - Dark pill + Light Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-2.5 mb-8 sm:mb-12"
        >
          {/* Dark Pill */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-xs tracking-wide shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2073e5]" />
            About Us
          </span>

          {/* Light Gray Pills */}
          <span className="px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-700 font-medium text-xs tracking-tight">
            Health Service
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-700 font-medium text-xs tracking-tight">
            Medical Platform
          </span>
          <span className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-700 font-medium text-xs tracking-tight">
            Boutique Luxury Clinic
          </span>
        </motion.div>

        {/* MAIN CONTENT GRID - Left Heading & Photos + Right Statement Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: Large Heading & Dual Image Cards */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B2E78] leading-[1.08]">
                Observe With Team
              </h2>
            </motion.div>

            {/* GSAP Animated Statistics Counters Bar */}
            <div ref={statsContainerRef} className="grid grid-cols-3 gap-3 pt-2 max-w-md">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span 
                  className="gsap-stat-counter text-2xl sm:text-3xl font-black text-[#0B2E78] block" 
                  data-target="15" 
                  data-suffix="+"
                >
                  0+
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                  Years Exp
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span 
                  className="gsap-stat-counter text-2xl sm:text-3xl font-black text-[#2073e5] block" 
                  data-target="99.4" 
                  data-decimal="true" 
                  data-suffix="%"
                >
                  0%
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                  Precision
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span 
                  className="gsap-stat-counter text-2xl sm:text-3xl font-black text-[#0B2E78] block" 
                  data-target="12000" 
                  data-suffix="+"
                >
                  0+
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                  Smiles
                </span>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="grid grid-cols-2 gap-4 max-w-md"
            >
              {/* Photo 1: X-ray consultation */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-44 sm:h-52 shadow-md border border-slate-200/80 group">
                <img 
                  src={xrayImg} 
                  alt="3D Dental X-ray Consultation" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                  Precision Scan
                </span>
              </div>

              {/* Photo 2: Specialist in clinic */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-44 sm:h-52 shadow-md border border-slate-200/80 group">
                <img 
                  src={teamImg} 
                  alt="Dentora Dental Specialist" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                  Specialist Team
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Large Narrative Statement & Bottom Action Row */}
          <div className="lg:col-span-7 flex flex-col justify-between min-h-[380px] lg:pl-4 space-y-10 lg:space-y-0">
            
            {/* Big Narrative Paragraph matching reference tone */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-800 leading-[1.32]">
                At <span className="text-[#0B2E78] font-bold">Dentora</span>, We Understand The Power Of A Healthy Aesthetic. Our Specialist Team Ensures Precise, Individual Care Within A Boutique Space, Utilizing High-End Technology For Lasting Dental Excellence.
              </p>
            </motion.div>

            {/* BOTTOM ROW: Ratings + "Learn More" circular arrow button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-200/80"
            >
              {/* Rating & Wellbeing Label */}
              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Staying - Informed About Wellbeing
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    4.9 / 5.0
                  </span>
                </div>
              </div>

              {/* "Learn More" + Large Circular Arrow Button */}
              <div 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#2073e5] transition-colors">
                  Learn More
                </span>
                <div className="w-14 h-14 rounded-full bg-slate-900 group-hover:bg-[#2073e5] text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-108">
                  <ArrowUpRight className="w-7 h-7 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

            </motion.div>

          </div>

        </div>

      </div>

      {/* ABOUT US DETAIL EXPANSION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 border border-slate-200 my-auto space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2073e5] flex items-center justify-center border border-blue-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#2073e5] uppercase tracking-wider">
                    Boutique Dental Excellence
                  </span>
                  <h3 className="text-2xl font-bold text-[#0B2E78]">
                    Our Philosophy & Vision
                  </h3>
                </div>
              </div>

              {/* Details Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  Founded on the principles of empathetic care and precision aesthetics, Dentora transforms conventional dental visits into a soothing, tailored luxury experience.
                </p>
                <p>
                  Our clinic combines zero-radiation digital imaging, painless laser diagnostics, and board-certified specialists under one roof to deliver predictable, natural, and long-lasting smile transformations.
                </p>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-[#2073e5] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2E78]">Next-Gen Tech</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">3D CBCT, optical intraoral scanners & cold lasers.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <HeartHandshake className="w-5 h-5 text-[#2073e5] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2E78]">Gentle Comfort</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Anxiety-free protocols and soothing boutique space.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Dentora Clinic Platform
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#0B2E78] hover:bg-[#2073e5] text-white font-semibold text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
                >
                  Close Overview
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
