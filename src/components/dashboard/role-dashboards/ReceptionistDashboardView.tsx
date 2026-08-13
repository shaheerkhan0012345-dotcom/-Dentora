import React from 'react';
import { 
  CreditCard, 
  Globe, 
  UserPlus, 
  ArrowRight
} from 'lucide-react';
import { DashboardCard } from '../DashboardCard';
import { AppointmentsTable } from '../AppointmentsTable';
import { LiveQueueWidget } from '../LiveQueueWidget';
import { DashboardTab } from '../../../types/dashboard';

interface ViewProps {
  userName: string;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const ReceptionistDashboardView: React.FC<ViewProps> = ({ userName, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* RECEPTIONIST BANNER */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] tracking-wider uppercase border border-teal-500/30">
              Front Desk & Reception Desk
            </span>
            <span className="text-[11px] text-teal-300 font-bold">4 Patients in Lobby</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Welcome, {userName}!
          </h1>
          <p className="text-xs text-teal-100/90 max-w-xl">
            Streamline patient check-ins, manage live chair queue, process co-pays, and verify online appointment requests.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab('patients')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-300" />
            <span>Register New Patient</span>
          </button>
          <button
            onClick={() => onNavigateTab('payments')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-white" />
            <span>Collect Payment</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          card={{
            id: 'rec-1',
            title: "Today's Total Bookings",
            value: '12 Booked',
            subValue: '8 Confirmed • 4 Unconfirmed',
            trend: '+3 online today',
            trendDirection: 'up',
            iconName: 'calendar',
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'rec-2',
            title: 'Lobby Waiting Queue',
            value: '4 Patients',
            subValue: 'Avg wait: 12 minutes',
            trend: '2 Checked in',
            trendDirection: 'neutral',
            iconName: 'clock',
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'rec-3',
            title: "Today's Collections",
            value: '$3,200',
            subValue: '$1,850 Cash/Card • $1,350 HSA',
            trend: '+15% copay goal',
            trendDirection: 'up',
            iconName: 'dollar',
            category: 'financial',
          }}
        />
        <DashboardCard
          card={{
            id: 'rec-4',
            title: 'Pending Online Requests',
            value: '3 Requests',
            subValue: 'Online 24/7 Portal Booked',
            trend: 'Needs review',
            trendDirection: 'neutral',
            iconName: 'globe',
            category: 'operations',
          }}
        />
      </div>

      {/* CONTENT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AppointmentsTable />

          {/* ONLINE BOOKING NOTICES */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Recent 24/7 Web Booking Requests</span>
              </span>
              <button
                onClick={() => onNavigateTab('online-booking')}
                className="text-[11px] font-bold text-[#1d5bd8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Requests</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">David Miller</span>
                  <p className="text-[11px] text-slate-500">Requested: Tomorrow 2:30 PM • Teeth Whitening</p>
                </div>
                <button
                  onClick={() => onNavigateTab('appointments')}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-xl cursor-pointer"
                >
                  Approve Slot
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <LiveQueueWidget />
        </div>
      </div>
    </div>
  );
};
