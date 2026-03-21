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
      className="bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-white/20 relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="p-8 md:p-10 relative z-10">
        {/* Verse Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-sm border border-[var(--color-gold)]/20 px-5 py-2.5 rounded-2xl text-[var(--color-primary-dark)] font-black flex items-center gap-3 shadow-sm text-sm">
               <span className="font-outfit tracking-wide">سورة {verse.surahName}</span>
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_8px_rgba(212,175,55,0.5)]"></span>
               <span className="font-outfit tracking-wide">الآية {verse.ayahNumber}</span>
            </div>
          </div>
          
          <div className="flex gap-2 bg-white/40 backdrop-blur-xl p-2 rounded-2xl border border-white/40 shadow-sm">
             <CopyButton text={copyText} label="نسخ الآية" />
             <button 
               onClick={() => onToggleBookmark(verse)}
               className={`btn-ghost btn-icon transition-all duration-300 ${isBookmarked ? 'text-[var(--color-gold)] bg-white shadow-md scale-110' : 'hover:bg-white/60 text-gray-400'}`}
               style={{ width: 36, height: 36 }}
               title={isBookmarked ? "إزالة من المحفوظات" : "حفظ الآية"}
             >
               <BookmarkIcon size={18} fill={isBookmarked ? "currentColor" : "none"} />
             </button>
             <button 
               onClick={handleShare}
               className="btn-ghost btn-icon transition-all duration-300 hover:bg-white/60 text-[var(--color-gold)]"
               style={{ width: 36, height: 36 }}
               title="مشاركة"
             >
               <Share2 size={18} />
             </button>
             <button 
               onClick={toggleAudio}
               disabled={!isOnline}
               className={`btn-ghost btn-icon transition-all duration-300 ${isPlaying ? 'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-lg scale-110' : 'hover:bg-white/60 text-[var(--color-gold)]'}`}
               style={{ width: 36, height: 36 }}
               title="استماع"
             >
               {!isOnline ? <WifiOff size={18} /> : (isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" className="ml-0.5" />)}
             </button>
          </div>
        </div>

        {/* The Quran Text */}
        <div className="text-center mb-10 relative">
          <p className="quran-text font-bold text-gray-900 leading-[2.5] px-2 md:px-8 text-3xl md:text-4xl drop-shadow-sm" dir="rtl">
            {verse.arabicText}
            <span className="inline-flex items-center justify-center mx-4 text-[var(--color-gold-dark)] font-outfit text-base md:text-lg border-2 border-[var(--color-gold)]/30 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 align-middle shadow-lg transform hover:rotate-[360deg] transition-transform duration-1000">
              {verse.ayahNumber}
            </span>
          </p>
        </div>

        {/* Tafsir and Tadabbur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-[2rem] p-6 text-gray-800 relative border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2.5 bg-white rounded-xl shadow-sm text-[var(--color-gold)] border border-gray-50">
                 <BookHeart size={20} />
               </div>
               <span className="text-sm font-black text-[var(--color-primary-dark)] tracking-widest font-outfit uppercase">التفسير</span>
            </div>
            <div className="font-sans text-base md:text-lg leading-relaxed text-gray-900 whitespace-pre-wrap text-justify font-medium">
               {verse.tafsir}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--color-gold)]/10 to-white rounded-[2rem] p-6 text-gray-800 relative border border-[var(--color-gold)]/10 shadow-sm hover:shadow-md transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2.5 bg-white rounded-xl shadow-sm text-[var(--color-gold)] border border-gray-50">
                 <Sparkles size={20} />
               </div>
               <span className="text-sm font-black text-[var(--color-primary-dark)] tracking-widest font-outfit uppercase">التدبر</span>
            </div>
            <div className="font-sans text-base md:text-lg leading-relaxed text-gray-900 whitespace-pre-wrap text-justify font-medium">
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
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent rounded-full opacity-40"></div>
          </div>
        )}

        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-br from-[var(--color-gold)]/20 to-white/5 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          
          <div className="relative bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] rounded-2xl text-white shadow-lg">
                 <Info size={20} />
               </div>
               <span className="text-sm font-black text-[var(--color-primary-dark)] tracking-widest font-outfit uppercase">المقدمة</span>
            </div>
            <p className="text-gray-900 leading-relaxed font-sans text-lg md:text-xl relative z-10 text-justify font-medium">
               {data.introMessage}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Verses List */}
      {data.verses && data.verses.length > 0 && (
        <div className="flex flex-col gap-10 mb-16">
          <div className="flex items-center gap-6 px-4">
            <div className="h-px flex-1 bg-gradient-to-l from-[var(--color-gold)] to-transparent opacity-40"></div>
            <span className="text-sm font-black text-[var(--color-gold-dark)] uppercase tracking-[0.3em] font-outfit">الآيات والتأملات</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-gold)] to-transparent opacity-40"></div>
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
            className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/40 p-8 md:p-10 relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)]"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3 text-[var(--color-primary-dark)] font-black font-sans text-xl">
                <div className="p-3 bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-gold-dark)]/20 rounded-2xl border border-[var(--color-gold)]/20">
                  <Lightbulb size={24} className="text-[var(--color-gold-dark)]" />
                </div>
                <span>التفكر والعمل</span>
              </div>
              <div className="flex gap-2 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/40">
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
                  className="btn-ghost btn-icon transition-all duration-300 hover:bg-white/60 text-[var(--color-gold-dark)]"
                  style={{ width: 36, height: 36 }}
                  title="مشاركة"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-900 leading-relaxed text-lg md:text-xl font-sans relative z-10 text-justify font-medium">
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
            className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[#022c22] text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group border border-white/10"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
               <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-gold)] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
                <BookHeart size={24} className="text-[var(--color-gold-light)]" />
              </div>
              <h3 className="text-xl font-black font-sans tracking-widest text-[var(--color-gold-light)] uppercase">الخلاصة</h3>
            </div>
            
            <p className="text-white/95 leading-relaxed text-lg md:text-xl font-sans relative z-10 italic font-medium text-justify">
              "{data.summary}"
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
};

