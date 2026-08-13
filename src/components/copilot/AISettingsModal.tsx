import React, { useState } from 'react';
import { X, Sliders, Sparkles, Check, RotateCcw } from 'lucide-react';
import { AISettings } from '../../types/copilot';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (updated: AISettings) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens);
  const [systemPromptOverride, setSystemPromptOverride] = useState(settings.systemPromptOverride || '');
  const [modelAlias, setModelAlias] = useState(settings.modelAlias || 'gemini-3.6-flash');
  const [streamEnabled, setStreamEnabled] = useState(settings.streamEnabled);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      temperature,
      maxTokens,
      systemPromptOverride,
      modelAlias,
      streamEnabled,
    });
    onClose();
  };

  const handleReset = () => {
    setTemperature(0.4);
    setMaxTokens(2048);
    setSystemPromptOverride('');
    setModelAlias('gemini-3.6-flash');
    setStreamEnabled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Dentora AI Settings</h3>
              <p className="text-xs text-slate-500">Configure Copilot intelligence parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY FORM */}
        <div className="space-y-4 text-xs">
          
          {/* MODEL SELECTION */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">AI Gemini Model</label>
            <select
              value={modelAlias}
              onChange={(e) => setModelAlias(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast, Low Latency - Recommended)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Clinical Reasoning)</option>
            </select>
          </div>

          {/* TEMPERATURE SLIDER */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Creativity / Precision (Temperature)</span>
              <span className="text-purple-600 font-extrabold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Exact / Clinical (0.0)</span>
              <span>Balanced (0.4)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* MAX TOKENS */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Max Output Tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          {/* CUSTOM SYSTEM INSTRUCTIONS */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Custom System Prompt Override</label>
            <textarea
              rows={3}
              value={systemPromptOverride}
              onChange={(e) => setSystemPromptOverride(e.target.value)}
              placeholder="e.g. Always format drug dosages in metric mg/ml and append clinical warning..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none"
            />
          </div>

          {/* STREAM TOGGLE */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">Enable Real-Time Response Streaming</span>
              <span className="text-[10px] text-slate-500">Stream tokens as they generate from Gemini API</span>
            </div>
            <input
              type="checkbox"
              checked={streamEnabled}
              onChange={(e) => setStreamEnabled(e.target.checked)}
              className="w-4 h-4 accent-purple-600 cursor-pointer"
            />
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save AI Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
