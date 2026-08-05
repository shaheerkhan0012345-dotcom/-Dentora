import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, RefreshCcw } from 'lucide-react';
import { UserRole } from '../../types/user';

interface UnauthorizedPageProps {
  currentRole?: UserRole | null;
  requiredRoles?: UserRole[];
  onReturnToAuthorized?: () => void;
  title?: string;
  description?: string;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  currentRole = 'Patient',
  requiredRoles,
  onReturnToAuthorized,
  title = '403 - Access Restricted',
  description = 'Your current user role does not possess the required security permissions to view this clinic system module.',
}) => {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* TOP DECORATIVE ACCENT */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />

        {/* ICON BADGE */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8" />
          <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 text-amber-400 rounded-full border-2 border-white">
            <Lock className="w-3 h-3" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* ROLE METADATA CARD */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-semibold">Your Active Role:</span>
            <span className="font-extrabold text-[#1d5bd8] uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
              {currentRole || 'Unassigned'}
            </span>
          </div>

          {requiredRoles && requiredRoles.length > 0 && (
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
              <span className="text-slate-500 font-semibold">Allowed Roles:</span>
              <span className="font-bold text-slate-700 truncate max-w-[180px]">
                {requiredRoles.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-2">
          {onReturnToAuthorized ? (
            <button
              onClick={onReturnToAuthorized}
              className="w-full py-3 px-4 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Authorized View</span>
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reload Authorized Dashboard</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
