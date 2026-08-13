import React from 'react';
import { Package, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const InventoryInsights: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Clinical Inventory Analyst
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                Supply Optimization
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stock depletion velocity, expiry forecasting, and automated purchase requisitions.
            </p>
          </div>
        </div>
      </div>

      {/* Stock Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Warning
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
              2 Items
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-1">
            Composite Resin A2 (3 units remaining) & Surgical Gloves (Size M, 1 box left). Reorder required within 48 hours.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Fast-Moving Velocity
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
              High Demand
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-1">
            Lignocaine 2% Anesthetic Cartridges depleting 28% faster this month due to increased root canal appointments.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-cyan-600" /> Expiry Safeguard
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100">
              Zero Expired
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-1">
            4 boxes of Etchant Gel expiring in 60 days. AI recommends utilizing stock prior to newer batches.
          </p>
        </div>
      </div>

      {/* Recommended Purchase Requisition */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-500" /> AI Drafted Reorder Order Requisition
          </h4>
          <button className="px-3 py-1 rounded-lg bg-cyan-600 text-white font-semibold text-[11px] hover:bg-cyan-700">
            Approve Supplier Order
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          <div className="py-2 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Composite Resin Shade A2</span>
              <span className="text-[10px] text-slate-400 block">Supplier: DentalDirect PK | Item #INV-401</span>
            </div>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Order Qty: 10 Cartridges (Rs. 18,000)</span>
          </div>
          <div className="py-2 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Latex Examination Gloves (M)</span>
              <span className="text-[10px] text-slate-400 block">Supplier: MedSupply Co | Item #INV-802</span>
            </div>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Order Qty: 10 Boxes (Rs. 6,500)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
