export type UserRole = 
  | 'Super Admin' 
  | 'Clinic Owner' 
  | 'Admin' 
  | 'Doctor' 
  | 'Receptionist' 
  | 'Assistant' 
  | 'Accountant'
  | 'Patient';

export type AccountStatus = 'active' | 'inactive';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  clinicId?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  memberSince?: string;
  plan?: string;
  assignedOrthodontist?: string;
}

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
