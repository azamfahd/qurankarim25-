import { db, handleFirestoreError, OperationType } from '../firebase';
import { SupabaseService, getSupabase } from './supabaseService';
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { ChatSession, UserSettings, BackendType } from '../types';

export class SyncService {
  private static getActiveBackend(settings: UserSettings): BackendType {
    const hasSupabase = !!getSupabase();
    
    // If user explicitly chose a backend
    if (settings.preferredBackend) {
      // If they chose supabase but it's not configured, fallback to firestore
      if (settings.preferredBackend === 'supabase' && !hasSupabase) return 'firestore';
      return settings.preferredBackend;
    }
    
    // Default: Prefer Supabase if configured, otherwise Firestore
    return hasSupabase ? 'supabase' : 'firestore';
  }

  static async saveSession(userId: string, session: ChatSession, settings: UserSettings): Promise<void> {
    if (!userId) return;
    const backend = this.getActiveBackend(settings);

    if (backend === 'supabase') {
      await SupabaseService.saveSessions(userId, [session]);
    } else {
      const sessionRef = doc(db, 'users', userId, 'sessions', session.id);
      await setDoc(sessionRef, session).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/sessions/${session.id}`);
      });
    }
  }

  static async loadSessions(userId: string, settings: UserSettings): Promise<ChatSession[]> {
    if (!userId) return [];
    const backend = this.getActiveBackend(settings);

    if (backend === 'supabase') {
      return await SupabaseService.loadSessions(userId);
    } else {
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const q = query(sessionsRef, orderBy('date', 'desc'));
      try {
        const querySnap = await getDocs(q);
        const loadedSessions: ChatSession[] = [];
        querySnap.forEach((doc) => {
          loadedSessions.push(doc.data() as ChatSession);
        });
        return loadedSessions;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${userId}/sessions`);
        return [];
      }
    }
  }

  static async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    const backend = this.getActiveBackend(settings);

    if (backend === 'supabase') {
      await SupabaseService.saveUserSettings(userId, settings);
    } else {
      const settingsRef = doc(db, 'users', userId);
      const { bookmarks, ...settingsToSave } = settings;
      await setDoc(settingsRef, { 
        ...settingsToSave, 
        uid: userId,
        lastUpdated: new Date().toISOString() 
      }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
      });
    }
  }

  static async loadSettings(userId: string, currentSettings: UserSettings): Promise<Partial<UserSettings> | null> {
    if (!userId) return null;
    const backend = this.getActiveBackend(currentSettings);

    if (backend === 'supabase') {
      return await SupabaseService.loadUserSettings(userId);
    } else {
      const settingsRef = doc(db, 'users', userId);
      try {
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          return docSnap.data() as UserSettings;
        }
        return null;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${userId}`);
        return null;
      }
    }
  }

  static async deleteSession(userId: string, sessionId: string, settings: UserSettings): Promise<void> {
    if (!userId) return;
    const backend = this.getActiveBackend(settings);

    if (backend === 'supabase') {
      await SupabaseService.deleteSession(sessionId);
    } else {
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      await deleteDoc(sessionRef).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}/sessions/${sessionId}`);
      });
    }
  }

  static async clearAllSessions(userId: string, sessions: ChatSession[], settings: UserSettings): Promise<void> {
    if (!userId) return;
    const backend = this.getActiveBackend(settings);

    if (backend === 'supabase') {
      await SupabaseService.clearAllSessions(userId);
    } else {
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      for (const s of sessions) {
        await deleteDoc(doc(sessionsRef, s.id)).catch(err => {
          console.error('Error deleting session during clear:', err);
        });
      }
    }
  }
}
