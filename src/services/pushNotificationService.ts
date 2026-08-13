import { NotificationItem } from '../types/dashboard';

export interface PushNotificationPreferences {
  appointmentReminders: boolean;
  paymentAlerts: boolean;
  lowInventoryAlerts: boolean;
  leaveRequests: boolean;
  aiAlerts: boolean;
  systemAnnouncements: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: PushNotificationPreferences = {
  appointmentReminders: true,
  paymentAlerts: true,
  lowInventoryAlerts: true,
  leaveRequests: true,
  aiAlerts: true,
  systemAnnouncements: true,
  soundEnabled: true,
};

export class PushNotificationService {
  private static STORAGE_KEY = 'teethly_push_preferences';

  public static getPreferences(): PushNotificationPreferences {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse push preferences', e);
    }
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  public static savePreferences(prefs: PushNotificationPreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
  }

  public static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    return permission;
  }

  public static sendNotification(
    title: string,
    options: {
      body: string;
      category?: keyof PushNotificationPreferences;
      icon?: string;
      tag?: string;
    }
  ) {
    const prefs = this.getPreferences();

    if (options.category && prefs[options.category] === false) {
      console.log(`Push notification suppressed by user preference: ${options.category}`);
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          tag: options.tag || 'teethly-notif',
        });

        if (prefs.soundEnabled) {
          this.playNotificationSound();
        }

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('Native notification trigger failed:', err);
      }
    }
  }

  private static playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // AudioContext might be blocked before user interaction
    }
  }
}
