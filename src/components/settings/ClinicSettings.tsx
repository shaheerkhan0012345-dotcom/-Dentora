import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  MessageSquare,
  Palette,
  Globe,
  History,
  Save,
  Check,
  Shield,
  Download,
  Server,
  Key,
  Clock,
  Smartphone,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  GeneralClinicSettings,
  AISettingsConfig,
  WhatsAppSettingsConfig,
  ThemeSettingsConfig,
  LanguageSettingsConfig,
} from '../../types/admin';
import {
  subscribeToGeneralSettings,
  updateGeneralSettings,
  subscribeToAISettings,
  updateAISettings,
  subscribeToWhatsAppSettings,
  updateWhatsAppSettings,
  exportDatabaseBackupJSON,
} from '../../services/clinicSettingsService';
import {
  subscribeToWhatsAppStatus,
  getWhatsAppWebStatus,
  initializeWhatsAppWeb,
  simulatePairWhatsAppWeb,
  logoutWhatsAppWeb,
  sendWhatsAppAppointmentNotification,
  subscribeToNotificationJobs,
  retryNotificationJob,
  WhatsAppWebStatus,
  NotificationJob,
} from '../../services/whatsappService';
import { AuditLogViewer } from './AuditLogViewer';

interface ClinicSettingsProps {
  currentUserRole?: string;
  currentUserName?: string;
}

export const ClinicSettings: React.FC<ClinicSettingsProps> = ({
  currentUserRole = 'Admin',
  currentUserName = 'Dr. Elena Rostova',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'general' | 'ai' | 'whatsapp' | 'theme' | 'language' | 'audit'
  >('general');

  const [general, setGeneral] = useState<GeneralClinicSettings | null>(null);
  const [aiConfig, setAiConfig] = useState<AISettingsConfig | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppSettingsConfig | null>(null);

  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // WhatsApp Test Dispatch state
  const [testPhone, setTestPhone] = useState('+92 300 1234567');
  const [testBody, setTestBody] = useState('Hello! This is a test message from Dentora Dental Practice Operating System.');
  const [isTestDispatching, setIsTestDispatching] = useState(false);
  const [testDispatchResult, setTestDispatchResult] = useState<{ success: boolean; note: string } | null>(null);

  // WhatsApp Web (Baileys) Bot state
  const [waWebStatus, setWaWebStatus] = useState<WhatsAppWebStatus>({
    status: 'disconnected',
    qrDataUrl: null,
    user: null,
    error: null,
  });
  const [isInitializingWaWeb, setIsInitializingWaWeb] = useState(false);
  const [showPairingMode, setShowPairingMode] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToWhatsAppStatus((status) => {
      setWaWebStatus(status);
      if (status.status === 'connected') {
        setShowPairingMode(false);
      }
    });

    let interval: any = null;
    if (showPairingMode || waWebStatus.status === 'qr_ready' || waWebStatus.status === 'connecting') {
      interval = setInterval(async () => {
        const liveStatus = await getWhatsAppWebStatus();
        setWaWebStatus(liveStatus);
        if (liveStatus.status === 'connected') {
          setShowPairingMode(false);
        }
      }, 3500);
    }

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [showPairingMode, waWebStatus.status]);

  const handleInitWaWeb = async () => {
    setIsInitializingWaWeb(true);
    setShowPairingMode(true);
    try {
      const res = await initializeWhatsAppWeb();
      setWaWebStatus(res);
      if (res.status === 'connected') {
        setShowPairingMode(false);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsInitializingWaWeb(false);
    }
  };

  const handleSimulatePairWaWeb = async () => {
    setIsInitializingWaWeb(true);
    try {
      const res = await simulatePairWhatsAppWeb();
      setWaWebStatus(res);
      setShowPairingMode(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsInitializingWaWeb(false);
    }
  };

  const handleLogoutWaWeb = async () => {
    setIsInitializingWaWeb(true);
    try {
      await logoutWhatsAppWeb();
      setWaWebStatus(await getWhatsAppWebStatus());
      setShowPairingMode(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsInitializingWaWeb(false);
    }
  };

  const handleTestWhatsAppDispatch = async () => {
    if (!testPhone.trim() || !testBody.trim()) return;
    setIsTestDispatching(true);
    setTestDispatchResult(null);

    try {
      const res = await sendWhatsAppAppointmentNotification({
        recipientPhone: testPhone,
        patientName: 'Test Patient',
        doctorName: 'Dr. Elena Rostova',
        treatmentName: 'General Consultation',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        clinicName: general?.clinicName || 'Dentora Clinic',
      });

      setTestDispatchResult({
        success: res.sentViaApi,
        note: res.message,
      });
    } catch (err: any) {
      setTestDispatchResult({
        success: false,
        note: err.message || 'Dispatch attempt failed',
      });
    } finally {
      setIsTestDispatching(false);
    }
  };

  // Notification Jobs Queue History State
  const [notificationJobs, setNotificationJobs] = useState<NotificationJob[]>([]);
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'queued' | 'processing' | 'sent' | 'failed'>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  const handleRetryNotification = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      await retryNotificationJob(jobId);
    } catch (err) {
      console.error('Error retrying notification job:', err);
    } finally {
      setRetryingJobId(null);
    }
  };

  useEffect(() => {
    const unsubGen = subscribeToGeneralSettings(setGeneral);
    const unsubAi = subscribeToAISettings(setAiConfig);
    const unsubWa = subscribeToWhatsAppSettings(setWhatsapp);
    const unsubJobs = subscribeToNotificationJobs('clinic-flagship', setNotificationJobs);

    return () => {
      unsubGen();
      unsubAi();
      unsubWa();
      unsubJobs();
    };
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!general) return;
    setSavingSection('general');
    try {
      await updateGeneralSettings(general, currentUserName);
      setSaveSuccessMsg('General Clinic Details Saved');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiConfig) return;
    setSavingSection('ai');
    try {
      await updateAISettings(aiConfig, currentUserName);
      setSaveSuccessMsg('AI Copilot Configuration Saved');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp) return;
    setSavingSection('whatsapp');
    try {
      await updateWhatsAppSettings(whatsapp, currentUserName);
      setSaveSuccessMsg('WhatsApp API Settings Saved');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSection(null);
    }
  };

  const handleBackupExport = async () => {
    const dataStr = await exportDatabaseBackupJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dentora_firestore_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & SUB-TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1d5bd8]" />
            <span>Clinic Settings & Administration Hub</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage practice identity, Gemini AI parameters, WhatsApp gateway, audit logs & system backups
          </p>
        </div>

        <button
          onClick={handleBackupExport}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Backup Database (JSON)</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-900 p-3 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SUB-TAB NAV */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'general'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#1d5bd8]" />
          <span>General Clinic</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ai'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>AI Copilot Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('whatsapp')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'whatsapp'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>WhatsApp API</span>
        </button>

        <button
          onClick={() => setActiveSubTab('theme')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'theme'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Theme & Appearance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('language')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'language'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Language & Localization</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-indigo-500" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* SECTION 1: GENERAL CLINIC SETTINGS */}
      {activeSubTab === 'general' && general && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1d5bd8]" />
            <span>Practice Identity & Invoicing Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinic Name *</label>
              <input
                type="text"
                required
                value={general.clinicName}
                onChange={(e) => setGeneral({ ...general, clinicName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={general.tagline}
                onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Physical Address *</label>
              <input
                type="text"
                required
                value={general.address}
                onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={general.phone}
                onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={general.email}
                onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax Registration No (NTN/STRN)</label>
              <input
                type="text"
                value={general.taxRegistrationNo}
                onChange={(e) => setGeneral({ ...general, taxRegistrationNo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol & Code</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={general.currencySymbol}
                  onChange={(e) => setGeneral({ ...general, currencySymbol: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <input
                  type="text"
                  value={general.currencyCode}
                  onChange={(e) => setGeneral({ ...general, currencyCode: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingSection === 'general'}
              className="px-5 py-2.5 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSection === 'general' ? 'Saving...' : 'Save General Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: AI COPILOT CONFIGURATION */}
      {activeSubTab === 'ai' && aiConfig && (
        <form onSubmit={handleSaveAI} className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Gemini AI Copilot Configuration</span>
            </h3>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black">
              Server-Side API Key Active
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selected Gemini Model Alias</label>
              <input
                type="text"
                readOnly
                value={aiConfig.activeProvider}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-purple-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Powered by Google Gemini 2.5 Flash server-side SDK endpoint.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Model Temperature ({aiConfig.temperature})</label>
                <span className="text-[10px] text-slate-500">
                  {aiConfig.temperature < 0.3 ? 'Deterministic / Precise Clinical' : 'Balanced Analysis'}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={aiConfig.temperature}
                onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical System Prompt Template</label>
              <textarea
                rows={4}
                value={aiConfig.systemPromptTemplate}
                onChange={(e) => setAiConfig({ ...aiConfig, systemPromptTemplate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 block">Auto-Approve Low-Risk Write Actions</span>
                <span className="text-[10px] text-slate-500 block">
                  Allows AI to auto-generate invoices and draft prescriptions without requiring double doctor confirmation.
                </span>
              </div>
              <input
                type="checkbox"
                checked={aiConfig.autoApproveLowRiskActions}
                onChange={(e) => setAiConfig({ ...aiConfig, autoApproveLowRiskActions: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded-xs cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingSection === 'ai'}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSection === 'ai' ? 'Saving...' : 'Save AI Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: WHATSAPP API SETTINGS & BAILEYS WEB GATEWAY */}
      {activeSubTab === 'whatsapp' && whatsapp && (
        <div className="space-y-6">
          {/* WHATSAPP WEB (BAILEYS) LIVE QR CODE SCANNER CARD */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg border border-emerald-800/50 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-extrabold text-white">WhatsApp Web Bot Gateway (100% Free)</h3>
                </div>
                <p className="text-emerald-200/80 text-[11px] mt-0.5">
                  Link your clinic's WhatsApp phone number via QR Code scanning. No Meta approval or UltraMsg subscription needed!
                </p>
              </div>

              {waWebStatus.status === 'connected' ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-[11px] flex items-center gap-1.5 self-start sm:self-auto">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                  <span>Device Linked & Connected</span>
                </span>
              ) : waWebStatus.status === 'qr_ready' ? (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-[11px] flex items-center gap-1.5 self-start sm:self-auto animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Scan QR Code Below</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-bold text-[11px] flex items-center gap-1.5 self-start sm:self-auto">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Gateway Disconnected</span>
                </span>
              )}
            </div>

            {/* STATUS CONTENT AREA */}
            {waWebStatus.status === 'connected' ? (
              <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-lg">
                    📱
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">
                      {waWebStatus.user?.name || 'Dentora Clinic WhatsApp Account'}
                    </h4>
                    <p className="text-emerald-300/80 text-[11px] font-mono mt-0.5">
                      {waWebStatus.user?.id ? `ID: ${waWebStatus.user.id}` : 'Active WhatsApp Web Session'}
                    </p>
                    <p className="text-[10px] text-emerald-400/70 mt-1">
                      Automated booking confirmations and patient messages will be sent directly from this number.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogoutWaWeb}
                  disabled={isInitializingWaWeb}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 font-bold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
                >
                  Unlink Device / Logout
                </button>
              </div>
            ) : showPairingMode || waWebStatus.qrDataUrl || waWebStatus.status === 'qr_ready' || waWebStatus.status === 'connecting' || isInitializingWaWeb ? (
              <div className="bg-slate-950/80 border border-emerald-800/60 rounded-2xl p-6 text-center max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Scan QR Code with WhatsApp
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPairingMode(false)}
                    className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-white p-3 rounded-2xl inline-block shadow-xl border-4 border-emerald-500/40 relative min-w-[240px] min-h-[240px]">
                  {waWebStatus.qrDataUrl ? (
                    <img
                      src={waWebStatus.qrDataUrl}
                      alt="Official WhatsApp Web Pairing QR Code"
                      className="w-56 h-56 object-contain mx-auto"
                    />
                  ) : waWebStatus.error ? (
                    <div className="w-56 h-56 flex flex-col items-center justify-center space-y-2 bg-amber-50/80 rounded-xl p-3 text-center border border-amber-200">
                      <AlertCircle className="w-7 h-7 text-amber-600 mx-auto" />
                      <p className="text-slate-800 font-bold text-xs">Connection Timeout</p>
                      <p className="text-amber-800 text-[10px] leading-tight px-1">{waWebStatus.error}</p>
                      <button
                        type="button"
                        onClick={handleInitWaWeb}
                        disabled={isInitializingWaWeb}
                        className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className={`w-3 h-3 ${isInitializingWaWeb ? 'animate-spin' : ''}`} />
                        <span>Retry QR Generation</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-xl p-4">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                      <p className="text-slate-800 font-bold text-xs">Connecting to WhatsApp Web Gateway...</p>
                      <p className="text-slate-500 text-[10px] text-center">Fetching live session QR code directly from WhatsApp servers</p>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 text-left bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-emerald-400 mb-1">Pairing Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Open WhatsApp on your phone</li>
                    <li>Tap <b>Settings</b> or <b>Menu (⋮)</b> → <b>Linked Devices</b></li>
                    <li>Tap <b>Link a Device</b> and point camera at screen</li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleInitWaWeb}
                    disabled={isInitializingWaWeb}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isInitializingWaWeb ? 'animate-spin' : ''}`} />
                    <span>Regenerate QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatePairWaWeb}
                    disabled={isInitializingWaWeb}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Quick Link Demo Device</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                  Start the free WhatsApp Web Gateway to pair your phone. Once linked, appointment confirmation messages are automatically dispatched to patients without third-party fees.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleInitWaWeb}
                    disabled={isInitializingWaWeb}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md transition-all cursor-pointer text-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isInitializingWaWeb ? 'animate-spin' : ''}`} />
                    <span>{isInitializingWaWeb ? 'Generating QR Code...' : 'Pair Device (Generate QR Code)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePairWaWeb}
                    disabled={isInitializingWaWeb}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer text-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Quick Link Demo Device</span>
                  </button>

                  <a
                    href={`https://wa.me/15559876543?text=${encodeURIComponent('Hello! Confirming my appointment with Dentora Clinic.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl border border-slate-700 transition-all cursor-pointer text-xs inline-flex items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Test 1-Click WhatsApp Link</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveWhatsApp} className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Message Templates</span>
            </h3>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Templates Configured</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Appointment Reminder Template</label>
              <textarea
                rows={2}
                value={whatsapp.defaultAppointmentReminderTemplate}
                onChange={(e) => setWhatsapp({ ...whatsapp, defaultAppointmentReminderTemplate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Receipt Template</label>
              <textarea
                rows={2}
                value={whatsapp.defaultPaymentReceiptTemplate}
                onChange={(e) => setWhatsapp({ ...whatsapp, defaultPaymentReceiptTemplate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Patient Follow-up Template</label>
              <textarea
                rows={2}
                value={whatsapp.defaultFollowupTemplate}
                onChange={(e) => setWhatsapp({ ...whatsapp, defaultFollowupTemplate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* LIVE TEST DISPATCH BOX */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Test WhatsApp Web Bot Dispatcher</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Live Web Bot Test
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Target Phone Number</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl font-mono text-xs font-bold text-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Test Message Body</label>
                <input
                  type="text"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder="Enter message text..."
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {testDispatchResult ? (
                <div className={`text-[11px] font-bold flex items-center gap-1.5 ${testDispatchResult.success ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {testDispatchResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                  <span>{testDispatchResult.note}</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500">Click below to send live message via connected WhatsApp Web Bot.</span>
              )}

              <button
                type="button"
                onClick={handleTestWhatsAppDispatch}
                disabled={isTestDispatching}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestDispatching ? 'animate-spin' : ''}`} />
                <span>{isTestDispatching ? 'Dispatching...' : 'Dispatch Test Message'}</span>
              </button>
            </div>
          </div>

          {/* NOTIFICATION QUEUE & MESSAGE HISTORY LOGS */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Notification Queue & Dispatch History</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time Firestore job queue tracking appointment confirmations and automated messages
                </p>
              </div>

              {/* FILTER TABS */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {(['all', 'queued', 'processing', 'sent', 'failed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setJobStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      jobStatusFilter === st
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH & REFRESH ROW */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Filter by patient name or phone number..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="w-full max-w-xs px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 font-medium focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 font-mono">
                Total Jobs: {notificationJobs.length}
              </span>
            </div>

            {/* JOBS TABLE */}
            <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[9px] tracking-wider sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Patient</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Attempts</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {notificationJobs
                    .filter((job) => jobStatusFilter === 'all' || job.status === jobStatusFilter)
                    .filter((job) =>
                      !jobSearchQuery.trim() ||
                      (job.recipientName || '').toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
                      (job.phoneNumber || '').includes(jobSearchQuery)
                    )
                    .map((job) => (
                      <tr key={job.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-3 py-2 font-bold text-white">
                          {job.recipientName || 'Patient'}
                          {job.doctorName && <span className="block text-[9px] text-slate-400 font-normal">Doc: {job.doctorName}</span>}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">{job.phoneNumber}</td>
                        <td className="px-3 py-2 text-slate-400 capitalize">
                          {job.type ? job.type.replace('_', ' ') : 'Confirmation'}
                        </td>
                        <td className="px-3 py-2">
                          {job.status === 'sent' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold inline-flex items-center gap-1">
                              🟢 Sent
                            </span>
                          )}
                          {job.status === 'queued' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold inline-flex items-center gap-1">
                              🟡 Queued
                            </span>
                          )}
                          {job.status === 'processing' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold inline-flex items-center gap-1 animate-pulse">
                              🔵 Processing
                            </span>
                          )}
                          {job.status === 'failed' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold inline-flex items-center gap-1" title={job.error || 'Failed'}>
                              🔴 Failed
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-400">{job.attempts || 0} / 3</td>
                        <td className="px-3 py-2 text-right">
                          {job.status === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleRetryNotification(job.id)}
                              disabled={retryingJobId === job.id}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-50"
                            >
                              {retryingJobId === job.id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                  {notificationJobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-500 italic text-[11px]">
                        No notification jobs in queue yet. New appointment bookings will automatically create jobs here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingSection === 'whatsapp'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSection === 'whatsapp' ? 'Saving...' : 'Save WhatsApp Settings'}</span>
            </button>
          </div>
        </form>
        </div>
      )}

      {/* SECTION 4: THEME */}
      {activeSubTab === 'theme' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500" />
            <span>Theme & Visual Customization</span>
          </h3>
          <p className="text-slate-600 font-medium">
            Dentora defaults to a clean, eye-safe clinical light theme with high-contrast typography, zero distraction layout & fluid card spacing.
          </p>
        </div>
      )}

      {/* SECTION 5: LANGUAGE */}
      {activeSubTab === 'language' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Language & Localization</span>
          </h3>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Operating Language</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
                <option value="English">English (US / UK Standard)</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: AUDIT LOGS */}
      {activeSubTab === 'audit' && <AuditLogViewer />}
    </div>
  );
};
