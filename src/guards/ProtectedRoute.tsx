import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';
import { RoleGuard } from './RoleGuard';
import { ClinicLoader } from '../components/common/ClinicLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onUnauthenticated?: () => void;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onUnauthenticated,
  onUnauthorized,
}) => {
  const { isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [loading, isAuthenticated, onUnauthenticated]);

  if (loading) {
    return (
      <ClinicLoader
        message="Verifying Security Credentials"
        subtext="Authenticating RBAC user profile & session..."
        fullScreen
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 p-6 text-center select-none">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white mb-2">Authentication Required</h2>
          <p className="text-xs text-slate-400 mb-6">Please sign in to access the Teethly enterprise workspace.</p>
          <button
            onClick={onUnauthenticated}
            className="w-full py-3 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    return (
      <RoleGuard allowedRoles={allowedRoles} onUnauthorizedRedirect={onUnauthorized}>
        {children}
      </RoleGuard>
    );
  }

  return <>{children}</>;
};
