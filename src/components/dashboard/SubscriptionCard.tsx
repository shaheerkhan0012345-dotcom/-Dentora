import React, { useState, useEffect } from 'react';
import { ClinicSubscription, SubscriptionPlanType } from '../../types/subscription';
import { getClinicSubscription, updateSubscriptionPlan, PLAN_CONFIGS } from '../../services/subscriptionService';
import { Zap, Check, ShieldCheck, Calendar, ArrowUpRight, Lock, Sparkles, Building2, Users, Bot, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubscriptionCardProps {
  clinicId: string;
  clinicName: string;
  userRole?: string;
  userName?: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  clinicId,
  clinicName,
  userRole = 'Admin',
  userName = 'Admin User',
}) => {
  const [subscription, setSubscription] = useState<ClinicSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<SubscriptionPlanType>('Enterprise');

  useEffect(() => {
    let isMounted = true;
    getClinicSubscription(clinicId).then((sub) => {
      if (isMounted) {
        setSubscription(sub);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [clinicId]);

  const handleApplyUpgrade = async (plan: SubscriptionPlanType) => {
    try {
      setLoading(true);
      const updated = await updateSubscriptionPlan(clinicId, plan, userName);
      setSubscription(updated);
      setIsUpgradeModalOpen(false);
    } catch (err) {
      console.error('Subscription update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-12 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  const limits = subscription.featureLimits;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1d5bd8]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#1d5bd8]/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {subscription.plan} SaaS Plan
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              {subscription.status}
            </span>
          </div>
          <h3 className="text-2xl font-black text-white">{clinicName} Subscription</h3>
          <p className="text-slate-400 text-xs mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Renews on: <span className="text-slate-200 font-semibold">{subscription.renewalDate}</span> (${subscription.pricePerMonth}/mo)
          </p>
        </div>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#1d5bd8] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          Change / Upgrade Plan
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feature Limits Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
            <Users className="w-4 h-4 text-blue-400" />
            Max Doctors
          </div>
          <div className="text-xl font-extrabold text-white">{limits.maxDoctors} Active</div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Monthly Patients
          </div>
          <div className="text-xl font-extrabold text-white">{limits.maxPatientsPerMonth.toLocaleString()}</div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
            <Bot className="w-4 h-4 text-emerald-400" />
            Daily AI Copilot
          </div>
          <div className="text-xl font-extrabold text-white">{limits.maxAIQueriesPerDay} queries/day</div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            WhatsApp Engine
          </div>
          <div className="text-xl font-extrabold text-white">
            {limits.whatsappIntegration ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* UPGRADE PLAN MODAL */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-black">Choose Subscription Tier</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Select a multi-clinic tier structure. (No payment required in preview mode)
                  </p>
                </div>
                <button
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 my-6">
                {(['Basic', 'Professional', 'Enterprise'] as SubscriptionPlanType[]).map((planKey) => {
                  const pConfig = PLAN_CONFIGS[planKey];
                  const isCurrent = subscription.plan === planKey;

                  return (
                    <div
                      key={planKey}
                      className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#1d5bd8]/20 border-[#1d5bd8] ring-2 ring-[#1d5bd8]/40'
                          : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#1d5bd8] text-white text-[10px] font-extrabold uppercase">
                          Current Tier
                        </span>
                      )}

                      <div>
                        <h4 className="text-lg font-black text-white">{planKey}</h4>
                        <div className="text-2xl font-extrabold text-blue-400 my-2">
                          ${pConfig.pricePerMonth}<span className="text-xs text-slate-400 font-normal">/mo</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-4">{pConfig.description}</p>

                        <ul className="space-y-2 text-xs text-slate-300 mb-4">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            Up to {pConfig.maxDoctors} Doctors
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {pConfig.maxPatientsPerMonth.toLocaleString()} Patients/mo
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {pConfig.maxAIQueriesPerDay} AI Queries/day
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className={`w-3.5 h-3.5 ${pConfig.whatsappIntegration ? 'text-emerald-400' : 'text-slate-600'}`} />
                            WhatsApp Integration
                          </li>
                        </ul>
                      </div>

                      <button
                        disabled={isCurrent}
                        onClick={() => handleApplyUpgrade(planKey)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-[#1d5bd8] hover:bg-blue-600 text-white shadow-md'
                        }`}
                      >
                        {isCurrent ? 'Active Plan' : `Switch to ${planKey}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Tenant Isolation & Multi-clinic scoping automatically enforced across all tiers.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
