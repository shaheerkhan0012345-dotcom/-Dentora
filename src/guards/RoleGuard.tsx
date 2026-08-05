import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole } from '../types/user';
import { UnauthorizedPage } from '../components/common/UnauthorizedPage';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  onUnauthorizedRedirect?: () => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  onUnauthorizedRedirect,
}) => {
  const { hasRole, role } = usePermissions();

  if (!hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <UnauthorizedPage
        currentRole={role}
        requiredRoles={allowedRoles}
        onReturnToAuthorized={onUnauthorizedRedirect}
      />
    );
  }

  return <>{children}</>;
};
