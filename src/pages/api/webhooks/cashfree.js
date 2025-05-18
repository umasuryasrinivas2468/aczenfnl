import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import axios from 'axios';

// Verify webhook signature for security
function verifyWebhookSignature(payload, signature, secretKey) {
  if (!signature || !secretKey) {
    return false;
  }

  try {
    // Create a HMAC SHA256 hash using the secret key
    const hmac = crypto.createHmac('sha256', secretKey);
    
    // Update the hash with the request body (stringified)
    const computedSignature = hmac
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    
    // Compare the computed signature with the one from the request headers
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Function to call Cashfree notify URL for a transaction
async function callNotifyUrl(order_id, status) {
  try {
    // Constants for API authentication
    const API_KEY = process.env.CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
    const API_SECRET = process.env.CASHFREE_API_SECRET || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
    
    // Notify URL - this should be configured in your Cashfree dashboard
    const notifyUrl = `https://api.cashfree.com/pg/orders/${order_id}/notify`;
    
    console.log(`Calling notify URL for order ${order_id} with status ${status}`);
    
    // Make the API call to Cashfree's notify URL
    const response = await axios.post(notifyUrl, 
      { status },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': API_KEY,
          'x-client-secret': API_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Notify URL call response:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error calling notify URL for order ${order_id}:`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Function to update all pending transactions
export async function checkAndUpdateAllPendingTransactions() {
  try {
    // Get all pending transactions
    const { data: pendingTransactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'PENDING');
    
    if (error) {
      console.error('Error fetching pending transactions:', error);
      return { updated: 0, error };
    }
    
    if (!pendingTransactions || pendingTransactions.length === 0) {
      console.log('No pending transactions to update');
      return { updated: 0 };
    }
    
    console.log(`Found ${pendingTransactions.length} pending transactions to check`);
    let updatedCount = 0;
    
    // Process each pending transaction
    for (const transaction of pendingTransactions) {
      try {
        // Call Cashfree API to get current status
        const { success, data } = await callNotifyUrl(transaction.order_id, 'PENDING');
        
        if (success && data) {
          // Update transaction based on response
          const newStatus = 
            data.order_status === 'PAID' ? 'PAID' :
            data.order_status === 'FAILED' ? 'FAILED' : 
            'PENDING';
          
          if (newStatus !== transaction.status) {
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('order_id', transaction.order_id);
            
            if (!updateError) {
              updatedCount++;
              console.log(`Updated transaction ${transaction.order_id} to ${newStatus}`);
            }
          }
        }
      } catch (txError) {
        console.error(`Error processing transaction ${transaction.order_id}:`, txError);
      }
    }
    
    return { updated: updatedCount };
  } catch (error) {
    console.error('Error in checking all pending transactions:', error);
    return { updated: 0, error };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-webhook-signature'] || '';
    const payload = req.body;
    const rawBody = req.rawBody; // This requires body-parser raw configuration
    
    console.log('Webhook received:', {
      event: payload.event,
      orderId: payload.data?.order_id
    });
    
    // Get secret key from environment variables
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    
    // Skip verification in development if no secret key is set
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !secretKey) {
      console.warn('CASHFREE_SECRET_KEY not set in production environment');
    }
    
    // Verify the webhook is genuinely from Cashfree (skip in dev if no key)
    if (isProduction && secretKey && !verifyWebhookSignature(rawBody || payload, signature, secretKey)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Process based on event type
    const { event, data } = payload;
    
    if (!data || !data.order_id) {
      return res.status(400).json({ error: 'Invalid payload, missing order_id' });
    }
    
    const { order_id, payment_id, order_amount, payment_method } = data;
    
    // Get the transaction from Supabase
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();
    
    if (txError && txError.code !== 'PGRST116') {
      console.error('Error fetching transaction:', txError);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Call Cashfree notify URL to sync status
    let notifyStatus;
    
    if (event === 'PAYMENT_SUCCESS') {
      notifyStatus = 'PAID';
      console.log('Payment success:', {
        order_id,
        amount: order_amount,
        payment_method: payment_method?.type || 'unknown'
      });
      
      // Also call the notify URL to ensure Cashfree is updated
      await callNotifyUrl(order_id, 'PAID');
      
      if (transaction) {
        // Update existing transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'PAID',
            payment_method: payment_method?.type || transaction.payment_method,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', order_id);
        
        if (updateError) {
          console.error('Error updating transaction:', updateError);
          return res.status(500).json({ error: 'Failed to update transaction' });
        }
      } else {
        // This should rarely happen - a webhook received without a transaction record
        // Extract user_id and metal_type from order_id if following aczen_userId_metalType format
        const orderIdParts = order_id.split('_');
        let user_id = null;
        let metal_type = 'unknown';
        
        if (orderIdParts.length >= 2) {
          user_id = orderIdParts[1];
          metal_type = orderIdParts.length >= 3 ? orderIdParts[2] : 'unknown';
        }
        
        if (user_id) {
          // Create a new transaction record
          const { error: insertError } = await supabase
            .from('transactions')
            .insert([{
              order_id,
              user_id,
              amount: parseFloat(order_amount),
              metal_type,
              status: 'PAID',
              payment_method: payment_method?.type || 'upi',
              created_at: new Date().toISOString()
            }]);
          
          if (insertError) {
            console.error('Error creating transaction from webhook:', insertError);
            return res.status(500).json({ error: 'Failed to create transaction' });
          }
        } else {
          console.error('Cannot determine user_id from order_id:', order_id);
          return res.status(400).json({ error: 'Invalid order_id format' });
        }
      }
      
      return res.status(200).json({ success: true, message: 'Payment recorded successfully' });
    }
    else if (event === 'PAYMENT_FAILED') {
      notifyStatus = 'FAILED';
      console.log('Payment failed:', data);
      
      // Call the notify URL to ensure Cashfree is updated
      await callNotifyUrl(order_id, 'FAILED');
      
      if (transaction) {
        // Update transaction to failed
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'FAILED',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', order_id);
        
        if (updateError) {
          console.error('Error updating failed transaction:', updateError);
          return res.status(500).json({ error: 'Failed to update transaction' });
        }
      }
      
      return res.status(200).json({ success: true, message: 'Payment failure recorded' });
    }
    else if (event === 'PAYMENT_USER_DROPPED') {
      notifyStatus = 'FAILED';
      console.log('Payment dropped by user:', data);
      
      // Call the notify URL to ensure Cashfree is updated
      await callNotifyUrl(order_id, 'FAILED');
      
      if (transaction) {
        // Update transaction to failed with user dropped reason
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'FAILED',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', order_id);
        
        if (updateError) {
          console.error('Error updating dropped transaction:', updateError);
          return res.status(500).json({ error: 'Failed to update transaction' });
        }
      }
      
      return res.status(200).json({ success: true, message: 'Payment drop recorded' });
    }
    else {
      // Other events - acknowledge receipt
      console.log('Other payment event received:', event);
      return res.status(200).json({ success: true, message: 'Event received' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 