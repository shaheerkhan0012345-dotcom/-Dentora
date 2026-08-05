import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  UserPlus, 
  Info, 
  Trash2,
  CheckCheck
} from 'lucide-react';
import { NotificationItem } from '../../types/dashboard';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'alerts') return item.priority === 'high' || item.category === 'inventory';
    return true;
  });

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'appointment': return <Calendar className="w-4 h-4 text-[#1d5bd8]" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'inventory': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'patient': return <UserPlus className="w-4 h-4 text-[#008080]" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1d5bd8]" />
            <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#1d5bd8] text-white text-[10px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[#1d5bd8] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-slate-600 font-medium p-1 cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 text-[11px] font-semibold bg-white">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'unread' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('alerts')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'alerts' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Critical Alerts
          </button>
        </div>

        {/* LIST */}
        <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Check className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-[11px] mt-0.5">No unread notifications at this moment.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkRead(item.id)}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  !item.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs truncate ${!item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#1d5bd8] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-2.5 border-t border-slate-100 text-center bg-slate-50">
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close Notification Panel
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
