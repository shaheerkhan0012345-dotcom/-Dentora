import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  User, 
  Calendar, 
  FileText, 
  Stethoscope, 
  ChevronRight, 
  Sparkles,
  Command
} from 'lucide-react';
import { DashboardTab } from '../../types/dashboard';
import { subscribeToAppointments } from '../../services/appointmentService';
import { subscribeToPatients } from '../../services/patientService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tab: DashboardTab, detailId?: string) => void;
}

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'doctor' | 'invoice' | 'treatment';
  title: string;
  subtitle: string;
  badge: string;
  tab: DashboardTab;
}

const mockSearchData: SearchResult[] = [
  { id: 'p1', type: 'patient', title: 'Sarah Jenkins', subtitle: 'PT-2026-0847 • (555) 234-5678', badge: 'Active Patient', tab: 'patients' },
  { id: 'p2', type: 'patient', title: 'Marcus Vance', subtitle: 'PT-2026-0412 • (555) 987-6543', badge: 'VIP Patient', tab: 'patients' },
  { id: 'p3', type: 'patient', title: 'Elena Rostova', subtitle: 'PT-2026-0119 • (555) 456-7890', badge: 'Aligner Patient', tab: 'patients' },
  { id: 'd1', type: 'doctor', title: 'Dr. Elena Rostova, MD', subtitle: 'Lead Orthodontist • Beverly Hills Branch', badge: 'On Duty', tab: 'staff' },
  { id: 'd2', type: 'doctor', title: 'Dr. Marcus Vance, DDS', subtitle: 'Cosmetic Specialist • Flagship Studio', badge: 'In Surgery', tab: 'staff' },
  { id: 't1', type: 'treatment', title: 'Invisalign Clear Aligner Sequence', subtitle: '18 Trays • $2,850 Standard Package', badge: 'Treatment', tab: 'treatments' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'patient' | 'appointment' | 'invoice'>('all');
  const [liveResults, setLiveResults] = useState<SearchResult[]>(mockSearchData);

  useEffect(() => {
    let currentApts: SearchResult[] = [];
    let currentPts: SearchResult[] = [];

    const unsubApts = subscribeToAppointments((apts) => {
      currentApts = apts.map((a) => ({
        id: a.id,
        type: 'appointment' as const,
        title: `${a.patientName} - ${a.treatment}`,
        subtitle: `Date: ${a.date} at ${a.startTime} • Doctor: ${a.doctorName}`,
        badge: a.status,
        tab: 'appointments' as DashboardTab,
      }));
      setLiveResults([...currentApts, ...currentPts, ...mockSearchData]);
    });

    const unsubPts = subscribeToPatients((pts) => {
      currentPts = pts.map((p) => ({
        id: p.id,
        type: 'patient' as const,
        title: p.fullName,
        subtitle: `${p.patientId} • ${p.phone || '(555) 000-0000'} • ${p.email || 'No email'}`,
        badge: p.status || 'Active',
        tab: 'patients' as DashboardTab,
      }));
      setLiveResults([...currentApts, ...currentPts, ...mockSearchData]);
    });

    return () => {
      unsubApts();
      unsubPts();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Parent triggers open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredResults = liveResults.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesSearch = 
      !searchTerm.trim() ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getItemIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return <User className="w-4 h-4 text-[#1d5bd8]" />;
      case 'appointment': return <Calendar className="w-4 h-4 text-[#008080]" />;
      case 'invoice': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'doctor': return <Stethoscope className="w-4 h-4 text-indigo-600" />;
      default: return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* MODAL CONTENT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[80vh]"
        >
          {/* SEARCH INPUT BAR */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients, appointments, invoices, doctors, treatments..."
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-slate-400 hover:text-slate-600 p-1 text-xs"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* FILTER CATEGORY PILLS */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs bg-white shrink-0">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mr-1">Filter:</span>
            {(['all', 'patient', 'appointment', 'invoice'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 rounded-full font-bold capitalize transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#1d5bd8] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Results' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* RESULTS LIST */}
          <div className="p-2 overflow-y-auto flex-1 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No records found matching "{searchTerm}"</p>
                <p className="text-[11px] text-slate-400 mt-1">Try searching by patient ID, doctor name, or invoice number.</p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelectResult(result.tab, result.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-200/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-2xs transition-all">
                      {getItemIcon(result.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{result.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                          {result.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{result.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#1d5bd8] transition-colors shrink-0 pl-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Go to {result.tab}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono font-bold text-[10px] text-slate-600">
                <Command className="w-3 h-3" /> K
              </span>
              <span>Global Quick Search</span>
            </div>
            <span>Dentora Enterprise Database</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
