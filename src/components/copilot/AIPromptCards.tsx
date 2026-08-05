import React from 'react';
import { Sparkles, FileText, DollarSign, Package, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';

interface AIPromptCardsProps {
  onSelectPrompt: (promptText: string) => void;
  userRole?: string;
}

export const AIPromptCards: React.FC<AIPromptCardsProps> = ({ onSelectPrompt, userRole }) => {
  const prompts = [
    {
      title: "Patient Summary",
      desc: "Summarize Sarah Jenkins' 3D Aligner progress (Tray 12/18)",
      prompt: "Summarize 3D Aligner treatment trajectory for Sarah Jenkins (PT-8801). Tray 12/18.",
      icon: Stethoscope,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      roles: ["Doctor", "Assistant", "Admin"],
    },
    {
      title: "Unpaid Invoices Audit",
      desc: "Find overdue patient balances and copay statuses",
      prompt: "/invoice Show unpaid invoices and outstanding patient balances.",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      roles: ["Admin", "Receptionist"],
    },
    {
      title: "CDT Insurance Codification",
      desc: "Lookup ADA CDT codes for Molar Root Canal & Crown",
      prompt: "Generate ADA Dental CDT codes for Porcelain Crown & Molar Root Canal with copay breakdown.",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      roles: ["Doctor", "Admin", "Receptionist"],
    },
    {
      title: "Low Inventory Alert",
      desc: "Check items below minimum stock threshold",
      prompt: "Show dental inventory items with low or critical stock levels.",
      icon: Package,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      roles: ["Admin", "Assistant"],
    },
    {
      title: "Today's Clinic Schedule",
      desc: "Overview of today's appointments and waiting queue",
      prompt: "Provide an executive summary of today's scheduled appointments and waiting queue status.",
      icon: Calendar,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      roles: ["Admin", "Doctor", "Receptionist", "Assistant"],
    },
    {
      title: "Post-Op Patient Draft",
      desc: "Draft instructions for Tooth Extraction recovery",
      prompt: "Draft patient post-op care instructions following Tooth #19 surgical extraction.",
      icon: ShieldCheck,
      color: "bg-teal-500/10 text-teal-600 border-teal-200",
      roles: ["Doctor", "Assistant"],
    },
  ];

  // Filter prompts relevant to active user role if specified
  const filtered = userRole
    ? prompts.filter((p) => p.roles.includes(userRole) || p.roles.includes('Admin'))
    : prompts;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Suggested AI Practice Actions
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 bg-white hover:bg-purple-50/40 rounded-2xl border border-slate-200/90 hover:border-purple-300 text-left transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl border ${item.color} group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                    {item.title}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
