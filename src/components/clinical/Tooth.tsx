import React from 'react';
import { ToothRecord, ToothCondition } from '../../types/clinical';

interface ToothProps {
  tooth: ToothRecord;
  isSelected: boolean;
  onClick: () => void;
  isLowerArch?: boolean;
}

export const CONDITION_COLORS: Record<
  ToothCondition,
  { bg: string; text: string; border: string; dot: string }
> = {
  Healthy: { bg: 'bg-[#f8fafc]', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-emerald-500' },
  Decayed: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-600' },
  Missing: { bg: 'bg-slate-100', text: 'text-slate-400 line-through opacity-60', border: 'border-slate-300', dot: 'bg-slate-400' },
  Filled: { bg: 'bg-blue-50', text: 'text-[#1d5bd8]', border: 'border-blue-300', dot: 'bg-[#1d5bd8]' },
  'Root Canal': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-600' },
  Crown: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  Bridge: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  Implant: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-600' },
  Extraction: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-400', dot: 'bg-red-700' },
  Fractured: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-600' },
  Sealant: { bg: 'bg-teal-50', text: 'text-[#006666]', border: 'border-teal-300', dot: 'bg-[#008080]' },
  Whitening: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300', dot: 'bg-sky-400' },
  Scaling: { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-300', dot: 'bg-lime-600' },
  Orthodontic: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-600' },
  'Temporary Crown': { bg: 'bg-amber-100/60', text: 'text-amber-900', border: 'border-amber-400', dot: 'bg-amber-600' },
};

export const Tooth: React.FC<ToothProps> = ({
  tooth,
  isSelected,
  onClick,
  isLowerArch = false,
}) => {
  const primaryCondition = tooth.conditions[0] || 'Healthy';
  const colorStyle = CONDITION_COLORS[primaryCondition] || CONDITION_COLORS.Healthy;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative p-1.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-between min-w-[38px] sm:min-w-[46px] h-20 sm:h-24 ${
        colorStyle.bg
      } ${colorStyle.border} ${
        isSelected
          ? 'ring-2 ring-[#1d5bd8] shadow-md scale-105 z-10 font-bold'
          : 'hover:scale-102 hover:shadow-xs'
      }`}
      title={`Tooth #${tooth.fdiCode} - ${tooth.name} (${tooth.conditions.join(', ')})`}
    >
      {/* TOP NUMBER IF UPPER ARCH */}
      {!isLowerArch && (
        <span className="text-[10px] sm:text-[11px] font-black text-slate-700 font-mono tracking-tighter">
          #{tooth.fdiCode}
        </span>
      )}

      {/* TOOTH GRAPHICAL SCHEMATIC SURFACES (5 SURFACES: M, O, D, B, L) */}
      <div className="relative w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center my-0.5">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Outer Tooth Shape */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            rx="20"
            className={`fill-white stroke-slate-300 stroke-[4] ${
              tooth.conditions.includes('Missing') ? 'stroke-dashed stroke-slate-400' : ''
            }`}
          />
          {/* Occlusal / Incisal Center */}
          <rect
            x="32"
            y="32"
            width="36"
            height="36"
            rx="6"
            className={`${
              tooth.surfaces?.Occlusal
                ? 'fill-rose-500'
                : tooth.conditions.includes('Filled')
                ? 'fill-blue-500'
                : tooth.conditions.includes('Root Canal')
                ? 'fill-purple-500'
                : 'fill-slate-100'
            } stroke-slate-300 stroke-[2]`}
          />
          {/* Mesial Surface (Left) */}
          <path
            d="M 5 25 L 32 32 L 32 68 L 5 75 Z"
            className={`${
              tooth.surfaces?.Mesial ? 'fill-rose-400' : 'fill-slate-50'
            } stroke-slate-300 stroke-[2]`}
          />
          {/* Distal Surface (Right) */}
          <path
            d="M 95 25 L 68 32 L 68 68 L 95 75 Z"
            className={`${
              tooth.surfaces?.Distal ? 'fill-rose-400' : 'fill-slate-50'
            } stroke-slate-300 stroke-[2]`}
          />
          {/* Buccal Surface (Top) */}
          <path
            d="M 25 5 L 32 32 L 68 32 L 75 5 Z"
            className={`${
              tooth.surfaces?.Buccal ? 'fill-rose-400' : 'fill-slate-50'
            } stroke-slate-300 stroke-[2]`}
          />
          {/* Lingual Surface (Bottom) */}
          <path
            d="M 25 95 L 32 68 L 68 68 L 75 95 Z"
            className={`${
              tooth.surfaces?.Lingual ? 'fill-rose-400' : 'fill-slate-50'
            } stroke-slate-300 stroke-[2]`}
          />

          {/* CROWN OVERLAY ICON */}
          {tooth.conditions.includes('Crown') && (
            <path
              d="M 20 20 L 35 40 L 50 20 L 65 40 L 80 20 L 80 80 L 20 80 Z"
              className="fill-amber-400/80 stroke-amber-700 stroke-[3]"
            />
          )}

          {/* IMPLANT SCREW SYMBOL */}
          {tooth.conditions.includes('Implant') && (
            <g className="stroke-cyan-800 stroke-[5] fill-none">
              <line x1="50" y1="10" x2="50" y2="90" />
              <line x1="30" y1="30" x2="70" y2="30" />
              <line x1="35" y1="50" x2="65" y2="50" />
              <line x1="40" y1="70" x2="60" y2="70" />
            </g>
          )}

          {/* MISSING CROSS OUT */}
          {tooth.conditions.includes('Missing') && (
            <path d="M 10 10 L 90 90 M 90 10 L 10 90" className="stroke-slate-400 stroke-[8]" />
          )}
        </svg>

        {/* PRIMARY CONDITION STATUS DOT */}
        <span
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${colorStyle.dot}`}
        />
      </div>

      {/* CONDITION BADGE */}
      <span
        className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded-full truncate max-w-full ${colorStyle.text}`}
      >
        {primaryCondition === 'Healthy' ? 'OK' : primaryCondition.slice(0, 7)}
      </span>

      {/* BOTTOM NUMBER IF LOWER ARCH */}
      {isLowerArch && (
        <span className="text-[10px] sm:text-[11px] font-black text-slate-700 font-mono tracking-tighter">
          #{tooth.fdiCode}
        </span>
      )}
    </button>
  );
};
