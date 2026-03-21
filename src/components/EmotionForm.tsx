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
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${variant === 'centered' ? 'max-w-2xl mx-auto' : 'w-full'}`}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="بماذا تشعر اليوم؟ أو ما هو سؤالك؟"
        disabled={isLoading || !isOnline}
        className="flex-1 bg-white border border-[var(--color-border)] rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 shadow-sm transition-all disabled:opacity-50"
        dir="rtl"
      />
      <button
        type="submit"
        disabled={!text.trim() || isLoading || !isOnline}
        className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
      >
        <Send size={20} className={text.trim() && !isLoading ? 'rtl:-scale-x-100' : ''} />
      </button>
    </form>
  );
};
