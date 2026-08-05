import React, { useState } from 'react';
import { TrendingUp, DollarSign, PieChart, Sparkles, AlertCircle, ArrowUpRight, BarChart3, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CHART_DATA = [
  { month: 'Jan', revenue: 1850000, expenses: 620000 },
  { month: 'Feb', revenue: 2100000, expenses: 650000 },
  { month: 'Mar', revenue: 1950000, expenses: 610000 },
  { month: 'Apr', revenue: 2400000, expenses: 720000 },
  { month: 'May', revenue: 2280000, expenses: 680000 },
  { month: 'Jun', revenue: 2750000, expenses: 750000 },
];

export const BusinessInsights: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string | null>(null);

  const handleAskQuestion = (q: string) => {
    setSelectedQuestion(q);
    if (q.includes('decreased') || q.includes('variance')) {
      setAnswerText('In March, revenue dipped 7% due to 4 cancelled implant surgeries and a 2-day public holiday closure. Recovery in April was driven by 3D aligner tray packages.');
    } else if (q.includes('Highest earning')) {
      setAnswerText('1. Orthodontic Clear Aligners (42% of gross revenue)\n2. Implant Restorations (28%)\n3. Crown & Bridge Suite (18%)\n4. General Hygiene & Fillings (12%)');
    } else if (q.includes('Pending')) {
      setAnswerText('Total uncollected balance stands at Rs. 485,000 across 18 patients. 3 patients account for 60% of the total pending amount.');
    } else {
      setAnswerText('Comparing Q1 to Q2, gross practice revenue expanded by 19.4% with gross profit margins maintaining at 72%.');
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Business & Revenue Analyst
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                Executive Intelligence
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice revenue velocity, high-margin service share, and financial variance audit.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-500" /> Monthly Practice Revenue Trend (PKR)
          </h4>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> +19.4% Q2 Growth
          </span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rs. ${(v / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip
                formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Gross Revenue']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* One-Click Financial Audit Q&A */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-cyan-500" /> Executive Q&A & Variance Audits
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => handleAskQuestion("Why did March revenue decrease?")}
            className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
              selectedQuestion?.includes('decreased')
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
            }`}
          >
            Why did March revenue experience a minor drop?
          </button>
          <button
            onClick={() => handleAskQuestion("Highest earning treatments?")}
            className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
              selectedQuestion?.includes('Highest earning')
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
            }`}
          >
            Which treatment lines generate highest profit margins?
          </button>
          <button
            onClick={() => handleAskQuestion("Pending payments breakdown?")}
            className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
              selectedQuestion?.includes('Pending')
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
            }`}
          >
            What is the total uncollected patient balance?
          </button>
          <button
            onClick={() => handleAskQuestion("Compare Q1 vs Q2?")}
            className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
              selectedQuestion?.includes('Compare')
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
            }`}
          >
            Show quarterly comparative growth summary.
          </button>
        </div>

        {answerText ? (
          <div className="p-4 rounded-xl bg-cyan-950 text-white border border-cyan-800 text-xs leading-relaxed animate-in fade-in duration-200 whitespace-pre-line">
            <span className="font-bold text-cyan-300 block mb-1">AI Financial Analyst Response:</span>
            {answerText}
          </div>
        ) : null}
      </div>

      {/* Strategic Business Recommendations */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
        <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" /> Executive Action Plan & Growth Advice
        </h4>
        <ul className="space-y-1.5 text-amber-950 dark:text-amber-200 list-disc list-inside">
          <li><strong>High-Value Promotion:</strong> Expand weekend slots specifically for clear aligner consultations.</li>
          <li><strong>No-Show Reduction:</strong> Enable 24-hour WhatsApp UltraMsg reminders for appointments over Rs. 20,000.</li>
          <li><strong>Unpaid Balance Recapture:</strong> Automate polite WhatsApp payment reminders for balances older than 14 days.</li>
        </ul>
      </div>
    </div>
  );
};
