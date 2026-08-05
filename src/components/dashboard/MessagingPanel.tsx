import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SecureMessage } from '../../types/messaging';
import { subscribeToMessages, sendSecureMessage, markMessageRead } from '../../services/messagingService';
import { MessageSquare, Send, Check, CheckCheck, User, ShieldCheck, Search, Filter, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessagingPanelProps {
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({
  currentUserId = 'user-sarah-jenkins',
  currentUserName = 'Sarah Jenkins',
  currentUserRole = 'Patient',
}) => {
  const { currentClinic } = useClinic();
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [recipientRole, setRecipientRole] = useState<'Doctor' | 'Patient' | 'Receptionist' | 'Admin'>('Doctor');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(currentClinic.id, currentUserId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [currentClinic.id, currentUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    setSending(true);
    try {
      await sendSecureMessage({
        clinicId: currentClinic.id,
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole as any,
        recipientId: recipientRole === 'Doctor' ? 'doc-elena-rostova' : 'user-receptionist',
        recipientName: recipientRole === 'Doctor' ? 'Dr. Elena Rostova, MD' : 'Clinic Reception',
        recipientRole: recipientRole,
        content: inputContent,
      });
      setInputContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d5bd8] border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              HIPAA Compliant Encrypted Channel
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Secure Internal Communications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct secure messaging between patients, doctors, and clinic staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            {messages.length} Messages
          </span>
        </div>
      </div>

      {/* MESSAGES CONVERSATION CONTAINER */}
      <div className="h-96 overflow-y-auto p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-bold">No messages yet in this channel.</p>
            <p className="text-[10px] mt-1">Start a secure conversation below.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId || m.senderName === currentUserName;

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-slate-400">
                  <span>{m.senderName} ({m.senderRole})</span>
                  <span>•</span>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#1d5bd8] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MESSAGE INPUT FORM */}
      <form onSubmit={handleSend} className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Send To:</label>
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="Doctor">Dr. Elena Rostova (Doctor)</option>
            <option value="Receptionist">Beverly Hills Receptionist</option>
            <option value="Admin">Clinic Owner / Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            required
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Type your secure message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 rounded-2xl bg-[#1d5bd8] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>{sending ? 'Sending...' : 'Send'}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
