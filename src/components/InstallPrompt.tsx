import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center">
          <Download size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm">تثبيت التطبيق</h4>
          <p className="text-xs text-gray-500">أضف أنيس القلوب لشاشتك الرئيسية</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleInstall} className="text-xs font-bold bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg">تثبيت</button>
        <button onClick={() => setShowPrompt(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
      </div>
    </div>
  );
};
