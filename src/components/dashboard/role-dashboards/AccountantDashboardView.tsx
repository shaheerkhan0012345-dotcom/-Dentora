import React from 'react';
import { 
  Receipt, 
  TrendingUp
} from 'lucide-react';
import { DashboardCard } from '../DashboardCard';
import { ChartCard } from '../ChartCard';
import { DashboardTab } from '../../../types/dashboard';

interface ViewProps {
  userName: string;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const AccountantDashboardView: React.FC<ViewProps> = ({ userName, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* ACCOUNTANT BANNER */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase border border-amber-500/30">
              Financial Ledger & Billing Command
            </span>
            <span className="text-[11px] text-amber-300 font-bold">Monthly Target: 137.3% Achieved</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Financial Workstation, {userName}
          </h1>
          <p className="text-xs text-amber-100/90 max-w-xl">
            Monitor real-time cash flow, pending insurance claims, outstanding invoices, and complete revenue audit statements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab('invoices')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-300" />
            <span>Manage Invoices</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>Generate Ledger Report</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          card={{
            id: 'acc-1',
            title: 'Monthly Collections',
            value: '$82,400',
            subValue: '137.3% of $60,000 target',
            trend: '+34% vs last mo',
            trendDirection: 'up',
            iconName: 'dollar',
            category: 'financial',
          }}
        />
        <DashboardCard
          card={{
            id: 'acc-2',
            title: "Today's Collections",
            value: '$4,850',
            subValue: '$3,200 Cash/Card • $1,650 Insurance',
            trend: '+22.4% daily avg',
            trendDirection: 'up',
            iconName: 'credit-card',
            category: 'financial',
          }}
        />
        <DashboardCard
          card={{
            id: 'acc-3',
            title: 'Outstanding Patient Balance',
            value: '$3,450',
            subValue: '5 Overdue Invoices (>30 Days)',
            trend: 'Follow-up needed',
            trendDirection: 'down',
            iconName: 'file-text',
            category: 'financial',
          }}
        />
        <DashboardCard
          card={{
            id: 'acc-4',
            title: 'Pending Insurance Claims',
            value: '$12,800',
            subValue: '14 Claims in portal submission',
            trend: 'Processing',
            trendDirection: 'neutral',
            iconName: 'check',
            category: 'financial',
          }}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue & Ledger Breakdown"
            subtitle="Insurance reimbursements vs patient direct co-pays"
          />
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Outstanding Invoices Alert
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-950">#INV-8802 - James Wilson</span>
                <p className="text-[11px] text-rose-700">$450.00 • 34 Days Overdue</p>
              </div>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
              >
                Send Reminder
              </button>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-950">#INV-8805 - Amanda Ross</span>
                <p className="text-[11px] text-amber-700">$1,200.00 • Insurance Pending</p>
              </div>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
              >
                Check Claim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
