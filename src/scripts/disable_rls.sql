-- Disable Row Level Security on investments table
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;

-- Disable Row Level Security on transactions table
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('investments', 'transactions'); 