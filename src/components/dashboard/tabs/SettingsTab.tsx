import React from 'react';
import { ClinicSettings } from '../../settings/ClinicSettings';
import { PatientProfileSettings } from '../../settings/PatientProfileSettings';
import { StaffProfileSettings } from '../../settings/StaffProfileSettings';
import { UserRole } from '../../../types/user';

interface SettingsTabProps {
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userRole = 'Doctor',
  userName,
  userEmail,
}) => {
  if (userRole === 'Patient') {
    return (
      <PatientProfileSettings
        userName={userName}
        userEmail={userEmail}
      />
    );
  }

  if (
    userRole === 'Doctor' ||
    userRole === 'Receptionist' ||
    userRole === 'Assistant' ||
    userRole === 'Accountant'
  ) {
    return (
      <StaffProfileSettings
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />
    );
  }

  return <ClinicSettings currentUserRole={userRole} currentUserName={userName} />;
};

