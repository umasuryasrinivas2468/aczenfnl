
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We need to ensure we're passing valid values to createClient
// even if the environment variables are missing
const finalSupabaseUrl = supabaseUrl || 'https://placeholder-url.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'placeholder-key';

// Log warning if the real credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Make sure you've connected your Supabase project properly through the Lovable interface."
  );
}

export const supabase = createClient(
  finalSupabaseUrl,
  finalSupabaseAnonKey
);
