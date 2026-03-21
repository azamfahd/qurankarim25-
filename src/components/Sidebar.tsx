import React from 'react';
import { Settings, History, PlusCircle, X, User, Heart, Bookmark as BookmarkIcon, SunMoon, BookOpenText, Share2, Compass, Calculator } from 'lucide-react';
import { UserSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
  onOpenTasbih: () => void;
  onOpenBookmarks: () => void;
  onOpenAdhkar: () => void;
  onOpenNamesOfAllah: () => void;
  onOpenQibla: () => void;
  onOpenZakat: () => void;
  userInfo: UserSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSettings, 
  onOpenHistory,
  onNewChat,
  onOpenTasbih,
  onOpenBookmarks,
  onOpenAdhkar,
  onOpenNamesOfAllah,
  onOpenQibla,
  onOpenZakat,
  userInfo
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div key="sidebar-container" className="fixed inset-0 z-50 flex justify-start">
          {/* Backdrop */}
          <motion.div 
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div 
            key="sidebar-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full w-[280px] sm:w-[320px] bg-white shadow-2xl flex flex-col overflow-hidden rounded-l-3xl border-l border-[var(--color-border)]"
          >
            
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-primary-light)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xl shadow-md transform hover:scale-105 transition-transform">
                  {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : <User size={24} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--color-primary-dark)] text-base">
                    {userInfo.username || 'ضيف كريم'}
                  </p>
                  <p className="text-xs text-[var(--color-primary)] opacity-80 font-medium">
                    {userInfo.isLoggedIn ? 'متصل' : 'وضع الزائر'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-sm">
                <X size={18} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
              
              <SidebarItem 
                icon={<PlusCircle size={20} />} 
                label="موضوع جديد" 
                onClick={() => { onNewChat(); onClose(); }} 
                primary
              />

              <div className="my-2 border-t border-[var(--color-border)] mx-2 opacity-50"></div>

              <SidebarItem 
                icon={<History size={20} />} 
                label="سجل التدبر" 
                onClick={() => { onOpenHistory(); onClose(); }} 
              />

              <SidebarItem 
                icon={<BookmarkIcon size={20} />} 
                label="الآيات المحفوظة" 
                onClick={() => { onOpenBookmarks(); onClose(); }} 
              />

              <div className="my-2 border-t border-[var(--color-border)] mx-2 opacity-50"></div>

              <SidebarItem 
                icon={<SunMoon size={20} />} 
                label="أذكار الصباح والمساء" 
                onClick={() => { onOpenAdhkar(); onClose(); }} 
              />

              <SidebarItem 
                icon={<BookOpenText size={20} />} 
                label="أسماء الله الحسنى" 
                onClick={() => { onOpenNamesOfAllah(); onClose(); }} 
              />

              <SidebarItem 
                icon={<Compass size={20} />} 
                label="اتجاه القبلة" 
                onClick={() => { onOpenQibla(); onClose(); }} 
              />

              <SidebarItem 
                icon={<Calculator size={20} />} 
                label="حاسبة الزكاة" 
                onClick={() => { onOpenZakat(); onClose(); }} 
              />

              <SidebarItem 
                icon={<Heart size={20} />} 
                label="المسبحة الإلكترونية" 
                onClick={() => { onOpenTasbih(); onClose(); }} 
              />

              <div className="my-2 border-t border-[var(--color-border)] mx-2 opacity-50"></div>

              <SidebarItem 
                icon={<Settings size={20} />} 
                label="الإعدادات" 
                onClick={() => { onOpenSettings(); onClose(); }} 
              />

              <SidebarItem 
                icon={<Share2 size={20} />} 
                label="مشاركة التطبيق" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'تطبيق أنيس القلوب',
                      text: 'رفيقك القرآني للتدبر والسكينة. جربه الآن!',
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('تم نسخ رابط التطبيق');
                  }
                  onClose();
                }} 
              />

            </div>

            {/* Footer */}
            <div className="p-4 text-center border-t border-[var(--color-border)] bg-gray-50/50">
              <p className="text-xs text-[var(--color-primary)] font-bold">
                أنيس القلوب - رفيقك القرآني
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                الإصدار 1.0.0
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SidebarItem = ({ icon, label, onClick, primary = false }: { icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean }) => (
  <button 
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group border ${
      primary 
        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5' 
        : 'bg-white text-gray-700 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md hover:-translate-y-0.5'
    }`}
    onClick={onClick}
  >
    <div className={`p-2 rounded-xl transition-colors ${primary ? 'bg-white/20 text-white' : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white'}`}>
      {icon}
    </div>
    <span className="font-bold text-sm">{label}</span>
  </button>
);
