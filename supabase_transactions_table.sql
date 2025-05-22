-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_session_id TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid()::TEXT = user_id);

-- Allow anyone to insert transactions (for testing purposes)
CREATE POLICY "Anyone can insert transactions" 
  ON public.transactions FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to update their own transactions
CREATE POLICY "Users can update their own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid()::TEXT = user_id);

-- Create a function to update transaction status
CREATE OR REPLACE FUNCTION update_transaction_status(
  p_order_id TEXT,
  p_status TEXT,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.transactions
  SET 
    status = p_status,
    payment_id = COALESCE(p_payment_id, payment_id),
    updated_at = NOW()
  WHERE order_id = p_order_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user transactions
CREATE OR REPLACE FUNCTION get_user_transactions(p_user_id TEXT)
RETURNS SETOF public.transactions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.transactions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 