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

export const ReceptionistLayout: React.FC<LayoutProps> = (props) => {
  return (
    <DashboardLayout {...props}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span>Front Desk Desk</span>
          <span>/</span>
          <span className="text-teal-600 font-bold uppercase">{props.activeTab}</span>
        </div>
        <span className="px-2.5 py-1 bg-teal-100 text-teal-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
          Reception Desk
        </span>
      </div>
      {props.children}
    </DashboardLayout>
  );
};
