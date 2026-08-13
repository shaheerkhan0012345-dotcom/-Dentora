import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  Calendar as CalendarIcon, 
  Building2, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings, 
  Sparkles,
  Command,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationItem } from '../../types/dashboard';
import { UserRole } from '../../types/user';
import { ClinicSelector } from './ClinicSelector';
import { SystemHealthModal } from '../pwa/SystemHealthModal';

interface TopNavbarProps {
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  simulatedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenQuickActions: () => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onLogout: () => void;
  onNavigateSettings: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  userName,
  userRole,
  userAvatar,
  simulatedRole,
  onRoleChange,
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenQuickActions,
  notifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onClearNotifications,
  onLogout,
  onNavigateSettings,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const availableRoles: UserRole[] = ['Admin', 'Doctor', 'Receptionist', 'Assistant', 'Patient'];

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'rose';
      case 'Doctor': return 'brand';
      case 'Receptionist': return 'teal';
      case 'Assistant': return 'sky';
      case 'Patient': return 'amber';
      default: return 'slate';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-20 px-4 sm:px-6 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        
        {/* LEFT SECTION: MOBILE TOGGLE + CLINIC INFO */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <ClinicSelector userRole={userRole} />
          </div>
        </div>

        {/* MIDDLE SECTION: GLOBAL SEARCH INPUT BUTTON */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full py-2 px-3.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs text-slate-500 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#1d5bd8] transition-colors" />
              <span className="truncate font-medium">Search patients, doctors, invoices...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
              <Command className="w-3 h-3" /> K
            </div>
          </button>
        </div>

        {/* RIGHT SECTION: QUICK ACTIONS, ROLE SWITCHER, NOTIFICATIONS & PROFILE */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* QUICK ACTION BUTTON */}
          <button
            onClick={onOpenQuickActions}
            className="px-3.5 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {/* ROLE SIMULATOR SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Switch simulated user role"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1d5bd8]" />
              <span className="hidden xl:inline text-[11px] text-slate-400">View as:</span>
              <Badge variant={getRoleBadgeVariant(simulatedRole)} size="sm">
                {simulatedRole}
              </Badge>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Role Simulator
                </div>
                <div className="space-y-1 mt-1">
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl font-semibold flex items-center justify-between cursor-pointer ${
                        simulatedRole === role ? 'bg-[#1d5bd8]/10 text-[#1d5bd8] font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{role}</span>
                      {simulatedRole === role && <ShieldCheck className="w-3.5 h-3.5 text-[#1d5bd8]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATION BELL WITH POPPER */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-600 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAllRead={onMarkAllNotificationsRead}
              onMarkRead={onMarkNotificationRead}
              onClearAll={onClearNotifications}
            />
          </div>

          {/* USER AVATAR & DROPDOWN MENU */}
          <div className="relative pl-1">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Avatar name={userName} src={userAvatar} size="sm" status="online" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{simulatedRole} Account</p>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigateSettings();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      <SystemHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />
    </header>
  );
};
