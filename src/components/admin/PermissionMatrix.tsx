import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, Lock, Check, X, AlertCircle } from 'lucide-react';
import { RoleDefinition, PermissionItem } from '../../types/admin';
import { SYSTEM_PERMISSIONS } from '../../data/permissionDefaults';

interface PermissionMatrixProps {
  roles: RoleDefinition[];
  onSaveRole: (updatedRole: RoleDefinition) => Promise<void>;
  onAddNewRoleClick: () => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  roles,
  onSaveRole,
  onAddNewRoleClick,
}) => {
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(roles[0] || null);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Group permissions by category
  const categories = Array.from(new Set(SYSTEM_PERMISSIONS.map((p) => p.category)));

  const handleTogglePermission = async (role: RoleDefinition, permKey: string) => {
    const hasPerm = role.permissions.includes(permKey);
    const updatedPermissions = hasPerm
      ? role.permissions.filter((k) => k !== permKey)
      : [...role.permissions, permKey];

    const updatedRole: RoleDefinition = {
      ...role,
      permissions: updatedPermissions,
    };

    setSavingRoleId(role.id);
    try {
      await onSaveRole(updatedRole);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Role-Based Access Control (RBAC) Permission Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure system capabilities, module authorization & strict security boundaries across roles
          </p>
        </div>

        <button
          onClick={onAddNewRoleClick}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs">
                <th className="py-4 px-5 font-black uppercase tracking-wider w-1/3">
                  System Module & Capability
                </th>
                {roles.map((r) => (
                  <th key={r.id} className="py-4 px-4 font-black text-center min-w-[110px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">{r.roleName}</span>
                      {r.isSystemRole ? (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                          System Role
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {categories.map((category) => {
                const categoryPerms = SYSTEM_PERMISSIONS.filter((p) => p.category === category);
                return (
                  <React.Fragment key={category}>
                    <tr className="bg-slate-50/90">
                      <td
                        colSpan={roles.length + 1}
                        className="py-2.5 px-5 font-black text-[#1d5bd8] uppercase text-[10px] tracking-widest bg-slate-100/70"
                      >
                        {category} Permissions
                      </td>
                    </tr>
                    {categoryPerms.map((perm) => (
                      <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-5">
                          <div className="font-extrabold text-slate-800">{perm.label}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{perm.description}</div>
                        </td>
                        {roles.map((r) => {
                          const isGranted = r.permissions.includes(perm.key);
                          const isSaving = savingRoleId === r.id;

                          return (
                            <td key={r.id} className="py-3 px-4 text-center align-middle">
                              <button
                                onClick={() => handleTogglePermission(r, perm.key)}
                                disabled={isSaving}
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                                  isGranted
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                                }`}
                                title={`${isGranted ? 'Revoke' : 'Grant'} ${perm.label} for ${r.roleName}`}
                              >
                                {isGranted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
