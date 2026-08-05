import React from 'react';

interface DentoraLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
  variant?: 'light' | 'dark' | 'white' | 'auto';
  showTagline?: boolean;
  taglineText?: string;
}

export const DentoraLogo: React.FC<DentoraLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showTagline = false,
  taglineText = 'Dental Specialist Practice',
}) => {
  const sizeMap = {
    xs: 'h-4 sm:h-5',
    sm: 'h-6 sm:h-7',
    md: 'h-7 sm:h-8',
    lg: 'h-9 sm:h-10',
    xl: 'h-11 sm:h-12',
    '2xl': 'h-14 sm:h-16',
    '3xl': 'h-18 sm:h-22',
    custom: '',
  };

  const heightClass = sizeMap[size];

  // Determine logo color
  const colorHex = variant === 'dark' || variant === 'white' ? '#ffffff' : '#0052cc';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 410 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heightClass || 'h-10'} w-auto overflow-visible shrink-0 transition-transform`}
      >
        <style>{`
          .brand-text-v2 {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-weight: 900;
            font-size: 78px;
            letter-spacing: 1px;
          }
        `}</style>
        
        {/* DENT */}
        <text x="0" y="70" className="brand-text-v2" fill={colorHex}>
          DENT
        </text>

        {/* TOOTH ICON WITH TRANSPARENT HOLLOW INNER ROOT (REPLACING 'O') */}
        <g transform="translate(222, 6)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M32 2 C20 2, 11 8, 5 18 C0 28, 1 43, 7 54 C10 60, 14 67, 17 75 C19 81, 22 87, 25 91 C26 93, 29 93, 30 90 C32 81, 34 71, 36 60 C37 54, 39 54, 40 60 C42 71, 44 81, 46 90 C47 93, 50 93, 51 91 C54 87, 57 81, 59 75 C62 67, 66 60, 69 54 C75 43, 76 28, 71 18 C65 8, 56 2, 44 2 Z M38 22 C30 22, 23 27, 20 34 C17 41, 18 50, 22 56 C24 60, 27 65, 29 70 C31 74, 33 79, 34 82 C34.5 83.5, 35.5 83.5, 36 82 C37 79, 39 74, 41 70 C43 65, 46 60, 48 56 C52 50, 53 41, 50 34 C47 27, 40 22, 38 22 Z"
            fill={colorHex}
          />
        </g>

        {/* RA */}
        <text x="300" y="70" className="brand-text-v2" fill={colorHex}>
          RA
        </text>
      </svg>

      {showTagline && (
        <span
          className={`text-[11px] font-extrabold tracking-widest uppercase border-l-2 pl-3 ml-1 hidden sm:inline-block ${
            variant === 'dark' || variant === 'white'
              ? 'text-blue-200 border-blue-300/40'
              : 'text-[#0052cc] border-[#0052cc]/30'
          }`}
        >
          {taglineText}
        </span>
      )}
    </div>
  );
};

export default DentoraLogo;
