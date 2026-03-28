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

  static async signInWithGoogle() {
    const client = getSupabase();
    if (!client) throw new Error("Supabase client not initialized");
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  static onAuthStateChange(callback: (user: any) => void) {
    const client = getSupabase();
    if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
    return client.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

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
            messages: session.messages, // Pass object directly for JSONB compatibility
          });
      }
    } catch (error) {
      console.error('Error in saveSessions:', error);
    }
  }

  static async loadSessions(userId: string): Promise<ChatSession[] | null> {
    if (!userId) return null;
    const client = getSupabase();
    if (!client) return null;

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
        messages: typeof item.messages === 'string' ? JSON.parse(item.messages) : item.messages,
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return null;
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
          bookmarks: settings.bookmarks || [],
          location: settings.location || null,
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
        bookmarks: typeof data.bookmarks === 'string' ? JSON.parse(data.bookmarks) : (data.bookmarks || []),
        location: typeof data.location === 'string' ? JSON.parse(data.location) : (data.location || undefined),
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
          verse: bookmark.verse,
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
        verse: typeof item.verse === 'string' ? JSON.parse(item.verse) : item.verse,
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

  static async registerUser(userId: string, metadata: any, settings: UserSettings): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_SETTINGS)
        .upsert({
          user_id: userId,
          username: settings.username || 'Guest',
          email: settings.email || '',
          last_active: metadata.lastActive,
          user_agent: metadata.userAgent,
          language: metadata.language,
          is_installed: metadata.isInstalled,
          platform: metadata.platform,
          last_updated: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error registering user in Supabase:', error);
    }
  }

  static async updateUserInstallStatus(userId: string, isInstalled: boolean): Promise<void> {
    if (!userId) return;
    const client = getSupabase();
    if (!client) return;

    try {
      await client
        .from(this.TABLE_SETTINGS)
        .update({
          is_installed: isInstalled,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating install status in Supabase:', error);
    }
  }
}
