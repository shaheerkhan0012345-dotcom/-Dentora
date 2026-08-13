import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
import { 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  X, 
  Cpu, 
  Award, 
  Clock, 
  ShieldCheck, 
  Headphones, 
  Percent 
} from 'lucide-react';

import whyChooseUsImg from '../assets/images/why_choose_us_dentist_1785581164048.jpg';

export interface FloatingFeature {
  id: string;
  title: string;
  icon: React.ElementType;
  positionClass: string; // Tailwind absolute position for desktop
  shortDetail: string;
  fullDetail: string;
  benefits: string[];
}

const FLOATING_FEATURES: FloatingFeature[] = [
  {
    id: 'tech',
    title: 'Advanced Technology',
    icon: Cpu,
    positionClass: 'top-6 left-6 lg:top-8 lg:left-8',
    shortDetail: '3D CBCT Scanners & Laser Dentistry',
    fullDetail: 'We equip our clinic with state-of-the-art 3D Cone Beam Computed Tomography, pain-free laser caries scanning, and AI-guided digital smile design tools.',
    benefits: [
      '99.8% Diagnostic Accuracy',
      'Minimally invasive treatment protocols',
      'Zero-radiation digital optical intraoral scanners'
    ]
  },
  {
    id: 'experience',
    title: 'Top Experience',
    icon: Award,
    positionClass: 'top-6 left-[48%] -translate-x-1/2 lg:top-8',
    shortDetail: 'Board-certified international specialists',
    fullDetail: 'Our team comprises world-class endodontists, orthodontists, and aesthetic dental surgeons with over 15+ years of clinical excellence and 10,000+ completed transformations.',
    benefits: [
      'Continuous ivy-league clinical training',
      'Gentle, anxiety-free patient care protocol',
      'Multi-award winning aesthetic smile design'
    ]
  },
  {
    id: 'appointments',
    title: 'Easy appointment system',
    icon: Calendar,
    positionClass: 'top-6 right-6 lg:top-8 lg:right-8',
    shortDetail: 'Instant 1-click booking & smart reminders',
    fullDetail: 'Book your visit seamlessly online without waiting on hold. Receive instant SMS/WhatsApp confirmations and automated appointment scheduling.',
    benefits: [
      'Real-time live specialist availability',
      'Reschedule or cancel with zero hassle',
      'VIP priority emergency slot reservation'
    ]
  },
  {
    id: 'membership',
    title: 'Get membership discount',
    icon: Percent,
    positionClass: 'bottom-6 left-6 lg:bottom-8 lg:left-8',
    shortDetail: 'Exclusive Dentora Club savings up to 25%',
    fullDetail: 'Join our Dentora Privilege Club to enjoy complimentary biannual hygiene cleanings, free emergency consultations, and 25% off cosmetic whitening treatments.',
    benefits: [
      '2 free professional cleanings per year',
      '25% discount on cosmetic makeovers',
      'Family membership bundle options available'
    ]
  },
  {
    id: 'support',
    title: '24/7 Support',
    icon: Headphones,
    positionClass: 'bottom-6 right-6 lg:bottom-8 lg:right-8',
    shortDetail: 'Round-the-clock emergency assistance',
    fullDetail: 'Dental emergencies don’t keep office hours. Access our dedicated 24/7 specialist helpline for immediate triage, prescription dispatch, or urgent same-day appointments.',
    benefits: [
      'Direct line to lead clinical team',
      'Immediate emergency prescription dispatch',
      'Same-day guaranteed emergency appointments'
    ]
  }
];

export const WhyChooseUsSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FloatingFeature | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const bigCard3DRef = useRef<HTMLDivElement>(null);
  const card3DRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Big background card simple smooth reveal (flat, no 3D distortion)
      if (bigCard3DRef.current) {
        gsap.fromTo(
          bigCard3DRef.current,
          {
            scale: 0.95,
            opacity: 0
          },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              once: true
            }
          }
        );
      }

      // Small card 3D entrance animation
      if (card3DRef.current) {
        gsap.fromTo(
          card3DRef.current,
          {
            rotationX: 15,
            rotationY: -12,
            z: -40,
            scale: 0.92,
            opacity: 0,
            transformPerspective: 1000
          },
          {
            rotationX: 0,
            rotationY: 0,
            z: 0,
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 78%',
              once: true
            }
          }
        );
      }

      const featurePills = containerRef.current?.querySelectorAll('.gsap-floating-pill');
      if (featurePills && featurePills.length > 0) {
        // Initial ScrollTrigger reveal with 3D depth perspective
        gsap.fromTo(
          featurePills,
          {
            scale: 0.6,
            opacity: 0,
            y: 35,
            rotationX: -20,
            rotationY: 10,
            transformPerspective: 1000
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
              once: true
            }
          }
        );

        // Continuous 3D floating wave loop with varying Z depths
        featurePills.forEach((pill, idx) => {
          gsap.to(pill, {
            y: idx % 2 === 0 ? '-=10' : '+=10',
            rotationX: idx % 2 === 0 ? 6 : -6,
            rotationY: idx % 3 === 0 ? -8 : 8,
            duration: 2.5 + idx * 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.easeInOut',
            delay: idx * 0.2
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Interactive Mouse Parallax tilt handler specifically for the small inner card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (-y / (rect.height / 2)) * 12; // small card tilt up to 12 deg
    const rotY = (x / (rect.width / 2)) * 12;

    // 1. Keep Big Back Card stable (flat)
    if (bigCard3DRef.current) {
      gsap.to(bigCard3DRef.current, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    // 2. Apply 3D tilt ONLY to the small inner card
    if (card3DRef.current) {
      gsap.to(card3DRef.current, {
        rotationX: rotX,
        rotationY: rotY,
        z: 35,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        boxShadow: `${-rotY * 1.5}px ${rotX * 1.5 + 20}px 40px rgba(11, 46, 120, 0.22)`
      });
    }

    // 3. Parallax offset for background doctor photo
    if (bgImageRef.current) {
      gsap.to(bgImageRef.current, {
        x: (-x / (rect.width / 2)) * 10,
        y: (-y / (rect.height / 2)) * 10,
        scale: 1.03,
        duration: 0.6,
        ease: 'power1.out'
      });
    }

    // 4. Floating feature pills 3D movement
    const pills = containerRef.current.querySelectorAll('.gsap-floating-pill');
    pills.forEach((pill, i) => {
      const factor = (i + 1) * 6;
      gsap.to(pill, {
        x: (x / (rect.width / 2)) * factor,
        y: (y / (rect.height / 2)) * factor,
        z: 30 + i * 8,
        duration: 0.5,
        ease: 'power1.out'
      });
    });
  };

  const handleMouseLeave = () => {
    if (bigCard3DRef.current) {
      gsap.to(bigCard3DRef.current, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    if (card3DRef.current) {
      gsap.to(card3DRef.current, {
        rotationX: 0,
        rotationY: 0,
        z: 0,
        duration: 0.8,
        ease: 'power2.out',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      });
    }

    if (bgImageRef.current) {
      gsap.to(bgImageRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    if (containerRef.current) {
      const pills = containerRef.current.querySelectorAll('.gsap-floating-pill');
      pills.forEach((pill) => {
        gsap.to(pill, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    }
  };

  const handleBooking = () => {
    const bookingElem = document.getElementById('booking');
    if (bookingElem) {
      bookingElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="why-us" className="w-full min-h-screen flex flex-col justify-center bg-white text-slate-900 py-16 sm:py-20 md:py-24 px-5 sm:px-8 lg:px-16 selection:bg-blue-100 selection:text-blue-900 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Main Banner Outer Container matching reference aesthetic */}
        <div 
          ref={containerRef} 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full [perspective:1200px]"
        >
          <div 
            ref={bigCard3DRef}
            className="relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden bg-slate-900 shadow-2xl border border-slate-200/80 min-h-[560px] sm:min-h-[600px] lg:min-h-[640px] flex flex-col justify-between p-5 sm:p-8 lg:p-10 [transform-style:preserve-3d] transition-shadow duration-300"
          >
            {/* Background Dentist Image positioned to right so doctor's face is unblocked */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                ref={bgImageRef}
                src={whyChooseUsImg} 
                alt="Why Choose Dentora - Premium Dentist" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[82%_center] sm:object-[80%_center] scale-105"
              />
            {/* Dark & Soft Light Overlay Gradients for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/25 to-transparent lg:via-slate-950/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />
          </div>

          {/* FLOATING TAG BADGES - DESKTOP / TABLET POSITIONS (Layer z-20) */}
          <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
            {FLOATING_FEATURES.map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * idx,
                    y: {
                      duration: 3 + idx * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  onClick={() => setActiveFeature(feature)}
                  className={`gsap-floating-pill absolute ${feature.positionClass} pointer-events-auto group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-900 text-xs sm:text-xs md:text-sm font-semibold tracking-tight shadow-xl backdrop-blur-md border border-white/90 transition-all duration-300 hover:scale-105 hover:border-[#2073e5] cursor-pointer`}
                >
                  <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2073e5]" />
                  <span>{feature.title}</span>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#2073e5] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* MAIN COMPACT GLASSMOPHISM CARD OVERLAY - LEFT SIDE (Layer z-10) */}
          <div ref={card3DRef} className="relative z-10 my-auto w-full max-w-full md:max-w-[360px] lg:max-w-[420px] [transform-style:preserve-3d]">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="p-5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-xl border border-white/90 shadow-2xl space-y-4 sm:space-y-5"
            >
              {/* Eyebrow badge */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-[2px] bg-[#2073e5] rounded-full" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#2073e5] uppercase font-sans">
                  WHY CHOOSE US
                </span>
              </div>

              {/* Main Headline - Compact and sleek */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#0B2E78] leading-[1.18]">
                Discover why we're your top choice for dental care.
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                At Dentora, we combine high-precision clinical technology with boutique luxury comfort to deliver a seamless, gentle dental experience designed around you.
              </p>

              {/* Action CTA Button */}
              <div className="pt-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBooking}
                  className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#0B2E78] hover:bg-[#2073e5] text-white font-semibold text-xs sm:text-sm tracking-wide shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <span>Book an appointment</span>
                  <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* MOBILE / TABLET FLOATING TAG BADGES STRIP (Layer z-20) */}
          <div className="block md:hidden relative z-20 pt-6 mt-6 border-t border-white/20">
            <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3">
              Key Features (Tap to explore)
            </p>
            <div className="flex flex-wrap gap-2">
              {FLOATING_FEATURES.map((feature) => {
                const IconComp = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-semibold shadow-md border border-white/80 cursor-pointer active:scale-95"
                  >
                    <IconComp className="w-3.5 h-3.5 text-[#2073e5]" />
                    <span>{feature.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>

      {/* FEATURE DETAIL MODAL WHEN CLICKING FLOATING TAGS */}
      <AnimatePresence>
        {activeFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFeature(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 border border-slate-200 my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header Icon & Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2073e5] flex items-center justify-center border border-blue-100 shadow-xs">
                  {React.createElement(activeFeature.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#2073e5] uppercase tracking-wider">
                    Dentora Standard
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B2E78]">
                    {activeFeature.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed font-normal mb-5">
                {activeFeature.fullDetail}
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-[#0B2E78] uppercase tracking-wider">
                  Key Advantages:
                </p>
                {activeFeature.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#2073e5] shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Included in all Dentora consultations
                </span>
                <button
                  onClick={() => {
                    handleBooking();
                    setActiveFeature(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#0B2E78] hover:bg-[#2073e5] text-white font-semibold text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
                >
                  Schedule Visit
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
