import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cashfree API credentials
const CASHFREE_API_KEY = process.env.CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

/**
 * Get transaction details from Cashfree API
 */
async function getTransactionDetails(orderId) {
  try {
    // Define API URL
    const API_URL = `https://api.cashfree.com/pg/orders/${orderId}`;

    // Make API call
    const response = await axios.get(API_URL, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_API_KEY,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', 
      error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Call Cashfree's notify URL
 */
async function callCashfreeNotify(orderId, status) {
  try {
    // Notify URL for Cashfree
    const notifyUrl = `https://api.cashfree.com/pg/orders/${orderId}/notify`;
    
    console.log(`Calling Cashfree notify URL for order ${orderId} with status ${status}`);
    
    // Make API call
    const response = await axios.post(notifyUrl, 
      { status },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_API_KEY,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error calling notify URL for order ${orderId}:`, 
      error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Update transaction status in database
 */
async function updateTransactionStatus(orderId, status) {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update transaction status:', error);
    return false;
  }
}

/**
 * API handler to sync all transactions
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Starting transaction sync');
    
    // Get user ID from query params if present
    const userId = req.query.userId;
    
    // Query for transactions
    let query = supabase.from('transactions').select('*');
    
    // Filter by user ID if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Fetch transactions
    const { data: transactions, error } = await query;
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions to sync');
      return res.status(200).json({ success: true, updated: 0, message: 'No transactions to sync' });
    }
    
    console.log(`Found ${transactions.length} transactions to sync`);
    
    let updatedCount = 0;
    let failedCount = 0;
    
    // Process each transaction
    for (const transaction of transactions) {
      try {
        // Get current status from Cashfree
        const paymentDetails = await getTransactionDetails(transaction.order_id);
        
        // Map Cashfree status to our status
        let newStatus;
        if (paymentDetails.order_status === 'PAID') {
          newStatus = 'PAID';
        } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentDetails.order_status)) {
          newStatus = 'FAILED';
        } else {
          newStatus = 'PENDING';
        }
        
        // Only update if status has changed
        if (newStatus !== transaction.status) {
          console.log(`Updating transaction ${transaction.order_id} status from ${transaction.status} to ${newStatus}`);
          
          // Update in database
          const success = await updateTransactionStatus(transaction.order_id, newStatus);
          
          if (success) {
            updatedCount++;
            console.log(`Successfully updated transaction ${transaction.order_id}`);
            
            // Call notify URL
            await callCashfreeNotify(transaction.order_id, newStatus);
          } else {
            failedCount++;
            console.error(`Failed to update transaction ${transaction.order_id}`);
          }
        } else {
          // Even if status hasn't changed, still call notify URL to ensure consistency
          await callCashfreeNotify(transaction.order_id, transaction.status);
          console.log(`Called notify URL for transaction ${transaction.order_id} (status unchanged: ${transaction.status})`);
        }
      } catch (txError) {
        failedCount++;
        console.error(`Error processing transaction ${transaction.order_id}:`, txError);
      }
    }
    
    console.log(`Transaction sync completed. Updated: ${updatedCount}, Failed: ${failedCount}`);
    return res.status(200).json({ 
      success: true, 
      updated: updatedCount,
      failed: failedCount,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error in transaction sync API:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
} 