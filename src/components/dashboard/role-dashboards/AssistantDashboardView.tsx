import React from 'react';
import { 
  Clock, 
  Package, 
  AlertTriangle,
  Activity
} from 'lucide-react';
import { DashboardCard } from '../DashboardCard';
import { LiveQueueWidget } from '../LiveQueueWidget';
import { DashboardTab } from '../../../types/dashboard';

interface ViewProps {
  userName: string;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const AssistantDashboardView: React.FC<ViewProps> = ({ userName, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* ASSISTANT BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase border border-indigo-500/30">
              Dental Chairside Assistant Station
            </span>
            <span className="text-[11px] text-indigo-300 font-bold">Operatory Sterilization Ready</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Hello, {userName}!
          </h1>
          <p className="text-xs text-indigo-100/90 max-w-xl">
            Monitor patient chair prep status, manage inventory supply restocks, and assist doctors during live dental procedures.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-amber-300" />
            <span>Supply Stock Alerts</span>
          </button>
          <button
            onClick={() => onNavigateTab('queue')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>Call Next Patient</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          card={{
            id: 'ast-1',
            title: 'Chair Queue Active',
            value: '4 Patients',
            subValue: 'Room #1 & Room #2 Active',
            trend: 'In Chair',
            trendDirection: 'up',
            iconName: 'clock',
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'ast-2',
            title: 'Assigned Patients Today',
            value: '8 Patients',
            subValue: 'Assigned to Dr. Elena',
            trend: '4 Completed',
            trendDirection: 'up',
            iconName: 'users',
            category: 'clinical',
          }}
        />
        <DashboardCard
          card={{
            id: 'ast-3',
            title: 'Low Stock Supply Alerts',
            value: '2 Items',
            subValue: 'Aligner Trays & Etchant Gel',
            trend: 'Reorder flagged',
            trendDirection: 'down',
            iconName: 'package',
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'ast-4',
            title: 'Sterilization Status',
            value: '100% Ready',
            subValue: 'Autoclave Cycle #4 Completed',
            trend: 'Verified',
            trendDirection: 'up',
            iconName: 'check',
            category: 'operations',
          }}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LiveQueueWidget />

          {/* TASK CHECKLIST FOR ASSISTANT */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Assigned Operatory Preparation Tasks</span>
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="line-through text-slate-400">Sterilize Tray Set #2 for Root Canal</span>
                </div>
                <span className="text-[10px] text-slate-400">09:15 AM</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-slate-800 font-bold">Prepare Clear Aligner Attachment Kit for Michael Vance</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold">11:30 AM</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-slate-800">Restock Disposable Gloves & Suction Tips in Room #3</span>
                </div>
                <span className="text-[10px] text-slate-500">02:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Inventory Alert</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              3D Clear Aligner Trays (Box of 50) dropped below minimum 5 threshold. Please submit reorder request.
            </p>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Go to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
