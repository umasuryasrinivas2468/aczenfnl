import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We need to ensure these values are actually defined strings, not just undefined
const isSupabaseConfigured = typeof supabaseUrl === 'string' && 
                           supabaseUrl.length > 0 && 
                           typeof supabaseAnonKey === 'string' && 
                           supabaseAnonKey.length > 0;

// Create a mock client that generates predictable errors for better UX
const createMockClient = () => {
  const mockError = new Error('Supabase not configured');
  
  return {
    auth: {
      signInWithPassword: () => Promise.reject({
        error: {
          message: 'Authentication failed: Supabase connection not configured',
          status: 500
        }
      }),
      signUp: () => Promise.reject({
        error: {
          message: 'Registration failed: Supabase connection not configured',
          status: 500
        }
      }),
      // Other auth methods that might be used
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    // Add other mock methods as needed
    from: () => ({
      select: () => ({ error: mockError, data: null }),
      insert: () => ({ error: mockError, data: null }),
      update: () => ({ error: mockError, data: null }),
      delete: () => ({ error: mockError, data: null }),
    })
  };
};

// Decide whether to use a real or mock client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Log warning if the real credentials are missing
if (!isSupabaseConfigured) {
  console.error(
    "Supabase connection is not configured. Make sure you've connected your Supabase project through the Lovable interface."
  );
  
  // Show a toast notification when the app loads - this will appear once
  // to inform users about the missing configuration
  setTimeout(() => {
    toast({
      title: "Supabase Not Connected",
      description: "Please connect your Supabase project to enable authentication and database features.",
      variant: "destructive"
    });
  }, 1000);
}
