import React from 'react';
import { Clock } from 'lucide-react';

export const PrayerTimesWidget: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-6 text-white shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} />
        <h3 className="font-bold">مواقيت الصلاة</h3>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-center"><p className="text-xs opacity-80">الفجر</p><p className="font-bold">04:30</p></div>
        <div className="text-center"><p className="text-xs opacity-80">الظهر</p><p className="font-bold">12:15</p></div>
        <div className="text-center"><p className="text-xs opacity-80">العصر</p><p className="font-bold">15:45</p></div>
        <div className="text-center"><p className="text-xs opacity-80">المغرب</p><p className="font-bold">18:30</p></div>
        <div className="text-center"><p className="text-xs opacity-80">العشاء</p><p className="font-bold">20:00</p></div>
      </div>
    </div>
  );
};
