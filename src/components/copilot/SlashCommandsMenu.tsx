import React from 'react';
import {
  User,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Stethoscope,
  Search,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { SlashCommand } from '../../types/copilot';

interface SlashCommandsMenuProps {
  onSelectCommand: (cmd: SlashCommand) => void;
  onClose: () => void;
  filterQuery?: string;
}

export const slashCommandsList: SlashCommand[] = [
  {
    command: '/patient',
    description: 'Lookup patient profile, medical history, allergies & active treatments',
    category: 'Clinical Context',
  },
  {
    command: '/appointment',
    description: 'Show today scheduled appointments, room assignments & waiting queue',
    category: 'Schedule',
  },
  {
    command: '/invoice',
    description: 'Audit unpaid invoices, copays, insurance claims & patient balances',
    category: 'Billing',
  },
  {
    command: '/report',
    description: 'Generate practice revenue summary, monthly growth & expense reports',
    category: 'Analytics',
  },
  {
    command: '/prescription',
    description: 'Draft digital Rx prescription, dosages, and drug allergy warnings',
    category: 'Clinical',
  },
  {
    command: '/treatment',
    description: 'Draft 3D aligner or endodontic treatment plan & CDT codes',
    category: 'Clinical',
  },
  {
    command: '/search',
    description: 'Perform natural language search across clinic database',
    category: 'Utility',
  },
  {
    command: '/help',
    description: 'Display Teethly AI Copilot capabilities and clinical safeguards',
    category: 'Utility',
  },
  {
    command: '/settings',
    description: 'Open AI Copilot temperature, token limits, and model configuration',
    category: 'System',
  },
];

const getCommandIcon = (cmd: string) => {
  switch (cmd) {
    case '/patient':
      return User;
    case '/appointment':
      return Calendar;
    case '/invoice':
      return DollarSign;
    case '/report':
      return BarChart3;
    case '/prescription':
      return FileText;
    case '/treatment':
      return Stethoscope;
    case '/search':
      return Search;
    case '/settings':
      return Settings;
    default:
      return HelpCircle;
  }
};

export const SlashCommandsMenu: React.FC<SlashCommandsMenuProps> = ({
  onSelectCommand,
  filterQuery = '',
}) => {
  const filtered = slashCommandsList.filter((item) =>
    item.command.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-0 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-40 p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        <span>Teethly AI Slash Commands</span>
        <span>Press TAB or Enter to select</span>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-0.5">
        {filtered.map((item, idx) => {
          const Icon = getCommandIcon(item.command);
          return (
            <button
              key={idx}
              onClick={() => onSelectCommand(item)}
              className="w-full px-3 py-2 hover:bg-purple-50 rounded-xl text-left flex items-center gap-3 group transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-purple-600 group-hover:text-white text-slate-600 transition-colors shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-700 font-mono">
                    {item.command}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
