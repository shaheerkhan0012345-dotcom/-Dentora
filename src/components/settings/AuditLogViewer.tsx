import React, { useState, useEffect } from 'react';
import { History, Search, Shield, Filter, Download, UserCheck } from 'lucide-react';
import { AuditLogRecord } from '../../types/admin';
import { subscribeToAuditLogs } from '../../services/auditLogService';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const unsub = subscribeToAuditLogs(setLogs);
    return () => unsub();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || log.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-[#1d5bd8]" />
            <span>System Audit Trail & HIPAA Compliance Logs</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Immutable security event registry recording user logins, record modifications, billing transactions & administrative updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="All">All Categories</option>
            <option value="Auth">Auth & Sessions</option>
            <option value="Patient">Patient Files</option>
            <option value="Billing">Billing & Revenue</option>
            <option value="Staff">Staff Management</option>
            <option value="Settings">Clinic Settings</option>
          </select>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No matching audit entries found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-800">{log.action}</td>
                  <td className="py-3 px-4 font-bold text-slate-600">{log.category}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
