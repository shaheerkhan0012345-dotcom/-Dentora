import React, { useState } from 'react';
import { X, ShieldPlus, Check, Save } from 'lucide-react';
import { RoleDefinition } from '../../types/admin';
import { SYSTEM_PERMISSIONS } from '../../data/permissionDefaults';

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRole: (role: RoleDefinition) => Promise<void>;
}

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveRole,
}) => {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTogglePerm = (key: string) => {
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedPerms(SYSTEM_PERMISSIONS.map((p) => p.key));
  };

  const handleClearAll = () => {
    setSelectedPerms([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setIsSubmitting(true);
    try {
      const newRole: RoleDefinition = {
        id: `role-${Date.now()}`,
        roleName: roleName.trim(),
        isSystemRole: false,
        description: description.trim() || 'Custom practice role',
        permissions: selectedPerms,
        createdAt: new Date().toISOString(),
      };
      await onSaveRole(newRole);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Array.from(new Set(SYSTEM_PERMISSIONS.map((p) => p.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
        {/* HEADER */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <ShieldPlus className="w-5 h-5 text-emerald-400" />
              <span>Create Custom System Role</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Define custom authorization credentials and module permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Role Title / Name *</label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Senior Hygienist / Billing Coordinator"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of responsibilities and permissions"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-black text-slate-800 text-xs">Select Permissions</label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-500 font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 max-h-64 overflow-y-auto space-y-4">
              {categories.map((cat) => {
                const perms = SYSTEM_PERMISSIONS.filter((p) => p.category === cat);
                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1">
                      {cat}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = selectedPerms.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePerm(p.key)}
                              className="mt-0.5 text-emerald-600 rounded-xs cursor-pointer"
                            />
                            <div>
                              <div className="font-extrabold text-[11px] leading-tight">{p.label}</div>
                              <div className="text-[9px] text-slate-500">{p.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !roleName.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Save Custom Role'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
