import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppUser, AuditLogEntry, UserRole } from '../types/user';

const USERS_COLLECTION = 'users';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

export const userService = {
  /**
   * Fetches user profile from Firestore by UID
   */
  async getUserProfile(uid: string): Promise<AppUser | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data() as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error);
      throw error;
    }
  },

  /**
   * Creates or updates a user profile document in Firestore
   */
  async createUserProfile(user: Partial<AppUser> & { uid: string; email: string }): Promise<AppUser> {
    const now = new Date().toISOString();
    
    // Assign default role if none provided
    const role: UserRole = user.role || 'Patient';
    
    const userProfile: AppUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0] || 'Clinic User',
      phone: user.phone || '',
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=1d5bd8&color=fff`,
      role: role,
      status: user.status || 'active',
      createdAt: user.createdAt || now,
      updatedAt: now,
      lastLogin: now,
      memberSince: user.memberSince || 'August 2026',
      plan: user.plan || 'Teethly Dental Care Member',
      assignedOrthodontist: user.assignedOrthodontist || 'Dr. Elena Rostova, MD',
    };

    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      await setDoc(userRef, userProfile, { merge: true });
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile in Firestore:', error);
      throw error;
    }
  },

  /**
   * Updates last login timestamp for existing user profile
   */
  async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to update last login timestamp:', error);
    }
  },

  /**
   * Updates partial fields in user profile
   */
  async updateUserProfile(uid: string, updates: Partial<AppUser>): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating user profile in Firestore:', error);
      throw error;
    }
  },

  /**
   * Logs security or audit events to auditLogs collection
   */
  async logAuditEvent(log: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      const logRef = collection(db, AUDIT_LOGS_COLLECTION);
      await addDoc(logRef, {
        ...log,
        timestamp: new Date().toISOString(),
        createdServerTime: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Failed to write audit log:', error);
    }
  },
};
