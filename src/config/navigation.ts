import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  Smile, 
  Stethoscope, 
  Pill, 
  FileText, 
  CreditCard, 
  Package, 
  BarChart3, 
  UserCheck, 
  Bell, 
  Settings, 
  Sparkles, 
  Building2, 
  HeartHandshake, 
  Globe, 
  MessageSquare,
  ShieldCheck,
  Receipt,
  TrendingUp,
  User,
  ClipboardList,
  Activity
} from 'lucide-react';
import { DashboardTab } from '../types/dashboard';
import { UserRole } from '../types/user';

export interface NavItemConfig {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  roles?: UserRole[];
}

export interface NavCategoryConfig {
  title: string;
  items: NavItemConfig[];
}

export function getNavigationForRole(
  role: UserRole, 
  counts: {
    appointments?: number;
    queue?: number;
    inventoryAlerts?: number;
    notifications?: number;
  } = {}
): NavCategoryConfig[] {
  const {
    appointments = 8,
    queue = 4,
    inventoryAlerts = 2,
    notifications = 3,
  } = counts;

  switch (role) {
    case 'Super Admin':
    case 'Clinic Owner':
    case 'Admin':
      return [
        {
          title: 'Core Platform',
          items: [
            { id: 'overview', label: 'Dashboard', icon: React.createElement(LayoutDashboard, { className: 'w-4 h-4' }) },
            { id: 'clinics', label: 'Multi-Clinic SaaS', icon: React.createElement(Building2, { className: 'w-4 h-4 text-[#1d5bd8]' }), badge: 'SaaS', badgeColor: 'bg-blue-100 text-[#1d5bd8] font-bold' },
          ]
        },
        {
          title: 'Patients & Clinical',
          items: [
            { id: 'patients', label: 'Patients', icon: React.createElement(Users, { className: 'w-4 h-4' }) },
            { id: 'appointments', label: 'Appointments', icon: React.createElement(Calendar, { className: 'w-4 h-4' }), badge: appointments, badgeColor: 'bg-blue-100 text-[#1d5bd8]' },
            { id: 'queue', label: 'Queue', icon: React.createElement(Clock, { className: 'w-4 h-4' }), badge: queue, badgeColor: 'bg-teal-100 text-teal-800' },
            { id: 'dental-chart', label: 'Dental Chart', icon: React.createElement(Smile, { className: 'w-4 h-4' }) },
            { id: 'treatments', label: 'Treatments', icon: React.createElement(Stethoscope, { className: 'w-4 h-4' }) },
          ]
        },
        {
          title: 'Billing & Operations',
          items: [
            { id: 'invoices', label: 'Billing & Invoices', icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
            { id: 'inventory', label: 'Inventory', icon: React.createElement(Package, { className: 'w-4 h-4' }), badge: inventoryAlerts > 0 ? `${inventoryAlerts} Low` : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
            { id: 'reports', label: 'Reports & Analytics', icon: React.createElement(BarChart3, { className: 'w-4 h-4' }) },
            { id: 'staff', label: 'Staff Management', icon: React.createElement(UserCheck, { className: 'w-4 h-4' }) },
          ]
        },
        {
          title: 'Intelligence & Admin',
          items: [
            { id: 'ai-assistant', label: 'AI Copilot', icon: React.createElement(Sparkles, { className: 'w-4 h-4 text-purple-600' }), badge: 'Gemini', badgeColor: 'bg-purple-100 text-purple-700 font-extrabold' },
            { id: 'messages', label: 'Messages', icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
            { id: 'settings', label: 'Clinic Settings', icon: React.createElement(Settings, { className: 'w-4 h-4' }) },
          ]
        }
      ];

    case 'Doctor':
      return [
        {
          title: 'Clinical Practice',
          items: [
            { id: 'overview', label: 'Doctor Dashboard', icon: React.createElement(LayoutDashboard, { className: 'w-4 h-4' }) },
            { id: 'patients', label: 'My Patients', icon: React.createElement(Users, { className: 'w-4 h-4' }) },
            { id: 'appointments', label: "Today's Appointments", icon: React.createElement(Calendar, { className: 'w-4 h-4' }), badge: appointments, badgeColor: 'bg-blue-100 text-[#1d5bd8]' },
            { id: 'dental-chart', label: 'Dental Chart', icon: React.createElement(Smile, { className: 'w-4 h-4' }) },
            { id: 'treatments', label: 'Treatments & Notes', icon: React.createElement(Stethoscope, { className: 'w-4 h-4' }) },
            { id: 'prescriptions', label: 'Prescriptions', icon: React.createElement(Pill, { className: 'w-4 h-4' }) },
          ]
        },
        {
          title: 'Copilot & Profile',
          items: [
            { id: 'ai-assistant', label: 'AI Clinical Copilot', icon: React.createElement(Sparkles, { className: 'w-4 h-4 text-purple-600' }), badge: 'AI', badgeColor: 'bg-purple-100 text-purple-700' },
            { id: 'messages', label: 'Patient Messages', icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
            { id: 'settings', label: 'My Profile & Preferences', icon: React.createElement(User, { className: 'w-4 h-4' }) },
          ]
        }
      ];

    case 'Receptionist':
      return [
        {
          title: 'Front Desk Operations',
          items: [
            { id: 'overview', label: 'Reception Dashboard', icon: React.createElement(LayoutDashboard, { className: 'w-4 h-4' }) },
            { id: 'patients', label: 'Patient Registry', icon: React.createElement(Users, { className: 'w-4 h-4' }) },
            { id: 'appointments', label: 'Appointments Calendar', icon: React.createElement(Calendar, { className: 'w-4 h-4' }), badge: appointments, badgeColor: 'bg-blue-100 text-[#1d5bd8]' },
            { id: 'queue', label: 'Live Waiting Queue', icon: React.createElement(Clock, { className: 'w-4 h-4' }), badge: queue, badgeColor: 'bg-teal-100 text-teal-800 font-bold' },
            { id: 'online-booking', label: 'Online Booking Requests', icon: React.createElement(Globe, { className: 'w-4 h-4 text-teal-600' }) },
          ]
        },
        {
          title: 'Billing & Communication',
          items: [
            { id: 'payments', label: 'Payment Collection', icon: React.createElement(CreditCard, { className: 'w-4 h-4 text-emerald-600' }) },
            { id: 'invoices', label: 'Patient Invoices', icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
            { id: 'notifications', label: 'Notifications', icon: React.createElement(Bell, { className: 'w-4 h-4' }), badge: notifications > 0 ? notifications : undefined, badgeColor: 'bg-rose-100 text-rose-700' },
            { id: 'messages', label: 'Patient Chat', icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
            { id: 'settings', label: 'Profile Settings', icon: React.createElement(User, { className: 'w-4 h-4' }) },
          ]
        }
      ];

    case 'Assistant':
      return [
        {
          title: 'Clinical Assistance',
          items: [
            { id: 'overview', label: 'Assistant Dashboard', icon: React.createElement(LayoutDashboard, { className: 'w-4 h-4' }) },
            { id: 'queue', label: "Today's Chair Queue", icon: React.createElement(Clock, { className: 'w-4 h-4' }), badge: queue, badgeColor: 'bg-teal-100 text-teal-800' },
            { id: 'patients', label: 'Assigned Patients', icon: React.createElement(Users, { className: 'w-4 h-4' }) },
            { id: 'dental-chart', label: 'Treatment Assistance', icon: React.createElement(Activity, { className: 'w-4 h-4 text-indigo-600' }) },
          ]
        },
        {
          title: 'Supplies & Profile',
          items: [
            { id: 'inventory', label: 'Chairside Inventory', icon: React.createElement(Package, { className: 'w-4 h-4' }), badge: inventoryAlerts > 0 ? `${inventoryAlerts} Low` : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
            { id: 'settings', label: 'My Profile', icon: React.createElement(User, { className: 'w-4 h-4' }) },
          ]
        }
      ];

    case 'Accountant':
      return [
        {
          title: 'Financial Management',
          items: [
            { id: 'overview', label: 'Financial Dashboard', icon: React.createElement(LayoutDashboard, { className: 'w-4 h-4' }) },
            { id: 'invoices', label: 'Invoices & Billing', icon: React.createElement(Receipt, { className: 'w-4 h-4 text-emerald-600' }) },
            { id: 'payments', label: 'Payment Ledger', icon: React.createElement(CreditCard, { className: 'w-4 h-4 text-indigo-600' }) },
            { id: 'reports', label: 'Financial Analytics', icon: React.createElement(TrendingUp, { className: 'w-4 h-4 text-blue-600' }) },
          ]
        },
        {
          title: 'System & Account',
          items: [
            { id: 'patients', label: 'Patients (Financial)', icon: React.createElement(Users, { className: 'w-4 h-4' }) },
            { id: 'settings', label: 'Account Profile', icon: React.createElement(User, { className: 'w-4 h-4' }) },
          ]
        }
      ];

    case 'Patient':
    default:
      return [
        {
          title: 'Patient Portal',
          items: [
            { id: 'portal-patient', label: 'My Dashboard', icon: React.createElement(HeartHandshake, { className: 'w-4 h-4 text-rose-500' }) },
            { id: 'appointments', label: 'My Appointments', icon: React.createElement(Calendar, { className: 'w-4 h-4 text-blue-600' }) },
            { id: 'online-booking', label: 'Book New Visit', icon: React.createElement(Globe, { className: 'w-4 h-4 text-teal-600' }), badge: '24/7', badgeColor: 'bg-teal-100 text-teal-800' },
            { id: 'prescriptions', label: 'My Prescriptions', icon: React.createElement(Pill, { className: 'w-4 h-4 text-emerald-600' }) },
            { id: 'treatments', label: 'My Treatments', icon: React.createElement(Stethoscope, { className: 'w-4 h-4 text-indigo-600' }) },
            { id: 'invoices', label: 'My Invoices & Payments', icon: React.createElement(FileText, { className: 'w-4 h-4 text-amber-600' }) },
            { id: 'messages', label: 'Clinic Messaging', icon: React.createElement(MessageSquare, { className: 'w-4 h-4 text-indigo-600' }) },
            { id: 'settings', label: 'My Profile', icon: React.createElement(User, { className: 'w-4 h-4' }) },
          ]
        }
      ];
  }
}
