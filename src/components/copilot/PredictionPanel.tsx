import React, { useState, useEffect } from 'react';
import { Brain, AlertCircle, HelpCircle, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { AIPrediction } from '../../types/copilot';
import { subscribeToAIPredictions } from '../../services/aiAutomationService';

export const PredictionPanel: React.FC = () => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);

  useEffect(() => {
    const unsub = subscribeToAIPredictions((list) => setPredictions(list));
    return () => unsub();
  }, []);

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Predictive Analytics & Forecasting
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                Estimates & Models
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Machine learning probability forecasts for patient retention, no-shows, and supply demands.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory Compliance Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Regulatory Compliance:</strong> All predictive metrics generated here are mathematical probability estimates and should be used solely as operational decision support.
        </span>
      </div>

      {/* Predictions Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {predictions.map((pred) => (
          <div
            key={pred.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {pred.metricTitle}
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {pred.predictedValue}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  {(pred.confidenceScore * 100).toFixed(0)}% Confidence
                </span>
                {pred.riskLevel ? (
                  <span
                    className={`block text-[10px] font-bold mt-1 ${
                      pred.riskLevel === 'High'
                        ? 'text-red-600 dark:text-red-400'
                        : pred.riskLevel === 'Medium'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {pred.riskLevel} Risk
                  </span>
                ) : null}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
              {pred.contextNotes}
            </p>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Patient: {pred.patientName || 'Practice Wide'}</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Estimate (Statistical Model)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
