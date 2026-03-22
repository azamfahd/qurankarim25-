import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface EmotionFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  isOnline: boolean;
  variant: 'centered' | 'bottom';
}

export const EmotionForm: React.FC<EmotionFormProps> = ({ onSubmit, isLoading, isOnline, variant }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading && isOnline) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-3 ${variant === 'centered' ? 'max-w-3xl mx-auto' : 'w-full'}`}>
      <div className="relative flex-1 group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="بماذا تشعر اليوم؟ أو ما هو سؤالك؟"
          disabled={isLoading || !isOnline}
          className="relative w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-4 px-8 text-white placeholder:text-white/50 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 shadow-2xl transition-all disabled:opacity-50"
          dir="rtl"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || isLoading || !isOnline}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(197,160,89,0.3)] shrink-0 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <Send size={24} className={`relative z-10 ${text.trim() && !isLoading ? 'rtl:-scale-x-100' : ''}`} />
      </button>
    </form>
  );
};
