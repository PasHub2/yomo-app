import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseAuthProvider } from './SupabaseAuthProvider';
import type { User } from './AuthService';

/**
 * Auth context value type
 */
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Wraps the application and provides authentication state and methods.
 * Automatically handles session restoration and auth state changes.
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authService] = useState(() => new SupabaseAuthProvider());

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } catch (error) {
        // Session check failed, user is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    authService.onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
  }, [authService]);

  /**
   * Logs out the current user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
      throw new Error('Logout failed with unknown error');
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication state and methods
 * 
 * Must be used within an AuthProvider component.
 * 
 * @returns Authentication context value with user, loading state, and logout method
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, logout } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *   
 *   return <button onClick={logout}>Logout</button>;
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

