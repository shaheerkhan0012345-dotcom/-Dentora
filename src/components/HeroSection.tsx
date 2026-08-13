import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Calendar, Sparkles, Menu, X, ChevronRight, User } from 'lucide-react';
import gsap from 'gsap';
import { DentoraLogo } from './common/DentoraLogo';

interface TransparentVideoProps {
  src: string;
  className?: string;
}

const TransparentVideo: React.FC<TransparentVideoProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicit play trigger to bypass autoplay policies
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay or video load error:", err);
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    const render = () => {
      if (video && !video.paused && !video.ended && video.videoWidth > 0) {
        if (!hasFirstFrame) {
          setHasFirstFrame(true);
        }

        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Ultra-fast 32-bit Uint32Array pixel loop for 60fps execution on all GPUs
            const data32 = new Uint32Array(frame.data.buffer);
            const len = data32.length;

            for (let i = 0; i < len; i++) {
              const pixel = data32[i];
              // Extract RGB components in little endian order
              const r = pixel & 0xff;
              const g = (pixel >> 8) & 0xff;
              const b = (pixel >> 16) & 0xff;

              const maxBright = Math.max(r, g, b);

              if (maxBright < 28) {
                // Completely dark/black background -> 100% transparent
                data32[i] = 0;
              } else if (maxBright < 75) {
                // Soft edge feathering so glass tooth anti-aliasing looks pristine
                const alpha = Math.floor(((maxBright - 28) / 47) * 255);
                data32[i] = (pixel & 0x00ffffff) | (alpha << 24);
              }
            }

            ctx.putImageData(frame, 0, 0);
          } catch (err) {
            // CORS or canvas security error -> switch to CSS blend mode fallback so video is visible!
            setUseCanvasFallback(true);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [src, hasFirstFrame]);

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[460px] lg:min-h-[580px] flex items-center justify-center overflow-hidden">
      {/* Video element - kept active in DOM so browser decodes frames for real-time canvas chroma keying */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onLoadedData={() => setHasFirstFrame(true)}
        onTimeUpdate={() => setHasFirstFrame(true)}
        onError={() => setVideoError(true)}
        className={
          useCanvasFallback
            ? `w-full h-full max-h-[960px] object-contain pointer-events-none transition-opacity duration-300 mix-blend-screen ${className || ''}`
            : `absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0 -z-10`
        }
      />

      {/* Instant 3D Glass Tooth Artwork displayed at 0ms until video frame plays */}
      {!hasFirstFrame && !videoError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, y: [-8, 8, -8] }}
          transition={{
            opacity: { duration: 0.15 },
            scale: { duration: 0.25 },
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
        >
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] flex items-center justify-center">
            {/* Radiant Glass Glow Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/25 via-sky-400/35 to-cyan-300/20 rounded-full blur-3xl animate-pulse" />
            
            {/* Instant Floating 3D Glass Tooth Vector */}
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full drop-shadow-[0_20px_45px_rgba(32,115,229,0.4)] relative z-10"
            >
              <defs>
                <linearGradient id="glassToothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#2073e5" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="glassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Main Tooth Shell */}
              <path
                d="M 50 8 C 30 8, 16 18, 8 36 C 0 54, 2 78, 14 96 C 19 104, 27 112, 33 116 C 36 118, 41 116, 43 110 C 46 96, 47 80, 50 66 C 53 80, 54 96, 57 110 C 59 116, 64 118, 67 116 C 73 112, 81 104, 86 96 C 98 78, 100 54, 92 36 C 84 18, 70 8, 50 8 Z"
                fill="url(#glassToothGrad)"
                stroke="#93c5fd"
                strokeWidth="1.8"
              />

              {/* Inner Root Refraction */}
              <path
                d="M 50 32 C 38 32, 30 39, 26 49 C 22 59, 24 72, 30 81 C 34 87, 40 93, 43 97 C 45 100, 47 98, 48 93 C 49 87, 50 77, 50 66 C 50 77, 51 87, 52 93 C 53 98, 55 100, 57 97 C 60 93, 66 87, 70 81 C 76 72, 78 59, 74 49 C 70 39, 62 32, 50 32 Z"
                fill="#0b2e78"
                fillOpacity="0.2"
                stroke="#60a5fa"
                strokeWidth="1"
              />

              {/* Specular Surface Gloss */}
              <path
                d="M 30 16 C 38 12, 62 12, 70 16 C 77 20, 80 28, 77 36 C 72 28, 60 22, 50 22 C 40 22, 28 28, 23 36 C 20 28, 23 20, 30 16 Z"
                fill="url(#glassHighlight)"
              />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Background-Free Canvas Output */}
      {!useCanvasFallback && !videoError && (
        <canvas
          ref={canvasRef}
          className={`w-full h-full max-h-[960px] object-contain pointer-events-none relative z-10 scale-135 sm:scale-150 lg:scale-165 transition-transform duration-300 ${className || ''}`}
        />
      )}

      {/* SVG Animated Tooth Backup if video fails to load completely */}
      {videoError && (
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-blue-500/10 to-cyan-400/20 rounded-full border border-blue-200/50 backdrop-blur-xl shadow-2xl relative z-10"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-teal-300 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
          </div>
          <span className="mt-3 text-xs font-bold text-[#0B2E78] tracking-widest uppercase">Teethly 3D Smile</span>
        </motion.div>
      )}
    </div>
  );
};

import { UserProfile } from '../types';

interface HeroSectionProps {
  onOpenDashboard?: () => void;
  user?: UserProfile | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDashboard, user }) => {
  const videoUrl = "https://res.cloudinary.com/dkpv0eax8/video/upload/v1785525253/Blue_glass_tooth_floating_white_202607311213_dsp3fy.mp4";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroContainerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.gsap-hero-video',
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.1)' },
        0
      )
      .fromTo(
        '.gsap-hero-title',
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08 },
        0.05
      )
      .fromTo(
        '.gsap-hero-subtitle',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.25
      );
    }, heroContainerRef);

    return () => ctx.revert();
  }, []);

  // Cursor motion values relative to section center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for reactive motion
  const springConfig = { damping: 28, stiffness: 100, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax offsets for background aurora blobs
  const blob1X = useTransform(smoothMouseX, (val) => val * 0.15);
  const blob1Y = useTransform(smoothMouseY, (val) => val * 0.15);

  const blob2X = useTransform(smoothMouseX, (val) => val * -0.2);
  const blob2Y = useTransform(smoothMouseY, (val) => val * -0.2);

  const blob3X = useTransform(smoothMouseX, (val) => val * 0.12);
  const blob3Y = useTransform(smoothMouseY, (val) => val * 0.12);

  // Cursor spotlight position
  const spotlightX = useTransform(smoothMouseX, (val) => val);
  const spotlightY = useTransform(smoothMouseY, (val) => val);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const navLinks = [
    { label: 'About us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Specialists', href: '#specialists' },
    { label: 'Contact', href: '#booking' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <section 
      ref={heroContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-white flex flex-col justify-between overflow-hidden m-0 p-0 selection:bg-blue-100 selection:text-blue-900 isolate"
    >
      
      {/* LAYER 0: Animated Blue Aurora Background Effect with Cursor Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Interactive Cursor Spotlight Glow */}
        <motion.div
          style={{
            x: spotlightX,
            y: spotlightY,
            translateX: '-50%',
            translateY: '-50%',
            left: '50%',
            top: '50%',
          }}
          className="absolute w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-r from-blue-400/25 via-cyan-300/20 to-sky-400/25 blur-[80px] sm:blur-[100px] transition-opacity duration-300"
        />

        {/* Aurora Blob 1 - Top Left Deep Blue & Cyan */}
        <motion.div
          style={{ x: blob1X, y: blob1Y }}
          animate={{
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute -top-[20%] -left-[10%] w-[85vw] sm:w-[65vw] h-[85vw] sm:h-[65vw] rounded-full bg-gradient-to-tr from-blue-600/20 via-sky-400/25 to-indigo-500/15 blur-[100px] sm:blur-[130px]"
        />

        {/* Aurora Blob 2 - Center Floating Sky & Cyan */}
        <motion.div
          style={{ x: blob2X, y: blob2Y }}
          animate={{
            scale: [1, 0.9, 1.12, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute top-[15%] left-[10%] sm:left-[20%] w-[75vw] sm:w-[55vw] h-[75vw] sm:h-[55vw] rounded-full bg-gradient-to-r from-sky-300/30 via-blue-500/20 to-teal-300/15 blur-[110px] sm:blur-[140px]"
        />

        {/* Aurora Blob 3 - Right & Bottom Royal Blue Aurora Glow */}
        <motion.div
          style={{ x: blob3X, y: blob3Y }}
          animate={{
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute -bottom-[15%] -right-[5%] w-[80vw] sm:w-[60vw] h-[80vw] sm:h-[60vw] rounded-full bg-gradient-to-tl from-indigo-600/20 via-blue-400/25 to-cyan-300/15 blur-[90px] sm:blur-[120px]"
        />

        {/* Subtle radial sheen overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Top Navigation Header (Layer z-40) */}
      <header className="relative z-40 w-full px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7 pb-2 flex items-center justify-between">
        {/* Logo - Far Left */}
        <div className="flex items-center cursor-pointer">
          <DentoraLogo size="md" />
        </div>

        {/* Middle Nav Links - Centered (Tablet / Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[15px] font-medium tracking-[-0.01em] text-[#102B72]">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-[#2073e5] transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Dashboard Nav Item - Far Right (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
              if (onOpenDashboard) onOpenDashboard();
            }}
            className="px-5 py-2.5 rounded-full bg-[#0B2E78] hover:bg-[#2073e5] text-white font-semibold text-[14px] transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer group"
          >
            {user ? (
              <>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover ring-2 ring-white/50" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                <span>{user.name.split(' ')[0]}'s Portal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </>
            ) : (
              <>
                <span>Portal Dashboard</span>
                <Sparkles className="w-3.5 h-3.5 text-sky-300 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Mobile / Tablet Menu Button Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 rounded-xl bg-blue-50/80 text-[#0B2E78] hover:bg-blue-100 transition-colors border border-blue-100/80 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden absolute top-16 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl p-6 flex flex-col space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between text-base font-semibold text-[#0B2E78] hover:text-[#2073e5] py-2 border-b border-slate-100 transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="flex items-center justify-between text-base font-semibold text-[#2073e5] py-2 transition-colors w-full text-left cursor-pointer"
              >
                <span>{user ? `${user.name.split(' ')[0]}'s Patient Portal` : 'Patient Dashboard'}</span>
                <ChevronRight className="w-4 h-4 text-[#2073e5]" />
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-[#2073e5] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Schedule a Visit</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO MAIN BODY LAYOUT */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-2 relative">
          
          {/* LEFT COLUMN: Main Hero Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-5 text-left z-20"
          >
            <h1 className="text-[32px] sm:text-[46px] md:text-[52px] lg:text-[40px] xl:text-[50px] 2xl:text-[58px] font-bold leading-[1.08] text-[#0B2E78] tracking-[-0.03em] select-none">
              <span className="gsap-hero-title block pl-[8%] sm:pl-[12%] lg:pl-[10%]">Not all smiles</span>
              <span className="gsap-hero-title block">need fixing, some</span>
              <span className="gsap-hero-title block">need vision</span>
            </h1>

            <p className="gsap-hero-subtitle text-[14px] sm:text-[16px] lg:text-[15px] xl:text-[17px] text-[#5C6984] leading-[1.55] font-normal max-w-[360px] sm:max-w-[420px] tracking-[-0.01em]">
              We're a premium orthodontic and aesthetic clinic crafting confident smiles for those who settle for nothing ordinary.
            </p>
          </motion.div>

          {/* CENTER COLUMN: Floating 3D Tooth Video */}
          <div className="lg:col-span-4 flex items-center justify-center relative z-10 my-2 lg:my-0 pointer-events-none">
            <div className="gsap-hero-video w-full max-w-[440px] sm:max-w-[580px] lg:max-w-[640px] xl:max-w-[720px] h-[440px] sm:h-[580px] lg:h-[640px] flex items-center justify-center">
              <TransparentVideo src={videoUrl} />
            </div>
          </div>

          {/* RIGHT COLUMN: Luxury Care & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-3 flex flex-col justify-center items-start lg:items-end text-left lg:text-right z-20 space-y-4 sm:space-y-5"
          >
            <h2 className="text-[26px] sm:text-[36px] md:text-[40px] lg:text-[34px] xl:text-[42px] font-bold leading-[1.08] text-[#0B2E78] tracking-[-0.03em]">
              Luxury care<br className="hidden lg:block" />
              made personal
            </h2>

            <a
              href="#booking"
              className="inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#2073e5] hover:bg-[#1862cd] text-white font-semibold text-[14px] sm:text-[15px] tracking-[-0.01em] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer pointer-events-auto"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Schedule a visit</span>
            </a>
          </motion.div>

        </div>
      </div>

      {/* Infinite Marquee Banner at the end of Hero Section - GPU Hardware Accelerated CSS */}
      <div className="relative z-30 w-full overflow-hidden bg-transparent py-3 sm:py-5 lg:py-6 lg:-mt-24 mb-2 sm:mb-4 lg:mb-6 pointer-events-auto select-none">
        <div className="flex w-max animate-marquee-smooth">
          <div className="flex items-center whitespace-nowrap gap-6 sm:gap-10 lg:gap-16 pr-6 sm:pr-10 lg:pr-16">
            {[
              "Teeth Whitening",
              "Dental Implants",
              "Invisalign",
              "Root Canal",
              "Veneers",
              "Smile Design",
              "Dental Cleaning",
              "Cosmetic Dentistry",
              "Braces",
              "Emergency Care",
              "Teeth Whitening",
              "Dental Implants",
              "Invisalign",
              "Root Canal",
              "Veneers",
              "Smile Design",
              "Dental Cleaning",
              "Cosmetic Dentistry",
              "Braces",
              "Emergency Care",
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 sm:gap-5 group cursor-pointer transition-colors duration-200"
              >
                <span className="text-gray-300 group-hover:text-[#2073e5] font-bold text-sm sm:text-lg md:text-xl lg:text-2xl transition-colors duration-200">
                  •
                </span>
                <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-bold tracking-wider sm:tracking-widest text-slate-400 group-hover:text-[#2073e5] uppercase font-sans transition-colors duration-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
          {/* Duplicate block for 100% seamless infinite looping */}
          <div className="flex items-center whitespace-nowrap gap-6 sm:gap-10 lg:gap-16 pr-6 sm:pr-10 lg:pr-16">
            {[
              "Teeth Whitening",
              "Dental Implants",
              "Invisalign",
              "Root Canal",
              "Veneers",
              "Smile Design",
              "Dental Cleaning",
              "Cosmetic Dentistry",
              "Braces",
              "Emergency Care",
              "Teeth Whitening",
              "Dental Implants",
              "Invisalign",
              "Root Canal",
              "Veneers",
              "Smile Design",
              "Dental Cleaning",
              "Cosmetic Dentistry",
              "Braces",
              "Emergency Care",
            ].map((item, idx) => (
              <div 
                key={`dup-${idx}`} 
                className="flex items-center gap-3 sm:gap-5 group cursor-pointer transition-colors duration-200"
              >
                <span className="text-gray-300 group-hover:text-[#2073e5] font-bold text-sm sm:text-lg md:text-xl lg:text-2xl transition-colors duration-200">
                  •
                </span>
                <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-bold tracking-wider sm:tracking-widest text-slate-400 group-hover:text-[#2073e5] uppercase font-sans transition-colors duration-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

