import { supabase } from '../supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type {
  AuthService,
  LoginCredentials,
  SignupCredentials,
  User,
  Session,
  AuthStateChangeCallback
} from './AuthService';

/**
 * Supabase implementation of AuthService
 * 
 * Provides authentication using Supabase Auth with HttpOnly cookie storage.
 * Profile creation is handled by database triggers on auth.user creation.
 */
export class SupabaseAuthProvider implements AuthService {
  /**
   * Authenticates a user with email and password
   * @param credentials - User login credentials
   * @returns Promise resolving to authenticated user
   * @throws Error if authentication fails
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Login failed: No user returned');
      }

      return this.mapAuthUserToProfile(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login error: ${error.message}`);
      }
      throw new Error('Login failed with unknown error');
    }
  }

  /**
   * Signs out the current user and clears session
   * @throws Error if logout fails
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout error: ${error.message}`);
      }
      throw new Error('Logout failed with unknown error');
    }
  }

  /**
   * Creates a new user account
   * 
   * Profile creation is handled by database trigger on auth.user creation.
   * If username is provided, it will be updated after signup completes.
   * 
   * @param credentials - User signup credentials
   * @returns Promise resolving to created user
   * @throws Error if signup fails
   */
  async signup(credentials: SignupCredentials): Promise<User> {
    try {
      // Create auth user (database trigger creates profile automatically)
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new Error(`Signup failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Signup failed: No user returned');
      }

      const user = this.mapAuthUserToProfile(data.user);

      // If username provided, update profile (non-blocking, don't fail signup)
      if (credentials.username) {
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ username: credentials.username })
            .eq('id', data.user.id);

          if (updateError) {
            // Log error but don't fail signup
            throw new Error(`Profile username update failed: ${updateError.message}`);
          }

          // Update returned user with username
          user.username = credentials.username;
        } catch (updateError) {
          // Profile update failed but signup succeeded
          // Continue without failing the entire signup process
        }
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Signup error: ${error.message}`);
      }
      throw new Error('Signup failed with unknown error');
    }
  }

  /**
   * Retrieves the current session
   * @returns Promise resolving to current session or null if not authenticated
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error(`Get session failed: ${error.message}`);
      }

      if (!data.session) {
        return null;
      }

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Get session error: ${error.message}`);
      }
      throw new Error('Get session failed with unknown error');
    }
  }

  /**
   * Retrieves the current user
   * @returns Promise resolving to current user or null if not authenticated
   */
  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new Error(`Get user failed: ${error.message}`);
      }

      if (!data.user) {
        return null;
      }

      return this.mapAuthUserToProfile(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Get user error: ${error.message}`);
      }
      throw new Error('Get user failed with unknown error');
    }
  }

  /**
   * Refreshes the authentication token
   * @throws Error if token refresh fails
   */
  async refreshToken(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token refresh error: ${error.message}`);
      }
      throw new Error('Token refresh failed with unknown error');
    }
  }

  /**
   * Registers a callback for auth state changes
   * @param callback - Function to call when auth state changes
   */
  onAuthStateChange(callback: AuthStateChangeCallback): void {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(this.mapAuthUserToProfile(session.user));
      } else {
        callback(null);
      }
    });
  }

  /**
   * Maps Supabase auth user to application User interface
   * @param authUser - Supabase auth user object
   * @returns User object conforming to application interface
   */
  private mapAuthUserToProfile(authUser: SupabaseUser): User {
    return {
      id: authUser.id,
      email: authUser.email || '',
      username: authUser.user_metadata?.username,
      created_at: authUser.created_at || new Date().toISOString()
    };
  }
}

