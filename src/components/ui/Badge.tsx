import React from 'react';

export type BadgeVariant = 'emerald' | 'sky' | 'amber' | 'rose' | 'slate' | 'indigo' | 'teal' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-[#1d5bd8]/10 text-[#1d5bd8] border-[#1d5bd8]/20',
    teal: 'bg-[#008080]/10 text-[#006666] border-[#008080]/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  };

  const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-bold',
    lg: 'text-xs px-3 py-1 gap-1.5 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border whitespace-nowrap transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
