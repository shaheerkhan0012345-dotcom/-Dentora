import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  X,
  ShieldCheck,
  Building2,
  User,
  HeartHandshake,
  Globe,
  MessageSquare
} from 'lucide-react';
import { DashboardTab } from '../../types/dashboard';
import { UserRole } from '../../types/user';
import { getNavigationForRole } from '../../config/navigation';
import { DentoraLogo } from '../common/DentoraLogo';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userRole: UserRole;
  userName: string;
  userAvatar?: string;
  unreadNotificationsCount?: number;
  queueCount?: number;
  appointmentsCount?: number;
  inventoryAlertsCount?: number;
  onNavigateHome: () => void;
  onLogout: () => void;
}

interface NavCategory {
  title: string;
  items: {
    id: DashboardTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    roles?: UserRole[];
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  userRole,
  userName,
  userAvatar,
  unreadNotificationsCount = 3,
  queueCount = 4,
  appointmentsCount = 8,
  inventoryAlertsCount = 2,
  onNavigateHome,
  onLogout,
}) => {
  const categories = getNavigationForRole(userRole, {
    appointments: appointmentsCount,
    queue: queueCount,
    inventoryAlerts: inventoryAlertsCount,
    notifications: unreadNotificationsCount,
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200/90 select-none">
      
      {/* BRAND HEADER */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 h-16">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer overflow-hidden min-w-0"
        >
          {isCollapsed ? (
            <DentoraLogo size="xs" />
          ) : (
            <DentoraLogo size="sm" showTagline={false} />
          )}
        </button>

        {/* DESKTOP COLLAPSE BUTTON */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* MOBILE CLOSE BUTTON */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAVIGATION SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-semibold custom-scrollbar">
        {categories.map((cat, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {cat.title}
              </div>
            )}

            <div className="space-y-1">
              {cat.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (isMobileOpen) onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-[#1d5bd8] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate text-xs tracking-tight">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* USER FOOTER & ROLE BADGE */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
        <div className={`p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1d5bd8] to-[#008080] text-white font-black text-xs flex items-center justify-center shrink-0">
              {userName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <h4 className="text-xs font-bold text-slate-800 truncate">{userName}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#1d5bd8]" />
                  <span className="text-[10px] font-extrabold text-[#1d5bd8] uppercase tracking-wider block truncate">
                    {userRole}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 z-30 h-screen sticky top-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* SLIDE DRAWER */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
