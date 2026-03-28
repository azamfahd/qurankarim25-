import React from 'react';
import { X, Bookmark as BookmarkIcon, Trash2, Calendar, Play, Pause, Copy, Share2, WifiOff } from 'lucide-react';
import { Bookmark } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  isOnline: boolean;
  reciter?: string;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({ 
  isOpen, 
  onClose, 
  bookmarks, 
  onRemoveBookmark,
  isOnline,
  reciter = 'ar.alafasy',
  onShowToast
}) => {
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = async (bookmark: Bookmark) => {
    if (!isOnline) {
      onShowToast("عذراً، التشغيل الصوتي يتطلب اتصالاً بالإنترنت.", 'info');
      return;
    }

    if (playingId === bookmark.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
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
        
        audio.onended = () => setPlayingId(null);
        audio.onerror = async () => {
          console.error("Audio error for URL:", url);
          if (!isRetry) {
            const fallbackUrl = await getAudioUrl(reciter, bookmark.verse.surahNumber, bookmark.verse.ayahNumber, true);
            if (fallbackUrl && fallbackUrl !== url) {
              console.log("Retrying with fallback URL:", fallbackUrl);
              playWithUrl(fallbackUrl, true);
              return;
            }
          }
          setPlayingId(null);
          onShowToast("عذراً، فشل تحميل التلاوة. قد يكون الرابط غير متاح حالياً.", 'error');
        };

        try {
          await audio.play();
          setPlayingId(bookmark.id);
        } catch (e) {
          console.error("Audio play failed:", e);
          setPlayingId(null);
        }
      };

      const initialUrl = await getAudioUrl(reciter, bookmark.verse.surahNumber, bookmark.verse.ayahNumber);
      if (!initialUrl) {
        onShowToast("عذراً، لم نتمكن من العثور على رابط التلاوة لهذا القارئ.", 'error');
        return;
      }
      
      await playWithUrl(initialUrl);
    }
  };

  const handleCopy = (bookmark: Bookmark) => {
    const text = `${bookmark.verse.arabicText} ﴿${bookmark.verse.ayahNumber}﴾\n[سورة ${bookmark.verse.surahName}]\n\n- عبر تطبيق أنيس القلوب`;
    navigator.clipboard.writeText(text);
    onShowToast('تم نسخ الآية', 'success');
  };

  const handleShare = async (bookmark: Bookmark) => {
    const text = `${bookmark.verse.arabicText} ﴿${bookmark.verse.ayahNumber}﴾\n[سورة ${bookmark.verse.surahName}]\n\n- عبر تطبيق أنيس القلوب`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'أنيس القلوب - رفيقك القرآني',
          text: text,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError' && !error.message?.includes('canceled')) {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(text);
      onShowToast('تم نسخ النص للمشاركة', 'success');
    }
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
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-b from-[var(--color-primary-light)] to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md">
                  <BookmarkIcon size={20} />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">الآيات المحفوظة</h2>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
              {bookmarks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-16"
                >
                  <div className="w-24 h-24 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-6 opacity-50">
                    <BookmarkIcon size={48} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد آيات محفوظة</h3>
                  <p className="text-gray-500 max-w-sm">يمكنك حفظ الآيات التي تلامس قلبك للعودة إليها لاحقاً من خلال النقر على أيقونة الحفظ بجوار كل آية.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-6">
                  <AnimatePresence>
                    {bookmarks.map((bookmark, index) => (
                      <motion.div 
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-[var(--color-border)]">
                            <span>سورة {bookmark.verse.surahName}</span>
                            <span className="text-[var(--color-accent)] opacity-50">|</span>
                            <span>الآية {bookmark.verse.ayahNumber}</span>
                          </div>
                          <button 
                            onClick={() => onRemoveBookmark(bookmark.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="إزالة من المحفوظات"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <p className="font-bold text-2xl text-center leading-loose text-gray-800 mb-8 px-4" dir="rtl" style={{ fontFamily: 'var(--font-serif)' }}>
                          {bookmark.verse.arabicText}
                        </p>
                        
                        <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Calendar size={12} />
                            {new Date(bookmark.dateAdded).toLocaleDateString('ar-SA')}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleCopy(bookmark)}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                              title="نسخ الآية"
                            >
                              <Copy size={16} />
                            </button>
                            <button 
                              onClick={() => handleShare(bookmark)}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                              title="مشاركة"
                            >
                              <Share2 size={16} />
                            </button>
                            <button 
                              onClick={() => toggleAudio(bookmark)}
                              disabled={!isOnline}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${playingId === bookmark.id ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'}`}
                              title="استماع"
                            >
                              {isOnline ? (playingId === bookmark.id ? <Pause size={16} /> : <Play size={16} fill="currentColor" />) : <WifiOff size={16} />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
