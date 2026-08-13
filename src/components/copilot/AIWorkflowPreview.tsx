import React from 'react';
import { Zap, Database, Brain, Eye, ShieldAlert, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface AIWorkflowPreviewProps {
  step: 'trigger' | 'context' | 'reasoning' | 'preview' | 'confirmation' | 'execution' | 'logging';
  triggerText?: string;
  contextText?: string;
  reasoningText?: string;
  previewText?: string;
  isCompleted?: boolean;
}

export const AIWorkflowPreview: React.FC<AIWorkflowPreviewProps> = ({
  step,
  triggerText = 'User input / System trigger',
  contextText = 'Patient EHR & Practice Context attached',
  reasoningText = 'Gemini AI clinical reasoning model applied',
  previewText = 'Action proposal generated',
  isCompleted = false,
}) => {
  const steps = [
    { key: 'trigger', label: 'Trigger', icon: Zap, text: triggerText },
    { key: 'context', label: 'Context', icon: Database, text: contextText },
    { key: 'reasoning', label: 'Reasoning', icon: Brain, text: reasoningText },
    { key: 'preview', label: 'Preview', icon: Eye, text: previewText },
    { key: 'confirmation', label: 'Doctor Approval', icon: ShieldAlert, text: 'Awaiting human authorization' },
    { key: 'execution', label: 'Execution', icon: CheckCircle2, text: 'Persisting to Firestore EHR' },
    { key: 'logging', label: 'Audit Log', icon: FileText, text: 'Logged to audit trail' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="w-full p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md my-3">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-cyan-400" />
          AI Copilot Automation Engine Pipeline
        </h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
          Modular Workflow
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx || isCompleted;

          return (
            <div
              key={s.key}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-500 text-white ring-1 ring-cyan-500'
                  : isDone
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                  : 'bg-slate-900 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-cyan-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                />
                <span className="text-[9px] font-mono font-bold text-slate-500">0{idx + 1}</span>
              </div>
              <p className="text-[11px] font-semibold tracking-tight">{s.label}</p>
              <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{s.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
