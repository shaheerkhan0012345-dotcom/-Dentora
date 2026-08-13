import { useState, useEffect } from 'react';

export interface OfflineQueueItem {
  id: string;
  type: 'appointment' | 'patient_note' | 'payment' | 'prescription' | 'chart_update';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingQueue: OfflineQueueItem[];
  lastSyncTime: string | null;
}

type Listener = (state: OfflineSyncState) => void;

class OfflineSyncServiceStore {
  private state: OfflineSyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingQueue: [
      {
        id: 'off-q-1',
        type: 'appointment',
        action: 'CREATE',
        payload: { patientName: 'Zainab Ahmed', time: '02:30 PM', treatment: 'Root Canal Therapy' },
        timestamp: new Date().toISOString(),
        status: 'pending',
      }
    ],
    lastSyncTime: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
    }
  }

  public getState(): OfflineSyncState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  public setOnlineStatus(status: boolean) {
    this.state = { ...this.state, isOnline: status };
    this.notify();
    if (status && this.state.pendingQueue.length > 0) {
      this.triggerManualSync();
    }
  }

  public addToQueue(type: OfflineQueueItem['type'], action: OfflineQueueItem['action'], payload: any) {
    const newItem: OfflineQueueItem = {
      id: `off-q-${Date.now()}`,
      type,
      action,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    this.state = {
      ...this.state,
      pendingQueue: [...this.state.pendingQueue, newItem],
    };
    this.notify();
  }

  public removeFromQueue(id: string) {
    this.state = {
      ...this.state,
      pendingQueue: this.state.pendingQueue.filter((item) => item.id !== id),
    };
    this.notify();
  }

  public async triggerManualSync() {
    if (!this.state.isOnline || this.state.pendingQueue.length === 0) return;

    this.state = {
      ...this.state,
      isSyncing: true,
      pendingQueue: this.state.pendingQueue.map((item) => ({ ...item, status: 'syncing' as const })),
    };
    this.notify();

    // Simulate batch sync processing
    await new Promise((resolve) => setTimeout(resolve, 1800));

    this.state = {
      ...this.state,
      pendingQueue: [],
      isSyncing: false,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.notify();
  }
}

export const offlineSyncService = new OfflineSyncServiceStore();

export function useOfflineSyncStore(): OfflineSyncState & {
  addToQueue: (type: OfflineQueueItem['type'], action: OfflineQueueItem['action'], payload: any) => void;
  removeFromQueue: (id: string) => void;
  triggerManualSync: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
} {
  const [state, setState] = useState<OfflineSyncState>(offlineSyncService.getState());

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    addToQueue: (type, action, payload) => offlineSyncService.addToQueue(type, action, payload),
    removeFromQueue: (id) => offlineSyncService.removeFromQueue(id),
    triggerManualSync: () => offlineSyncService.triggerManualSync(),
    setOnlineStatus: (status) => offlineSyncService.setOnlineStatus(status),
  };
}
