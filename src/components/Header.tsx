import React, { useState, useEffect } from 'react';
import { Menu, User, Calendar, Moon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  username: string;
  isSyncing?: boolean;
  lastSynced?: number | null;
}

const Header = React.memo<HeaderProps>(({ onOpenSidebar, onOpenSettings, username, isSyncing, lastSynced }) => {
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    try {
      const date = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
      setHijriDate(date);
    } catch (e) {
      console.error("Hijri date formatting not supported", e);
    }
  }, []);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 bg-white/10 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-sm border border-white/10"
          aria-label="القائمة"
        >
          <Menu size={22} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-[var(--color-gold)]" />
            <h1 className="text-xl font-black royal-text-gradient leading-tight tracking-tight">أنيس القلوب</h1>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-gold-light)] font-semibold mt-0.5 opacity-80">
            <Calendar size={10} className="text-[var(--color-gold)]" />
            <span>{hijriDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-full border border-white/10"
              title="جاري المزامنة..."
            >
              <RefreshCw size={12} className="text-[var(--color-gold)] animate-spin" />
              <span className="text-[9px] text-white/70 font-bold">مزامنة</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={onOpenSettings}
          className="group flex items-center gap-3 pl-2 pr-1 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-sm font-bold text-white group-hover:text-[var(--color-gold-light)] transition-colors hidden sm:block pr-2">{username || 'ضيف'}</span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <User size={18} />
          </div>
        </button>
      </div>
    </motion.header>
  );
});

export default Header;

