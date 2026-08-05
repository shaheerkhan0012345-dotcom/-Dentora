import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { QuickActionsModal } from './QuickActionsModal';
import { FloatingAICopilot } from '../copilot/FloatingAICopilot';
import { DashboardTab, NotificationItem } from '../../types/dashboard';
import { UserRole } from '../../types/user';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  userAvatar?: string;
  simulatedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Patient Registered',
    message: 'Sarah Jenkins (#PT-8801) completed registration questionnaire.',
    time: '10m ago',
    read: false,
    category: 'patient',
    priority: 'medium',
  },
  {
    id: 'n2',
    title: 'Copay Payment Received',
    message: '$180.00 processed via HSA Card for Invoice #INV-8801.',
    time: '45m ago',
    read: false,
    category: 'payment',
    priority: 'low',
  },
  {
    id: 'n3',
    title: 'Inventory Reorder Alert',
    message: '3D Clear Aligner Trays (Box of 50) dropped below minimum 5 threshold.',
    time: '2h ago',
    read: false,
    category: 'inventory',
    priority: 'high',
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  userName,
  userRole,
  userEmail,
  userAvatar,
  simulatedRole,
  onRoleChange,
  onNavigateHome,
  onLogout,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSelectSearchResult = (tab: DashboardTab, detailId?: string) => {
    onTabChange(tab);
    showToast(`Navigated to ${tab.toUpperCase()} ${detailId ? `(#${detailId})` : ''}`);
  };

  const handleSelectQuickAction = (tab: DashboardTab, actionNoticeMsg?: string) => {
    onTabChange(tab);
    if (actionNoticeMsg) {
      showToast(actionNoticeMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-[#1d5bd8]/20">
      
      {/* MAIN CONTAINER WITH SIDEBAR & TOPNAVBAR */}
      <div className="flex flex-1 min-h-screen">
        
        {/* REUSABLE SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          userRole={simulatedRole}
          userName={userName}
          userAvatar={userAvatar}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onNavigateHome={onNavigateHome}
          onLogout={onLogout}
        />

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* REUSABLE TOP NAVBAR */}
          <TopNavbar
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
            simulatedRole={simulatedRole}
            onRoleChange={onRoleChange}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenQuickActions={() => setIsQuickActionsOpen(true)}
            notifications={notifications}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearNotifications={handleClearNotifications}
            onLogout={onLogout}
            onNavigateSettings={() => onTabChange('settings')}
          />

          {/* MAIN TAB CONTENT AREA */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>

        </div>

      </div>

      {/* GLOBAL SEARCH OVERLAY MODAL */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* QUICK ACTIONS OVERLAY MODAL */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      {/* ACTION TOAST NOTIFICATION BANNER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 text-xs font-bold"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING AI COPILOT BUTTON & DRAWER */}
      <FloatingAICopilot
        userRole={simulatedRole}
        userName={userName}
        userAvatar={userAvatar}
      />

    </div>
  );
};
