import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  Minimize2,
  Maximize2,
  Stethoscope,
  Command,
} from 'lucide-react';
import { sendCopilotRequest, defaultAISettings } from '../../services/copilotService';
import { AIMessage } from '../../types/copilot';

interface FloatingAICopilotProps {
  userRole?: string;
  userName?: string;
  userAvatar?: string;
}

export const FloatingAICopilot: React.FC<FloatingAICopilotProps> = ({
  userRole = 'Doctor',
  userName = 'Dr. Elena',
  userAvatar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'f-init',
      chatId: 'floating',
      sender: 'model',
      content: 'Hello! I am your **Teethly AI Copilot**. Press **CTRL+K** anywhere to trigger me for quick clinical checks, invoice audits, or treatment notes.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // KEYBOARD SHORTCUT LISTENER (CTRL+K or CMD+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isGenerating]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim() || isGenerating) return;

    const userMsg: AIMessage = {
      id: `f-user-${Date.now()}`,
      chatId: 'floating',
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const responseText = await sendCopilotRequest({
        prompt: text,
        history: messages,
        userRole,
        settings: defaultAISettings,
      });

      const aiMsg: AIMessage = {
        id: `f-ai-${Date.now()}`,
        chatId: 'floating',
        sender: 'model',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Floating copilot error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (BOTTOM RIGHT) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1d5bd8] hover:bg-[#154dbf] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30 group"
        title="Open Teethly AI Copilot (CTRL + K)"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1d5bd8]"></span>
        </div>
        <span className="text-xs font-black tracking-wide hidden sm:inline pr-1">
          Teethly AI
        </span>
        <span className="hidden sm:inline px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold">
          ⌘K
        </span>
      </button>

      {/* OVERLAY SLIDE-OVER DRAWER WINDOW */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 transition-all duration-300 ${
              isExpanded ? 'w-full md:w-[700px]' : 'w-full md:w-[460px]'
            }`}
          >
            {/* DRAWER HEADER */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1d5bd8] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase">Teethly AI Copilot</h3>
                  <p className="text-[10px] text-slate-400">Instant Clinical & Financial Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                  title={isExpanded ? 'Collapse width' : 'Expand width'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                  title="Close AI Copilot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGES FEED */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        isUser ? 'bg-slate-900' : 'bg-purple-600'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`p-3 rounded-2xl border text-xs max-w-[85%] ${
                        isUser
                          ? 'bg-slate-900 text-white border-slate-800'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="prose prose-xs max-w-none text-slate-800 space-y-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {!isUser && (
                        <div className="mt-2 pt-1 border-t border-slate-200/80 flex justify-end">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="text-[10px] text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isGenerating && (
                <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl font-bold text-xs animate-pulse flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Gemini AI is processing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK ACTIONS & INPUT BAR */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
                {['/invoice Unpaid list', '/patient Sarah Jenkins', 'CDT codes for Crown'].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-medium whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Teethly AI Copilot..."
                  className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isGenerating || !prompt.trim()}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
