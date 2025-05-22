-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  metal_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payment_method TEXT NOT NULL,
  payment_session_id TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);

-- Create index on user_id for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Add RLS policies for security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON transactions 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions" 
  ON transactions 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own transactions
CREATE POLICY "Users can update their own transactions" 
  ON transactions 
  FOR UPDATE 
  USING (auth.uid()::text = user_id); 