-- Delete test data from investments table
DELETE FROM investments 
WHERE user_id = 'test_user_1';

-- Delete test data from transactions table
DELETE FROM transactions 
WHERE user_id = 'test_user_1';

-- Verify data was deleted
SELECT COUNT(*) FROM investments;
SELECT COUNT(*) FROM transactions; 