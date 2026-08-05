import React, { useState, useEffect } from 'react';
import { Sun, Calendar, DollarSign, AlertCircle, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAdminDailyBriefing, DailyBriefingPayload } from '../../services/aiAutomationService';

export const DailyBriefingCard: React.FC = () => {
  const [briefing, setBriefing] = useState<DailyBriefingPayload | null>(null);

  useEffect(() => {
    fetchAdminDailyBriefing().then((data) => setBriefing(data));
  }, []);

  if (!briefing) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 text-white border border-slate-800 shadow-xl my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Executive Daily Briefing
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Admin Oversight
              </span>
            </h3>
            <p className="text-xs text-slate-400">{briefing.date}</p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Status: All Systems Operational
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Appointments Today
          </span>
          <p className="text-xl font-extrabold text-white mt-1">{briefing.appointmentsTodayCount} Scheduled</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Revenue Expected
          </span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">Rs. {briefing.revenueTodayTotal.toLocaleString()}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Low Stock Alerts
          </span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{briefing.lowStockAlertsCount} Items</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Active Doctors
          </span>
          <p className="text-xl font-extrabold text-white mt-1">{briefing.activeDoctorsCount} On Duty</p>
        </div>
      </div>

      {/* Critical Executive Reminders */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <span className="font-bold text-cyan-300 block mb-2 uppercase tracking-wider text-[10px]">
          Priority Action Items for Today
        </span>
        <ul className="space-y-1.5 text-slate-300">
          {briefing.criticalReminders.map((rem, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{rem}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
