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
  return {
    auth: {
      signInWithPassword: () => Promise.resolve({
        data: null,
        error: {
          message: 'Authentication failed: Supabase connection not configured',
          status: 500
        }
      }),
      signUp: () => Promise.resolve({
        data: null,
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
    from: (table: string) => ({
      select: () => Promise.resolve({ error: null, data: [] }),
      insert: () => Promise.resolve({ error: null, data: [] }),
      update: () => Promise.resolve({ error: null, data: [] }),
      delete: () => Promise.resolve({ error: null, data: [] }),
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
