import { SupabaseService, getSupabase } from './supabaseService';
import { ChatSession, UserSettings, Bookmark } from '../types';

export class SyncService {
  static async saveSession(userId: string, session: ChatSession, settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.saveSessions(userId, [session]);
  }

  static async loadSessions(userId: string, settings: UserSettings): Promise<ChatSession[] | null> {
    if (!userId) return null;
    return await SupabaseService.loadSessions(userId);
  }

  static async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.saveUserSettings(userId, settings);
  }

  static async loadSettings(userId: string, currentSettings: UserSettings): Promise<Partial<UserSettings> | null> {
    if (!userId) return null;

    let loadedSettings: Partial<UserSettings> | null = null;
    loadedSettings = await SupabaseService.loadUserSettings(userId);
    
    try {
      const bookmarks = await SupabaseService.getBookmarks(userId);
      if (bookmarks && bookmarks.length > 0) {
        loadedSettings = {
          ...(loadedSettings || {}),
          bookmarks: bookmarks
        };
      }
    } catch (e) {
      console.error('Error fetching separate bookmarks:', e);
    }

    return loadedSettings;
  }

  static async deleteSession(userId: string, sessionId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.deleteSession(sessionId);
  }

  static async clearAllSessions(userId: string, sessions: ChatSession[], settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.clearAllSessions(userId);
  }

  static async saveBookmark(userId: string, bookmark: Bookmark, settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.saveBookmark(userId, bookmark);
  }

  static async deleteBookmark(userId: string, bookmarkId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.deleteBookmark(userId, bookmarkId);
  }

  static async registerUser(userId: string, metadata: any, settings: UserSettings): Promise<void> {
    if (!userId) return;
    await SupabaseService.registerUser(userId, metadata, settings);
  }

  static async updateUserInstallStatus(userId: string, isInstalled: boolean): Promise<void> {
    if (!userId) return;
    await SupabaseService.updateUserInstallStatus(userId, isInstalled);
  }
}

