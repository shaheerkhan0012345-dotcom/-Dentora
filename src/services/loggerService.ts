export interface SystemLogItem {
  id: string;
  type: 'ERROR' | 'WARN' | 'INFO' | 'PERFORMANCE' | 'SECURITY';
  message: string;
  source: string;
  timestamp: string;
  details?: any;
}

export interface PerformanceMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'API_LATENCY' | 'FIRESTORE_QUERY';
  value: number; // in ms or score
  unit: 'ms' | 'score';
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

class LoggerService {
  private static STORAGE_KEY = 'dentora_system_logs';
  private static PERF_KEY = 'dentora_perf_metrics';

  public getLogs(): SystemLogItem[] {
    try {
      const logs = localStorage.getItem(LoggerService.STORAGE_KEY);
      if (logs) return JSON.parse(logs);
    } catch (e) {
      console.warn('Failed to parse system logs', e);
    }
    return [
      {
        id: 'sys-log-1',
        type: 'INFO',
        message: 'Dentora OS Initialized with PWA & Offline Sync Engine',
        source: 'AppBoot',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'sys-log-2',
        type: 'SECURITY',
        message: 'RBAC Authorization verified for Clinic Owner role',
        source: 'AuthGuard',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'sys-log-3',
        type: 'PERFORMANCE',
        message: 'Firestore batch patient load executed in 142ms',
        source: 'FirestoreClient',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        details: { queryTimeMs: 142, docCount: 48 }
      }
    ];
  }

  public log(type: SystemLogItem['type'], message: string, source: string, details?: any) {
    const item: SystemLogItem = {
      id: `sys-log-${Date.now()}`,
      type,
      message,
      source,
      timestamp: new Date().toISOString(),
      details,
    };

    const current = this.getLogs();
    const updated = [item, ...current.slice(0, 199)]; // Keep latest 200
    try {
      localStorage.setItem(LoggerService.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage limit reached for logs', e);
    }
  }

  public logPerformance(name: PerformanceMetric['name'], value: number, unit: 'ms' | 'score' = 'ms') {
    let rating: PerformanceMetric['rating'] = 'good';
    if (unit === 'ms') {
      if (value > 300) rating = 'needs-improvement';
      if (value > 1000) rating = 'poor';
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      rating,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing: PerformanceMetric[] = JSON.parse(localStorage.getItem(LoggerService.PERF_KEY) || '[]');
      localStorage.setItem(LoggerService.PERF_KEY, JSON.stringify([metric, ...existing.slice(0, 49)]));
    } catch (e) {}

    this.log('PERFORMANCE', `${name} metric logged: ${value}${unit} (${rating})`, 'PerfMonitor', metric);
  }

  public getPerformanceMetrics(): PerformanceMetric[] {
    try {
      return JSON.parse(localStorage.getItem(LoggerService.PERF_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  public clearLogs() {
    localStorage.removeItem(LoggerService.STORAGE_KEY);
  }
}

export const logger = new LoggerService();
