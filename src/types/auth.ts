import { User } from 'firebase/auth';
import { AppUser, UserRole } from './user';
import { PermissionSet } from '../config/permissions';

export interface AuthState {
  currentUser: AppUser | null;
  firebaseUser: User | null;
  role: UserRole | null;
  permissions: PermissionSet | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, phone?: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSimulatedRole?: (role: UserRole) => void;
}
