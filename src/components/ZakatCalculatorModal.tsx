import React, { useState, useEffect } from 'react';
import { X, Calculator, Info, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZakatCalculatorModal: React.FC<ZakatCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [goldPrice, setGoldPrice] = useState('250'); // Default approx price per gram
  const [nisab, setNisab] = useState(0);

  useEffect(() => {
    const price = parseFloat(goldPrice) || 0;
    setNisab(price * 85); // Nisab is 85g of gold
  }, [goldPrice]);

  const zakat = amount ? (parseFloat(amount) * 0.025).toFixed(2) : '0.00';
  const isEligible = parseFloat(amount) >= nisab;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Decorative background elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary-light)]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--color-secondary-light)]/20 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-3 text-[var(--color-primary-dark)]">
                <div className="p-3 bg-[var(--color-primary-light)]/30 rounded-2xl">
                  <Calculator size={24} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="text-2xl font-bold">حاسبة الزكاة</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6 relative z-10">
              {/* Gold Price Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <TrendingUp size={16} className="text-[var(--color-primary)]" />
                  سعر جرام الذهب (عيار 24)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={goldPrice}
                    onChange={e => setGoldPrice(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[var(--color-primary)] focus:outline-none transition-all font-bold text-lg"
                    placeholder="سعر الجرام..."
                    dir="ltr"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">عملة</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info size={10} />
                  النصاب الشرعي هو قيمة 85 جراماً من الذهب الخالص.
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <DollarSign size={16} className="text-[var(--color-primary)]" />
                  إجمالي المال المدخر (حال عليه الحول)
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[var(--color-primary)] focus:outline-none transition-all font-bold text-lg"
                  placeholder="أدخل المبلغ..."
                  dir="ltr"
                />
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-medium text-gray-500">النصاب الحالي:</span>
                  <span className="font-bold text-gray-700">{nisab.toLocaleString()}</span>
                </div>

                <div className={`p-6 rounded-3xl text-center border-2 transition-all duration-500 ${
                  isEligible 
                    ? 'bg-[var(--color-primary-light)]/10 border-[var(--color-primary-light)]' 
                    : 'bg-gray-50 border-gray-100'
                }`}>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">مقدار الزكاة الواجب إخراجه (2.5%)</p>
                  <p className={`text-4xl font-black mb-2 ${isEligible ? 'text-[var(--color-primary-dark)]' : 'text-gray-300'}`}>
                    {isEligible ? zakat : '0.00'}
                  </p>
                  
                  {!isEligible && amount && (
                    <p className="text-[10px] text-red-400 font-bold flex items-center justify-center gap-1">
                      <Info size={12} />
                      المبلغ لم يبلغ النصاب بعد.
                    </p>
                  )}
                  {isEligible && (
                    <p className="text-[10px] text-[var(--color-primary)] font-bold flex items-center justify-center gap-1">
                      <TrendingUp size={12} />
                      المبلغ بلغ النصاب، وجبت الزكاة.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-[10px] text-amber-700 leading-relaxed text-center font-medium">
                  "خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا"
                  <br />
                  <span className="opacity-60 text-[8px]">[سورة التوبة: 103]</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
