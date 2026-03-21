import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Copy, Check, Info, Sparkles, BookHeart, Share2, WifiOff, Bookmark as BookmarkIcon, Lightbulb } from 'lucide-react';
import { QuranResponse, Verse, Bookmark } from '../types';
import { motion } from 'framer-motion';

const CopyButton: React.FC<{ text: string, label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`btn-ghost btn-icon transition-all duration-300 ${copied ? 'text-green-600 bg-green-50' : 'hover:bg-[var(--color-primary-light)] text-[var(--color-primary)]'}`}
      style={{ width: 32, height: 32 }}
      title={label || "نسخ"}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};

const VerseItem: React.FC<{ 
  verse: Verse, 
  index: number, 
  isOnline: boolean,
  isBookmarked: boolean,
  onToggleBookmark: (verse: Verse) => void,
  reciter?: string
}> = ({ verse, index, isOnline, isBookmarked, onToggleBookmark, reciter = 'ar.alafasy' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = async () => {
    if (!isOnline) {
      alert("عذراً، التشغيل الصوتي يتطلب اتصالاً بالإنترنت.");
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        const surahStr = verse.surahNumber.toString().padStart(3, '0');
        const ayahStr = verse.ayahNumber.toString().padStart(3, '0');
        
        let audioUrl = '';
        
        // For reciters known to be on everyayah.com
        const getAudioUrl = async (reciterId: string, surah: number, ayah: number, useFallback: boolean = false) => {
          const surahStr = surah.toString().padStart(3, '0');
          const ayahStr = ayah.toString().padStart(3, '0');
          
          const everyAyahReciters: Record<string, string> = {
            'ar.alafasy': 'Alafasy_128kbps',
            'ar.abdulsamad': 'Abdul_Basit_Murattal_192kbps',
            'ar.as-sudais': 'Abdurrahmaan_As-Sudais_192kbps',
            'ar.maheralmuaiqly': 'Maher_AlMuaiqly_64kbps',
            'ar.saadghamidi': 'Saad_Al-Ghamidi_128kbps',
            'ar.minshawi': 'Minshawy_Murattal_128kbps',
            'ar.yasseraldosari': 'Yasser_Ad-Dussary_128kbps'
          };

          if (!useFallback && everyAyahReciters[reciterId]) {
            return `https://everyayah.com/data/${everyAyahReciters[reciterId]}/${surahStr}${ayahStr}.mp3`;
          } else {
            try {
              const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${reciterId}`);
              const result = await response.json();
              if (result.code === 200 && result.data.audio) {
                return result.data.audio;
              }
            } catch (e) {
              console.error("Failed to fetch audio from API", e);
            }
          }
          return null;
        };

        const playWithUrl = async (url: string, isRetry: boolean = false) => {
          const audio = new Audio(url);
          audioRef.current = audio;
          
          audio.onended = () => setIsPlaying(false);
          audio.onerror = async () => {
            console.error("Audio error for URL:", url);
            if (!isRetry) {
              const fallbackUrl = await getAudioUrl(reciter, verse.surahNumber, verse.ayahNumber, true);
              if (fallbackUrl && fallbackUrl !== url) {
                console.log("Retrying with fallback URL:", fallbackUrl);
                playWithUrl(fallbackUrl, true);
                return;
              }
            }
            setIsPlaying(false);
            alert("عذراً، فشل تحميل التلاوة. قد يكون الرابط غير متاح حالياً.");
          };

          audio.oncanplaythrough = () => {
            if (isPlaying) {
              audio.play().catch(e => {
                console.error("Audio play failed:", e);
                setIsPlaying(false);
              });
            }
          };

          try {
            await audio.play();
            setIsPlaying(true);
          } catch (e) {
            console.error("Initial audio play failed:", e);
          }
        };

        const initialUrl = await getAudioUrl(reciter, verse.surahNumber, verse.ayahNumber);
        if (!initialUrl) {
          alert("عذراً، لم نتمكن من العثور على رابط التلاوة لهذا القارئ.");
          return;
        }
        
        setIsPlaying(true);
        await playWithUrl(initialUrl);
      } else {
        audioRef.current.play().catch(e => {
          console.error("Audio play failed:", e);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  const copyText = `${verse.arabicText} ﴿${verse.ayahNumber}﴾\n[سورة ${verse.surahName}]\n\n- عبر تطبيق أنيس القلوب`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'أنيس القلوب - رفيقك القرآني',
          text: copyText,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(copyText);
      alert('تم نسخ النص للمشاركة');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="bg-white rounded-3xl border border-gray-100 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group"
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-light)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="p-6 md:p-8 relative z-10">
        {/* Verse Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-[var(--color-primary-dark)] font-bold flex items-center gap-3 shadow-sm text-sm">
               <span className="font-outfit">سورة {verse.surahName}</span>
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-40"></span>
               <span className="font-outfit">الآية {verse.ayahNumber}</span>
            </div>
          </div>
          
          <div className="flex gap-2 bg-gray-50/80 backdrop-blur-md p-1.5 rounded-xl border border-gray-100 shadow-sm">
             <CopyButton text={copyText} label="نسخ الآية" />
             <button 
               onClick={() => onToggleBookmark(verse)}
               className={`btn-ghost btn-icon transition-all duration-300 ${isBookmarked ? 'text-[var(--color-primary)] bg-white shadow-sm scale-105' : 'hover:bg-white text-gray-400'}`}
               style={{ width: 32, height: 32 }}
               title={isBookmarked ? "إزالة من المحفوظات" : "حفظ الآية"}
             >
               <BookmarkIcon size={16} fill={isBookmarked ? "currentColor" : "none"} />
             </button>
             <button 
               onClick={handleShare}
               className="btn-ghost btn-icon transition-all duration-300 hover:bg-white text-[var(--color-primary)]"
               style={{ width: 32, height: 32 }}
               title="مشاركة"
             >
               <Share2 size={16} />
             </button>
             <button 
               onClick={toggleAudio}
               disabled={!isOnline}
               className={`btn-ghost btn-icon transition-all duration-300 ${isPlaying ? 'bg-[var(--color-primary)] text-white shadow-md scale-105' : 'hover:bg-white text-[var(--color-primary)]'}`}
               style={{ width: 32, height: 32 }}
               title="استماع"
             >
               {!isOnline ? <WifiOff size={16} /> : (isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" className="ml-0.5" />)}
             </button>
          </div>
        </div>

        {/* The Quran Text */}
        <div className="text-center mb-8 relative">
          <p className="quran-text font-bold text-gray-900 leading-loose px-2 md:px-6 text-2xl md:text-3xl" dir="rtl">
            {verse.arabicText}
            <span className="inline-flex items-center justify-center mx-3 text-[var(--color-primary)] font-outfit text-sm md:text-base border border-[var(--color-primary-light)] bg-white rounded-full w-8 h-8 md:w-10 md:h-10 align-middle shadow-sm transform hover:rotate-12 transition-transform duration-500">
              {verse.ayahNumber}
            </span>
          </p>
        </div>

        {/* Tafsir and Tadabbur */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-gray-50/80 to-white rounded-2xl p-5 text-gray-800 relative border border-gray-100 shadow-inner group-hover:shadow-sm transition-all duration-500">
            <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-white rounded-lg shadow-sm text-[var(--color-primary)] border border-gray-50">
                 <BookHeart size={16} />
               </div>
               <span className="text-sm font-bold text-[var(--color-primary-dark)] tracking-wider font-outfit">التفسير</span>
            </div>
            <div className="font-sans text-sm md:text-base leading-relaxed text-gray-700 whitespace-pre-wrap text-justify">
               {verse.tafsir}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--color-primary-light)]/20 to-white rounded-2xl p-5 text-gray-800 relative border border-[var(--color-primary)]/10 shadow-inner group-hover:shadow-sm transition-all duration-500">
            <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-white rounded-lg shadow-sm text-[var(--color-primary)] border border-gray-50">
                 <Sparkles size={16} />
               </div>
               <span className="text-sm font-bold text-[var(--color-primary-dark)] tracking-wider font-outfit">التدبر</span>
            </div>
            <div className="font-sans text-sm md:text-base leading-relaxed text-gray-700 whitespace-pre-wrap text-justify">
               {verse.tadabbur}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ResultCard: React.FC<{ 
  data: QuranResponse, 
  isOnline?: boolean,
  bookmarks?: Bookmark[],
  onToggleBookmark?: (verse: Verse) => void,
  reciter?: string
}> = ({ data, isOnline = true, bookmarks = [], onToggleBookmark = () => {}, reciter }) => {
  return (
    <div className="w-full max-w-3xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* 1. Response Header & Intro */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        {data.title && (
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-4 shadow-inner border border-[var(--color-primary)]/20"
            >
              <BookHeart className="w-8 h-8 text-[var(--color-primary)]" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-primary-dark)] mb-3 tracking-tight leading-tight">
              {data.title}
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent rounded-full opacity-40"></div>
          </div>
        )}

        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-br from-[var(--color-primary-light)]/30 to-white/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          
          <div className="relative bg-white/90 backdrop-blur-lg p-6 md:p-8 rounded-3xl border border-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-[var(--color-primary-light)]/30 rounded-lg text-[var(--color-primary)]">
                 <Info size={18} />
               </div>
               <span className="text-sm font-bold text-[var(--color-primary-dark)] tracking-wider font-outfit">المقدمة</span>
            </div>
            <p className="text-gray-800 leading-relaxed font-sans text-base md:text-lg relative z-10 text-justify">
              {data.introMessage}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Verses List */}
      {data.verses && data.verses.length > 0 && (
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-gradient-to-l from-[var(--color-primary)]/20 to-transparent"></div>
            <span className="text-xs font-bold text-[var(--color-primary-dark)] uppercase tracking-widest font-outfit">الآيات والتأملات</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent"></div>
          </div>
          
          {data.verses.map((verse, idx) => {
            const isBookmarked = bookmarks.some(b => b.verse.surahNumber === verse.surahNumber && b.verse.ayahNumber === verse.ayahNumber);
            return (
              <VerseItem 
                key={`${verse.surahNumber}-${verse.ayahNumber}-${idx}`} 
                verse={verse} 
                index={idx}
                isOnline={isOnline}
                isBookmarked={isBookmarked}
                onToggleBookmark={onToggleBookmark}
                reciter={reciter}
              />
            );
          })}
        </div>
      )}

      {/* 3. Tafakkur & Summary */}
      <div className="flex flex-col gap-6">
        {/* Tafakkur */}
        {data.tafakkur && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-dark)]"></div>
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-3 text-[var(--color-primary-dark)] font-bold font-sans text-lg">
                <div className="p-2 bg-[var(--color-primary-light)]/40 rounded-xl">
                  <Lightbulb size={20} className="text-[var(--color-primary)]" />
                </div>
                <span>التفكر والعمل</span>
              </div>
              <div className="flex gap-2 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
                <CopyButton text={data.tafakkur} label="نسخ التفكر" />
                <button 
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'أنيس القلوب - رفيقك القرآني',
                          text: data.tafakkur || '',
                        });
                      } catch (error) {
                        console.log('Error sharing', error);
                      }
                    } else {
                      navigator.clipboard.writeText(data.tafakkur || '');
                      alert('تم نسخ النص للمشاركة');
                    }
                  }}
                  className="btn-ghost btn-icon transition-all duration-300 hover:bg-white text-[var(--color-primary)]"
                  style={{ width: 32, height: 32 }}
                  title="مشاركة"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed text-base md:text-lg font-sans relative z-10 text-justify">
              {data.tafakkur}
            </p>
          </motion.div>
        )}

        {/* Summary Section */}
        {data.summary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[#064e3b] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
            </div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                <BookHeart size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold font-sans tracking-wide">الخلاصة</h3>
            </div>
            
            <p className="text-white/90 leading-relaxed text-base md:text-lg font-sans relative z-10 italic font-light text-justify">
              "{data.summary}"
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
};

