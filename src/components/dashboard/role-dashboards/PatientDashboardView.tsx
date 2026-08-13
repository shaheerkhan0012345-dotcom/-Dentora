import React from 'react';
import { PatientDashboard } from '../PatientDashboard';
import { DashboardTab } from '../../../types/dashboard';

interface ViewProps {
  userName: string;
  userEmail?: string;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const PatientDashboardView: React.FC<ViewProps> = ({ userName, userEmail, onNavigateTab }) => {
  return (
    <PatientDashboard
      patientName={userName}
      patientEmail={userEmail}
      onBookAppointmentClick={() => onNavigateTab('online-booking')}
    />
  );
};
