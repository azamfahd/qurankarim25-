import React, { useState } from 'react';
import { X, Search, BookHeart } from 'lucide-react';
import { NAMES_OF_ALLAH } from '../data/namesOfAllah';
import { motion, AnimatePresence } from 'framer-motion';

interface NamesOfAllahModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NamesOfAllahModal: React.FC<NamesOfAllahModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNames = NAMES_OF_ALLAH.filter(name => 
    name.name.includes(searchTerm) || 
    name.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="bg-[var(--color-background)] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--color-border)] rounded-3xl" 
            onClick={e => e.stopPropagation()}
          >
          
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-light)]/20 to-transparent p-6 border-b border-[var(--color-border)] shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-border)]">
                  <BookHeart size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">أسماء الله الحسنى</h2>
                  <p className="text-xs text-text-muted mt-0.5">٩٩ اسماً</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white text-[var(--color-primary)]/60 hover:text-[var(--color-primary-dark)] rounded-full transition-all shadow-sm border border-[var(--color-border)]"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-primary-light)]/10 shrink-0">
            <div className="relative max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="ابحث عن اسم، معنى..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[var(--color-border)] rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 shadow-sm transition-all"
                dir="rtl"
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/40" />
            </div>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-[var(--color-primary-light)]/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-6">
              <AnimatePresence mode="popLayout">
                {filteredNames.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index < 20 ? index * 0.02 : 0, duration: 0.2 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-[var(--color-primary)]/40 hover:shadow-md transition-all"
                  >
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[var(--color-primary-light)] to-transparent opacity-20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="absolute top-2 right-3 text-[10px] font-bold text-[var(--color-primary)]/20 group-hover:text-[var(--color-primary)]/40 transition-colors">
                      {String(item.id).padStart(2, '0')}
                    </div>
                    <h3 className="font-serif text-3xl text-[var(--color-primary-dark)] mb-2 mt-2 drop-shadow-sm">{item.name}</h3>
                    <p className="text-xs text-text-muted font-medium mb-1.5 tracking-wider uppercase">{item.transliteration}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.meaning}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredNames.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12 text-text-muted flex flex-col items-center justify-center"
                >
                  <Search size={48} className="text-[var(--color-primary)]/10 mb-4" />
                  <p className="text-lg font-medium text-[var(--color-primary-dark)]/60">لا توجد نتائج مطابقة للبحث</p>
                  <p className="text-sm text-text-muted mt-1">جرب البحث بكلمات مختلفة</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
