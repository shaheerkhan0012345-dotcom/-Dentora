import React from 'react';
import { DentoraLogo } from './DentoraLogo';

interface ClinicLoaderProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export const ClinicLoader: React.FC<ClinicLoaderProps> = ({
  message = 'Initializing Clinical Workspace',
  subtext = 'Connecting securely to Teethly database...',
  fullScreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-xs mx-auto">
      {/* LOGO WITH LIGHT BLUE GLOW ANIMATION */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Soft light blue glow ring */}
        <div className="absolute w-28 h-28 rounded-full bg-blue-100/70 animate-ping opacity-60" />
        <div className="absolute w-20 h-20 rounded-full bg-sky-100/80 animate-pulse blur-md" />
        
        {/* Main Logo */}
        <div className="relative z-10 p-2 transform transition-transform animate-[pulse_2.2s_easeInOut_infinite]">
          <DentoraLogo size="xl" />
        </div>
      </div>

      {/* PRIMARY MESSAGE */}
      <h3 className="text-sm font-bold text-[#0052cc] tracking-tight mb-1">
        {message}
      </h3>

      {/* SUBTEXT */}
      <p className="text-[11px] text-sky-700/70 font-medium leading-relaxed mb-5">
        {subtext}
      </p>

      {/* LIGHT BLUE PROGRESS BAR */}
      <div className="w-40 h-1 bg-sky-100 rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 bg-[#0052cc] w-1/2 rounded-full"
          style={{
            animation: 'teethlyProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
      </div>

      {/* INLINE ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes teethlyProgress {
          0% { left: -50%; width: 50%; }
          50% { left: 25%; width: 60%; }
          100% { left: 100%; width: 50%; }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl p-4 sm:p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

