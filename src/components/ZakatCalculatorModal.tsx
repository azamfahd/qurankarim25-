import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZakatCalculatorModal: React.FC<ZakatCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const zakat = amount ? (parseFloat(amount) * 0.025).toFixed(2) : '0.00';

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
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-[var(--color-primary-dark)]">
                <Calculator size={24} />
                <h2 className="text-xl font-bold">حاسبة الزكاة</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ المدخر (حال عليه الحول)</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="أدخل المبلغ..."
                dir="ltr"
              />
            </div>

            <div className="bg-[var(--color-primary-light)]/10 rounded-xl p-4 text-center border border-[var(--color-primary-light)]/30">
              <p className="text-sm text-gray-600 mb-1">مقدار الزكاة الواجب إخراجه (2.5%)</p>
              <p className="text-3xl font-bold text-[var(--color-primary-dark)]">{zakat}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
