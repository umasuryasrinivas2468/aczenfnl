-- Function to increment a user's total investment
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