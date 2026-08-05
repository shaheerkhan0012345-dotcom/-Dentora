import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionSet } from '../config/permissions';
import { UserRole } from '../types/user';

interface FeatureGuardProps {
  children: React.ReactNode;
  permission?: keyof PermissionSet;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  permission,
  allowedRoles,
  fallback = null,
}) => {
  const { can, hasRole } = usePermissions();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
