import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useOfflineSyncStore } from '../../services/offlineSyncService';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingQueue, isSyncing, triggerManualSync, lastSyncTime } = useOfflineSyncStore();

  if (isOnline) {
    return null;
  }

  return (
    <div className={`w-full px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors shadow-sm ${
      !isOnline 
        ? 'bg-amber-500 text-slate-950 border-b border-amber-600' 
        : 'bg-emerald-600 text-white border-b border-emerald-700'
    }`}>
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 animate-bounce shrink-0" />
              <span><strong>Offline Mode Active</strong> — Viewing cached data. {pendingQueue.length} change(s) queued for automatic sync.</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Network Restored — Syncing {pendingQueue.length} offline operation(s) to cloud database...</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="opacity-80 text-[11px] hidden sm:inline">Last Sync: {lastSyncTime}</span>
          )}
          {isOnline && pendingQueue.length > 0 && (
            <button
              onClick={triggerManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-emerald-900 hover:bg-emerald-50 text-[11px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
