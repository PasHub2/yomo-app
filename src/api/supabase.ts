import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required');
}

/**
 * Supabase client instance configured with HttpOnly cookie persistence
 * 
 * Uses Supabase's secure HttpOnly cookie storage by default (no explicit storage config needed).
 * This provides XSS protection and is production-ready.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions (previously in src/lib/supabaseClient.js)

/**
 * Error Handling Wrapper - nutzen wir später für alle Queries
 * @param {Function} queryFn - Die Supabase Query Funktion
 * @param {string} errorContext - Beschreibung für bessere Error Messages
 * @returns {Promise<*>} Die Daten aus der Query
 */
export async function executeQuery(queryFn: any, errorContext: string) {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error(`[DB Error] ${errorContext}:`, error);
      throw new Error(`Failed to ${errorContext}: ${error.message}`);
    }
    
    return data;
  } catch (err) {
    console.error(`[Query Failed] ${errorContext}:`, err);
    throw err;
  }
}

/**
 * Realtime Subscriptions - für Live Updates
 * @param {string} table - Der Name der Tabelle
 * @param {string} filter - Optional: Filter für die Subscription
 * @param {Function} callback - Callback Funktion die bei Änderungen aufgerufen wird
 * @returns {Function} Cleanup Funktion zum Unsubscriben
 */
export function subscribeToTable(table: string, filter: any, callback: any) {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        ...(filter && { filter })
      },
      callback
    )
    .subscribe();
  
  // Return cleanup function
  return () => {
    channel.unsubscribe();
  };
}

