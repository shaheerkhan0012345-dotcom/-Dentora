import { UserRole } from '../types/user';

export interface PermissionSet {
  // Patients
  canViewPatients: boolean;
  canCreatePatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;

  // Appointments & Queue
  canViewAppointments: boolean;
  canManageAppointments: boolean;
  canViewQueue: boolean;
  canManageQueue: boolean;

  // Clinical
  canViewDentalChart: boolean;
  canEditDentalChart: boolean;
  canWritePrescriptions: boolean;
  canViewClinicalNotes: boolean;
  canCreateClinicalNotes: boolean;

  // Financial & Billing
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  canManageInvoices: boolean;
  canProcessPayments: boolean;
  canViewFinancialReports: boolean;

  // Operations
  canManageInventory: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageAI: boolean;
  canViewAuditLogs: boolean;

  // Patient Portal
  isPatientPortalOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  'Super Admin': {
    canViewPatients: true,
    canCreatePatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canViewAppointments: true,
    canManageAppointments: true,
    canViewQueue: true,
    canManageQueue: true,
    canViewDentalChart: true,
    canEditDentalChart: true,
    canWritePrescriptions: true,
    canViewClinicalNotes: true,
    canCreateClinicalNotes: true,
    canViewInvoices: true,
    canCreateInvoices: true,
    canManageInvoices: true,
    canProcessPayments: true,
    canViewFinancialReports: true,
    canManageInventory: true,
    canManageStaff: true,
    canViewReports: true,
    canManageSettings: true,
    canManageAI: true,
    canViewAuditLogs: true,
    isPatientPortalOnly: false,
  },
  'Clinic Owner': {
    canViewPatients: true,
    canCreatePatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canViewAppointments: true,
    canManageAppointments: true,
    canViewQueue: true,
    canManageQueue: true,
    canViewDentalChart: true,
    canEditDentalChart: true,
    canWritePrescriptions: true,
    canViewClinicalNotes: true,
    canCreateClinicalNotes: true,
    canViewInvoices: true,
    canCreateInvoices: true,
    canManageInvoices: true,
    canProcessPayments: true,
    canViewFinancialReports: true,
    canManageInventory: true,
    canManageStaff: true,
    canViewReports: true,
    canManageSettings: true,
    canManageAI: true,
    canViewAuditLogs: true,
    isPatientPortalOnly: false,
  },
  'Admin': {
    canViewPatients: true,
    canCreatePatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canViewAppointments: true,
    canManageAppointments: true,
    canViewQueue: true,
    canManageQueue: true,
    canViewDentalChart: true,
    canEditDentalChart: true,
    canWritePrescriptions: true,
    canViewClinicalNotes: true,
    canCreateClinicalNotes: true,
    canViewInvoices: true,
    canCreateInvoices: true,
    canManageInvoices: true,
    canProcessPayments: true,
    canViewFinancialReports: true,
    canManageInventory: true,
    canManageStaff: true,
    canViewReports: true,
    canManageSettings: true,
    canManageAI: true,
    canViewAuditLogs: true,
    isPatientPortalOnly: false,
  },
  'Doctor': {
    canViewPatients: true,
    canCreatePatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewAppointments: true,
    canManageAppointments: true,
    canViewQueue: true,
    canManageQueue: true,
    canViewDentalChart: true,
    canEditDentalChart: true,
    canWritePrescriptions: true,
    canViewClinicalNotes: true,
    canCreateClinicalNotes: true,
    canViewInvoices: true,
    canCreateInvoices: false,
    canManageInvoices: false,
    canProcessPayments: false,
    canViewFinancialReports: false,
    canManageInventory: false,
    canManageStaff: false,
    canViewReports: true,
    canManageSettings: false,
    canManageAI: true,
    canViewAuditLogs: false,
    isPatientPortalOnly: false,
  },
  'Receptionist': {
    canViewPatients: true,
    canCreatePatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewAppointments: true,
    canManageAppointments: true,
    canViewQueue: true,
    canManageQueue: true,
    canViewDentalChart: false,
    canEditDentalChart: false,
    canWritePrescriptions: false,
    canViewClinicalNotes: false,
    canCreateClinicalNotes: false,
    canViewInvoices: true,
    canCreateInvoices: true,
    canManageInvoices: true,
    canProcessPayments: true,
    canViewFinancialReports: false,
    canManageInventory: false,
    canManageStaff: false,
    canViewReports: false,
    canManageSettings: false,
    canManageAI: false,
    canViewAuditLogs: false,
    isPatientPortalOnly: false,
  },
  'Assistant': {
    canViewPatients: true,
    canCreatePatients: false,
    canEditPatients: false,
    canDeletePatients: false,
    canViewAppointments: true,
    canManageAppointments: false,
    canViewQueue: true,
    canManageQueue: true,
    canViewDentalChart: true,
    canEditDentalChart: false,
    canWritePrescriptions: false,
    canViewClinicalNotes: true,
    canCreateClinicalNotes: false,
    canViewInvoices: false,
    canCreateInvoices: false,
    canManageInvoices: false,
    canProcessPayments: false,
    canViewFinancialReports: false,
    canManageInventory: true,
    canManageStaff: false,
    canViewReports: false,
    canManageSettings: false,
    canManageAI: false,
    canViewAuditLogs: false,
    isPatientPortalOnly: false,
  },
  'Accountant': {
    canViewPatients: true,
    canCreatePatients: false,
    canEditPatients: false,
    canDeletePatients: false,
    canViewAppointments: true,
    canManageAppointments: false,
    canViewQueue: false,
    canManageQueue: false,
    canViewDentalChart: false,
    canEditDentalChart: false,
    canWritePrescriptions: false,
    canViewClinicalNotes: false,
    canCreateClinicalNotes: false,
    canViewInvoices: true,
    canCreateInvoices: true,
    canManageInvoices: true,
    canProcessPayments: true,
    canViewFinancialReports: true,
    canManageInventory: false,
    canManageStaff: false,
    canViewReports: true,
    canManageSettings: false,
    canManageAI: false,
    canViewAuditLogs: true,
    isPatientPortalOnly: false,
  },
  'Patient': {
    canViewPatients: false,
    canCreatePatients: false,
    canEditPatients: false,
    canDeletePatients: false,
    canViewAppointments: true,
    canManageAppointments: true, // For own booking
    canViewQueue: false,
    canManageQueue: false,
    canViewDentalChart: true, // View own chart
    canEditDentalChart: false,
    canWritePrescriptions: false,
    canViewClinicalNotes: false,
    canCreateClinicalNotes: false,
    canViewInvoices: true, // View own invoices
    canCreateInvoices: false,
    canManageInvoices: false,
    canProcessPayments: true, // Pay own invoice
    canViewFinancialReports: false,
    canManageInventory: false,
    canManageStaff: false,
    canViewReports: true, // Own treatment reports
    canManageSettings: false,
    canManageAI: false,
    canViewAuditLogs: false,
    isPatientPortalOnly: true,
  },
};

export function getRolePermissions(role: UserRole): PermissionSet {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['Patient'];
}

export function hasPermission(role: UserRole, permissionKey: keyof PermissionSet): boolean {
  const permissions = getRolePermissions(role);
  return Boolean(permissions[permissionKey]);
}
