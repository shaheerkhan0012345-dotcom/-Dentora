import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { AIMessage } from '../../types/copilot';

interface AIChatMessageItemProps {
  message: AIMessage;
  userAvatar?: string;
  userName?: string;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
}

export const AIChatMessageItem: React.FC<AIChatMessageItemProps> = ({
  message,
  userAvatar,
  userName = 'Doctor',
  onFeedback,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-start gap-3 text-xs leading-relaxed ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } group animate-in fade-in duration-200`}
    >
      {/* AVATAR */}
      <div
        className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs ${
          isUser
            ? 'bg-slate-900 text-white'
            : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
        }`}
      >
        {isUser ? (
          userAvatar ? (
            <img src={userAvatar} alt="User" className="w-8 h-8 rounded-2xl object-cover" />
          ) : (
            <User className="w-4 h-4" />
          )
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* MESSAGE BODY BUBBLE */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
        {/* SENDER LABEL & TIMESTAMP */}
        <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 font-bold ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{isUser ? userName : 'Dentora Gemini AI Copilot'}</span>
          <span>•</span>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* BUBBLE CONTENT */}
        <div
          className={`p-4 rounded-3xl border shadow-2xs relative ${
            isUser
              ? 'bg-slate-900 text-white border-slate-800 rounded-tr-xs'
              : 'bg-white text-slate-800 border-slate-200/90 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap font-medium">{message.content}</div>
          ) : (
            <div className="prose prose-xs max-w-none text-slate-800 space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-sm font-black text-slate-900 mt-2 mb-1">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xs font-bold text-slate-900 mt-2 mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-bold text-purple-900 mt-1 mb-0.5">{children}</h3>,
                  p: ({ children }) => <p className="mb-1.5 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1.5 pl-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1.5 pl-1">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-700 font-medium">{children}</li>,
                  strong: ({ children }) => <strong className="font-extrabold text-slate-900">{children}</strong>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 rounded-xl border border-slate-200">
                      <table className="min-w-full text-[11px] divide-y divide-slate-200">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-slate-50 font-bold text-slate-900">{children}</thead>,
                  th: ({ children }) => <th className="p-2 text-left">{children}</th>,
                  td: ({ children }) => <td className="p-2 border-t border-slate-100">{children}</td>,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-slate-100 text-purple-700 font-mono text-[11px] rounded-md font-semibold">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* ACTIONS FOR MODEL RESPONSES */}
          {!isUser && (
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span className="font-semibold text-slate-500">Dentora Medical Intelligence</span>
              </div>

              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* COPY BUTTON */}
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  title="Copy message"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* THUMBS UP */}
                <button
                  onClick={() => onFeedback?.(message.id, 'like')}
                  className={`p-1 rounded-lg hover:bg-slate-100 cursor-pointer ${
                    message.feedback === 'like' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                {/* THUMBS DOWN */}
                <button
                  onClick={() => onFeedback?.(message.id, 'dislike')}
                  className={`p-1 rounded-lg hover:bg-slate-100 cursor-pointer ${
                    message.feedback === 'dislike' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Needs improvement"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
