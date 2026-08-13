import React from 'react';

interface PatientAvatarProps {
  name: string;
  photoURL?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'Active' | 'Inactive' | 'Blocked' | 'Archived';
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  name,
  photoURL,
  size = 'md',
  status,
}) => {
  const getInitials = (n: string) => {
    if (!n) return 'PT';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-extrabold',
  };

  const dotSizes = {
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-3 h-3 bottom-0 right-0',
    lg: 'w-3.5 h-3.5 bottom-0 right-0',
    xl: 'w-4 h-4 bottom-1 right-1',
  };

  const statusColors = {
    Active: 'bg-emerald-500 border-white',
    Inactive: 'bg-slate-400 border-white',
    Blocked: 'bg-rose-500 border-white',
    Archived: 'bg-amber-500 border-white',
  };

  return (
    <div className="relative inline-block shrink-0">
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          className={`${sizeClasses[size]} rounded-2xl object-cover border border-slate-200/90 shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-[#1d5bd8] to-[#154dbf] text-white font-extrabold flex items-center justify-center border border-slate-200/90 shadow-2xs`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute rounded-full border-2 ${dotSizes[size]} ${statusColors[status]}`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
