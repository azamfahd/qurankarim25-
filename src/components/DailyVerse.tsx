import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VERSES = [
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "الشرح", ayah: 6 },
  { text: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا", surah: "الطور", ayah: 48 },
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", surah: "الرعد", ayah: 28 },
  { text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", surah: "طه", ayah: 114 },
  { text: "فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ", surah: "البقرة", ayah: 186 },
  { text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", surah: "الطلاق", ayah: 3 },
  { text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا", surah: "آل عمران", ayah: 8 },
  { text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", surah: "البقرة", ayah: 153 },
  { text: "وَقُولُوا لِلنَّاسِ حُسْنًا", surah: "البقرة", ayah: 83 },
  { text: "وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ", surah: "البقرة", ayah: 195 },
  { text: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", surah: "الزمر", ayah: 53 },
  { text: "وَاللَّهُ يَعْلَمُ مَا فِي قُلُوبِكُمْ", surah: "الأحزاب", ayah: 51 }
];

export const DailyVerse: React.FC = () => {
  const [verse, setVerse] = useState(VERSES[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Pick a verse based on the day of the year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setVerse(VERSES[dayOfYear % VERSES.length]);
  }, []);

  const refreshVerse = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const currentIndex = VERSES.indexOf(verse);
      let nextIndex = Math.floor(Math.random() * VERSES.length);
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * VERSES.length);
      }
      setVerse(VERSES[nextIndex]);
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/40 relative overflow-hidden group hover:shadow-xl transition-all duration-700 h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)]"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3 text-[var(--color-gold-dark)]">
          <div className="p-2 bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-gold-dark)]/20 rounded-xl border border-[var(--color-gold)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <BookOpen size={20} className="text-[var(--color-gold-dark)]" />
          </div>
          <h3 className="font-bold text-lg">آية وتأمل</h3>
        </div>
        <button 
          onClick={refreshVerse}
          className={`p-2 text-[var(--color-gold-dark)] hover:bg-[var(--color-gold)]/10 rounded-xl transition-all shadow-sm border border-transparent hover:border-[var(--color-gold)]/20 ${isRefreshing ? 'animate-spin' : ''}`}
          title="آية أخرى"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={verse.text}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center relative z-10"
        >
          <p className="text-2xl md:text-3xl font-bold leading-[1.8] text-center text-gray-900 mb-6 px-2 quran-text drop-shadow-sm tracking-normal" style={{ wordSpacing: '0.1em' }}>
            "{verse.text}"
          </p>
          <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-gold-dark)] bg-[var(--color-gold)]/5 px-4 py-2 rounded-xl border border-[var(--color-gold)]/20 shadow-sm">
            <span className="font-outfit">سورة {verse.surah}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]"></span>
            <span className="font-outfit">الآية {verse.ayah}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
