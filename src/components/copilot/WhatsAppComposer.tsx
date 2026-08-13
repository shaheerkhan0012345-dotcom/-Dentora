import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, Phone, Eye, ShieldCheck, X, Loader2 } from 'lucide-react';
import { WhatsAppMessageData } from '../../types/copilot';
import { sendWhatsAppAppointmentNotification, buildWhatsAppAppointmentText } from '../../services/whatsappService';

interface WhatsAppComposerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  defaultPatientName?: string;
  defaultPhone?: string;
}

export const WhatsAppComposer: React.FC<WhatsAppComposerProps> = ({
  isOpen,
  onClose,
  currentUserId,
  defaultPatientName = 'Ali Khan',
  defaultPhone = '+923001234567',
}) => {
  const [phone, setPhone] = useState(defaultPhone);
  const [patientName, setPatientName] = useState(defaultPatientName);
  const [msgType, setMsgType] = useState<WhatsAppMessageData['messageType']>('confirmation');
  const [bodyText, setBodyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    const text = buildWhatsAppAppointmentText({
      recipientPhone: phone,
      patientName,
      doctorName: 'Elena Rostova',
      treatmentName: 'Dental Examination',
      date: 'Tomorrow',
      timeSlot: '10:00 AM',
      clinicName: 'Dentora Dental Practice',
    });
    setBodyText(text);
  }, [msgType, patientName, phone]);

  if (!isOpen) return null;

  const handleSendWhatsApp = async () => {
    setIsSending(true);
    try {
      const res = await sendWhatsAppAppointmentNotification({
        recipientPhone: phone,
        patientName,
        doctorName: 'Elena Rostova',
        treatmentName: 'Dental Examination',
        date: 'Tomorrow',
        timeSlot: '10:00 AM',
        clinicName: 'Dentora Dental Practice',
      });
      setSendResult(res.message || 'WhatsApp message dispatched successfully!');
      setTimeout(() => {
        setSendResult(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error sending WhatsApp message:', err);
      setSendResult(err.message || 'Failed to dispatch message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI WhatsApp Composer
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  WhatsApp Web Bot Gateway
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and preview automated patient communication before dispatch via connected WhatsApp Web.
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

        {/* Message Inputs */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Message Template
            </label>
            <select
              value={msgType}
              onChange={(e) => setMsgType(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="confirmation">Appointment Confirmation</option>
              <option value="reminder">Appointment Reminder</option>
              <option value="followup">Post-Op Care Follow-Up</option>
              <option value="review">Google Review Request</option>
              <option value="payment">Unpaid Balance Reminder</option>
              <option value="treatment">Next Visit Due Reminder</option>
              <option value="birthday">Birthday Wishes & Offer</option>
              <option value="recall">6-Month Recall Check-Up</option>
            </select>
          </div>
        </div>

        {/* WhatsApp Preview Card */}
        <div className="my-4 p-4 rounded-xl bg-emerald-950 text-white border border-emerald-800 shadow-inner">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" /> WhatsApp Message Preview
            </span>
            <span className="text-[10px] font-mono text-emerald-300">To: {phone}</span>
          </div>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full bg-emerald-900/60 p-3 rounded-lg border border-emerald-800 text-xs text-emerald-100 outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed"
            rows={5}
          />
        </div>

        {sendResult ? (
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 my-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> {sendResult}
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Always previewed before dispatch to ensure patient privacy.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              disabled={isSending}
              onClick={handleSendWhatsApp}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send WhatsApp Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
