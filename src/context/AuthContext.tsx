import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { AppUser, UserRole } from '../types/user';
import { AuthContextType } from '../types/auth';
import { getRolePermissions } from '../config/permissions';

import { ClinicLoader } from '../components/common/ClinicLoader';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (fUser: User) => {
    try {
      let profile = await userService.getUserProfile(fUser.uid);
      if (!profile) {
        profile = await userService.createUserProfile({
          uid: fUser.uid,
          email: fUser.email || '',
          displayName: fUser.displayName || fUser.email?.split('@')[0] || 'Clinic Member',
          photoURL: fUser.photoURL || undefined,
          role: 'Admin', // Default new authenticated user to Admin for full demo capabilities
        });
      }
      setCurrentUser(profile);
    } catch (err) {
      console.error('Failed to load user profile in AuthContext:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        await fetchProfile(fUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { profile, firebaseUser: fUser } = await authService.loginWithEmail(email, pass);
      setFirebaseUser(fUser);
      setCurrentUser(profile);
      setSimulatedRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    pass: string, 
    displayName: string, 
    phone?: string, 
    role: UserRole = 'Patient'
  ) => {
    setLoading(true);
    try {
      const { profile, firebaseUser: fUser } = await authService.signUpWithEmail(email, pass, displayName, phone, role);
      setFirebaseUser(fUser);
      setCurrentUser(profile);
      setSimulatedRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { profile, firebaseUser: fUser } = await authService.loginWithGoogle();
      setFirebaseUser(fUser);
      setCurrentUser(profile);
      setSimulatedRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setFirebaseUser(null);
      setCurrentUser(null);
      setSimulatedRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    await authService.sendForgotPasswordEmail(email);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser);
    }
  };

  const activeRole: UserRole = simulatedRole || currentUser?.role || 'Patient';
  const activePermissions = getRolePermissions(activeRole);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    role: activeRole,
    permissions: activePermissions,
    loading,
    isAuthenticated: !!firebaseUser || !!currentUser,
    login,
    signUp,
    logout,
    forgotPassword,
    loginWithGoogle,
    refreshProfile,
    setSimulatedRole: setSimulatedRoleState,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <ClinicLoader 
          message="Loading Clinical Workspace" 
          subtext="Connecting securely to Dentora medical database..." 
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
