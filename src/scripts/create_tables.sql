-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  weight_in_grams NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  status TEXT NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create row level security policies
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for investments
CREATE POLICY "Enable read access for all users" ON investments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON investments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Enable update for users based on user_id" ON investments FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policies for transactions
CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Enable update for users based on user_id" ON transactions FOR UPDATE USING (auth.uid()::text = user_id);

-- Insert test data
INSERT INTO investments (user_id, metal_type, amount, weight_in_grams)
VALUES 
  ('test_user_1', 'gold', 25000, 4.545),
  ('test_user_1', 'silver', 10000, 142.857);

INSERT INTO transactions (order_id, user_id, amount, metal_type, status, payment_method)
VALUES 
  ('order_test_1', 'test_user_1', 25000, 'gold', 'completed', 'UPI'),
  ('order_test_2', 'test_user_1', 10000, 'silver', 'completed', 'UPI'); 