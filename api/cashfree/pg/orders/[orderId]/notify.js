import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cashfree API credentials
const CASHFREE_API_KEY = process.env.CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
const CASHFREE_API_BASE = "https://api.cashfree.com/pg";

/**
 * Update transaction status in database
 * @param {string} orderId - The order ID
 * @param {string} status - The payment status (PAID, PENDING, FAILED)
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
 * Notifies Cashfree about an order status change
 */
export default async function handler(req, res) {
  // Allow both GET and POST for this endpoint
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    // Get the status from the request body
    const { status } = req.method === 'POST' ? req.body : req.query;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Map status to Cashfree format if needed
    const cashfreeStatus = status === 'PAID' ? 'PAID' : 
                           status === 'FAILED' ? 'FAILED' : 'ACTIVE';
    
    console.log(`Notifying Cashfree for order: ${orderId} with status: ${cashfreeStatus}`);
    
    // First update the transaction in our database
    const updated = await updateTransactionStatus(orderId, status);
    
    if (!updated) {
      console.warn(`Database update failed for order ${orderId}, but continuing with Cashfree notification`);
    }
    
    // Now notify Cashfree
    const notifyUrl = `${CASHFREE_API_BASE}/orders/${orderId}/notify`;
    
    // Make API call to Cashfree
    const response = await axios.post(notifyUrl, 
      { status: cashfreeStatus },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_API_KEY,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: `Notification sent for order ${orderId}`,
      status: cashfreeStatus,
      database_updated: updated,
      cashfree_response: response.data
    });
  } catch (error) {
    console.error('Error notifying Cashfree:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to notify Cashfree',
      message: error.response?.data?.message || error.message
    });
  }
} 