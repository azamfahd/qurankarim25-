import React, { useState } from 'react';
import { X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DHIKR_SUGGESTIONS = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "أستغفر الله",
  "لا حول ولا قوة إلا بالله",
  "اللهم صلِ على محمد"
];

interface TasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasbihModal: React.FC<TasbihModalProps> = ({ isOpen, onClose }) => {
  const [count, setCount] = useState(0);
  const [dhikrIndex, setDhikrIndex] = useState(0);

  const handleTap = () => {
    setCount(c => c + 1);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const nextDhikr = () => {
    setDhikrIndex((prev) => (prev + 1) % DHIKR_SUGGESTIONS.length);
    setCount(0);
  };

  const prevDhikr = () => {
    setDhikrIndex((prev) => (prev - 1 + DHIKR_SUGGESTIONS.length) % DHIKR_SUGGESTIONS.length);
    setCount(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="modal-backdrop flex items-center justify-center p-4 z-50" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">المسبحة الإلكترونية</h2>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="w-full mb-8 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <button onClick={prevDhikr} className="p-2 hover:bg-white rounded-xl text-[var(--color-primary)] transition-all shadow-sm">
                <ChevronRight size={20} />
              </button>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={dhikrIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-lg font-bold text-[var(--color-primary-dark)]"
                >
                  {DHIKR_SUGGESTIONS[dhikrIndex]}
                </motion.span>
              </AnimatePresence>
              <button onClick={nextDhikr} className="p-2 hover:bg-white rounded-xl text-[var(--color-primary)] transition-all shadow-sm">
                <ChevronLeft size={20} />
              </button>
            </div>

            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="w-56 h-56 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-xl cursor-pointer select-none relative group"
              onClick={handleTap}
            >
              <div className="absolute inset-4 rounded-full border-2 border-white/20 group-hover:scale-105 transition-transform"></div>
              <div className="flex flex-col items-center">
                <span className="text-7xl font-bold text-white drop-shadow-md">{count}</span>
                <span className="text-xs text-white/60 font-medium mt-2 uppercase tracking-widest">اضغط للتسبيح</span>
              </div>
            </motion.div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => setCount(0)} 
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm border border-gray-100"
              >
                <RotateCcw size={18} />
                <span>تصفير</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
