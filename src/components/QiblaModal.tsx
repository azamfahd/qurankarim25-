import React from 'react';
import { X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({ isOpen, onClose }) => {
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
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">اتجاه القبلة</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="w-48 h-48 rounded-full border-4 border-[var(--color-primary-light)] flex items-center justify-center relative">
              <Compass size={64} className="text-[var(--color-primary)]" />
              <div className="absolute top-4 font-bold text-red-500">N</div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              يرجى تفعيل خدمات الموقع (GPS) للحصول على اتجاه دقيق.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
