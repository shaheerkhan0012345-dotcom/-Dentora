import React, { useState } from 'react';
import { RoleLayoutManager } from '../layouts/RoleLayoutManager';
import { OverviewTab } from '../components/dashboard/tabs/OverviewTab';
import { PatientsTab } from '../components/dashboard/tabs/PatientsTab';
import { AppointmentsTab } from '../components/dashboard/tabs/AppointmentsTab';
import { QueueTab } from '../components/dashboard/tabs/QueueTab';
import { DentalChartTab } from '../components/dashboard/tabs/DentalChartTab';
import { InvoicesTab } from '../components/dashboard/tabs/InvoicesTab';
import { InventoryTab } from '../components/dashboard/tabs/InventoryTab';
import { StaffTab } from '../components/dashboard/tabs/StaffTab';
import { ReportsTab } from '../components/dashboard/tabs/ReportsTab';
import { AIAssistantTab } from '../components/dashboard/tabs/AIAssistantTab';
import { SettingsTab } from '../components/dashboard/tabs/SettingsTab';
import { ClinicDashboard } from '../components/dashboard/ClinicDashboard';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';
import { PatientDashboard } from '../components/dashboard/PatientDashboard';
import { OnlineBookingForm } from '../components/dashboard/OnlineBookingForm';
import { MessagingPanel } from '../components/dashboard/MessagingPanel';
import { RoleGuard } from '../guards/RoleGuard';
import { PermissionGuard } from '../guards/PermissionGuard';
import { useAuth } from '../hooks/useAuth';

import { UserProfile } from '../types';
import { DashboardTab } from '../types/dashboard';
import { UserRole } from '../types/user';

interface DashboardPageProps {
  user: UserProfile;
  onNavigateHome: () => void;
  onLogout: () => void;
  onBookNewVisit?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onNavigateHome,
  onLogout,
}) => {
  const { role: authRole, setSimulatedRole } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [simulatedRoleState, setSimulatedRoleState] = useState<UserRole>(authRole || 'Admin');

  const activeRole: UserRole = simulatedRoleState || authRole || 'Admin';

  const handleRoleChange = (newRole: UserRole) => {
    setSimulatedRoleState(newRole);
    if (setSimulatedRole) {
      setSimulatedRole(newRole);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            userRole={activeRole}
            userName={user.name}
            userEmail={user.email}
            onNavigateTab={setActiveTab}
            onOpenQuickActions={() => {}}
          />
        );

      case 'clinics':
      case 'subscriptions':
        return (
          <RoleGuard allowedRoles={['Super Admin', 'Clinic Owner', 'Admin']}>
            <ClinicDashboard userName={user.name} />
          </RoleGuard>
        );

      case 'portal-doctor':
        return (
          <RoleGuard allowedRoles={['Super Admin', 'Clinic Owner', 'Admin', 'Doctor']}>
            <DoctorDashboard doctorName={user.name} userRole={activeRole} />
          </RoleGuard>
        );

      case 'portal-patient':
        return (
          <PatientDashboard
            patientName={user.name}
            patientEmail={user.email}
            onBookAppointmentClick={() => setActiveTab('online-booking')}
          />
        );

      case 'online-booking':
        return <OnlineBookingForm />;

      case 'messages':
        return (
          <MessagingPanel
            currentUserName={user.name}
            currentUserRole={activeRole}
          />
        );

      case 'patients':
        return (
          <PermissionGuard permission="canViewPatients">
            <PatientsTab userRole={activeRole} userName={user.name} />
          </PermissionGuard>
        );

      case 'appointments':
        return <AppointmentsTab userRole={activeRole} userName={user.name} userEmail={user.email} />;

      case 'queue':
        return <QueueTab />;

      case 'dental-chart':
      case 'treatments':
      case 'prescriptions':
        return (
          <PermissionGuard permission="canViewDentalChart">
            <DentalChartTab activeTabName={activeTab} />
          </PermissionGuard>
        );

      case 'invoices':
      case 'payments':
        return (
          <PermissionGuard permission="canViewInvoices">
            <InvoicesTab />
          </PermissionGuard>
        );

      case 'inventory':
        return (
          <PermissionGuard permission="canManageInventory">
            <InventoryTab />
          </PermissionGuard>
        );

      case 'reports':
        return (
          <PermissionGuard permission="canViewReports">
            <ReportsTab />
          </PermissionGuard>
        );

      case 'staff':
        return (
          <PermissionGuard permission="canManageStaff">
            <StaffTab />
          </PermissionGuard>
        );

      case 'ai-assistant':
        return (
          <AIAssistantTab userRole={activeRole} userName={user.name} userAvatar={user.avatar} />
        );

      case 'settings':
        return (
          <SettingsTab userRole={activeRole} userName={user.name} userEmail={user.email} />
        );

      default:
        return (
          <OverviewTab
            userRole={activeRole}
            userName={user.name}
            userEmail={user.email}
            onNavigateTab={setActiveTab}
            onOpenQuickActions={() => {}}
          />
        );
    }
  };

  return (
    <RoleLayoutManager
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={user.name}
      userRole={activeRole}
      userEmail={user.email}
      userAvatar={user.avatar}
      simulatedRole={activeRole}
      onRoleChange={handleRoleChange}
      onNavigateHome={onNavigateHome}
      onLogout={onLogout}
    >
      {renderTabContent()}
    </RoleLayoutManager>
  );
};
