import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionSet } from '../config/permissions';
import { UnauthorizedPage } from '../components/common/UnauthorizedPage';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: keyof PermissionSet;
  fallback?: React.ReactNode;
  onUnauthorizedRedirect?: () => void;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback,
  onUnauthorizedRedirect,
}) => {
  const { can, role } = usePermissions();

  if (!can(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <UnauthorizedPage
        currentRole={role}
        title="Permission Denied"
        description={`Your current role (${role}) does not have permission '${String(permission)}' enabled.`}
        onReturnToAuthorized={onUnauthorizedRedirect}
      />
    );
  }

  return <>{children}</>;
};
