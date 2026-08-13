import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import {
  StaffMember,
  RoleDefinition,
  AttendanceRecord,
  LeaveRequest,
  LeaveStatus,
} from '../types/admin';
import { INITIAL_ROLES } from '../data/permissionDefaults';
import { logAuditEvent } from './auditLogService';

const STAFF_COLLECTION = 'staff';
const ROLES_COLLECTION = 'roles';
const ATTENDANCE_COLLECTION = 'attendance';
const LEAVE_COLLECTION = 'leaveRequests';

// Initial mock staff data if Firestore collection is empty
const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    employeeId: 'EMP-1001',
    fullName: 'Dr. Elena Rostova',
    email: 'elena.rostova@teethly.clinic',
    phone: '+92 300 1112233',
    cnic: '35202-1234567-1',
    designation: 'Lead Orthodontist & Clinical Director',
    department: 'Orthodontics',
    role: 'Doctor',
    joiningDate: '2022-01-15',
    salary: 350000,
    workingHours: '09:00 AM - 05:00 PM',
    weeklySchedule: [
      { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '14:00' },
      { day: 'Sunday', isWorking: false, startTime: '00:00', endTime: '00:00' },
    ],
    emergencyContact: {
      name: 'Alexander Rostova',
      relation: 'Spouse',
      phone: '+92 300 9998877',
    },
    status: 'Active',
    biometricId: 'BIO-101',
    createdAt: '2022-01-15T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'staff-2',
    employeeId: 'EMP-1002',
    fullName: 'Dr. Marcus Vance',
    email: 'marcus.vance@teethly.clinic',
    phone: '+92 301 2223344',
    cnic: '35202-7654321-2',
    designation: 'Cosmetic Specialist',
    department: 'Prosthodontics',
    role: 'Doctor',
    joiningDate: '2023-03-10',
    salary: 280000,
    workingHours: '10:00 AM - 06:00 PM',
    weeklySchedule: [
      { day: 'Monday', isWorking: true, startTime: '10:00', endTime: '18:00' },
      { day: 'Tuesday', isWorking: true, startTime: '10:00', endTime: '18:00' },
      { day: 'Wednesday', isWorking: true, startTime: '10:00', endTime: '18:00' },
      { day: 'Thursday', isWorking: true, startTime: '10:00', endTime: '18:00' },
      { day: 'Friday', isWorking: true, startTime: '10:00', endTime: '18:00' },
      { day: 'Saturday', isWorking: false, startTime: '00:00', endTime: '00:00' },
      { day: 'Sunday', isWorking: false, startTime: '00:00', endTime: '00:00' },
    ],
    emergencyContact: {
      name: 'Sarah Vance',
      relation: 'Sister',
      phone: '+92 301 7776655',
    },
    status: 'Active',
    biometricId: 'BIO-102',
    createdAt: '2023-03-10T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'staff-3',
    employeeId: 'EMP-1003',
    fullName: 'Maya Lin',
    email: 'maya.lin@teethly.clinic',
    phone: '+92 302 3334455',
    cnic: '35202-4567890-3',
    designation: 'Dental Hygienist',
    department: 'Hygiene & Prophylaxis',
    role: 'Dental Assistant',
    joiningDate: '2023-08-01',
    salary: 120000,
    workingHours: '09:00 AM - 05:00 PM',
    weeklySchedule: [
      { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '13:00' },
      { day: 'Sunday', isWorking: false, startTime: '00:00', endTime: '00:00' },
    ],
    emergencyContact: {
      name: 'David Lin',
      relation: 'Father',
      phone: '+92 302 8887766',
    },
    status: 'Active',
    biometricId: 'BIO-103',
    createdAt: '2023-08-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'staff-4',
    employeeId: 'EMP-1004',
    fullName: 'Alex Rivera',
    email: 'alex.rivera@teethly.clinic',
    phone: '+92 303 4445566',
    cnic: '35202-9876543-4',
    designation: 'Senior Front Desk Officer',
    department: 'Reception & Patient Care',
    role: 'Receptionist',
    joiningDate: '2024-01-10',
    salary: 95000,
    workingHours: '08:30 AM - 04:30 PM',
    weeklySchedule: [
      { day: 'Monday', isWorking: true, startTime: '08:30', endTime: '16:30' },
      { day: 'Tuesday', isWorking: true, startTime: '08:30', endTime: '16:30' },
      { day: 'Wednesday', isWorking: true, startTime: '08:30', endTime: '16:30' },
      { day: 'Thursday', isWorking: true, startTime: '08:30', endTime: '16:30' },
      { day: 'Friday', isWorking: true, startTime: '08:30', endTime: '16:30' },
      { day: 'Saturday', isWorking: true, startTime: '08:30', endTime: '14:00' },
      { day: 'Sunday', isWorking: false, startTime: '00:00', endTime: '00:00' },
    ],
    emergencyContact: {
      name: 'Maria Rivera',
      relation: 'Mother',
      phone: '+92 303 1112233',
    },
    status: 'Active',
    biometricId: 'BIO-104',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// Initial Attendance Records
const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    staffId: 'staff-1',
    staffName: 'Dr. Elena Rostova',
    staffRole: 'Doctor',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:52 AM',
    checkOut: undefined,
    status: 'Present',
    lateArrivalMinutes: 0,
    overtimeHours: 0,
    biometricDeviceId: 'BIO-TERM-01',
  },
  {
    id: 'att-2',
    staffId: 'staff-2',
    staffName: 'Dr. Marcus Vance',
    staffRole: 'Doctor',
    date: new Date().toISOString().split('T')[0],
    checkIn: '10:14 AM',
    checkOut: undefined,
    status: 'Late',
    lateArrivalMinutes: 14,
    overtimeHours: 0,
    biometricDeviceId: 'BIO-TERM-01',
  },
  {
    id: 'att-3',
    staffId: 'staff-3',
    staffName: 'Maya Lin',
    staffRole: 'Dental Assistant',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:58 AM',
    checkOut: undefined,
    status: 'Present',
    lateArrivalMinutes: 0,
    overtimeHours: 0,
    biometricDeviceId: 'BIO-TERM-01',
  },
];

// Initial Leave Requests
const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lv-101',
    staffId: 'staff-2',
    staffName: 'Dr. Marcus Vance',
    staffRole: 'Doctor',
    leaveType: 'Annual',
    startDate: '2026-08-15',
    endDate: '2026-08-18',
    totalDays: 4,
    reason: 'Attending Dental Surgery Symposium in Lahore',
    status: 'Approved',
    appliedOn: '2026-08-01',
    approvedBy: 'Dr. Elena Rostova',
    doctorAvailabilitySynced: true,
  },
];

// Subscribe to Staff
export function subscribeToStaff(callback: (staff: StaffMember[]) => void) {
  const q = query(collection(db, STAFF_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed initial staff
        INITIAL_STAFF.forEach((member) => {
          setDoc(doc(db, STAFF_COLLECTION, member.id), member).catch(console.error);
        });
        callback(INITIAL_STAFF);
      } else {
        const list: StaffMember[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as StaffMember);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, STAFF_COLLECTION);
    }
  );
}

// Add Staff Member
export async function addStaffMember(staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>, performedBy: string) {
  try {
    const newDocRef = doc(collection(db, STAFF_COLLECTION));
    const newStaff: StaffMember = {
      ...staff,
      id: newDocRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, newStaff);

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Staff Created',
      category: 'Staff',
      details: `Added new staff member: ${newStaff.fullName} (${newStaff.employeeId})`,
      result: 'Success',
    });

    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, STAFF_COLLECTION);
    throw error;
  }
}

// Update Staff Member
export async function updateStaffMember(id: string, updates: Partial<StaffMember>, performedBy: string) {
  try {
    const docRef = doc(db, STAFF_COLLECTION, id);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, payload);

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Staff Updated',
      category: 'Staff',
      details: `Updated staff profile ID #${id}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${STAFF_COLLECTION}/${id}`);
    throw error;
  }
}

// Delete Staff Member
export async function deleteStaffMember(id: string, performedBy: string) {
  try {
    await deleteDoc(doc(db, STAFF_COLLECTION, id));
    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Staff Deleted',
      category: 'Staff',
      details: `Removed staff member ID #${id}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STAFF_COLLECTION}/${id}`);
    throw error;
  }
}

// Subscribe to Roles & Permissions
export function subscribeToRoles(callback: (roles: RoleDefinition[]) => void) {
  const q = query(collection(db, ROLES_COLLECTION));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed initial roles
        INITIAL_ROLES.forEach((r) => {
          setDoc(doc(db, ROLES_COLLECTION, r.id), r).catch(console.error);
        });
        callback(INITIAL_ROLES);
      } else {
        const list: RoleDefinition[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as RoleDefinition);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ROLES_COLLECTION);
    }
  );
}

// Save Role Definition
export async function saveRole(role: RoleDefinition, performedBy: string) {
  try {
    const docRef = doc(db, ROLES_COLLECTION, role.id);
    await setDoc(docRef, role, { merge: true });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Admin',
      action: 'Permission Changed',
      category: 'Staff',
      details: `Updated RBAC matrix for role: ${role.roleName}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ROLES_COLLECTION}/${role.id}`);
    throw error;
  }
}

// Subscribe to Attendance
export function subscribeToAttendance(callback: (records: AttendanceRecord[]) => void) {
  const q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ATTENDANCE.forEach((rec) => {
          setDoc(doc(db, ATTENDANCE_COLLECTION, rec.id), rec).catch(console.error);
        });
        callback(INITIAL_ATTENDANCE);
      } else {
        const list: AttendanceRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AttendanceRecord);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ATTENDANCE_COLLECTION);
    }
  );
}

// Check-In
export async function logAttendanceCheckIn(
  staffId: string,
  staffName: string,
  staffRole: string,
  performedBy: string
) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const docRef = doc(collection(db, ATTENDANCE_COLLECTION));

    const rec: AttendanceRecord = {
      id: docRef.id,
      staffId,
      staffName,
      staffRole,
      date: today,
      checkIn: nowTimeStr,
      status: 'Present',
      lateArrivalMinutes: 0,
      overtimeHours: 0,
      biometricDeviceId: 'BIO-SIMULATOR',
    };

    await setDoc(docRef, rec);

    logAuditEvent({
      userId: performedBy,
      userName: staffName,
      userRole: staffRole,
      action: 'Attendance Check-In',
      category: 'Staff',
      details: `${staffName} checked in at ${nowTimeStr}`,
      result: 'Success',
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ATTENDANCE_COLLECTION);
    throw error;
  }
}

// Check-Out
export async function logAttendanceCheckOut(attendanceId: string, performedBy: string) {
  try {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
    await updateDoc(docRef, { checkOut: nowTimeStr });

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Staff',
      action: 'Attendance Check-Out',
      category: 'Staff',
      details: `Checked out attendance record #${attendanceId} at ${nowTimeStr}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ATTENDANCE_COLLECTION}/${attendanceId}`);
    throw error;
  }
}

// Subscribe to Leave Requests
export function subscribeToLeaveRequests(callback: (requests: LeaveRequest[]) => void) {
  const q = query(collection(db, LEAVE_COLLECTION), orderBy('appliedOn', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_LEAVES.forEach((req) => {
          setDoc(doc(db, LEAVE_COLLECTION, req.id), req).catch(console.error);
        });
        callback(INITIAL_LEAVES);
      } else {
        const list: LeaveRequest[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as LeaveRequest);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, LEAVE_COLLECTION);
    }
  );
}

// Submit Leave Request
export async function submitLeaveRequest(
  reqData: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status' | 'doctorAvailabilitySynced'>,
  performedBy: string
) {
  try {
    const newDocRef = doc(collection(db, LEAVE_COLLECTION));
    const newReq: LeaveRequest = {
      ...reqData,
      id: newDocRef.id,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      doctorAvailabilitySynced: false,
    };

    await setDoc(newDocRef, newReq);

    logAuditEvent({
      userId: performedBy,
      userName: reqData.staffName,
      userRole: reqData.staffRole,
      action: 'Leave Requested',
      category: 'Staff',
      details: `${reqData.staffName} requested ${reqData.totalDays} day(s) ${reqData.leaveType} leave`,
      result: 'Success',
    });

    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LEAVE_COLLECTION);
    throw error;
  }
}

// Approve / Reject Leave Request
export async function updateLeaveRequestStatus(
  requestId: string,
  status: LeaveStatus,
  approvedBy: string,
  rejectionReason?: string
) {
  try {
    const docRef = doc(db, LEAVE_COLLECTION, requestId);
    await updateDoc(docRef, {
      status,
      approvedBy,
      rejectionReason: rejectionReason || '',
      doctorAvailabilitySynced: true,
    });

    logAuditEvent({
      userId: approvedBy,
      userName: approvedBy,
      userRole: 'Admin',
      action: `Leave ${status}`,
      category: 'Staff',
      details: `Leave request #${requestId} was ${status.toLowerCase()} by ${approvedBy}`,
      result: 'Success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LEAVE_COLLECTION}/${requestId}`);
    throw error;
  }
}
