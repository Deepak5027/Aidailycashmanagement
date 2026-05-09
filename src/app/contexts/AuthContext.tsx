import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, AuthState } from '../../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
      setLoading(false);
    });

    // Initial state is already loaded
    setLoading(false);

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    return await authService.signup(email, password, name);
  };

  const signIn = async (email: string, password: string) => {
    return await authService.login(email, password);
  };

  const signOut = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      loading,
      isAuthenticated: authState.isAuthenticated,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
