-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    metal_type TEXT NOT NULL,
    mobile_number TEXT,
    pan_number TEXT,
    dob TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS investments_user_id_idx ON public.investments(user_id);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    mobile_number TEXT,
    pan_number TEXT,
    dob TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for investments table
CREATE POLICY "Users can view their own investments" 
    ON public.investments 
    FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own investments" 
    ON public.investments 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" 
    ON public.user_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id); 