import React from 'react';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';
import { UserRole } from '../../types/user';

interface RoleVisibilityBannerProps {
  currentRole: UserRole;
}

export const RoleVisibilityBanner: React.FC<RoleVisibilityBannerProps> = ({ currentRole }) => {
  const roleDescriptions: Record<UserRole, { title: string; desc: string; bg: string }> = {
    'Super Admin': {
      title: 'SaaS Master Platform Director',
      desc: 'Global multi-clinic tenant management, SaaS subscription tiers, tenant health monitoring, and system-wide audit controls.',
      bg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border-purple-800',
    },
    'Clinic Owner': {
      title: 'Clinic Enterprise Owner View',
      desc: 'Full operational control over clinic configuration, staff permissions, multi-branch revenue analytics, and copilot subscription settings.',
      bg: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white border-blue-900',
    },
    Admin: {
      title: 'Practice Executive View',
      desc: 'Full administrative access: Monthly financial growth, staff performance, clinic revenue, and inventory controls.',
      bg: 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-indigo-900',
    },
    Doctor: {
      title: 'Clinical Practitioner View',
      desc: 'Clinical focus: Today\'s patient appointments, waiting queue, 3D dental chart access, and digital prescriptions.',
      bg: 'bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-800',
    },
    Receptionist: {
      title: 'Front Desk & Patient Flow View',
      desc: 'Operational focus: Live patient waiting queue, check-in, appointment scheduling, and patient copays.',
      bg: 'bg-gradient-to-r from-teal-900 to-slate-900 text-white border-teal-800',
    },
    Assistant: {
      title: 'Clinical Support View',
      desc: 'Support focus: Chair preparation, inventory stock alerts, sterilization logs, and daily visit sequence.',
      bg: 'bg-gradient-to-r from-sky-900 to-slate-900 text-white border-sky-800',
    },
    Accountant: {
      title: 'Financial Ledger & Billing View',
      desc: 'Financial focus: Ledger entries, invoice processing, outstanding balance tracking, and audit statements.',
      bg: 'bg-gradient-to-r from-amber-900 to-slate-900 text-white border-amber-800',
    },
    Patient: {
      title: 'Patient Portal Experience',
      desc: 'Personal portal: 3D aligner sequence progress, upcoming visits, doctor notes, and account billing statement.',
      bg: 'bg-gradient-to-r from-amber-900 to-slate-900 text-white border-amber-800',
    },
  };

  const info = roleDescriptions[currentRole] || roleDescriptions['Admin'];

  return (
    <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${info.bg}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/10 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-tight">{info.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
              Role: {currentRole}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">
            {info.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Role-Based Widget Adaptive Engine Active</span>
      </div>
    </div>
  );
};
