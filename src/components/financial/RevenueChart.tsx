import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { FinancialAnalyticsSummary } from '../../types/financial';

interface RevenueChartProps {
  summary: FinancialAnalyticsSummary;
}

const COLORS = ['#1d5bd8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const RevenueChart: React.FC<RevenueChartProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. REVENUE VS EXPENSES TREND CHART */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Revenue vs. Operational Expenses</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Monthly financial comparison & gross profit trend</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Est Profit: ${summary.estimatedProfit.toLocaleString('en-US')}
          </span>
        </div>

        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d5bd8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1d5bd8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                formatter={(val: number) => [`$${val.toLocaleString('en-US')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#1d5bd8" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses ($)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. PAYMENT METHODS DISTRIBUTION */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Payment Gateway Breakdown</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Distribution of payments across Cash, Card, Bank & Mobile Wallets</p>
        </div>

        <div className="h-64 w-full text-xs flex items-center justify-center">
          {summary.paymentMethodBreakdown.length === 0 ? (
            <div className="text-slate-400 font-semibold">No payment breakdown available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.paymentMethodBreakdown}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={5}
                  label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                >
                  {summary.paymentMethodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  formatter={(val: number) => [`$${val.toLocaleString('en-US')}`, 'Total Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. TOP REVENUE GENERATING TREATMENTS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 lg:col-span-2">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Top Revenue Generating Dental Treatments</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Most profitable clinical procedures billed this month</p>
        </div>

        <div className="h-60 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.topTreatments} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                formatter={(val: number) => [`$${val.toLocaleString('en-US')}`, 'Revenue']}
              />
              <Bar dataKey="revenue" name="Total Revenue ($)" fill="#1d5bd8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
