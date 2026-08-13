import React from 'react';
import { AdminDashboardView } from '../role-dashboards/AdminDashboardView';
import { DoctorDashboardView } from '../role-dashboards/DoctorDashboardView';
import { ReceptionistDashboardView } from '../role-dashboards/ReceptionistDashboardView';
import { AssistantDashboardView } from '../role-dashboards/AssistantDashboardView';
import { AccountantDashboardView } from '../role-dashboards/AccountantDashboardView';
import { PatientDashboardView } from '../role-dashboards/PatientDashboardView';
import { DashboardTab } from '../../../types/dashboard';
import { UserRole } from '../../../types/user';

interface OverviewTabProps {
  userRole: UserRole;
  userName: string;
  userEmail?: string;
  onNavigateTab: (tab: DashboardTab) => void;
  onOpenQuickActions: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  userRole,
  userName,
  userEmail,
  onNavigateTab,
}) => {
  switch (userRole) {
    case 'Super Admin':
    case 'Clinic Owner':
    case 'Admin':
      return <AdminDashboardView userName={userName} onNavigateTab={onNavigateTab} />;

    case 'Doctor':
      return <DoctorDashboardView userName={userName} onNavigateTab={onNavigateTab} />;

    case 'Receptionist':
      return <ReceptionistDashboardView userName={userName} onNavigateTab={onNavigateTab} />;

    case 'Assistant':
      return <AssistantDashboardView userName={userName} onNavigateTab={onNavigateTab} />;

    case 'Accountant':
      return <AccountantDashboardView userName={userName} onNavigateTab={onNavigateTab} />;

    case 'Patient':
    default:
      return (
        <PatientDashboardView
          userName={userName}
          userEmail={userEmail}
          onNavigateTab={onNavigateTab}
        />
      );
  }
};
