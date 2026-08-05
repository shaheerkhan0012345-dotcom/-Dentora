import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Building2, ChevronDown, Check, Plus, ShieldCheck, Globe, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClinicSelectorProps {
  userRole?: string;
  onOpenCreateClinicModal?: () => void;
}

export const ClinicSelector: React.FC<ClinicSelectorProps> = ({ userRole, onOpenCreateClinicModal }) => {
  const { currentClinic, clinics, switchClinicById } = useClinic();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20"
      >
        <div className="w-6 h-6 rounded-lg bg-[#1d5bd8]/10 text-[#1d5bd8] flex items-center justify-center shrink-0 font-bold">
          {currentClinic.logo ? (
            <img src={currentClinic.logo} alt={currentClinic.name} className="w-full h-full rounded-lg object-contain p-0.5" />
          ) : (
            <Building2 className="w-3.5 h-3.5" />
          )}
        </div>
        <div className="flex flex-col text-left max-w-[150px] sm:max-w-[200px] truncate">
          <span className="text-[11px] font-bold text-slate-900 truncate flex items-center gap-1">
            {currentClinic.name}
          </span>
          <span className="text-[9px] font-medium text-slate-500 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            {currentClinic.currency} • {currentClinic.subscriptionPlan}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 p-2 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Multi-Tenant Network</p>
                  <p className="text-xs font-bold text-slate-900">Switch Active Clinic</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {clinics.length} Active
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                {clinics.map((clinic) => {
                  const isSelected = clinic.id === currentClinic.id;
                  return (
                    <button
                      key={clinic.id}
                      onClick={() => {
                        switchClinicById(clinic.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border border-blue-200 text-slate-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-slate-600">
                        {clinic.logo ? (
                          <img src={clinic.logo} alt={clinic.name} className="w-full h-full rounded-lg object-contain p-0.5" />
                        ) : (
                          <Building2 className="w-4 h-4 text-[#1d5bd8]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold truncate text-slate-900">{clinic.name}</p>
                          {isSelected && <Check className="w-4 h-4 text-[#1d5bd8] shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {clinic.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-1.5 py-0.2 font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {clinic.currency}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {clinic.subscriptionPlan}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onOpenCreateClinicModal && (
                <div className="pt-2 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenCreateClinicModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register New Clinic
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
