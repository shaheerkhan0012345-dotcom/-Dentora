import { PermissionItem, RoleDefinition } from '../types/admin';

export const SYSTEM_PERMISSIONS: PermissionItem[] = [
  // Patients
  { key: 'view_patients', label: 'View Patients', category: 'Patients', description: 'Access patient list and records' },
  { key: 'edit_patients', label: 'Edit Patients', category: 'Patients', description: 'Update patient demographics and history' },
  { key: 'delete_patients', label: 'Delete Patients', category: 'Patients', description: 'Permanently remove patient files' },
  
  // Clinical
  { key: 'view_dental_chart', label: 'View Dental Chart', category: 'Clinical', description: 'Access Odontogram and tooth charts' },
  { key: 'edit_dental_chart', label: 'Modify Dental Chart', category: 'Clinical', description: 'Update tooth status, conditions, and procedures' },
  { key: 'create_prescriptions', label: 'Create Prescriptions', category: 'Clinical', description: 'Issue Rx notes to patients' },
  { key: 'create_soap_notes', label: 'Create Clinical SOAP Notes', category: 'Clinical', description: 'Record clinical encounter notes' },

  // Billing
  { key: 'manage_billing', label: 'Manage Invoices & Billing', category: 'Billing', description: 'Create and issue patient invoices' },
  { key: 'receive_payments', label: 'Process Payments', category: 'Billing', description: 'Log patient receipts and payment methods' },
  { key: 'manage_expenses', label: 'Manage Expenses', category: 'Billing', description: 'Track clinic operational overheads' },

  // Inventory
  { key: 'manage_inventory', label: 'Manage Inventory', category: 'Inventory', description: 'Update stock levels, add items & POs' },

  // Staff
  { key: 'manage_staff', label: 'Manage Staff Roster', category: 'Staff', description: 'Create, update, or suspend staff profiles' },
  { key: 'manage_roles', label: 'Manage Roles & RBAC', category: 'Staff', description: 'Configure system roles and permission matrix' },
  { key: 'manage_attendance', label: 'Manage Attendance & Leave', category: 'Staff', description: 'Approve leave requests and biometric logs' },

  // AI & Copilot
  { key: 'manage_ai', label: 'Execute AI Actions', category: 'AI & Copilot', description: 'Authorize AI write commands and workflows' },

  // Reports
  { key: 'view_reports', label: 'View Analytics & Reports', category: 'Reports', description: 'Access financial and practice reports' },
  { key: 'export_reports', label: 'Export Data (PDF/Excel)', category: 'Reports', description: 'Download CSV, Excel, and PDF reports' },

  // Settings
  { key: 'manage_settings', label: 'Manage Clinic Settings', category: 'Settings', description: 'Modify general, AI, WhatsApp & system settings' },
  { key: 'view_audit_logs', label: 'View System Audit Logs', category: 'Settings', description: 'Inspect audit trail and security logs' },
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-admin',
    roleName: 'Admin',
    isSystemRole: true,
    description: 'Full system access across all clinical, administrative, financial, and AI settings.',
    permissions: SYSTEM_PERMISSIONS.map((p) => p.key),
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role-doctor',
    roleName: 'Doctor',
    isSystemRole: true,
    description: 'Clinical access for patient care, dental charting, prescriptions, SOAP notes, and AI copilot.',
    permissions: [
      'view_patients',
      'edit_patients',
      'view_dental_chart',
      'edit_dental_chart',
      'create_prescriptions',
      'create_soap_notes',
      'manage_ai',
      'view_reports',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role-receptionist',
    roleName: 'Receptionist',
    isSystemRole: true,
    description: 'Front-desk operations, appointment scheduling, queue management, and invoicing.',
    permissions: [
      'view_patients',
      'edit_patients',
      'manage_billing',
      'receive_payments',
      'manage_ai',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role-assistant',
    roleName: 'Dental Assistant',
    isSystemRole: true,
    description: 'Support chairside operations, view dental chart, check inventory stock.',
    permissions: [
      'view_patients',
      'view_dental_chart',
      'manage_inventory',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role-accountant',
    roleName: 'Accountant',
    isSystemRole: true,
    description: 'Financial management, invoices, expense tracking, and financial performance reports.',
    permissions: [
      'manage_billing',
      'receive_payments',
      'manage_expenses',
      'view_reports',
      'export_reports',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role-inventory-manager',
    roleName: 'Inventory Manager',
    isSystemRole: true,
    description: 'Stock management, purchase order generation, reorder alerts, and supplier relations.',
    permissions: [
      'manage_inventory',
      'view_reports',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];
