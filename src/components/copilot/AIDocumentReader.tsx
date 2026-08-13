import React, { useState } from 'react';
import { FileSearch, Upload, Sparkles, AlertTriangle, FileText, CheckCircle2, X, Loader2 } from 'lucide-react';
import { DocumentAnalysisResult } from '../../types/copilot';

interface AIDocumentReaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDocumentReader: React.FC<AIDocumentReaderProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsAnalyzing(true);

      // Simulate AI Document Analysis Pipeline
      setTimeout(() => {
        setAnalysisResult({
          fileName: file.name,
          fileType: file.name.endsWith('.pdf') ? 'PDF' : 'Medical Report',
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          summary: 'The uploaded report indicates a complete blood count (CBC) and blood glucose assessment prior to surgical extractions.',
          keyFindings: [
            'Fasting Blood Sugar (FBS): 112 mg/dL (Mildly elevated, well within safe surgical limit <180 mg/dL).',
            'Hemoglobin (Hb): 14.2 g/dL (Normal).',
            'Platelet Count: 280,000 /mcL (Normal, low risk of post-op hemorrhage).',
            'Bleeding Time (BT): 2 mins 15 secs | Clotting Time (CT): 4 mins 10 secs (Normal).',
          ],
          medicinesMentioned: [
            'Metformin 500mg (Daily oral hypoglycemic agent)',
            'Multivitamin supplements',
          ],
          warningsAndRisks: [
            'Slightly elevated glucose requires routine aseptic precautions during surgical tooth extraction.',
            'No anticoagulant or antiplatelet drug interaction flagged.',
          ],
          suggestedActions: [
            'Proceed with scheduled surgical extraction of #38 under local anesthesia.',
            'Monitor post-op clot formation prior to discharge.',
            'Advise patient to take regular morning Metformin dosage.',
          ],
          extractedAt: new Date().toISOString(),
        });
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Document & Report Reader
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  OCR & Clinical AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload PDFs, external medical lab reports, consent forms, or prescriptions for instant AI clinical summarization.
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

        {/* Upload Zone */}
        {!analysisResult ? (
          <div className="my-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-3">
              {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {isAnalyzing ? 'Analyzing Document with Gemini AI...' : 'Click or Drag File to Upload'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports PDF, PNG, JPG, and Word documents (Max 10MB)
            </p>
          </div>
        ) : null}

        {/* Analysis Result Card */}
        {analysisResult ? (
          <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1 animate-in fade-in duration-200">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-600" /> {analysisResult.fileName} ({analysisResult.fileSize})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  {analysisResult.fileType}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{analysisResult.summary}</p>
            </div>

            {/* Key Findings */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Key Clinical Findings
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {analysisResult.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <h5 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Critical Risk Alerts & Safeguards
              </h5>
              <ul className="space-y-1 text-amber-900 dark:text-amber-200 list-disc list-inside">
                {analysisResult.warningsAndRisks.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>

            {/* Suggested Actions */}
            <div className="p-4 rounded-xl bg-cyan-950 text-white border border-cyan-800 text-xs">
              <h5 className="font-bold text-cyan-300 mb-1.5">Recommended Next Clinical Actions</h5>
              <ul className="space-y-1 text-cyan-100 list-disc list-inside">
                {analysisResult.suggestedActions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Document summaries are for decision-support only.</span>
          <div className="flex gap-2">
            {analysisResult ? (
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Upload Another Document
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
