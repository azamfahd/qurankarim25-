import React from 'react';
import { BookOpen } from 'lucide-react';

export const DailyVerse: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] my-6">
      <div className="flex items-center gap-2 mb-4 text-[var(--color-primary)]">
        <BookOpen size={20} />
        <h3 className="font-bold">آية اليوم</h3>
      </div>
      <p className="text-xl font-serif leading-loose text-center text-[var(--color-primary-dark)]">
        "إِنَّ مَعَ الْعُسْرِ يُسْرًا"
      </p>
      <p className="text-sm text-center text-gray-500 mt-4">سورة الشرح - الآية 6</p>
    </div>
  );
};
