import { createClient } from '@supabase/supabase-js';

// Use environment variables or direct configuration for development
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmF6b3dsdXV0Y3J2bWt1b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzc0NzksImV4cCI6MjA2Mjk1MzQ3OX0.rbYjUaoFbAzsPYkMmEzK3gdUXiIRhauhtqfFA5iSHQs';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In production, it's better to use environment variables:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 