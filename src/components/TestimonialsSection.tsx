import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote, 
  CheckCircle2, 
  ThumbsUp, 
  Instagram, 
  Twitter, 
  Globe 
} from 'lucide-react';

import featuredPatientImg from '../assets/images/patient_featured_smile_1785582162146.jpg';
import femaleAvatarImg from '../assets/images/patient_avatar_female_1785582181551.jpg';
import elenaPatientImg from '../assets/images/patient_featured_elena_1785582200000_1785582334245.jpg';

export interface TestimonialItem {
  id: string;
  leftReview: {
    headline: string;
    quote: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
    treatment: string;
  };
  centerImage: string;
  centerPatientName: string;
  rightReview: {
    headline: string;
    quote: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
    treatment: string;
  };
}

const TESTIMONIALS_SLIDES: TestimonialItem[] = [
  {
    id: 'slide-1',
    leftReview: {
      headline: 'A Seamless Transformation',
      quote: 'The precision and attention to detail at Teethly is unmatched. My composite veneer treatment was completely painless and the natural results far exceeded my highest expectations.',
      author: 'Robert Fox',
      role: 'Invisalign Patient',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      treatment: 'Cosmetic Veneers'
    },
    centerImage: featuredPatientImg,
    centerPatientName: 'Marcus Vance',
    rightReview: {
      headline: 'Gentle & Truly World-Class',
      quote: 'I used to suffer from severe dental anxiety before visiting Dr. Anna. The 3D optical scanning and laser technology made my root canal procedure so fast and completely stress-free.',
      author: 'Sophia Martinez',
      role: 'Verified Patient',
      avatar: femaleAvatarImg,
      rating: 5,
      treatment: 'Endodontics'
    }
  },
  {
    id: 'slide-2',
    leftReview: {
      headline: 'Confidence Restored Completely',
      quote: 'After getting my 3D guided dental implants here, I can chew naturally again without any discomfort. The boutique care and warmth from the staff made all the difference.',
      author: 'David Chen',
      role: 'Implant Patient',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      treatment: '3D Dental Implants'
    },
    centerImage: elenaPatientImg,
    centerPatientName: 'Elena Rostova',
    rightReview: {
      headline: 'Flawless Laser Whitening',
      quote: 'In just one 45-minute session, my teeth went 7 shades brighter with zero sensitivity. Teethly Dental Care is hands-down the premier luxury dental clinic in the city.',
      author: 'Claire Jenkins',
      role: 'Laser Whitening',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      treatment: 'Cold-Laser Whitening'
    }
  }
];

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsContainerRef.current) return;

    const ctx = gsap.context(() => {
      const testimonialCards = cardsContainerRef.current?.querySelectorAll('.gsap-testimonial-card');
      if (testimonialCards && testimonialCards.length > 0) {
        gsap.fromTo(
          testimonialCards,
          {
            opacity: 0,
            y: 50,
            scale: 0.92
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 82%',
              once: true
            }
          }
        );
      }
    }, cardsContainerRef);

    return () => ctx.revert();
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS_SLIDES.length) % TESTIMONIALS_SLIDES.length);
  };

  const activeSlide = TESTIMONIALS_SLIDES[currentIndex];

  return (
    <section id="testimonials" className="w-full min-h-screen flex flex-col justify-center bg-white text-slate-900 py-16 sm:py-20 md:py-24 px-5 sm:px-8 lg:px-16 selection:bg-blue-100 selection:text-blue-900 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Top Eyebrow Pill Badge - Exact match to reference badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-5"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-xs tracking-wide shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2073e5]" />
            Testimonials
          </span>
        </motion.div>

        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B2E78] leading-[1.12]">
            Real Smiles, Real Results From Our Community
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#5C6984] leading-relaxed font-normal max-w-2xl mx-auto">
            Delivering excellence through precision care, modern innovation, and a commitment to your long-term dental wellness.
          </p>
        </motion.div>

        {/* Testimonials 3-Card Trio Layout */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              ref={cardsContainerRef}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              
              {/* LEFT REVIEW CARD */}
              <div className="gsap-testimonial-card lg:col-span-4 bg-[#FAFAFC] rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(activeSlide.leftReview.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B2E78] tracking-tight">
                    {activeSlide.leftReview.headline}
                  </h3>

                  {/* Testimonial Quote */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    "{activeSlide.leftReview.quote}"
                  </p>
                </div>

                {/* Author Info Footer */}
                <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activeSlide.leftReview.avatar} 
                      alt={activeSlide.leftReview.author} 
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {activeSlide.leftReview.author}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {activeSlide.leftReview.role}
                      </p>
                    </div>
                  </div>

                  {/* Verified Badge Icons */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-[#2073e5]" />
                  </div>
                </div>
              </div>

              {/* CENTER FEATURED PATIENT SMILE PHOTO */}
              <div className="gsap-testimonial-card lg:col-span-4 relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[400px] shadow-lg border border-slate-200/80 group">
                <img 
                  src={activeSlide.centerImage} 
                  alt={activeSlide.centerPatientName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-104"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                {/* Overlay Name Tag */}
                <div className="absolute bottom-5 left-6 right-6 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      Featured Smile
                    </span>
                    <p className="text-sm font-bold text-white mt-1">
                      {activeSlide.centerPatientName}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* RIGHT REVIEW CARD */}
              <div className="gsap-testimonial-card lg:col-span-4 bg-[#FAFAFC] rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(activeSlide.rightReview.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B2E78] tracking-tight">
                    {activeSlide.rightReview.headline}
                  </h3>

                  {/* Testimonial Quote */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    "{activeSlide.rightReview.quote}"
                  </p>
                </div>

                {/* Author Info Footer */}
                <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activeSlide.rightReview.avatar} 
                      alt={activeSlide.rightReview.author} 
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {activeSlide.rightReview.author}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {activeSlide.rightReview.role}
                      </p>
                    </div>
                  </div>

                  {/* Verified Badge Icons */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-[#2073e5]" />
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* BOTTOM CENTER NAVIGATION CONTROLS - Matching reference round arrows */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={handlePrev}
              aria-label="Previous Testimonial"
              className="w-11 h-11 rounded-full bg-white border border-slate-300/80 hover:border-[#2073e5] text-slate-700 hover:text-[#2073e5] flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-105 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-slate-400 tracking-wider">
              {currentIndex + 1} / {TESTIMONIALS_SLIDES.length}
            </span>

            <button
              onClick={handleNext}
              aria-label="Next Testimonial"
              className="w-11 h-11 rounded-full bg-white border border-slate-300/80 hover:border-[#2073e5] text-slate-700 hover:text-[#2073e5] flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-105 cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
