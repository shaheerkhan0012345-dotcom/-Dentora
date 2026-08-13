import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  CalendarPlus, 
  FileCheck2, 
  Pill, 
  Smile, 
  Sparkles, 
  X,
  ChevronRight
} from 'lucide-react';
import { DashboardTab } from '../../types/dashboard';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: DashboardTab, actionNoticeMsg?: string) => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'add-patient',
      tab: 'patients' as DashboardTab,
      title: 'Add New Patient',
      desc: 'Register personal details, medical history & assign primary doctor',
      icon: <UserPlus className="w-5 h-5 text-[#1d5bd8]" />,
      bgColor: 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200/80',
      notice: 'Navigating to Patient Registration wizard...',
    },
    {
      id: 'book-appointment',
      tab: 'appointments' as DashboardTab,
      title: 'Book Appointment',
      desc: 'Schedule consultation, check chair availability & send SMS reminder',
      icon: <CalendarPlus className="w-5 h-5 text-[#008080]" />,
      bgColor: 'bg-teal-50/80 hover:bg-teal-100/80 border-teal-200/80',
      notice: 'Opening Appointment Scheduler...',
    },
    {
      id: 'generate-invoice',
      tab: 'invoices' as DashboardTab,
      title: 'Generate Invoice',
      desc: 'Create billing statement, apply insurance copay & process payment',
      icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />,
      bgColor: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200/80',
      notice: 'Opening Invoice Generator...',
    },
    {
      id: 'new-prescription',
      tab: 'prescriptions' as DashboardTab,
      title: 'New Prescription',
      desc: 'Issue digital Rx with auto-dosage guidelines & pharmacy delivery',
      icon: <Pill className="w-5 h-5 text-indigo-600" />,
      bgColor: 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200/80',
      notice: 'Launching E-Prescription Portal...',
    },
    {
      id: 'dental-chart',
      tab: 'dental-chart' as DashboardTab,
      title: 'Open Dental Chart',
      desc: 'Interactive 32-tooth arch map, surface wear & treatment planning',
      icon: <Smile className="w-5 h-5 text-amber-600" />,
      bgColor: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/80',
      notice: 'Loading Interactive 3D Dental Chart...',
    },
    {
      id: 'ai-assistant',
      tab: 'ai-assistant' as DashboardTab,
      title: 'Gemini AI Assistant',
      desc: 'AI treatment summary generator, insurance codification & clinical notes',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      bgColor: 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-200/80',
      notice: 'Initializing Gemini Clinical AI Assistant...',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* MODAL CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-5"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1d5bd8]" />
                <h2 className="text-base font-extrabold text-slate-900">Dentora Quick Action Launcher</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select an operational workflow to launch instantly
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ACTION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {actions.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.tab, act.notice);
                  onClose();
                }}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start justify-between group ${act.bgColor}`}
              >
                <div className="flex gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    {act.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#1d5bd8] transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1">
                      {act.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2 mt-1" />
              </button>
            ))}
          </div>

          {/* FOOTER */}
          <div className="pt-2 text-center text-[11px] text-slate-400">
            Tip: You can also press <span className="font-bold text-slate-600">Cmd+K</span> anywhere to open Global Search.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
