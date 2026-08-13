import React from 'react';
import { 
  BarChart3, 
  Sparkles 
} from 'lucide-react';
import { DashboardCard } from '../DashboardCard';
import { ChartCard } from '../ChartCard';
import { AppointmentsTable } from '../AppointmentsTable';
import { LiveQueueWidget } from '../LiveQueueWidget';
import { RecentActivity } from '../RecentActivity';
import { DashboardTab } from '../../../types/dashboard';

interface ViewProps {
  userName: string;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const AdminDashboardView: React.FC<ViewProps> = ({ userName, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-[10px] tracking-wider uppercase border border-blue-500/30">
              Clinic Owner & Admin Command Center
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Clinic Operations
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Here is your real-time practice dashboard featuring total revenue collections, active patient queue, inventory reorder status, and staff utilization metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Financial Reports</span>
          </button>
          <button
            onClick={() => onNavigateTab('ai-assistant')}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Executive Summary</span>
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          card={{
            id: 'adm-1',
            title: 'Total Practice Revenue',
            value: '$82,400',
            subValue: '$4,850 Collected Today',
            trend: '+22.4% vs last mo',
            trendDirection: 'up',
            iconName: 'dollar',
            sparklineData: [40, 55, 65, 80, 95],
            category: 'financial',
          }}
        />
        <DashboardCard
          card={{
            id: 'adm-2',
            title: 'Active Patient Registry',
            value: '1,420',
            subValue: '+92 New this month',
            trend: '+14% acquisition',
            trendDirection: 'up',
            iconName: 'users',
            sparklineData: [30, 40, 50, 70, 92],
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'adm-3',
            title: 'Inventory Health',
            value: '2 Critical',
            subValue: 'Aligner Trays & Etchant Resin',
            trend: 'Action required',
            trendDirection: 'down',
            iconName: 'package',
            sparklineData: [10, 8, 5, 3, 2],
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'adm-4',
            title: 'Staff On Duty',
            value: '8 / 10',
            subValue: '3 Doctors • 2 Hygienists • 3 Front',
            trend: 'Full coverage',
            trendDirection: 'up',
            iconName: 'user-plus',
            sparklineData: [6, 7, 8, 8, 8],
            category: 'operations',
          }}
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue & Treatment Performance"
            subtitle="Monthly breakdown by orthodontics, implants, hygiene, and general dentistry"
          />
        </div>
        <div className="space-y-4">
          <LiveQueueWidget />
          <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Operations Insight</span>
            </div>
            <p className="text-xs text-purple-800/90 leading-relaxed">
              Dr. Elena's afternoon slot has a 15-minute buffer. High probability of converting 2 hygiene patients to clear aligners based on past consult notes.
            </p>
          </div>
        </div>
      </div>

      {/* APPOINTMENTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentsTable />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};
