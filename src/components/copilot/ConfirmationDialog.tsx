import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { AIAction } from '../../types/copilot';
import { approveAndExecuteAIAction, rejectAIAction } from '../../services/aiActionService';

interface ConfirmationDialogProps {
  action: AIAction | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  onActionComplete?: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  action,
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  onActionComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !action) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveAndExecuteAIAction(action.id, currentUserId, currentUserName);
      if (onActionComplete) onActionComplete();
      onClose();
    } catch (err) {
      console.error('Failed to approve action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await rejectAIAction(action.id, currentUserId, currentUserName, rejectReason);
      if (onActionComplete) onActionComplete();
      onClose();
    } catch (err) {
      console.error('Failed to reject action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Human Approval Required
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Action Control
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The AI Copilot has prepared a write operation. Please review and confirm execution.
            </p>
          </div>
        </div>

        {/* Action Details Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {action.actionType.replace('_', ' ')}
            </span>
            <span className="text-[11px] font-mono text-slate-400">ID: {action.id.slice(0, 8)}</span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{action.title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{action.description}</p>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Preview Summary
            </p>
            <p className="text-slate-600 dark:text-slate-400">{action.previewSummary}</p>
          </div>

          {/* Requested By Info */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
            <span>Requested by: <strong className="text-slate-700 dark:text-slate-300">{action.requestedByUserName}</strong> ({action.requestedByUserRole})</span>
            <span>Target: <strong className="text-slate-700 dark:text-slate-300">{action.targetPatientName || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Form or Rejection Input */}
        {showRejectForm ? (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incorrect discount amount or duplicate appointment slot..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              rows={2}
            />
          </div>
        ) : null}

        {/* Safeguard Warning */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Executing this action will persist changes directly to the active practice database and log an entry into the enterprise audit trail.
          </span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {showRejectForm ? (
            <>
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-1.5 transition-all shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Rejection
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
              >
                Reject Action
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve & Execute
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
