import React, { useState } from 'react';
import { X, Sun, Moon, CheckCircle2, RotateCcw } from 'lucide-react';
import { MORNING_ADHKAR, EVENING_ADHKAR, Dhikr } from '../data/adhkar';
import { motion, AnimatePresence } from 'framer-motion';

interface AdhkarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdhkarModal: React.FC<AdhkarModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [completed, setCompleted] = useState<Record<string, number>>({});

  const adhkarList = activeTab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;

  const handleTap = (dhikr: Dhikr) => {
    setCompleted(prev => {
      const current = prev[dhikr.id] || 0;
      if (current < dhikr.count) {
        return { ...prev, [dhikr.id]: current + 1 };
      }
      return prev;
    });
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const resetProgress = () => {
    setCompleted({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop flex items-center justify-center p-4 z-50" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-[var(--color-background)] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--color-border)] rounded-3xl" 
            onClick={e => e.stopPropagation()}
          >
          
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-light)]/20 to-transparent p-6 border-b border-[var(--color-border)] shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-border)]">
                  {activeTab === 'morning' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">أذكار الصباح والمساء</h2>
                  <p className="text-xs text-text-muted mt-0.5">حصن المسلم</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetProgress} 
                  className="w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white text-[var(--color-primary)]/60 hover:text-[var(--color-primary)] rounded-full transition-all shadow-sm border border-[var(--color-border)]"
                  title="إعادة تعيين"
                >
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white text-[var(--color-primary)]/60 hover:text-[var(--color-primary-dark)] rounded-full transition-all shadow-sm border border-[var(--color-border)]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-3 bg-[var(--color-primary-light)]/10 border-b border-[var(--color-border)] shrink-0 gap-2">
            <button 
              onClick={() => { setActiveTab('morning'); resetProgress(); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'morning' ? 'bg-white text-[var(--color-primary-dark)] shadow-sm border border-[var(--color-border)]' : 'text-text-muted hover:bg-white/60 border border-transparent'}`}
            >
              <Sun size={18} className={activeTab === 'morning' ? 'text-[var(--color-primary)]' : ''} />
              أذكار الصباح
            </button>
            <button 
              onClick={() => { setActiveTab('evening'); resetProgress(); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'evening' ? 'bg-white text-[var(--color-primary-dark)] shadow-sm border border-[var(--color-border)]' : 'text-text-muted hover:bg-white/60 border border-transparent'}`}
            >
              <Moon size={18} className={activeTab === 'evening' ? 'text-[var(--color-primary)]' : ''} />
              أذكار المساء
            </button>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-[var(--color-primary-light)]/5">
            <div className="flex flex-col gap-4 pb-6">
              <AnimatePresence mode="popLayout">
                {adhkarList.map((dhikr, index) => {
                  const currentCount = completed[dhikr.id] || 0;
                  const isDone = currentCount >= dhikr.count;
                  
                  return (
                    <motion.div 
                      key={dhikr.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleTap(dhikr)}
                      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all cursor-pointer select-none relative overflow-hidden ${isDone ? 'border-green-200 bg-green-50/30' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md active:scale-[0.98]'}`}
                    >
                      {isDone && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500 opacity-5 rounded-bl-full pointer-events-none"></div>
                      )}
                      
                      <p className={`font-serif text-xl leading-[2.2] mb-6 text-center transition-colors duration-300 ${isDone ? 'text-gray-400' : 'text-[var(--color-primary-dark)]'}`} dir="rtl">
                        {dhikr.text}
                      </p>
                      
                      <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-4">
                        <span className="text-xs text-text-muted font-medium max-w-[60%] truncate" title={dhikr.reference}>
                          {dhikr.reference}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            المرات: {dhikr.count}
                          </span>
                          
                          <motion.div 
                            key={currentCount}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors duration-300 ${isDone ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-gradient-to-br from-[var(--color-primary-light)] to-white border border-[var(--color-border)] text-[var(--color-primary-dark)]'}`}
                          >
                            {isDone ? <CheckCircle2 size={24} /> : <span className="text-lg">{currentCount}</span>}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
