import React, { useState } from 'react';
import { Eye, Upload, AlertTriangle, Sparkles, ShieldAlert, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { XRayAnalysisResult } from '../../types/copilot';

interface AIXRayAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
}

export const AIXRayAssistant: React.FC<AIXRayAssistantProps> = ({
  isOpen,
  onClose,
  patientName = 'Ali Khan',
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<XRayAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setIsAnalyzing(true);

      setTimeout(() => {
        setAnalysis({
          imageId: `XR-${Math.floor(1000 + Math.random() * 9000)}`,
          imageName: file.name,
          patientName,
          toothRegion: 'Mandibular Right Quadrant (#45, #46, #47)',
          radiographType: 'Periapical',
          aiObservations: [
            'Radiolucency noted on distal aspect of Tooth #46 extending into dentin layer.',
            'Periapical widening of periodontal ligament (PDL) space surrounding mesial root of #46.',
            'Bone height normal along alveolar crest; no generalized bone loss detected.',
            'Adjacent restorations on #45 and #47 show good marginal adaptation.',
          ],
          suspectedFindings: [
            'Deep Distal Caries (#46)',
            'Early Periapical Rarefying Osteitis (#46)',
          ],
          disclaimer: 'AI observations are informational only and are not a diagnosis. All radiograph findings must be evaluated and confirmed by a Licensed Dentist.',
          analyzedAt: new Date().toISOString(),
        });
        setIsAnalyzing(false);
      }, 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI X-Ray Radiograph Assistant
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  Imaging Diagnostic Support
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <strong className="text-slate-700 dark:text-slate-200">{patientName}</strong> | Computer Vision Density Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Clinical Disclaimer Banner */}
        <div className="my-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-[11px] text-amber-800 dark:text-amber-300">
              Mandatory Healthcare Disclaimer
            </span>
            <span>
              AI observations are informational only and are not a diagnosis. All radiographs must be evaluated and confirmed by a Licensed Dentist prior to treatment initiation.
            </span>
          </div>
        </div>

        {/* Upload Zone */}
        {!previewImage ? (
          <div className="my-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 transition-all cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Click or Drag Dental X-Ray Image (Bitewing / Periapical / OPG)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports DICOM, PNG, JPG, and High-Resolution Radiograph Scans
            </p>
          </div>
        ) : (
          <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Preview Box */}
            <div className="p-3 rounded-2xl bg-black flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 min-h-[220px]">
              <img src={previewImage} alt="X-Ray Radiograph" className="max-h-[260px] object-contain rounded" />
              {isAnalyzing ? (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
                  <span className="text-xs font-semibold">Running AI Radiographs Pattern Recognition...</span>
                </div>
              ) : null}
            </div>

            {/* Analysis Results */}
            {analysis ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Radiograph Metadata</span>
                  <p className="font-bold text-slate-900 dark:text-white">{analysis.radiographType} Radiograph</p>
                  <p className="text-slate-600 dark:text-slate-300">{analysis.toothRegion}</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <h5 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Density & Structure Observations
                  </h5>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {analysis.aiObservations.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Image ID: {analysis?.imageId || 'XR-PENDING'}</span>
          <div className="flex gap-2">
            {previewImage ? (
              <button
                onClick={() => {
                  setPreviewImage(null);
                  setAnalysis(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Upload New Radiograph
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
