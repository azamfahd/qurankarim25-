export type GeminiModel = 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-flash-lite-preview';

export type BackendType = 'firebase' | 'supabase' | 'local' | 'firestore';

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  geminiModel?: GeminiModel;
  model?: GeminiModel;
  backendType?: BackendType;
  preferredBackend?: BackendType;
  showTafsir?: boolean;
  showTranslation?: boolean;
  username?: string;
  email?: string;
  creativityLevel?: number;
  reciter?: string;
  lastUpdated?: number;
  apiKey?: string;
  bookmarks?: Bookmark[];
  isLoggedIn?: boolean;
}

export interface Verse {
  text: string;
  arabicText?: string;
  surah: string;
  surahName?: string;
  number: number;
  surahNumber?: number;
  ayahNumber?: number;
  tafsir?: string;
  translation?: string;
}

export interface QuranResponse {
  title?: string;
  introMessage?: string;
  verses: Verse[];
  explanation?: string;
  practicalAdvice?: string;
  tafakkur?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  role?: 'user' | 'ai';
  type?: 'text' | 'quran' | 'user' | 'ai' | string;
  content?: string;
  timestamp?: number;
  quranResponse?: QuranResponse;
  data?: any;
}

export interface ChatSession {
  id: string;
  title?: string;
  date?: number | string;
  preview?: string;
  messages: ChatMessage[];
  updatedAt?: number;
  createdAt?: number;
}

export interface Bookmark {
  id: string;
  verse: Verse;
  note?: string;
  createdAt?: number;
  dateAdded?: number;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AppData {
  currentSessionId: string | null;
  sessions: ChatSession[];
  bookmarks: Bookmark[];
  settings: UserSettings;
}
