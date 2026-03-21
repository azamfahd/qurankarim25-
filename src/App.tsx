
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import { EmotionForm } from './components/EmotionForm';
import { ResultCard } from './components/ResultCard';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { TasbihModal } from './components/TasbihModal';
import { BookmarksModal } from './components/BookmarksModal';
import { AdhkarModal } from './components/AdhkarModal';
import { NamesOfAllahModal } from './components/NamesOfAllahModal';
import { Sidebar } from './components/Sidebar';
import { DailyVerse } from './components/DailyVerse';
import { PrayerTimesWidget } from './components/PrayerTimesWidget';
import { QiblaModal } from './components/QiblaModal';
import { ZakatCalculatorModal } from './components/ZakatCalculatorModal';
import { InstallPrompt } from './components/InstallPrompt';
import { QuranChatSession } from './services/geminiService';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import { SyncService } from './services/syncService';
import { ChatMessage, AppState, UserSettings, ChatSession, Bookmark, Verse } from './types';
import { AlertCircle, Plus, Menu, ArrowRight, WifiOff, BookOpen, Key, X, Compass, Calculator, Bookmark as BookmarkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  "نغوص في أعماق آيات الذكر الحكيم...",
  "نستحضر السكينة من فيض الوحي لقلبك...",
  "نتدبر في لطائف الآيات ومقاصدها...",
  "نلتمس لك من نور القرآن هداية وشفاء...",
  "جاري صياغة رسالة النور لروحك..."
];

const DEFAULT_SETTINGS: UserSettings = {
  username: '',
  email: '',
  isLoggedIn: false,
  model: 'gemini-3-flash-preview', 
  creativityLevel: 0.5,
  apiKey: '',
  preferredBackend: 'supabase'
};

// Generate a unique user ID for anonymous users
const generateUserId = (): string => {
  let userId = localStorage.getItem('anis_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anis_user_id', userId);
  }
  return userId;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
  const userIdRef = useRef<string>(generateUserId());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // تحميل الرسائل النشطة من الذاكرة (الحفظ التلقائي)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('anis_active_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return localStorage.getItem('anis_active_session_id');
  });

  const [state, setState] = useState<AppState>(() => {
    return (messages && messages.length > 0) ? AppState.SUCCESS : AppState.IDLE;
  });

  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineBannerDismissed, setIsOfflineBannerDismissed] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAdhkarOpen, setIsAdhkarOpen] = useState(false);
  const [isNamesOfAllahOpen, setIsNamesOfAllahOpen] = useState(false);
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);
  const [isZakatOpen, setIsZakatOpen] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('anis_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc to close all modals
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsHistoryOpen(false);
        setIsTasbihOpen(false);
        setIsBookmarksOpen(false);
        setIsAdhkarOpen(false);
        setIsNamesOfAllahOpen(false);
        setIsQiblaOpen(false);
        setIsZakatOpen(false);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('anis_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });
  
  const chatSessionRef = useRef<QuranChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Firebase Auth and Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        userIdRef.current = user.uid;
        
        // Initial load of settings and sessions
        const initLoad = async () => {
          const loadedSettings = await SyncService.loadSettings(user.uid, settings);
          if (loadedSettings) {
            setSettings(prev => ({ ...prev, ...loadedSettings, isLoggedIn: true }));
          } else {
            // Initialize user doc if it doesn't exist
            const initialSettings: UserSettings = {
              ...settings,
              uid: user.uid,
              username: user.displayName || settings.username || 'مستخدم',
              email: user.email || '',
              photoURL: user.photoURL || '',
              isLoggedIn: true,
              lastUpdated: new Date().toISOString()
            };
            await SyncService.saveSettings(user.uid, initialSettings);
          }

          const loadedSessions = await SyncService.loadSessions(user.uid, settings);
          if (loadedSessions.length > 0) {
            setSessions(loadedSessions);
          }
          setIsLoadingData(false);
        };

        initLoad();

        // Real-time sync for Firestore ONLY if it's the preferred backend
        let unsubSettings = () => {};
        let unsubSessions = () => {};

        if (!settings.preferredBackend || settings.preferredBackend === 'firestore') {
          const settingsRef = doc(db, 'users', user.uid);
          unsubSettings = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserSettings;
              setSettings(prev => ({ ...prev, ...data, isLoggedIn: true }));
            }
          }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

          const sessionsRef = collection(db, 'users', user.uid, 'sessions');
          const q = query(sessionsRef, orderBy('date', 'desc'));
          unsubSessions = onSnapshot(q, (querySnap) => {
            const loadedSessions: ChatSession[] = [];
            querySnap.forEach((doc) => {
              loadedSessions.push(doc.data() as ChatSession);
            });
            if (loadedSessions.length > 0) {
              setSessions(loadedSessions);
            }
          }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/sessions`));
        }

        return () => {
          unsubSettings();
          unsubSessions();
        };
      } else {
        userIdRef.current = generateUserId();
        setSettings(prev => ({ ...prev, isLoggedIn: false, uid: undefined }));
        setIsLoadingData(false);
      }
    });

    return () => unsubscribe();
  }, [settings.preferredBackend]);

  useEffect(() => {
    if (isLoadingData && !firebaseUser) {
      // Small delay to let auth settle
      const timer = setTimeout(() => setIsLoadingData(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [firebaseUser, isLoadingData]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsOfflineBannerDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineBannerDismissed(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (state === AppState.LOADING) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingText(LOADING_MESSAGES[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Save history to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('anis_history', JSON.stringify(sessions));
    
    // Also save to Firestore if logged in
    if (firebaseUser && isOnline) {
      // We handle individual session saves in saveCurrentSessionToHistory
    }
  }, [sessions, firebaseUser, isOnline]);

  // Save settings to localStorage and Backend
  useEffect(() => {
    chatSessionRef.current = null;
    localStorage.setItem('anis_settings', JSON.stringify(settings));
    
    // Also save to Backend if logged in
    if (firebaseUser && isOnline) {
      SyncService.saveSettings(firebaseUser.uid, settings).catch(err => {
        console.error('Error saving settings to Backend:', err);
      });
    }
  }, [settings, firebaseUser, isOnline]);

  useEffect(() => {
    localStorage.setItem('anis_active_chat', JSON.stringify(messages));
    if (currentSessionId) {
      localStorage.setItem('anis_active_session_id', currentSessionId);
    } else {
      localStorage.removeItem('anis_active_session_id');
    }
    
    if (messages.length > 0) {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, state, currentSessionId]);

  const saveCurrentSessionToHistory = (msgs: ChatMessage[]) => {
    if (msgs.length === 0) return;
    const firstUserMsg = msgs.find(m => m.type === 'user');
    if (!firstUserMsg) return;
    
    let sessionToSave: ChatSession;
    if (currentSessionId) {
      const existingSession = sessions.find(s => s.id === currentSessionId);
      if (existingSession) {
        sessionToSave = { ...existingSession, messages: msgs };
        setSessions(prev => prev.map(s => s.id === currentSessionId ? sessionToSave : s));
      } else {
        // Fallback if session not found in state
        const newId = currentSessionId;
        sessionToSave = {
          id: newId,
          date: Date.now(),
          preview: firstUserMsg.content.substring(0, 100) || "محادثة صوتية",
          messages: msgs
        };
        setSessions(prev => [sessionToSave, ...prev]);
      }
    } else {
      const newId = generateId();
      setCurrentSessionId(newId);
      
      sessionToSave = {
        id: newId,
        date: Date.now(),
        preview: firstUserMsg.content.substring(0, 100) || "محادثة صوتية",
        messages: msgs
      };
      
      setSessions(prev => [sessionToSave, ...prev]);
    }

    // Save to Backend if logged in
    if (firebaseUser && isOnline && sessionToSave!) {
      SyncService.saveSession(firebaseUser.uid, sessionToSave, settings).catch(err => {
        console.error('Error saving session to Backend:', err);
      });
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setState(AppState.IDLE);
    setCurrentSessionId(null);
    chatSessionRef.current = null;
    localStorage.removeItem('anis_active_chat');
    localStorage.removeItem('anis_active_session_id');
  };

  const handleImportHistory = (newHistory: ChatSession[]) => {
    setSessions(newHistory);
  };

  const handleToggleBookmark = (verse: Verse) => {
    setSettings((prev) => {
      const currentBookmarks = prev.bookmarks || [];
      const isBookmarked = currentBookmarks.some(b => b.verse.surahNumber === verse.surahNumber && b.verse.ayahNumber === verse.ayahNumber);
      
      let newBookmarks;
      if (isBookmarked) {
        newBookmarks = currentBookmarks.filter(b => !(b.verse.surahNumber === verse.surahNumber && b.verse.ayahNumber === verse.ayahNumber));
      } else {
        const newBookmark: Bookmark = {
          id: `${verse.surahNumber}-${verse.ayahNumber}-${generateId()}`,
          verse,
          dateAdded: Date.now()
        };
        newBookmarks = [newBookmark, ...currentBookmarks];
      }
      
      return { ...prev, bookmarks: newBookmarks };
    });
  };

  const handleEmotionSubmit = async (text: string) => {
    if (!isOnline) {
      setError("لا يمكن إرسال الرسائل في وضع عدم الاتصال.");
      return;
    }
    setState(AppState.LOADING);
    setLoadingText(LOADING_MESSAGES[0]);
    setError(null);

    // Re-instantiate session if needed (e.g., settings changed or first run)
    if (!chatSessionRef.current) {
      try {
        chatSessionRef.current = new QuranChatSession(settings);
      } catch (e: any) {
        setError(e.message || "حدث خطأ في الإعدادات.");
        setState(AppState.ERROR);
        return;
      }
    }

    const userMsg: ChatMessage = { id: generateId(), type: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const displayName = settings.username || (settings.email ? settings.email.split('@')[0] : undefined);
      const data = await chatSessionRef.current.sendMessage(text, displayName);
      const aiMsg: ChatMessage = { id: generateId(), type: 'ai', data: data };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      setState(AppState.SUCCESS);
      saveCurrentSessionToHistory(finalMessages);
    } catch (err: any) {
      console.error("FULL ERROR DETAILS:", err);
      let errorMessage = "حدث خطأ أثناء الاتصال. حاول مرة أخرى.";
      if (err.message && err.message.includes("quota")) {
        errorMessage = "تم استهلاك الحد المجاني للنموذج حالياً. يرجى المحاولة لاحقاً، أو يمكنك إضافة مفتاح API الخاص بك في الإعدادات (اختياري).";
      }
      setError(errorMessage);
      setState(AppState.ERROR);
    }
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setState(AppState.SUCCESS);
    setIsHistoryOpen(false);
  };

  const isChatStarted = messages.length > 0;

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "طاب صباحك بكل خير";
    if (hour < 17) return "طاب مساؤك بالمسرات";
    return "ليلة هادئة ومطمئنة";
  };

  if (isLoadingData) {
    return (
      <div className="app-wrapper royal-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/20 shadow-2xl">
          <div className="spin w-12 h-12 border-4 border-[var(--color-gold)] border-t-transparent rounded-full shadow-[0_0_20px_rgba(197,160,89,0.3)]"></div>
          <p className="text-[var(--color-gold-light)] font-black text-xl tracking-widest animate-pulse">جاري تحميل الأنوار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper royal-gradient selection:bg-[var(--color-gold)] selection:text-white">
      <InstallPrompt />
      
      <AnimatePresence>
        {!isOnline && !isOfflineBannerDismissed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="offline-banner relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3 py-2 px-8">
              <WifiOff size={16} className="animate-pulse" />
              <span className="text-sm">أنت في وضع عدم الاتصال. قد تكون بعض الميزات محدودة.</span>
              <button 
                onClick={() => setIsOfflineBannerDismissed(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        
        {isChatStarted ? (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel border-b border-white/10 shadow-lg" 
            style={{ 
              position: 'sticky', top: 0, zIndex: 30,
              padding: '0.75rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'top 0.3s'
            }}
          >
             <div className="flex items-center gap-3">
               <button onClick={startNewChat} className="btn-ghost btn-icon text-white hover:bg-white/10" style={{ width: 36, height: 36 }} title="الرئيسية">
                 <ArrowRight size={20} />
               </button>
               <div className="flex items-center gap-2">
                 <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center text-white shadow-lg">
                    <BookOpen size={18} />
                 </div>
                 <h1 className="royal-text-gradient font-black text-lg">أنيس القلوب</h1>
               </div>
             </div>
             
             <button onClick={() => setIsSidebarOpen(true)} className="btn-ghost btn-icon text-white hover:bg-white/10" style={{ width: 36, height: 36 }}>
               <Menu size={20} />
             </button>
          </motion.div>
        ) : (
           <Header 
             onOpenSidebar={() => setIsSidebarOpen(true)} 
             onOpenSettings={() => setIsSettingsOpen(true)}
             username={settings.username}
           />
        )}
        
        <main className="container" style={{ 
            flexGrow: 1, 
            paddingBottom: isChatStarted ? '140px' : '2rem', 
            paddingTop: '1rem' 
        }}>
          
          <div className="flex flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.type}`}>
                {msg.type === 'user' ? (
                  <div className="flex justify-end w-full animate-fade-in">
                    <div className="chat-bubble">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  msg.data && (
                    <div className="w-full">
                       <ResultCard 
                         data={msg.data} 
                         isOnline={isOnline} 
                         bookmarks={settings.bookmarks || []}
                         onToggleBookmark={handleToggleBookmark}
                         reciter={settings.reciter}
                       />
                    </div>
                  )
                )}
              </div>
            ))}
            
            {state === AppState.LOADING && (
              <div className="flex justify-center py-8">
                <div className="bg-white px-6 py-3 rounded-full shadow-sm flex items-center gap-3 border border-gray-100">
                  <div className="spin w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium text-[var(--color-primary-dark)]">{loadingText}</span>
                </div>
              </div>
            )}
            
            {state === AppState.ERROR && (
              <div className="flex justify-center">
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 border border-red-100">
                  <AlertCircle size={18} />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {state === AppState.SUCCESS && (
               <div className="flex justify-center mt-4 mb-4">
                 <button onClick={startNewChat} className="btn-primary rounded-full px-6">
                   <Plus size={18} />
                   <span>موضوع جديد</span>
                 </button>
               </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {!isChatStarted && state !== AppState.LOADING && (
             <div className="mt-4 w-full animate-slide-up">
               <div className="mb-8 text-center relative">
                 {/* 3D Decorative Element */}
                 <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 opacity-30 pointer-events-none z-0 animate-float-3d perspective-1000">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] blur-2xl" style={{ transform: 'rotateX(12deg) rotateY(12deg)' }}></div>
                 </div>
                 
                 <div className="relative z-10">
                   <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight font-outfit drop-shadow-lg">
                     {getTimeBasedGreeting()} {settings.username ? `، ${settings.username}` : ''}
                   </h2>
                    <p className="text-white text-xl font-bold drop-shadow-md">كيف يمكنني أن أؤنس قلبك اليوم بآيات الله؟</p>
                 </div>
               </div>

               <PrayerTimesWidget />
               <DailyVerse />

               <div className="my-12">
                 <EmotionForm onSubmit={handleEmotionSubmit} isLoading={false} isOnline={isOnline} variant="centered" />
                 
                 <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto px-4">
                   {[
                     "أشعر بضيق في صدري",
                     "أريد آيات عن الصبر",
                     "كيف أتوكل على الله؟",
                     "أشعر بالقلق من المستقبل",
                     "آيات تجلب السكينة"
                   ].map((prompt, idx) => (
                     <button
                       key={idx}
                       onClick={() => handleEmotionSubmit(prompt)}
                       className="text-xs font-black px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-white/20"
                     >
                       {prompt}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="mt-16 mb-10">
                 <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="h-px flex-1 bg-gradient-to-l from-[var(--color-border)] to-transparent"></div>
                    <h3 className="text-sm font-black text-[var(--color-gold)] uppercase tracking-[0.3em] font-outfit drop-shadow-sm">الوصول السريع</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-border)] to-transparent"></div>
                 </div>
                 
                 <div className="quick-actions-grid">
                   <div className="action-card group" onClick={() => setIsAdhkarOpen(true)}>
                     <div className="action-card-icon group-hover:rotate-12 transition-transform">
                       <BookOpen size={24} />
                     </div>
                     <span className="action-card-title">الأذكار</span>
                   </div>
                   <div className="action-card group" onClick={() => setIsTasbihOpen(true)}>
                     <div className="action-card-icon group-hover:scale-110 transition-transform">
                       <Plus size={24} />
                     </div>
                     <span className="action-card-title">المسبحة</span>
                   </div>
                   <div className="action-card group" onClick={() => setIsNamesOfAllahOpen(true)}>
                     <div className="action-card-icon group-hover:-rotate-12 transition-transform">
                       <Key size={24} />
                     </div>
                     <span className="action-card-title">أسماء الله</span>
                   </div>
                   <div className="action-card group" onClick={() => setIsQiblaOpen(true)}>
                     <div className="action-card-icon group-hover:rotate-45 transition-transform">
                       <Compass size={24} />
                     </div>
                     <span className="action-card-title">القبلة</span>
                   </div>
                   <div className="action-card group" onClick={() => setIsZakatOpen(true)}>
                     <div className="action-card-icon group-hover:-translate-y-1 transition-transform">
                       <Calculator size={24} />
                     </div>
                     <span className="action-card-title">الزكاة</span>
                   </div>
                   <div className="action-card group" onClick={() => setIsBookmarksOpen(true)}>
                     <div className="action-card-icon group-hover:translate-y-[-4px] transition-transform">
                       <BookmarkIcon size={24} />
                     </div>
                     <span className="action-card-title">المحفوظات</span>
                   </div>
                 </div>
               </div>
             </div>
          )}
        </main>

        {isChatStarted && (
          <div className="fixed bottom-0 left-0 right-0 z-40">
             <div style={{ height: '40px', background: 'linear-gradient(to bottom, transparent, var(--color-bg))', pointerEvents: 'none' }}></div>
             <div style={{ background: 'var(--color-bg)', padding: '0 1rem', paddingBottom: 'calc(1rem + var(--safe-area-bottom))' }}>
               <EmotionForm onSubmit={handleEmotionSubmit} isLoading={state === AppState.LOADING} isOnline={isOnline} variant="bottom" />
             </div>
          </div>
        )}
      </div>





      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={startNewChat}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenAdhkar={() => setIsAdhkarOpen(true)}
        onOpenNamesOfAllah={() => setIsNamesOfAllahOpen(true)}
        onOpenQibla={() => setIsQiblaOpen(true)}
        onOpenZakat={() => setIsZakatOpen(true)}
        userInfo={settings}
      />

      <TasbihModal 
        isOpen={isTasbihOpen} 
        onClose={() => setIsTasbihOpen(false)} 
      />

      <QiblaModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
      />

      <ZakatCalculatorModal
        isOpen={isZakatOpen}
        onClose={() => setIsZakatOpen(false)}
      />

      <AdhkarModal 
        isOpen={isAdhkarOpen} 
        onClose={() => setIsAdhkarOpen(false)} 
      />

      <NamesOfAllahModal
        isOpen={isNamesOfAllahOpen}
        onClose={() => setIsNamesOfAllahOpen(false)}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={settings.bookmarks || []}
        onRemoveBookmark={(id) => {
          setSettings(prev => ({
            ...prev,
            bookmarks: (prev.bookmarks || []).filter(b => b.id !== id)
          }));
        }}
        isOnline={isOnline}
        reciter={settings.reciter}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={loadSession}
        onDeleteSession={(id, e) => {
          e.stopPropagation();
          setSessions(prev => prev.filter(s => s.id !== id));
          
          // Also delete from Backend if logged in
          if (firebaseUser && isOnline) {
            SyncService.deleteSession(firebaseUser.uid, id, settings).catch(err => {
              console.error('Error deleting session from Backend:', err);
            });
          }
        }}
        onClearAll={() => {
          const sessionsToClear = [...sessions];
          setSessions([]);
          localStorage.removeItem('anis_history');
          
          // Also clear from Backend if logged in
          if (firebaseUser && isOnline) {
            SyncService.clearAllSessions(firebaseUser.uid, sessionsToClear, settings).catch(err => {
              console.error('Error clearing sessions from Backend:', err);
            });
          }
        }}
      />
    </div>
  );
};

export default App;
