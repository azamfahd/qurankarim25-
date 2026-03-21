import React, { useState, useEffect } from 'react';
import { Menu, User, Calendar, Moon, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  username: string;
}

const Header = React.memo<HeaderProps>(({ onOpenSidebar, onOpenSettings, username }) => {
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
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="p-2.5 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)] rounded-2xl transition-all text-gray-500 shadow-sm border border-transparent hover:border-[var(--color-primary)]/20"
          aria-label="القائمة"
        >
          <Menu size={22} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-[var(--color-primary)]" />
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] leading-tight tracking-tight">أنيس القلوب</h1>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold mt-0.5">
            <Calendar size={10} className="text-[var(--color-primary)]/60" />
            <span>{hijriDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenSettings}
          className="group flex items-center gap-3 pl-2 pr-1 py-1 bg-gray-50 hover:bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 rounded-full transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-sm font-bold text-gray-700 group-hover:text-[var(--color-primary)] transition-colors hidden sm:block pr-2">{username || 'ضيف'}</span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-white border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shadow-inner group-hover:scale-105 transition-transform">
            <User size={18} />
          </div>
        </button>
      </div>
    </motion.header>
  );
});

export default Header;

