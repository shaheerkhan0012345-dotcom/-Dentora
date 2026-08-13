import React from 'react';
import { 
  Users, 
  Sparkles, 
  Smile, 
  Pill
} from 'lucide-react';
import { DashboardCard } from '../DashboardCard';
import { AppointmentsTable } from '../AppointmentsTable';
import { LiveQueueWidget } from '../LiveQueueWidget';
import { DashboardTab } from '../../../types/dashboard';

interface ViewProps {
  userName: string;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const DoctorDashboardView: React.FC<ViewProps> = ({ userName, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* DOCTOR HEADER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] tracking-wider uppercase border border-emerald-500/30">
              Doctor Clinical Workstation
            </span>
            <span className="text-[11px] text-teal-300 font-bold">Operatory Room #2 Active</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Good day, Dr. {userName}!
          </h1>
          <p className="text-xs text-emerald-100/90 max-w-xl">
            You have <span className="font-bold text-white">8 patients scheduled</span> today. 2 currently waiting in queue, 1 in chair for clear aligner fitting.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab('dental-chart')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
          >
            <Smile className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Charting</span>
          </button>
          <button
            onClick={() => onNavigateTab('ai-assistant')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Clinical Notes Copilot</span>
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          card={{
            id: 'doc-1',
            title: "Today's Patient Schedule",
            value: '8 Patients',
            subValue: '4 Completed • 4 Remaining',
            trend: 'On Time Schedule',
            trendDirection: 'up',
            iconName: 'calendar',
            category: 'clinical',
          }}
        />
        <DashboardCard
          card={{
            id: 'doc-2',
            title: 'Waiting Room Queue',
            value: '2 Patients',
            subValue: 'Avg chair wait: 8 mins',
            trend: 'Normal Flow',
            trendDirection: 'up',
            iconName: 'clock',
            category: 'operations',
          }}
        />
        <DashboardCard
          card={{
            id: 'doc-3',
            title: 'Pending Clinical Notes',
            value: '1 Chart Note',
            subValue: 'Sarah Jenkins - Root Canal',
            trend: 'Needs Signoff',
            trendDirection: 'neutral',
            iconName: 'file-text',
            category: 'clinical',
          }}
        />
        <DashboardCard
          card={{
            id: 'doc-4',
            title: 'Prescriptions Issued',
            value: '5 Issued',
            subValue: 'Amoxicillin & Ibuprofen',
            trend: 'All synced',
            trendDirection: 'up',
            iconName: 'pill',
            category: 'clinical',
          }}
        />
      </div>

      {/* MAIN CLINICAL CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AppointmentsTable userRole="Doctor" userName={userName} filterDoctorName={userName} />

          {/* AI SUMMARY BOX */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Clinical Summary & Next Patient Prep</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Next Patient: <strong className="text-slate-900">Michael Vance</strong> (#PT-4920). Medical Alert: <span className="text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded">Penicillin Allergy</span>. Scheduled for Tooth #14 Composite Filling. X-Rays reviewed 3 days ago show moderate mesial caries.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateTab('dental-chart')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Open Michael's Dental Chart
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <LiveQueueWidget />

          {/* QUICK DOCTOR ACTIONS */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Quick Chairside Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('dental-chart')}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Write Prescription</span>
                <Pill className="w-4 h-4 text-emerald-600" />
              </button>
              <button
                onClick={() => onNavigateTab('dental-chart')}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Add Periodontal Charting</span>
                <Smile className="w-4 h-4 text-emerald-600" />
              </button>
              <button
                onClick={() => onNavigateTab('patients')}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Search Clinical History</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
