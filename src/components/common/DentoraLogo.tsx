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
    xs: 'h-5',
    sm: 'h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
    xl: 'h-12 sm:h-14',
    '2xl': 'h-16 sm:h-18',
    '3xl': 'h-20 sm:h-24',
    custom: '',
  };

  const heightClass = sizeMap[size];
  const isWhite = variant === 'dark' || variant === 'white';
  const textColor = isWhite ? 'text-white' : 'text-blue-600';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/teethly.png"
        alt="Teethly Logo"
        className={`${heightClass || 'h-9'} w-auto object-contain shrink-0`}
      />


      {showTagline && (
        <span
          className={`text-[11px] font-extrabold tracking-widest uppercase border-l-2 pl-3 ml-1 hidden sm:inline-block ${
            isWhite
              ? 'text-blue-200 border-blue-300/40'
              : 'text-blue-600 border-blue-600/30'
          }`}
        >
          {taglineText}
        </span>
      )}
    </div>
  );
};

export default DentoraLogo;
