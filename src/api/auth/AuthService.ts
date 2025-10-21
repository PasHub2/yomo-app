/**
 * Authentication credentials for login
 */
export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  /**
   * Authentication credentials for signup
   */
  export interface SignupCredentials {
    email: string;
    password: string;
    username?: string;
  }
  
  /**
   * User profile data
   */
  export interface User {
    id: string;
    email: string;
    username?: string;
    created_at: string;
  }
  
  /**
   * Authentication session data
   */
  export interface Session {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
  }
  
  /**
   * Auth state change callback function type
   */
  export type AuthStateChangeCallback = (user: User | null) => void;
  
  /**
   * Authentication service abstraction layer
   * 
   * This interface defines the contract for authentication operations,
   * allowing for easy swapping of auth providers (Supabase → Base SDK in Phase 3)
   */
  export interface AuthService {
    /**
     * Authenticates a user with email and password
     * @param credentials - User login credentials
     * @returns Promise resolving to authenticated user
     * @throws Error if authentication fails
     */
    login(credentials: LoginCredentials): Promise<User>;
  
    /**
     * Signs out the current user and clears session
     * @throws Error if logout fails
     */
    logout(): Promise<void>;
  
    /**
     * Creates a new user account
     * @param credentials - User signup credentials
     * @returns Promise resolving to created user
     * @throws Error if signup fails
     */
    signup(credentials: SignupCredentials): Promise<User>;
  
    /**
     * Retrieves the current session
     * @returns Promise resolving to current session or null if not authenticated
     */
    getSession(): Promise<Session | null>;
  
    /**
     * Retrieves the current user
     * @returns Promise resolving to current user or null if not authenticated
     */
    getUser(): Promise<User | null>;
  
    /**
     * Refreshes the authentication token
     * @throws Error if token refresh fails
     */
    refreshToken(): Promise<void>;
  
    /**
     * Registers a callback for auth state changes
     * @param callback - Function to call when auth state changes
     */
    onAuthStateChange(callback: AuthStateChangeCallback): void;
  }
  
  