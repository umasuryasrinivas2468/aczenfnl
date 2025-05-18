# Payment Integration Testing Guide

This guide provides instructions for testing the Cashfree UPI-Intent payment flow.

## Prerequisites

1. Supabase database configured with tables and functions (see SUPABASE_PAYMENT_SETUP.md)
2. Cashfree API credentials (test/sandbox environment)
3. Application running locally or deployed

## Test Case 1: Successful Payment Flow

### Steps:

1. **Initiate payment**:
   - Select metal type (gold or silver)
   - Enter amount
   - Click "Proceed to Pay"

2. **Complete Cashfree UPI payment**:
   - Follow UPI flow in test environment
   - Use test UPI ID for success: `success@cashfree`
   - Complete payment

3. **Verify payment success**:
   - You should be redirected to the Payment Success screen
   - Verify payment receipt shows:
     - Correct amount
     - Metal type
     - Transaction ID
     - Order ID
     - Payment timestamp

4. **Check database records**:
   - Verify transaction is recorded in Supabase:
     ```sql
     SELECT * FROM transactions 
     WHERE order_id = 'YOUR_ORDER_ID' AND status = 'completed';
     ```
   - Verify investment record:
     ```sql
     SELECT * FROM investments 
     WHERE user_id = 'YOUR_USER_ID' 
     ORDER BY created_at DESC LIMIT 1;
     ```
   - Verify total investment updated:
     ```sql
     SELECT * FROM user_summary 
     WHERE user_id = 'YOUR_USER_ID';
     ```

## Test Case 2: Failed Payment Flow

### Steps:

1. **Initiate payment**:
   - Select metal type (gold or silver)
   - Enter amount
   - Click "Proceed to Pay"

2. **Simulate failed payment**:
   - Follow UPI flow in test environment
   - Use test UPI ID for failure: `failure@cashfree`
   - Complete payment

3. **Verify payment failure**:
   - You should be redirected to the Payment Status screen with failure message
   - Verify error message is displayed
   - Verify order ID is shown

4. **Check database records**:
   - Verify transaction is recorded with failed status:
     ```sql
     SELECT * FROM transactions 
     WHERE order_id = 'YOUR_ORDER_ID' AND status = 'failed';
     ```
   - Verify total investment is NOT updated:
     ```sql
     SELECT * FROM user_summary 
     WHERE user_id = 'YOUR_USER_ID';
     ```

## Test Case 3: Pending Payment Flow

### Steps:

1. **Initiate payment**:
   - Select metal type (gold or silver)
   - Enter amount
   - Click "Proceed to Pay"

2. **Simulate pending payment**:
   - Use test UPI ID for pending: `pending@cashfree`
   - Start payment flow but do not complete

3. **Verify pending status**:
   - Navigate back to the app
   - Verify payment status shows as pending
   - Check that "Check Status Again" button is available

4. **Check database records**:
   - Verify transaction is recorded as pending:
     ```sql
     SELECT * FROM transactions 
     WHERE order_id = 'YOUR_ORDER_ID' AND status = 'pending';
     ```

## Test Case 4: Network Interruption During Payment

### Steps:

1. **Initiate payment**:
   - Start payment flow

2. **Simulate network interruption**:
   - Enable airplane mode or disconnect from internet during payment
   - Wait for timeout or error

3. **Reconnect and verify recovery**:
   - Reconnect to internet
   - Navigate to payment status
   - Use "Check Status Again" button to refresh payment status
   - Verify correct status is displayed after verification

## Test Case 5: Transaction History

### Steps:

1. **Complete multiple test payments** (mix of successful and failed)

2. **View transaction history**:
   - Navigate to History screen
   - Verify transactions are listed with correct status
   - Verify transaction details are displayed correctly

3. **Check filtering and sorting**:
   - Verify transactions are sorted by date (newest first)
   - Check transaction details show status, amount, and metal type

## Test Case 6: Payment Receipt

### Steps:

1. **Complete successful payment**

2. **View payment receipt**:
   - Navigate to the Payment Success screen
   - Verify all receipt details are correct
   - Test "Download Receipt" functionality
   - Test "Share Receipt" functionality (mobile)

## Test Case 7: Database Verification

After completing all test payments, verify database integrity:

```sql
-- Verify transaction count
SELECT status, COUNT(*) FROM transactions 
WHERE user_id = 'YOUR_USER_ID'
GROUP BY status;

-- Verify investment total matches transaction total
SELECT SUM(amount) FROM transactions 
WHERE user_id = 'YOUR_USER_ID' AND status = 'completed';

SELECT total_invested FROM user_summary 
WHERE user_id = 'YOUR_USER_ID';

-- Verify metal-specific weight calculations
SELECT 
  (SELECT COALESCE(SUM(weight_in_grams), 0) FROM transactions 
   WHERE user_id = 'YOUR_USER_ID' AND status = 'completed' AND metal_type = 'gold') as calculated_gold,
  (SELECT gold_weight FROM user_summary 
   WHERE user_id = 'YOUR_USER_ID') as summary_gold,
  (SELECT COALESCE(SUM(weight_in_grams), 0) FROM transactions 
   WHERE user_id = 'YOUR_USER_ID' AND status = 'completed' AND metal_type = 'silver') as calculated_silver,
  (SELECT silver_weight FROM user_summary 
   WHERE user_id = 'YOUR_USER_ID') as summary_silver;
```

## Test Case 8: Mobile Responsiveness

Test all payment screens on mobile devices:

1. **Payment initiation**
2. **Payment status**
3. **Payment receipt**
4. **Transaction history**

Verify UI is readable and functional on small screens.

## Troubleshooting

If you encounter issues:

1. **Check API requests in browser console**
   - Look for error responses from Cashfree API
   - Verify API keys are correct

2. **Check Supabase logs**
   - Verify database queries are executing correctly
   - Look for permission errors (RLS issues)

3. **Verify payment callback**
   - Check that redirect URLs are properly configured
   - Verify application is handling callback parameters correctly 