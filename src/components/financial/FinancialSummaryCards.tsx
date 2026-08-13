import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
} from 'lucide-react';
import { FinancialAnalyticsSummary } from '../../types/financial';

interface FinancialSummaryCardsProps {
  summary: FinancialAnalyticsSummary;
  lowStockCount: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  summary,
  lowStockCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* TODAY'S REVENUE */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2 group hover:border-[#1d5bd8] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Today's Revenue
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1d5bd8] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-900">
            ${summary.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +12%
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold">
          Collected via Cash, Card & Mobile Wallets
        </p>
      </div>

      {/* MONTHLY REVENUE & PROFIT */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2 group hover:border-[#1d5bd8] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Monthly Revenue
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-emerald-600">
            ${summary.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
            Net: ${summary.estimatedProfit.toLocaleString('en-US')}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold">
          Year to Date: ${summary.yearlyRevenue.toLocaleString('en-US')}
        </p>
      </div>

      {/* OUTSTANDING PAYMENTS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2 group hover:border-[#1d5bd8] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Outstanding Receivables
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-amber-600">
            ${summary.outstandingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            Pending Copays
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold">
          Uncollected balances across open invoices
        </p>
      </div>

      {/* TOTAL EXPENSES & LOW STOCK ALERTS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2 group hover:border-[#1d5bd8] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Clinic Expenses & Inventory
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-900">
            ${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          {lowStockCount > 0 ? (
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} Low Stock
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Stock Healthy
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 font-semibold">
          Operational costs, lab fees & inventory supplies
        </p>
      </div>

    </div>
  );
};
