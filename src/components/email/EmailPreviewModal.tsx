import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, Eye, RefreshCw, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { EmailService, EmailTemplateType, EmailLog } from '../../services/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientName?: string;
  defaultRecipientEmail?: string;
  defaultTemplate?: EmailTemplateType;
  defaultData?: Record<string, any>;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  defaultRecipientName = 'Samira Khan',
  defaultRecipientEmail = 'samira.k@example.com',
  defaultTemplate = 'appointment_reminder',
  defaultData = {}
}) => {
  const [templateType, setTemplateType] = useState<EmailTemplateType>(defaultTemplate);
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [subject, setSubject] = useState(
    defaultTemplate === 'appointment_reminder'
      ? 'Appointment Reminder: Tomorrow at 10:00 AM - Teethly Flagship'
      : defaultTemplate === 'invoice_receipt'
      ? 'Invoice & Payment Receipt #INV-2026-0892'
      : 'Important Notification from Teethly Clinic'
  );
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'logs'>('preview');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(EmailService.getEmailLogs());

  if (!isOpen) return null;

  const htmlPreview = EmailService.generateHtml(templateType, recipientName, {
    date: defaultData.date || 'Tomorrow, Aug 4',
    time: defaultData.time || '10:00 AM',
    doctor: defaultData.doctor || 'Dr. Elena Rostova',
    treatment: defaultData.treatment || 'Hygiene Polish & Composite Filling',
    clinicName: 'Teethly Flagship Clinic',
    clinicAddress: 'Floor 4, Medical Towers',
    clinicPhone: '+92 300 1234567',
    invoiceNumber: defaultData.invoiceNumber || 'INV-2026-0892',
    totalAmount: defaultData.totalAmount || 'Rs. 18,500',
    treatmentList: defaultData.treatmentList || 'Root Canal Therapy, Digital X-Ray',
    paymentMethod: 'Credit Card (Visa)',
    resetLink: 'https://Teethly-app.com/reset?token=xyz9876',
    ...defaultData
  });

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSentSuccess(false);

    try {
      const log = await EmailService.sendEmail({
        to: recipientEmail,
        recipientName,
        templateType,
        subject,
        data: defaultData,
      });

      setEmailLogs(EmailService.getEmailLogs());
      setSending(false);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3500);
    } catch (err) {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1d5bd8]/20 border border-[#1d5bd8]/40 text-[#1d5bd8] rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Teethly Email Engine</h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold">SMTP Dispatch</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Generate, preview, and dispatch patient & operational emails</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'preview' ? 'bg-white text-[#1d5bd8] shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Composer & Live Preview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'logs' ? 'bg-white text-[#1d5bd8] shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Sent Outbox Logs ({emailLogs.length})
          </button>
        </div>

        {activeTab === 'preview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[480px]">
            {/* Form Column */}
            <div className="lg:col-span-5 p-6 space-y-4 bg-slate-50/50">
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Template</label>
                  <select
                    value={templateType}
                    onChange={(e) => {
                      const val = e.target.value as EmailTemplateType;
                      setTemplateType(val);
                      if (val === 'appointment_confirmation') setSubject('Appointment Confirmed: Teethly Dental Practice');
                      if (val === 'appointment_reminder') setSubject('Appointment Reminder: Tomorrow - Teethly Flagship');
                      if (val === 'invoice_receipt') setSubject('Official Invoice & Payment Receipt');
                      if (val === 'welcome_patient') setSubject('Welcome to Teethly Dental Care!');
                      if (val === 'followup_reminder') setSubject('Post-Treatment Care Check-in');
                      if (val === 'password_reset') setSubject('Reset Your Teethly Password');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]"
                  >
                    <option value="appointment_reminder">Appointment Reminder</option>
                    <option value="appointment_confirmation">Appointment Confirmation</option>
                    <option value="invoice_receipt">Invoice & Receipt</option>
                    <option value="welcome_patient">Welcome New Patient</option>
                    <option value="followup_reminder">Post-Treatment Follow-up</option>
                    <option value="password_reset">Password Reset Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]"
                  />
                </div>

                {sentSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Email dispatched successfully to {recipientEmail}!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl bg-[#1d5bd8] hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-blue-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${sending ? 'animate-bounce' : ''}`} />
                  {sending ? 'Dispatching via SMTP...' : 'Send Test Email Now'}
                </button>
              </form>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-7 p-6 bg-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTML Render Preview</span>
                  <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">Responsive Layout</span>
                </div>

                <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm max-h-[400px] overflow-y-auto">
                  <iframe
                    title="Email Render"
                    srcDoc={htmlPreview}
                    className="w-full h-[380px] border-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50/50 min-h-[480px]">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1d5bd8]" />
              Sent Email Audit Trail
            </h3>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Sent At</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.recipientName}
                        <div className="text-[11px] font-normal text-slate-400">{log.to}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 capitalize">
                        {log.templateType.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.subject}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
