import React, { useState, useEffect } from 'react';
import { Download, Bell, X, ShieldCheck, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';
import { PushNotificationService } from '../../services/pushNotificationService';

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Listen for BeforeInstallPrompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check notification permission state
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleEnableNotifications = async () => {
    const res = await PushNotificationService.requestPermission();
    if (res === 'granted') {
      PushNotificationService.sendNotification('Teethly Push Alerts Active', {
        body: 'You will now receive instant appointment, payment, and clinical updates.',
      });
    }
    setShowNotificationPrompt(false);
  };

  if (!showInstallPrompt && !showNotificationPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full space-y-3 px-4 sm:px-0">
      {showInstallPrompt && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#1d5bd8]/20 border border-[#1d5bd8]/30 text-[#1d5bd8] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">Install Teethly App</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-bold">PWA</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-normal">
                Install Teethly OS on your desktop or mobile home screen for lightning offline access and push alerts.
              </p>
              <button
                onClick={handleInstallClick}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d5bd8] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-900/30 transition-all cursor-pointer w-full justify-center"
              >
                <Download className="w-4 h-4" />
                Install Application
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotificationPrompt && !showInstallPrompt && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <button
            onClick={() => setShowNotificationPrompt(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">Enable Real-Time Push Alerts</span>
              <p className="text-xs text-slate-300 mt-1 leading-normal">
                Get instant notifications for upcoming appointments, low inventory warnings, and AI patient insights.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all cursor-pointer text-center"
                >
                  Enable Alerts
                </button>
                <button
                  onClick={() => setShowNotificationPrompt(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
