import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Sliders,
  Trash2,
  Bot,
  User,
  CheckCircle2,
  RefreshCw,
  Zap,
  Plus,
  Stethoscope,
  X,
  MessageSquare,
  TrendingUp,
  Package,
  Brain,
  Calendar,
  FileText,
  Pill,
  FileSearch,
  Eye,
  Sun,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { ConversationSidebar } from './ConversationSidebar';
import { AIChatMessageItem } from './AIChatMessageItem';
import { AIPromptCards } from './AIPromptCards';
import { SlashCommandsMenu, slashCommandsList } from './SlashCommandsMenu';
import { AISettingsModal } from './AISettingsModal';

// Phase 7B AI Copilot Tools
import { DoctorCopilot } from './DoctorCopilot';
import { SOAPGenerator } from './SOAPGenerator';
import { PrescriptionGenerator } from './PrescriptionGenerator';
import { TreatmentPlanner } from './TreatmentPlanner';
import { AppointmentAssistant } from './AppointmentAssistant';
import { WhatsAppComposer } from './WhatsAppComposer';
import { AIDocumentReader } from './AIDocumentReader';
import { AIXRayAssistant } from './AIXRayAssistant';
import { BusinessInsights } from './BusinessInsights';
import { InventoryInsights } from './InventoryInsights';
import { DailyBriefingCard } from './DailyBriefingCard';
import { PredictionPanel } from './PredictionPanel';
import { VoiceAssistantPlaceholder } from './VoiceAssistantPlaceholder';
import { ConfirmationDialog } from './ConfirmationDialog';
import { AIWorkflowPreview } from './AIWorkflowPreview';

import {
  AIChat,
  AIMessage,
  AISettings,
  ChatCategory,
  SlashCommand,
  PatientContextData,
  AIAction,
  AILanguage,
} from '../../types/copilot';
import {
  getUserChats,
  getChatMessages,
  createChat,
  updateChat,
  deleteChat,
  saveMessage,
  updateMessageFeedback,
  sendCopilotRequest,
  fetchPatientContext,
  defaultAISettings,
} from '../../services/copilotService';
import { subscribeToPendingAIActions, parsePromptToActionProposal, createAIAction } from '../../services/aiActionService';
import { PatientRecord } from '../../types/patient';
import { subscribeToPatients } from '../../services/patientService';

interface AIChatPageProps {
  userRole?: string;
  userName?: string;
  userAvatar?: string;
}

export const AIChatPage: React.FC<AIChatPageProps> = ({
  userRole = 'Doctor',
  userName = 'Dr. Elena Rostova',
  userAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'doctor' | 'briefing' | 'revenue' | 'inventory' | 'predictions'>('chat');

  // Core chat state
  const [chats, setChats] = useState<AIChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings & Patient Context
  const [settings, setSettings] = useState<AISettings>(defaultAISettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT-8801');
  const [patientContextData, setPatientContextData] = useState<PatientContextData | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientRecord, setSelectedPatientRecord] = useState<PatientRecord | null>(null);

  // Slash commands
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');

  // Pending Actions & Modal Tools State
  const [pendingActions, setPendingActions] = useState<AIAction[]>([]);
  const [activeConfirmationAction, setActiveConfirmationAction] = useState<AIAction | null>(null);
  const [isSOAPOpen, setIsSOAPOpen] = useState(false);
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isTreatmentOpen, setIsTreatmentOpen] = useState(false);
  const [isAptAssistantOpen, setIsAptAssistantOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isDocReaderOpen, setIsDocReaderOpen] = useState(false);
  const [isXRayOpen, setIsXRayOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = subscribeToPatients((list) => {
      setPatients(list);
      if (list.length > 0 && !selectedPatientRecord) {
        setSelectedPatientRecord(list[0]);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToPendingAIActions((actions) => {
      setPendingActions(actions);
    });
    return () => unsub();
  }, []);

  // Initialize Chats
  useEffect(() => {
    async function loadData() {
      const userChats = await getUserChats('current-user');
      setChats(userChats);
      if (userChats.length > 0 && !activeChatId) {
        setActiveChatId(userChats[0].id);
      }
    }
    loadData();
  }, []);

  // Load Messages & Patient Context when Active Chat Changes
  useEffect(() => {
    if (!activeChatId) return;

    async function loadChatData() {
      const msgs = await getChatMessages(activeChatId!);
      setMessages(msgs);

      const activeChat = chats.find((c) => c.id === activeChatId);
      if (activeChat?.selectedPatientId) {
        setSelectedPatientId(activeChat.selectedPatientId);
      }
    }
    loadChatData();
  }, [activeChatId, chats]);

  // Load Patient Context
  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientContext(selectedPatientId).then(setPatientContextData);
      const matchedP = patients.find((p) => p.id === selectedPatientId);
      if (matchedP) setSelectedPatientRecord(matchedP);
    } else {
      setPatientContextData(null);
    }
  }, [selectedPatientId, patients]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Create Chat
  const handleCreateNewChat = async (category: ChatCategory = 'Clinical') => {
    const newChat = await createChat('current-user', userRole, 'New AI Conversation', category, selectedPatientId);
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessages([]);
  };

  // Handle Update Chat
  const handleUpdateChat = async (chatId: string, updates: Partial<AIChat>) => {
    await updateChat(chatId, updates);
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  // Handle Delete Chat
  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId);
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Input Change Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputPrompt(value);

    if (value.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashFilter(value);
    } else {
      setShowSlashMenu(false);
    }
  };

  // Select Slash Command
  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    setInputPrompt(`${cmd.command} `);
    setShowSlashMenu(false);
  };

  // Handle Send Message
  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isGenerating) return;

    // Check if input triggers an Action proposal (Write operation require human approval)
    const proposedAction = parsePromptToActionProposal(
      text,
      { id: 'current-user', name: userName, role: userRole },
      selectedPatientRecord ? { id: selectedPatientRecord.id, name: selectedPatientRecord.fullName, phone: selectedPatientRecord.phone } : null
    );

    if (proposedAction) {
      const actionId = await createAIAction(proposedAction);
      const actionNotice = `**[Teethly AI Action Engine]**\n\nI have generated a pending action proposal:\n* **Action**: ${proposedAction.title}\n* **Details**: ${proposedAction.previewSummary}\n\n*A human approval request (#${actionId.slice(0, 8)}) is now queued. Please confirm execution using the approval button above.*`;
      
      let targetChatId = activeChatId;
      if (!targetChatId) {
        const newChat = await createChat('current-user', userRole, text.slice(0, 30) + '...', 'Clinical', selectedPatientId);
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        targetChatId = newChat.id;
      }

      const userMsg = await saveMessage({ chatId: targetChatId!, sender: 'user', content: text, timestamp: new Date().toISOString() });
      const aiMsg = await saveMessage({ chatId: targetChatId!, sender: 'model', content: actionNotice, timestamp: new Date().toISOString() });
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      setInputPrompt('');
      return;
    }

    let targetChatId = activeChatId;

    if (!targetChatId) {
      const newChat = await createChat('current-user', userRole, text.slice(0, 30) + '...', 'Clinical', selectedPatientId);
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      targetChatId = newChat.id;
    }

    const userMsg = await saveMessage({
      chatId: targetChatId!,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    });

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setShowSlashMenu(false);
    setIsGenerating(true);

    const patientContextStr = patientContextData
      ? `Patient: ${patientContextData.fullName} (#${patientContextData.patientId})
Age/Gender: ${patientContextData.age}yo ${patientContextData.gender}
Allergies: ${patientContextData.allergies?.join(', ') || 'None'}
Medical History: ${patientContextData.medicalHistory}
Active Treatments: ${patientContextData.activeTreatments?.join(', ')}
Pending Balance: Rs. ${patientContextData.pendingBalance}`
      : undefined;

    try {
      const responseText = await sendCopilotRequest({
        prompt: text,
        history: messages,
        userRole,
        patientContext: patientContextStr,
        settings,
      });

      const aiMsg = await saveMessage({
        chatId: targetChatId!,
        sender: 'model',
        content: responseText,
        timestamp: new Date().toISOString(),
      });

      setMessages((prev) => [...prev, aiMsg]);

      const activeChat = chats.find((c) => c.id === targetChatId);
      if (activeChat && (activeChat.title === 'New AI Conversation' || activeChat.title.startsWith('New Conversation'))) {
        handleUpdateChat(targetChatId!, { title: text.slice(0, 36) + (text.length > 36 ? '...' : '') });
      }
    } catch (err: any) {
      console.error('Copilot send error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedback = async (messageId: string, type: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: type } : m))
    );
    await updateMessageFeedback(messageId, type);
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="space-y-4">
      {/* PAGE HEADER & TOP NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1d5bd8] text-white flex items-center justify-center font-black shadow-sm">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Teethly AI Copilot Station
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d5bd8] dark:bg-blue-950 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
              Enterprise Clinical Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Clinical intelligence, voice dictation, typing automation, WhatsApp messaging, and predictive analytics.
          </p>
        </div>

        {/* TOP TAB CONTROLS */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'doctor'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Copilot
          </button>
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'briefing'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Daily Briefing
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'revenue'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Business Insights
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Inventory AI
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'predictions'
                ? 'bg-[#1d5bd8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Predictive AI
          </button>
        </div>
      </div>

      {/* QUICK LAUNCHERS FOR AI CLINICAL TOOLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Quick AI Tools:</span>
        <button
          onClick={() => setIsAptAssistantOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-[#1d5bd8] dark:text-blue-300 font-semibold border border-blue-200 dark:border-slate-700 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" /> Book Appointment
        </button>
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-slate-700 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp UltraMsg
        </button>
        <button
          onClick={() => setIsDocReaderOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 text-indigo-800 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-slate-700 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FileSearch className="w-3.5 h-3.5" /> Document Reader
        </button>
        <button
          onClick={() => setIsXRayOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 text-purple-800 dark:text-purple-300 font-semibold border border-purple-200 dark:border-slate-700 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> X-Ray Assistant
        </button>
      </div>

      {/* PENDING HUMAN APPROVAL BANNER (IF ANY) */}
      {pendingActions.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingActions.length} Pending AI Action(s)</strong> awaiting human authorization: "
              {pendingActions[0].title}"
            </span>
          </div>
          <button
            onClick={() => setActiveConfirmationAction(pendingActions[0])}
            className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shrink-0 shadow-sm cursor-pointer"
          >
            Review & Approve
          </button>
        </div>
      )}

      {/* VOICE & INTERACTIVE TYPING ASSISTANT BAR */}
      <VoiceAssistantPlaceholder
        onTranscriptReceived={(text) => handleSend(text)}
        onSendMessage={(text) => handleSend(text)}
      />

      {/* TAB CONTENT VIEWS */}
      {activeTab === 'doctor' && selectedPatientRecord ? (
        <DoctorCopilot
          onSelectPatient={(p) => setSelectedPatientRecord(p)}
          onOpenSOAP={() => setIsSOAPOpen(true)}
          onOpenPrescription={() => setIsRxOpen(true)}
          onOpenTreatmentPlan={() => setIsTreatmentOpen(true)}
          onSendMessage={(text) => handleSend(text)}
        />
      ) : activeTab === 'briefing' ? (
        <DailyBriefingCard />
      ) : activeTab === 'revenue' ? (
        <BusinessInsights />
      ) : activeTab === 'inventory' ? (
        <InventoryInsights />
      ) : activeTab === 'predictions' ? (
        <PredictionPanel />
      ) : (
        /* MAIN CHAT & CONVERSATIONS WINDOW */
        <div className="flex flex-col lg:flex-row gap-4 min-h-[620px] h-[calc(100vh-320px)]">
          {/* LEFT CONVERSATION SIDEBAR */}
          <ConversationSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onCreateNewChat={handleCreateNewChat}
            onUpdateChat={handleUpdateChat}
            onDeleteChat={handleDeleteChat}
          />

          {/* RIGHT MAIN CHAT FEED */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-6 flex flex-col justify-between min-w-0 h-full relative">
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-[#1d5bd8] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {activeChat ? activeChat.title : 'Teethly AI Copilot'}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d5bd8] dark:text-blue-300 font-extrabold uppercase border border-blue-200 dark:border-blue-800">
                      {activeChat?.category || 'Clinical'}
                    </span>
                    <span>•</span>
                    <span>Role: {userRole}</span>
                    {patientContextData && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Context: {patientContextData.fullName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="AI Settings"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Clear current message view?')) setMessages([]);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear messages"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGES FEED AREA */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center space-y-6">
                  <div className="text-center space-y-2 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-[#1d5bd8] dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center mx-auto shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">How can Teethly AI assist you today?</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Type a query or slash command (`/invoice`, `/appointment`, `/prescription`). You can also dictate commands using the Voice & Typing Station above.
                    </p>
                  </div>

                  <AIPromptCards
                    onSelectPrompt={(pText) => handleSend(pText)}
                    userRole={userRole}
                  />
                </div>
              ) : (
                messages.map((msg) => (
                  <AIChatMessageItem
                    key={msg.id}
                    message={msg}
                    userAvatar={userAvatar}
                    userName={userName}
                    onFeedback={handleFeedback}
                  />
                ))
              )}

              {/* GENERATING / THINKING INDICATOR */}
              {isGenerating && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-[#1d5bd8] dark:text-blue-300 font-bold animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1d5bd8]" />
                  <span>Teethly AI Copilot processing clinical request & checking active context...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT BAR AREA */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 relative shrink-0">
              {showSlashMenu && (
                <SlashCommandsMenu
                  onSelectCommand={handleSelectSlashCommand}
                  onClose={() => setShowSlashMenu(false)}
                  filterQuery={slashFilter}
                />
              )}

              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar text-[10px]">
                <span className="font-extrabold uppercase text-slate-400 tracking-wider text-[9px] shrink-0">
                  Slash Commands:
                </span>
                {slashCommandsList.slice(0, 5).map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSlashCommand(cmd)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 hover:text-[#1d5bd8] font-mono font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    {cmd.command}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Teethly AI Copilot or type '/' for slash commands..."
                  className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] shadow-2xs"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={isGenerating || !inputPrompt.trim()}
                  className="p-3.5 rounded-2xl bg-[#1d5bd8] hover:bg-[#154dbf] disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TOOLS */}
      {selectedPatientRecord && (
        <>
          <SOAPGenerator
            patient={selectedPatientRecord}
            isOpen={isSOAPOpen}
            onClose={() => setIsSOAPOpen(false)}
            doctorName={userName}
          />
          <PrescriptionGenerator
            patient={selectedPatientRecord}
            isOpen={isRxOpen}
            onClose={() => setIsRxOpen(false)}
            doctorName={userName}
          />
          <TreatmentPlanner
            patient={selectedPatientRecord}
            isOpen={isTreatmentOpen}
            onClose={() => setIsTreatmentOpen(false)}
            doctorName={userName}
          />
        </>
      )}

      <AppointmentAssistant
        isOpen={isAptAssistantOpen}
        onClose={() => setIsAptAssistantOpen(false)}
        currentUserId="current-user"
        currentUserName={userName}
        currentUserRole={userRole}
      />

      <WhatsAppComposer
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        currentUserId="current-user"
        defaultPatientName={selectedPatientRecord?.fullName || 'Ali Khan'}
        defaultPhone={selectedPatientRecord?.phone || '+923001234567'}
      />

      <AIDocumentReader
        isOpen={isDocReaderOpen}
        onClose={() => setIsDocReaderOpen(false)}
      />

      <AIXRayAssistant
        isOpen={isXRayOpen}
        onClose={() => setIsXRayOpen(false)}
        patientName={selectedPatientRecord?.fullName || 'Ali Khan'}
      />

      <ConfirmationDialog
        action={activeConfirmationAction}
        isOpen={!!activeConfirmationAction}
        onClose={() => setActiveConfirmationAction(null)}
        currentUserId="current-user"
        currentUserName={userName}
      />

      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
};
