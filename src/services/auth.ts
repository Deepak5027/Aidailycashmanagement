import { supabase } from '../../utils/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
  };

  constructor() {
    this.loadSession();
  }

  private async loadSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && !error) {
        this.state = {
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
          },
          accessToken: session.access_token,
          isAuthenticated: true,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Session load error:', error);
    }
  }

  async signup(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return await this.login(email, password);
    } catch (error: any) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        return { success: false, error: error?.message || 'Login failed' };
      }

      this.state = {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
        },
        accessToken: data.session.access_token,
        isAuthenticated: true,
      };

      this.notifyListeners();

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();

      this.state = {
        user: null,
        accessToken: null,
        isAuthenticated: false,
      };

      this.notifyListeners();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getState(): AuthState {
    return this.state;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const authService = new AuthService();
