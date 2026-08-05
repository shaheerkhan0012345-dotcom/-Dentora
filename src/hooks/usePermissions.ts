import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '../types/user';
import { PermissionSet, getRolePermissions, hasPermission as checkPermission } from '../config/permissions';

export interface UsePermissionsReturn {
  permissions: PermissionSet;
  can: (permissionKey: keyof PermissionSet) => boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  role: UserRole;
  isAdmin: boolean;
  isDoctor: boolean;
  isReceptionist: boolean;
  isAssistant: boolean;
  isAccountant: boolean;
  isPatient: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { role: authRole } = useAuth();
  const currentRole: UserRole = authRole || 'Patient';

  const permissions = useMemo(() => {
    return getRolePermissions(currentRole);
  }, [currentRole]);

  const can = (permissionKey: keyof PermissionSet): boolean => {
    return checkPermission(currentRole, permissionKey);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(currentRole);
  };

  const isAdmin = currentRole === 'Super Admin' || currentRole === 'Clinic Owner' || currentRole === 'Admin';
  const isDoctor = currentRole === 'Doctor';
  const isReceptionist = currentRole === 'Receptionist';
  const isAssistant = currentRole === 'Assistant';
  const isAccountant = currentRole === 'Accountant';
  const isPatient = currentRole === 'Patient';

  return {
    permissions,
    can,
    hasRole,
    role: currentRole,
    isAdmin,
    isDoctor,
    isReceptionist,
    isAssistant,
    isAccountant,
    isPatient,
  };
}
