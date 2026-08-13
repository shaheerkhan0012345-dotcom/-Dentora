import React, { useState } from 'react';
import { 
  Activity, 
  UserPlus, 
  Calendar, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Pill, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { ActivityItem } from '../../types/dashboard';

const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'patient',
    title: 'New Patient Registered',
    description: 'Sarah Jenkins created patient file #PT-2026-0847 & assigned to Dr. Elena',
    timestamp: '10 minutes ago',
    user: 'Front Desk - Mia',
    category: 'clinical',
  },
  {
    id: 'act-2',
    type: 'appointment',
    title: 'Appointment Status: In Chair',
    description: 'Marcus Vance checked in for 3D Clear Aligner Refinement in Chair 3',
    timestamp: '25 minutes ago',
    user: 'Hygiene Desk',
    category: 'clinical',
  },
  {
    id: 'act-3',
    type: 'invoice',
    title: 'Copay Payment Collected',
    description: '$180.00 processed via HSA Card for Invoice #INV-2026-8801',
    timestamp: '42 minutes ago',
    user: 'Billing Specialist - Alex',
    category: 'financial',
  },
  {
    id: 'act-4',
    type: 'prescription',
    title: 'Digital Rx Issued',
    description: 'Amoxicillin 500mg prescribed by Dr. Marcus for Tooth #14 Post-Op',
    timestamp: '1 hour ago',
    user: 'Dr. Marcus Vance',
    category: 'clinical',
  },
  {
    id: 'act-5',
    type: 'system',
    title: 'Inventory Stock Restocked',
    description: '50 Box Dental Aligner Trays & 20 Composite Resin Tubes received',
    timestamp: '2 hours ago',
    user: 'Inventory Manager',
    category: 'operations',
  },
];

export const RecentActivity: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'clinical' | 'financial' | 'operations'>('all');

  const filtered = mockActivities.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'patient': return <UserPlus className="w-4 h-4 text-[#1d5bd8]" />;
      case 'appointment': return <Calendar className="w-4 h-4 text-[#008080]" />;
      case 'invoice': return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'prescription': return <Pill className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-[#1d5bd8]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Audit Activity Log</h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time clinic operations feed</p>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
          {(['all', 'clinical', 'financial', 'operations'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                filter === cat ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVITY TIMELINE LIST */}
      <div className="space-y-3.5 pt-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200/80 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold text-slate-400">
                  <span>{item.timestamp}</span>
                  <span>•</span>
                  <span>{item.user}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1d5bd8] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};
