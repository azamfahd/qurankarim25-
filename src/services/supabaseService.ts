import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatSession, UserSettings, Bookmark } from '../types';

// Get environment variables from import.meta.env (injected by Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseAnonKey || supabaseAnonKey === 'undefined') return null;
  
  let validUrl = supabaseUrl;
  
  // Handle case where user pasted the entire connection string or postgres URL
  if (validUrl.includes('https://')) {
    const match = validUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
    if (match) {
      validUrl = match[0];
    }
  } else if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
    // Handle case where user just pasted the project ID or domain without https://
    if (validUrl.includes('supabase.co')) {
      validUrl = `https://${validUrl.split('@').pop()?.split(':').shift()?.replace('db.', '')}`;
    } else {
      validUrl = `https://${validUrl}.supabase.co`;
    }
  }

  let validKey = supabaseAnonKey;
  if (validKey.includes('eyJ')) {
    const match = validKey.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
    if (match) {
      validKey = match[0];
    }
  } else if (validKey.includes('sb_publishable_')) {
    const match = validKey.match(/sb_publishable_[a-zA-Z0-9_-]+/);
    if (match) {
      validKey = match[0];
    }
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(validUrl, validKey);
    } catch (e) {
      console.error('Failed to initialize Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
};

// Exporting for backward compatibility if needed, but should use getSupabase()
export const supabase = getSupabase();

export class SupabaseService {
  private static TABLE_SESSIONS = 'chat_sessions';
  private static TABLE_SETTINGS = 'user_settings';
  private static TABLE_BOOKMARKS = 'bookmarks';

  /**
   * Saves all chat sessions for a user
   */
  static async saveSessions(userId: string, sessions: ChatSession[]): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      // For simplicity in this implementation, we'll save them one by one or use a batch
      for (const session of sessions) {
        const { error } = await client
          .from(this.TABLE_SESSIONS)
          .upsert({
            id: session.id,
            user_id: userId,
            date: session.date,
            preview: session.preview,
            messages: JSON.stringify(session.messages),
          });
        if (error) console.error('Error saving session:', error);
      }
    } catch (error) {
      console.error('Error in saveSessions:', error);
    }
  }

  /**
   * Loads all chat sessions for a user
   */
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

  /**
   * Saves user settings
   */
  static async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      const { error } = await client
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
      if (error) throw error;
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  /**
   * Loads user settings
   */
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

  /**
   * Deletes a specific session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    try {
      const { error } = await client
        .from(this.TABLE_SESSIONS)
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  /**
   * Clears all sessions for a user
   */
  static async clearAllSessions(userId: string): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      const { error } = await client
        .from(this.TABLE_SESSIONS)
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  }

  /**
   * Saves a bookmark
   */
  static async saveBookmark(userId: string, bookmark: Bookmark): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      const { error } = await client
        .from(this.TABLE_BOOKMARKS)
        .upsert({
          id: bookmark.id,
          user_id: userId,
          verse: JSON.stringify(bookmark.verse),
          date_added: bookmark.dateAdded,
        });
      if (error) throw error;
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  }

  /**
   * Fetches all bookmarks for a user
   */
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

  /**
   * Deletes a bookmark
   */
  static async deleteBookmark(userId: string, bookmarkId: string): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      const { error } = await client
        .from(this.TABLE_BOOKMARKS)
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  }
}
