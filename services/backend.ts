import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { DirectoryItem, HistoryItem, UserProfile } from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

/**
 * BackendService
 * 
 * Handles data persistence and authentication.
 * Designed to work with Supabase if keys are provided, 
 * or fall back seamlessly to LocalStorage ("Mock Mode") for demos.
 */
class BackendService {
  private supabase: SupabaseClient | null = null;
  private isMock: boolean = true;
  
  // In-memory user state for the session
  private currentUser: UserProfile | null = null;

  constructor() {
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        this.isMock = false;
        console.log("Backend: Connected to Supabase");
        this.recoverSession();
      } catch (e: any) {
        console.warn("Backend: Failed to init Supabase, falling back to local storage:", e?.message || String(e));
      }
    } else {
      console.log("Backend: Missing keys, running in Mock Mode (LocalStorage)");
      this.recoverMockSession();
    }
  }

  /**
   * Returns true if connected to a live Supabase instance.
   */
  isUsingSupabase(): boolean {
    return !this.isMock;
  }

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  /**
   * Gets the currently logged in user, if any.
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Simulates or performs a sign in.
   */
  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (this.isMock || !this.supabase) {
      // MOCK LOGIN
      // Accept any email/password for demo purposes
      if (!email.includes('@')) return { user: null, error: "Invalid email address" };
      
      const mockUser: UserProfile = {
        id: 'mock-user-123',
        email: email,
        name: email.split('@')[0],
        avatarUrl: `https://ui-avatars.com/api/?name=${email}&background=0ea5e9&color=fff`,
        joinedAt: new Date().toISOString()
      };
      
      this.currentUser = mockUser;
      localStorage.setItem('geodir_user_session', JSON.stringify(mockUser));
      return { user: mockUser, error: null };
    }

    // REAL SUPABASE LOGIN
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    
    if (data.user) {
        this.currentUser = this.mapSupabaseUser(data.user);
        return { user: this.currentUser, error: null };
    }
    return { user: null, error: "Unknown login error" };
  }

  /**
   * Simulates or performs a sign up.
   */
  async signUp(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (this.isMock || !this.supabase) {
        // For mock, sign up is same as sign in
        return this.signIn(email, password);
    }

    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) return { user: null, error: error.message };
    
    if (data.user) {
        this.currentUser = this.mapSupabaseUser(data.user);
        return { user: this.currentUser, error: null };
    }
    return { user: null, error: "Check email for confirmation link (if configured)" };
  }

  /**
   * Signs the user out.
   */
  async signOut(): Promise<void> {
    this.currentUser = null;
    if (this.isMock) {
        localStorage.removeItem('geodir_user_session');
    } else {
        await this.supabase?.auth.signOut();
    }
  }

  private recoverMockSession() {
      const stored = localStorage.getItem('geodir_user_session');
      if (stored) {
          this.currentUser = JSON.parse(stored);
      }
  }

  private async recoverSession() {
      if(this.supabase) {
          const { data } = await this.supabase.auth.getSession();
          if(data.session?.user) {
              this.currentUser = this.mapSupabaseUser(data.session.user);
          }
      }
  }

  private mapSupabaseUser(sbUser: User): UserProfile {
      return {
          id: sbUser.id,
          email: sbUser.email || '',
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
          avatarUrl: sbUser.user_metadata?.avatar_url,
          joinedAt: sbUser.created_at
      };
  }

  // ==========================================
  // DATA METHODS (Favorites & History)
  // ==========================================

  async getFavorites(): Promise<DirectoryItem[]> {
    if (this.isMock || !this.supabase) {
      const stored = localStorage.getItem('geodir_favorites');
      return stored ? JSON.parse(stored) : [];
    }

    // In a real app, we would filter by user_id
    const { data, error } = await this.supabase.from('favorites').select('*');
    if (error) {
      console.error('Supabase error:', error);
      return [];
    }
    return data || [];
  }

  async addFavorite(item: DirectoryItem): Promise<void> {
    if (this.isMock || !this.supabase) {
      const current = await this.getFavorites();
      // Update if exists (to save notes), else add
      const existsIndex = current.findIndex(i => i.id === item.id);
      let updated = [...current];
      
      if (existsIndex >= 0) {
          updated[existsIndex] = item;
      } else {
          updated.push(item);
      }
      
      localStorage.setItem('geodir_favorites', JSON.stringify(updated));
      return;
    }

    const { error } = await this.supabase.from('favorites').upsert([item]);
    if (error) console.error('Supabase insert error:', error);
  }

  async removeFavorite(itemId: string): Promise<void> {
    if (this.isMock || !this.supabase) {
      const current = await this.getFavorites();
      const next = current.filter(i => i.id !== itemId);
      localStorage.setItem('geodir_favorites', JSON.stringify(next));
      return;
    }

    const { error } = await this.supabase.from('favorites').delete().eq('id', itemId);
    if (error) console.error('Supabase delete error:', error);
  }

  async updateNote(itemId: string, note: string): Promise<void> {
      // 1. Update in favorites if it exists there
      const favorites = await this.getFavorites();
      const favItem = favorites.find(f => f.id === itemId);
      if (favItem) {
          favItem.userNotes = note;
          await this.addFavorite(favItem); // Reuse add/upsert logic
      }

      // 2. Also update in history if relevant (mock only for now)
      if (this.isMock) {
          const history = await this.getHistory();
          const histItem = history.find(h => h.id === itemId);
          if (histItem) {
              histItem.userNotes = note;
              localStorage.setItem('geodir_history', JSON.stringify(history));
          }
      }
      // Real backend would likely normalize notes into a separate table or field on the item
  }

  // --- HISTORY ---

  async getHistory(): Promise<HistoryItem[]> {
      if (this.isMock || !this.supabase) {
          const stored = localStorage.getItem('geodir_history');
          return stored ? JSON.parse(stored) : [];
      }
      // Supabase implementation omitted for brevity, logic implies a 'history' table
      return []; 
  }

  async addToHistory(item: DirectoryItem): Promise<void> {
      const historyItem: HistoryItem = { ...item, visitedAt: new Date().toISOString() };
      
      if (this.isMock || !this.supabase) {
          let current = await this.getHistory();
          // Remove duplicates to keep only most recent visit at top
          current = current.filter(i => i.id !== item.id);
          // Add to beginning
          current.unshift(historyItem);
          // Limit to last 20
          current = current.slice(0, 20);
          localStorage.setItem('geodir_history', JSON.stringify(current));
          return;
      }
      // Supabase insert logic here
  }
}

export const backend = new BackendService();