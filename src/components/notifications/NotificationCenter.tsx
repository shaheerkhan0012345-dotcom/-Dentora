import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Archive,
  AlertTriangle,
  Calendar,
  Sparkles,
  UserCheck,
  DollarSign,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../types/admin';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  archiveNotification,
} from '../../services/notificationService';

interface NotificationCenterProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateTab }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    const unsub = subscribeToNotifications(setNotifications);
    return () => unsub();
  }, []);

  const activeNotifications = notifications.filter((n) => !n.archived);

  const filtered = activeNotifications.filter((n) => {
    if (filterType === 'Unread') return !n.read;
    if (filterType === 'Stock Alerts') return n.type === 'stock_alert';
    if (filterType === 'Appointments') return n.type === 'appointment';
    if (filterType === 'AI Copilot') return n.type === 'ai_alert';
    if (filterType === 'Staff') return n.type === 'leave_request';
    return true;
  });

  const unreadCount = activeNotifications.filter((n) => !n.read).length;

  const handleItemClick = (n: NotificationItem) => {
    if (!n.read) {
      markNotificationAsRead(n.id);
    }
    if (n.actionUrl && onNavigateTab) {
      const match = n.actionUrl.match(/tab=([^&]+)/);
      if (match && match[1]) {
        onNavigateTab(match[1]);
      }
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'stock_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#1d5bd8]" />;
      case 'ai_alert':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'leave_request':
        return <UserCheck className="w-4 h-4 text-amber-600" />;
      case 'payment_due':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1d5bd8]" />
            <span>Practice Notification Center</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-xs rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time automated practice alerts, low stock warnings, appointment reminders & AI Copilot requests
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['All', 'Unread', 'Stock Alerts', 'Appointments', 'AI Copilot', 'Staff'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            No notifications found in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.read
                  ? 'bg-slate-50/90 border-[#1d5bd8]/30 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">{item.title}</h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#1d5bd8] inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-extrabold">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {!item.read && (
                  <button
                    onClick={() => markNotificationAsRead(item.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Mark as Read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => archiveNotification(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Archive Notification"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
