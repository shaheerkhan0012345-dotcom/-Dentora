import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  Stethoscope, 
  Package, 
  Bell, 
  Activity
} from 'lucide-react';
import { StatCardData } from '../../types/dashboard';

interface DashboardCardProps {
  card: StatCardData;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ card, onClick }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'calendar': return <Calendar className="w-4 h-4 text-[#1d5bd8]" />;
      case 'users': return <Users className="w-4 h-4 text-sky-600" />;
      case 'clock': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'dollar': return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'credit-card': return <CreditCard className="w-4 h-4 text-[#008080]" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'check': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'user-plus': return <UserPlus className="w-4 h-4 text-indigo-600" />;
      case 'stethoscope': return <Stethoscope className="w-4 h-4 text-purple-600" />;
      case 'package': return <Package className="w-4 h-4 text-amber-600" />;
      case 'bell': return <Bell className="w-4 h-4 text-rose-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const isPositive = card.trendDirection === 'up';
  const isNegative = card.trendDirection === 'down';

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group ${
        onClick ? 'hover:-translate-y-0.5' : ''
      }`}
    >
      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider truncate">
          {card.title}
        </span>
        <div className="p-2 rounded-xl bg-slate-100/80 group-hover:bg-slate-100 transition-colors shrink-0">
          {getIcon(card.iconName)}
        </div>
      </div>

      {/* VALUE & UNIT */}
      <div>
        <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
          <span>{card.value}</span>
          {card.unit && <span className="text-xs font-bold text-slate-400">{card.unit}</span>}
        </div>
        {card.subValue && (
          <span className="text-[11px] font-medium text-slate-400 block mt-0.5">{card.subValue}</span>
        )}
      </div>

      {/* FOOTER TREND & SPARKLINE BAR */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              {card.trend}
            </span>
          ) : isNegative ? (
            <span className="flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
              <TrendingDown className="w-3 h-3" />
              {card.trend}
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              <Minus className="w-3 h-3" />
              {card.trend}
            </span>
          )}
        </div>

        {/* SPARKLINE CHART BARS */}
        {card.sparklineData && (
          <div className="flex items-end gap-1 h-5 w-16 shrink-0">
            {card.sparklineData.map((val, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-t-xs transition-all ${
                  isNegative ? 'bg-rose-400/80' : 'bg-[#008080]/80'
                }`}
                style={{ height: `${Math.max(15, (val / 100) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
