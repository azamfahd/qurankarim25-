import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatSession, UserSettings, Bookmark } from '../types';

// Use directly from import.meta.env for Vite production compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  // Check for availability
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
    return null;
  }

  if (!supabaseInstance) {
    try {
      // Validate URL format before creating client
      const finalUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
      supabaseInstance = createClient(finalUrl, supabaseAnonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
};

// Exporting for backward compatibility
export const supabase = getSupabase();

export class SupabaseService {
  private static TABLE_SESSIONS = 'chat_sessions';
  private static TABLE_SETTINGS = 'user_settings';
  private static TABLE_BOOKMARKS = 'bookmarks';

  static async saveSessions(userId: string, sessions: ChatSession[]): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      for (const session of sessions) {
        await client
          .from(this.TABLE_SESSIONS)
          .upsert({
            id: session.id,
            user_id: userId,
            date: session.date,
            preview: session.preview,
            messages: JSON.stringify(session.messages),
          });
      }
    } catch (error) {
      console.error('Error in saveSessions:', error);
    }
  }

  static async loadSessions(userId: string): Promise<ChatSession[]> {
    if (!userId) return [];
    const client = getSupabase();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from(this.TABLE_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        date: item.date,
        preview: item.preview,
        messages: JSON.parse(item.messages),
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  static async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_SETTINGS)
        .upsert({
          user_id: userId,
          username: settings.username,
          email: settings.email,
          model: settings.model,
          creativity_level: settings.creativityLevel,
          reciter: settings.reciter,
          preferred_backend: settings.preferredBackend,
          last_updated: settings.lastUpdated || new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  static async loadUserSettings(userId: string): Promise<Partial<UserSettings> | null> {
    if (!userId) return null;
    const client = getSupabase();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from(this.TABLE_SETTINGS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return null;

      return {
        username: data.username,
        email: data.email,
        model: data.model,
        creativityLevel: data.creativity_level,
        reciter: data.reciter,
        preferredBackend: data.preferred_backend,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('Error loading user settings:', error);
      return null;
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_SESSIONS)
        .delete()
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  static async clearAllSessions(userId: string): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_SESSIONS)
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  }

  static async saveBookmark(userId: string, bookmark: Bookmark): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_BOOKMARKS)
        .upsert({
          id: bookmark.id,
          user_id: userId,
          verse: JSON.stringify(bookmark.verse),
          date_added: bookmark.dateAdded,
        });
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  }

  static async getBookmarks(userId: string): Promise<Bookmark[]> {
    if (!userId) return [];
    const client = getSupabase();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from(this.TABLE_BOOKMARKS)
        .select('*')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        verse: JSON.parse(item.verse),
        dateAdded: item.date_added,
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  static async deleteBookmark(userId: string, bookmarkId: string): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_BOOKMARKS)
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  }
}
