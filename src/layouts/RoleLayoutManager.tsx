import React from 'react';
import { AdminLayout } from './AdminLayout';
import { DoctorLayout } from './DoctorLayout';
import { ReceptionistLayout } from './ReceptionistLayout';
import { AssistantLayout } from './AssistantLayout';
import { AccountantLayout } from './AccountantLayout';
import { PatientLayout } from './PatientLayout';
import { DashboardTab } from '../types/dashboard';
import { UserRole } from '../types/user';

interface RoleLayoutManagerProps {
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

export const RoleLayoutManager: React.FC<RoleLayoutManagerProps> = (props) => {
  const activeRole = props.simulatedRole || props.userRole;

  switch (activeRole) {
    case 'Super Admin':
    case 'Clinic Owner':
    case 'Admin':
      return <AdminLayout {...props}>{props.children}</AdminLayout>;

    case 'Doctor':
      return <DoctorLayout {...props}>{props.children}</DoctorLayout>;

    case 'Receptionist':
      return <ReceptionistLayout {...props}>{props.children}</ReceptionistLayout>;

    case 'Assistant':
      return <AssistantLayout {...props}>{props.children}</AssistantLayout>;

    case 'Accountant':
      return <AccountantLayout {...props}>{props.children}</AccountantLayout>;

    case 'Patient':
    default:
      return <PatientLayout {...props}>{props.children}</PatientLayout>;
  }
};
