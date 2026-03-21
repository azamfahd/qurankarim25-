import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasbihModal: React.FC<TasbihModalProps> = ({ isOpen, onClose }) => {
  const [count, setCount] = useState(0);

  const handleTap = () => {
    setCount(c => c + 1);
    if (navigator.vibrate) navigator.vibrate(50);
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
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">المسبحة الإلكترونية</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div 
              className="w-48 h-48 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform select-none"
              onClick={handleTap}
            >
              <span className="text-6xl font-bold text-white">{count}</span>
            </div>

            <button 
              onClick={() => setCount(0)} 
              className="mt-8 flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <RotateCcw size={18} />
              <span>تصفير العداد</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
