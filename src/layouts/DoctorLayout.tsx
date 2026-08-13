import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardTab } from '../types/dashboard';
import { UserRole } from '../types/user';

interface LayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  userAvatar?: string;
  simulatedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DoctorLayout: React.FC<LayoutProps> = (props) => {
  return (
    <DashboardLayout {...props}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span>Clinical Portal</span>
          <span>/</span>
          <span className="text-emerald-600 font-bold uppercase">{props.activeTab}</span>
        </div>
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
          Doctor Workstation
        </span>
      </div>
      {props.children}
    </DashboardLayout>
  );
};
