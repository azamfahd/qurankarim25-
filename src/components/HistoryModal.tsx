import React from 'react';
import { X, History, MessageCircle, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { ChatSession } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  onSelectSession, 
  onDeleteSession,
  onClearAll
}) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(timestamp));
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
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--color-border)]" 
            onClick={e => e.stopPropagation()}
          >
          {/* Header */}
          <div className="relative overflow-hidden bg-[var(--color-primary-light)] p-6 border-b border-[var(--color-border)] shrink-0">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-border)]">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">سجل المحادثات</h2>
                  <p className="text-xs text-text-muted mt-0.5">العودة إلى تأملاتك السابقة</p>
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

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar bg-[var(--color-bg)]">
            {sessions.length === 0 ? (
              <div className="text-center py-20 text-text-muted space-y-4">
                <div className="w-20 h-20 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto shadow-inner border border-[var(--color-border)]">
                  <History size={32} className="opacity-20 text-[var(--color-primary)]" />
                </div>
                <p className="text-sm font-medium">لا توجد محادثات سابقة بعد</p>
              </div>
            ) : (
              sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white border border-[var(--color-border)] rounded-2xl p-4 hover:border-[var(--color-primary)]/40 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4"
                  onClick={() => {
                    onSelectSession(session);
                    onClose();
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary-light)] to-white border border-[var(--color-border)] rounded-2xl flex items-center justify-center text-[var(--color-primary-dark)] shrink-0 shadow-sm">
                    <MessageCircle size={22} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate mb-1.5 group-hover:text-[var(--color-primary-dark)] transition-colors">{session.preview}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
                      <Calendar size={12} />
                      <span>{formatDate(session.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id, e);
                      }}
                      className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="p-2 text-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)] transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-border)] bg-white flex justify-between items-center shrink-0">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">يتم حفظ السجل محلياً في متصفحك</p>
            {sessions.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                مسح السجل
              </button>
            )}
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

