import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Archive,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Filter,
} from 'lucide-react';
import { AIChat, ChatCategory } from '../../types/copilot';

interface ConversationSidebarProps {
  chats: AIChat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat: (category?: ChatCategory) => void;
  onUpdateChat: (chatId: string, updates: Partial<AIChat>) => void;
  onDeleteChat: (chatId: string) => void;
}

const categoryColors: Record<ChatCategory, string> = {
  Clinical: 'bg-purple-100 text-purple-700 border-purple-200',
  Billing: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  General: 'bg-slate-100 text-slate-700 border-slate-200',
  'Patient Care': 'bg-blue-100 text-blue-700 border-blue-200',
  Inventory: 'bg-amber-100 text-amber-700 border-amber-200',
  Analytics: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onCreateNewChat,
  onUpdateChat,
  onDeleteChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory | 'All'>('All');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (e: React.MouseEvent, chat: AIChat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onUpdateChat(chatId, { title: editingTitle.trim() });
    }
    setEditingChatId(null);
  };

  const handleTogglePin = (e: React.MouseEvent, chat: AIChat) => {
    e.stopPropagation();
    onUpdateChat(chat.id, { isPinned: !chat.isPinned });
  };

  const handleToggleArchive = (e: React.MouseEvent, chat: AIChat) => {
    e.stopPropagation();
    onUpdateChat(chat.id, { isArchived: !chat.isArchived });
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this AI Copilot conversation?')) {
      onDeleteChat(chatId);
    }
  };

  const filteredChats = chats.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat && !c.isArchived;
  });

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const regularChats = filteredChats.filter((c) => !c.isPinned);

  return (
    <div className="w-full lg:w-72 bg-slate-900 text-white rounded-3xl p-4 flex flex-col justify-between space-y-4 border border-slate-800 shadow-xl shrink-0 h-full min-h-[600px]">
      
      {/* TOP: BRAND & NEW CHAT BUTTON */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-200">Teethly Copilot</h2>
              <p className="text-[10px] text-slate-400 font-medium">Memory & History</p>
            </div>
          </div>
        </div>

        {/* NEW CHAT BUTTON */}
        <button
          onClick={() => onCreateNewChat()}
          className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Start New AI Conversation</span>
        </button>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI conversations..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-500 font-medium"
          />
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
          {(['All', 'Clinical', 'Billing', 'Inventory', 'Patient Care'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1d5bd8] text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT LIST AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        
        {/* PINNED CHATS SECTION */}
        {pinnedChats.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
              <Pin className="w-3 h-3" />
              <span>Pinned Sessions</span>
            </div>
            {pinnedChats.map((chat) => (
              <ChatItemRow
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                isEditing={editingChatId === chat.id}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                onSelect={() => onSelectChat(chat.id)}
                onSaveRename={(e) => handleSaveRename(e, chat.id)}
                onStartRename={(e) => handleStartRename(e, chat)}
                onTogglePin={(e) => handleTogglePin(e, chat)}
                onToggleArchive={(e) => handleToggleArchive(e, chat)}
                onDelete={(e) => handleDelete(e, chat.id)}
              />
            ))}
          </div>
        )}

        {/* RECENT CHATS SECTION */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <MessageSquare className="w-3 h-3" />
            <span>Recent Conversations ({regularChats.length})</span>
          </div>

          {regularChats.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs italic bg-slate-800/40 rounded-2xl border border-slate-800/80">
              No recent conversations found.
            </div>
          ) : (
            regularChats.map((chat) => (
              <ChatItemRow
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                isEditing={editingChatId === chat.id}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                onSelect={() => onSelectChat(chat.id)}
                onSaveRename={(e) => handleSaveRename(e, chat.id)}
                onStartRename={(e) => handleStartRename(e, chat)}
                onTogglePin={(e) => handleTogglePin(e, chat)}
                onToggleArchive={(e) => handleToggleArchive(e, chat)}
                onDelete={(e) => handleDelete(e, chat.id)}
              />
            ))
          )}
        </div>

      </div>

      {/* FOOTER INFO */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
        <span>Teethly AI Engine v3.6</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Ready
        </span>
      </div>

    </div>
  );
};

// HELPER ROW COMPONENT
interface ChatItemRowProps {
  chat: AIChat;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  setEditingTitle: (v: string) => void;
  onSelect: () => void;
  onSaveRename: (e: React.MouseEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onToggleArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ChatItemRow: React.FC<ChatItemRowProps> = ({
  chat,
  isActive,
  isEditing,
  editingTitle,
  setEditingTitle,
  onSelect,
  onSaveRename,
  onStartRename,
  onTogglePin,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 border ${
        isActive
          ? 'bg-purple-900/60 border-purple-500 text-white shadow-inner font-bold'
          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`p-1.5 rounded-xl border text-[9px] font-extrabold uppercase shrink-0 ${categoryColors[chat.category] || 'bg-slate-700 text-slate-200'}`}>
          {chat.category.substring(0, 3)}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="w-full bg-slate-900 border border-purple-500 px-2 py-0.5 rounded text-xs text-white focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="truncate min-w-0">
            <span className="text-xs font-semibold block truncate leading-tight">
              {chat.title}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* ROW ACTION HOVER BUTTONS */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {isEditing ? (
          <button
            onClick={onSaveRename}
            className="p-1 hover:text-emerald-400 text-slate-400 cursor-pointer"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        ) : (
          <>
            <button
              onClick={onStartRename}
              className="p-1 hover:text-white text-slate-400 cursor-pointer"
              title="Rename conversation"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={onTogglePin}
              className={`p-1 cursor-pointer ${chat.isPinned ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
              title={chat.isPinned ? 'Unpin' : 'Pin conversation'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
              title="Delete conversation"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
