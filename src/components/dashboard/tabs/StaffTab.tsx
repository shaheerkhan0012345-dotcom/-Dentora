import React from 'react';
import { StaffTable } from '../../admin/StaffTable';

interface StaffTabProps {
  userRole?: string;
  userName?: string;
}

export const StaffTab: React.FC<StaffTabProps> = ({ userRole = 'Admin', userName = 'Dr. Elena Rostova' }) => {
  return <StaffTable currentUserRole={userRole} currentUserName={userName} />;
};
