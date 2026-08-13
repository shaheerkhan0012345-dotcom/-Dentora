import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Sparkles, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock 
} from 'lucide-react';

import footerDentistImg from '../assets/images/footer_dentist_portrait_1785583259738.jpg';
import { DentoraLogo } from './common/DentoraLogo';

export const FooterSection: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const watermarkText = footerRef.current?.querySelector('.gsap-watermark-text');
      const doctorCard = footerRef.current?.querySelector('.gsap-footer-doctor');

      if (watermarkText) {
        gsap.fromTo(
          watermarkText,
          { letterSpacing: '0.02em', opacity: 0.1 },
          {
            letterSpacing: '0.22em',
            opacity: 0.3,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (doctorCard) {
        gsap.fromTo(
          doctorCard,
          { opacity: 0, x: 40, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer ref={footerRef} className="relative w-full bg-[#FAFAFC] text-slate-900 pt-16 sm:pt-20 md:pt-24 pb-8 px-5 sm:px-8 lg:px-16 overflow-hidden border-t border-slate-200/80 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* TOP MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-12 sm:mb-16">
          
          {/* LEFT 5 COLUMNS: Headline & Social Links */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B2E78] leading-[1.12]">
                Get The Smile <br className="hidden sm:inline" />
                You've Always <br className="hidden sm:inline" />
                Wanted
              </h2>
            </motion.div>

            {/* Social Media Pill Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 pt-2"
            >
              <a 
                href="#instagram" 
                aria-label="Instagram"
                className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#2073e5] hover:border-[#2073e5] hover:bg-blue-50/50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-108"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a 
                href="#facebook" 
                aria-label="Facebook"
                className="w-11 h-11 rounded-full bg-[#0B2E78] text-white hover:bg-[#2073e5] flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-108"
              >
                <Facebook className="w-5 h-5 fill-white" />
              </a>

              <a 
                href="#twitter" 
                aria-label="Twitter X"
                className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#2073e5] hover:border-[#2073e5] hover:bg-blue-50/50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-108"
              >
                <Twitter className="w-5 h-5" />
              </a>

              <a 
                href="#linkedin" 
                aria-label="LinkedIn"
                className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#2073e5] hover:border-[#2073e5] hover:bg-blue-50/50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-108"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </motion.div>
          </div>

          {/* RIGHT 7 COLUMNS: Navigation Link Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 pt-2 lg:pt-4">
            
            {/* Column 1: Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Company
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-600">
                <li>
                  <button 
                    onClick={() => scrollToSection('about')} 
                    className="hover:text-[#2073e5] transition-colors cursor-pointer text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('services')} 
                    className="hover:text-[#2073e5] transition-colors cursor-pointer text-left"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('why-us')} 
                    className="hover:text-[#2073e5] transition-colors cursor-pointer text-left"
                  >
                    Why Choose Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('testimonials')} 
                    className="hover:text-[#2073e5] transition-colors cursor-pointer text-left"
                  >
                    Testimonials
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('booking')} 
                    className="hover:text-[#2073e5] transition-colors cursor-pointer text-left"
                  >
                    Instant Booking
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Services */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Services
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-600">
                <li>
                  <a href="#services" className="hover:text-[#2073e5] transition-colors">
                    Cavity Protection
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#2073e5] transition-colors">
                    Root Canal Treatment
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#2073e5] transition-colors">
                    Oral Surgery & Implants
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#2073e5] transition-colors">
                    Cosmetic Veneers
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#2073e5] transition-colors">
                    Cold-Laser Whitening
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Hours */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Clinic Care
              </h3>
              <div className="space-y-3 text-xs sm:text-sm font-medium text-slate-600">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#2073e5] shrink-0 mt-0.5" />
                  <span>+1 (800) 450-8120</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#2073e5] shrink-0 mt-0.5" />
                  <span>care@teethlyclinic.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#2073e5] shrink-0 mt-0.5" />
                  <span>Mon-Fri: 8am - 7pm<br />Sat: 9am - 3pm</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* MIDDLE WATERMARK LOGO BRAND BANNER WITH PROPERLY VISIBLE DOCTOR PORTRAIT */}
        <div className="relative mt-10 mb-6 border-y border-slate-200/80 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-visible">
          
          {/* GIANT WATERMARK TEXT & LOGO ICON */}
          <div className="flex items-center gap-4 sm:gap-6 select-none opacity-90 hover:opacity-100 transition-opacity duration-500 py-2">
            <DentoraLogo size="2xl" showTagline taglineText="Dental Practice Platform" />
          </div>

          {/* DENTIST PORTRAIT CARD ON THE RIGHT (Fully Visible & Unclipped) */}
          <div 
            className="gsap-footer-doctor flex items-center gap-4 bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/90 z-20 shrink-0"
          >
            <div className="w-20 h-24 sm:w-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
              <img 
                src={footerDentistImg} 
                alt="Teethly Lead Specialist" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            
            <div className="pr-3 sm:pr-5 space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2073e5] font-bold text-[10px] uppercase tracking-wider">
                Lead Specialist
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#0B2E78] tracking-tight">
                Dr. Marcus Vance
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Chief Aesthetic Surgeon
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400 tracking-wider">
          <p>
            COPYRIGHT © 2026 | ALL RIGHTS RESERVED BY <span className="text-slate-700">TEETHLY CLINIC</span>
          </p>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-700 transition-colors">Terms of Service</a>
            <a href="#sitemap" className="hover:text-slate-700 transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
