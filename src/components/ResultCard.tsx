import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Copy, Check, Info, Sparkles, BookHeart, Share2, WifiOff, Bookmark as BookmarkIcon, Lightbulb, Quote } from 'lucide-react';
import { QuranResponse, Verse, Bookmark } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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
      className={`btn-ghost btn-icon transition-all duration-300 ${copied ? 'text-green-600 bg-green-50' : 'hover:bg-gray-100 text-gray-500'}`}
      style={{ width: 32, height: 32 }}
      title={label || "نسخ"}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};

const VerseSection: React.FC<{ 
  verse: Verse, 
  index: number, 
  isOnline: boolean,
  isBookmarked: boolean,
  onToggleBookmark: (verse: Verse) => void,
  reciter?: string,
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ verse, index, isOnline, isBookmarked, onToggleBookmark, reciter = 'ar.alafasy', onShowToast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'tafsir' | 'tadabbur'>('tafsir');
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
      onShowToast("عذراً، التشغيل الصوتي يتطلب اتصالاً بالإنترنت.", 'info');
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
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
            onShowToast("عذراً، فشل تحميل التلاوة. قد يكون الرابط غير متاح حالياً.", 'error');
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
          onShowToast("عذراً، لم نتمكن من العثور على رابط التلاوة لهذا القارئ.", 'error');
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
      onShowToast('تم نسخ النص للمشاركة', 'success');
    }
  };

  return (
    <div className="relative group">
      {/* Verse Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary-light)]/40 border border-[var(--color-primary)]/20 px-4 py-2 rounded-xl text-[var(--color-primary-dark)] font-bold flex items-center gap-2 text-sm shadow-sm">
             <BookHeart size={16} />
             <span className="font-outfit tracking-wide">سورة {verse.surahName}</span>
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]"></span>
             <span className="font-outfit tracking-wide">آية {verse.ayahNumber}</span>
          </div>
        </div>
        
        <div className="flex gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-sm">
           <CopyButton text={copyText} label="نسخ الآية" />
           <button 
             onClick={() => onToggleBookmark(verse)}
             className={`btn-ghost btn-icon transition-all duration-300 ${isBookmarked ? 'text-[var(--color-gold)] bg-white shadow-sm' : 'hover:bg-white text-gray-500'}`}
             style={{ width: 32, height: 32 }}
             title={isBookmarked ? "إزالة من المحفوظات" : "حفظ الآية"}
           >
             <BookmarkIcon size={16} fill={isBookmarked ? "currentColor" : "none"} />
           </button>
           <button 
             onClick={handleShare}
             className="btn-ghost btn-icon transition-all duration-300 hover:bg-white text-[var(--color-gold)]"
             style={{ width: 32, height: 32 }}
             title="مشاركة"
           >
             <Share2 size={16} />
           </button>
           <button 
             onClick={toggleAudio}
             disabled={!isOnline}
             className={`btn-ghost btn-icon transition-all duration-300 ${isPlaying ? 'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-md' : 'hover:bg-white text-[var(--color-gold)]'}`}
             style={{ width: 32, height: 32 }}
             title="استماع"
           >
             {!isOnline ? <WifiOff size={16} /> : (isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" className="ml-0.5" />)}
           </button>
        </div>
      </div>

      {/* The Quran Text */}
      <div className="text-center mb-8 sm:mb-10 relative px-2 sm:px-4 py-4 sm:py-6">
        <Quote className="absolute top-0 right-2 sm:right-4 text-gray-100 w-12 h-12 sm:w-16 sm:h-16 -z-10 transform -scale-x-100 opacity-50" />
        <p className="quran-text font-bold text-[var(--color-primary-dark)] leading-[2.2] md:leading-[2.5] text-2xl sm:text-3xl md:text-4xl drop-shadow-sm" dir="rtl">
          {verse.arabicText}
          <span className="inline-flex items-center justify-center mx-2 sm:mx-3 text-[var(--color-gold-dark)] font-outfit text-sm sm:text-base md:text-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 rounded-full w-8 h-8 sm:w-10 sm:h-10 align-middle">
            {verse.ayahNumber}
          </span>
        </p>
      </div>

      {/* Tafsir and Tadabbur Tabs */}
      <div className="mt-2 sm:mt-6">
        <div className="flex p-1.5 bg-gray-50/80 border border-gray-100 rounded-2xl mb-4 sm:mb-6 w-full sm:w-fit mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('tafsir')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'tafsir' ? 'bg-white text-[var(--color-primary-dark)] shadow-sm border border-gray-100 scale-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 scale-95'}`}
          >
            <BookHeart size={18} className={`transition-colors ${activeTab === 'tafsir' ? 'text-[var(--color-gold)]' : 'text-gray-400'}`} />
            التفسير الميسر
          </button>
          <button
            onClick={() => setActiveTab('tadabbur')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'tadabbur' ? 'bg-white text-[var(--color-primary-dark)] shadow-sm border border-gray-100 scale-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 scale-95'}`}
          >
            <Sparkles size={18} className={`transition-colors ${activeTab === 'tadabbur' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
            إضاءة وتدبر
          </button>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'tafsir' ? (
              <motion.div
                key="tafsir"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-sm"
              >
                <p className="explanation-text text-gray-700 text-base sm:text-lg text-justify">
                  {verse.tafsir}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="tadabbur"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-[var(--color-primary-light)]/5 to-transparent rounded-2xl p-5 sm:p-8 border border-[var(--color-primary)]/10 shadow-sm"
              >
                <p className="explanation-text text-gray-800 text-base sm:text-lg text-justify font-medium">
                  {verse.tadabbur}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const ResultCard: React.FC<{ 
  data: QuranResponse, 
  isOnline?: boolean,
  bookmarks?: Bookmark[],
  onToggleBookmark?: (verse: Verse) => void,
  reciter?: string,
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ data, isOnline = true, bookmarks = [], onToggleBookmark = () => {}, reciter, onShowToast }) => {
  return (
    <div className="w-full h-full mx-auto px-0 sm:px-2 flex flex-col flex-1">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/95 backdrop-blur-xl sm:rounded-3xl md:rounded-[2.5rem] shadow-2xl sm:border border-white/60 overflow-hidden flex flex-col flex-1 min-h-[calc(100vh-160px)]"
      >
        
        {/* 1. Header & Intro */}
        <div className="p-6 sm:p-8 md:p-12 border-b border-gray-100 bg-gradient-to-b from-[var(--color-primary-light)]/20 to-transparent relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10 bg-white/60 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white shadow-sm">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
               <div className="p-2 bg-[var(--color-gold)]/10 rounded-xl text-[var(--color-gold-dark)]">
                 <Info size={20} />
               </div>
               <span className="text-sm font-bold text-gray-800">رسالة مخصصة لك</span>
            </div>
            <p className="explanation-text text-gray-800 text-base sm:text-lg md:text-xl text-justify font-medium">
               {data.introMessage}
            </p>
          </div>
        </div>

        {/* 2. Verses List */}
        {data.verses && data.verses.length > 0 && (
          <div className="p-6 sm:p-8 md:p-12 bg-white">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent"></div>
              <span className="text-sm font-black text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-primary-light)]/20 px-4 py-1.5 rounded-full">الآيات والتأملات</span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>
            
            <div className="flex flex-col gap-12">
              {data.verses.map((verse, idx) => {
                const isBookmarked = bookmarks.some(b => b.verse.surahNumber === verse.surahNumber && b.verse.ayahNumber === verse.ayahNumber);
                return (
                  <React.Fragment key={`${verse.surahNumber}-${verse.ayahNumber}-${idx}`}>
                    <VerseSection 
                      verse={verse} 
                      index={idx}
                      isOnline={isOnline}
                      isBookmarked={isBookmarked}
                      onToggleBookmark={onToggleBookmark}
                      reciter={reciter}
                      onShowToast={onShowToast}
                    />
                    {idx < data.verses!.length - 1 && (
                      <div className="w-2/3 mx-auto h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mt-4"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Tafakkur */}
        {data.tafakkur && (
          <div className="p-6 sm:p-8 md:p-12 bg-gray-50/80 border-t border-gray-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1.5 h-full bg-[var(--color-gold)]"></div>
            <div className="flex justify-between items-center mb-5 sm:mb-6 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 text-gray-800 font-bold text-base sm:text-lg">
                <div className="p-2 sm:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Lightbulb size={20} className="text-[var(--color-gold-dark)] sm:w-[22px] sm:h-[22px]" />
                </div>
                <span>التفكر والعمل</span>
              </div>
              <div className="flex gap-2 bg-white p-1 sm:p-1.5 rounded-xl border border-gray-100 shadow-sm">
                <CopyButton text={data.tafakkur} label="نسخ التفكر" />
              </div>
            </div>
            <p className="explanation-text text-gray-700 text-base sm:text-lg text-justify font-medium relative z-10">
              {data.tafakkur}
            </p>
          </div>
        )}

        {/* 4. Summary Section */}
        {data.summary && (
          <div className="p-6 sm:p-8 md:p-12 bg-gradient-to-br from-[var(--color-primary-dark)] to-[#022c22] text-white relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
               <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[var(--color-gold)] rounded-full blur-[80px] translate-x-1/3 translate-y-1/3"></div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 relative z-10">
              <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Sparkles size={20} className="text-[var(--color-gold-light)] sm:w-[22px] sm:h-[22px]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-gold-light)]">الخلاصة</h3>
            </div>
            
            <p className="explanation-text text-white/90 text-base sm:text-lg md:text-xl relative z-10 font-medium text-justify italic">
              "{data.summary}"
            </p>
          </div>
        )}

      </motion.div>
    </div>
  );
};
