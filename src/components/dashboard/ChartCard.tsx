import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, Filter, Calendar } from 'lucide-react';

// RECHARTS MOCK DATA
const revenueData = [
  { month: 'Jan', Revenue: 42000, Target: 40000, Expenses: 18000 },
  { month: 'Feb', Revenue: 48000, Target: 42000, Expenses: 19500 },
  { month: 'Mar', Revenue: 54000, Target: 45000, Expenses: 21000 },
  { month: 'Apr', Revenue: 51000, Target: 48000, Expenses: 20000 },
  { month: 'May', Revenue: 62000, Target: 50000, Expenses: 23000 },
  { month: 'Jun', Revenue: 68000, Target: 52000, Expenses: 24500 },
  { month: 'Jul', Revenue: 75000, Target: 55000, Expenses: 26000 },
  { month: 'Aug', Revenue: 82000, Target: 60000, Expenses: 28000 },
];

const patientGrowthData = [
  { month: 'Jan', NewPatients: 42, Returning: 180 },
  { month: 'Feb', NewPatients: 56, Returning: 195 },
  { month: 'Mar', NewPatients: 68, Returning: 210 },
  { month: 'Apr', NewPatients: 61, Returning: 205 },
  { month: 'May', NewPatients: 79, Returning: 230 },
  { month: 'Jun', NewPatients: 84, Returning: 245 },
  { month: 'Jul', NewPatients: 92, Returning: 260 },
  { month: 'Aug', NewPatients: 105, Returning: 285 },
];

const appointmentsOverviewData = [
  { day: 'Mon', Confirmed: 24, Completed: 22, Cancelled: 2 },
  { day: 'Tue', Confirmed: 28, Completed: 26, Cancelled: 1 },
  { day: 'Wed', Confirmed: 32, Completed: 30, Cancelled: 2 },
  { day: 'Thu', Confirmed: 30, Completed: 28, Cancelled: 1 },
  { day: 'Fri', Confirmed: 35, Completed: 33, Cancelled: 2 },
  { day: 'Sat', Confirmed: 18, Completed: 17, Cancelled: 0 },
];

const treatmentDistributionData = [
  { name: '3D Clear Aligners', value: 45, color: '#1d5bd8' },
  { name: 'Hygiene & Cleaning', value: 25, color: '#008080' },
  { name: 'Crowns & Veneers', value: 15, color: '#6366f1' },
  { name: 'Implants & Surgery', value: 10, color: '#f59e0b' },
  { name: 'Teeth Whitening', value: 5, color: '#ec4899' },
];

interface ChartCardProps {
  type?: 'revenue' | 'growth' | 'appointments' | 'distribution';
  title?: string;
  subtitle?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  type = 'revenue',
  title,
  subtitle,
}) => {
  const [timeRange, setTimeRange] = useState<'6M' | '1Y' | 'ALL'>('6M');

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
      
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#1d5bd8]" />
            <span>
              {title || (
                type === 'revenue' ? 'Monthly Practice Revenue & Growth' :
                type === 'growth' ? 'Patient Acquisition & Retention' :
                type === 'appointments' ? 'Weekly Visit & Cancellation Breakdown' :
                'Treatment Revenue Share'
              )}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {subtitle || (
              type === 'revenue' ? 'Comparing total collections against monthly practice targets' :
              type === 'growth' ? 'New first-time consultations vs returning routine patients' :
              type === 'appointments' ? 'Daily appointment breakdown for the active week' :
              'Percentage breakdown of procedure revenue'
            )}
          </p>
        </div>

        {/* TIME FILTER BUTTONS */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          {(['6M', '1Y', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === r ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* RECHARTS CANVAS CONTAINER */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'revenue' ? (
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d5bd8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1d5bd8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008080" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#008080" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} 
                formatter={(val: number | string | Array<number | string> | undefined) => [`$${Number(val || 0).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Revenue" stroke="#1d5bd8" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="Target" stroke="#008080" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
            </AreaChart>
          ) : type === 'growth' ? (
            <LineChart data={patientGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="NewPatients" stroke="#1d5bd8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Returning" stroke="#008080" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          ) : type === 'appointments' ? (
            <BarChart data={appointmentsOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Completed" fill="#1d5bd8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Cancelled" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={treatmentDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {treatmentDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
