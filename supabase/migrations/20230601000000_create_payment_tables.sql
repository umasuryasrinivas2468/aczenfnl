-- Create payment and investment related tables with RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Metal prices table
CREATE TABLE IF NOT EXISTS public.metal_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('gold', 'silver')),
  price_per_gram DECIMAL(10, 2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transaction history table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'pending')),
  payment_method TEXT,
  weight_in_grams DECIMAL(10, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User investment summary table
CREATE TABLE IF NOT EXISTS public.user_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  total_invested DECIMAL(10, 2) NOT NULL DEFAULT 0,
  gold_weight DECIMAL(10, 4) DEFAULT 0,
  silver_weight DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);

-- Enable Row Level Security
ALTER TABLE public.metal_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Metal prices policies (anyone can read)
CREATE POLICY "Anyone can view metal prices" 
  ON public.metal_prices FOR SELECT 
  USING (true);

-- Transaction policies
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

-- Investment policies
CREATE POLICY "Users can view their own investments" 
  ON public.investments FOR SELECT 
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert their own investments" 
  ON public.investments FOR INSERT 
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

-- User summary policies
CREATE POLICY "Users can view their own summary" 
  ON public.user_summary FOR SELECT 
  USING (auth.uid()::TEXT = user_id::TEXT);

-- Create function for incrementing total investment
CREATE OR REPLACE FUNCTION increment_total_invested(uid TEXT, add_amount DECIMAL)
RETURNS VOID AS $$
DECLARE
  user_id UUID := uid::UUID;
BEGIN
  -- First try to update existing user_summary if it exists
  UPDATE user_summary
  SET total_invested = total_invested + add_amount,
      updated_at = NOW()
  WHERE user_id = increment_total_invested.user_id;
  
  -- If no row was updated, insert a new record
  IF NOT FOUND THEN
    INSERT INTO user_summary (user_id, total_invested)
    VALUES (increment_total_invested.user_id, add_amount);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update investment totals when transactions are added
CREATE OR REPLACE FUNCTION update_investment_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed transactions
  IF NEW.status = 'completed' THEN
    -- Update user summary
    UPDATE user_summary
    SET 
      total_invested = total_invested + NEW.amount,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- If no summary exists, create one
    IF NOT FOUND THEN
      INSERT INTO user_summary (user_id, total_invested)
      VALUES (NEW.user_id, NEW.amount);
    END IF;
    
    -- Update metal-specific weights
    IF NEW.metal_type = 'gold' THEN
      UPDATE user_summary
      SET gold_weight = gold_weight + NEW.weight_in_grams
      WHERE user_id = NEW.user_id;
    ELSIF NEW.metal_type = 'silver' THEN
      UPDATE user_summary
      SET silver_weight = silver_weight + NEW.weight_in_grams
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update investment totals
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_investment_totals();

-- Insert initial metal prices
INSERT INTO public.metal_prices (type, price_per_gram)
VALUES 
  ('gold', 5500.00),
  ('silver', 70.00)
ON CONFLICT DO NOTHING; 