import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

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
    
    if (event === 'PAYMENT_SUCCESS') {
      // Payment successful - update database
      const { order_id, payment_id, order_amount } = data;
      
      // Extract user_id and metal_type from order_id (assuming format like: user_123_gold_timestamp)
      const orderIdParts = order_id.split('_');
      const user_id = orderIdParts[1];
      const metal_type = orderIdParts[2];
      
      console.log('Payment success:', {
        order_id,
        user_id,
        metal_type,
        amount: order_amount
      });
      
      // Create the investment record in Supabase
      const { error } = await supabase
        .from('investments')
        .insert([{
          user_id,
          amount: parseFloat(order_amount),
          metal_type,
          created_at: new Date().toISOString(),
          payment_id
        }]);
      
      if (error) {
        console.error('Error recording investment:', error);
        return res.status(500).json({ error: 'Failed to record investment' });
      }
      
      return res.status(200).json({ success: true, message: 'Payment recorded successfully' });
    }
    else if (event === 'PAYMENT_FAILED') {
      // Handle failed payment - log for analysis
      console.log('Payment failed:', data);
      return res.status(200).json({ success: true, message: 'Payment failure logged' });
    }
    else {
      // Other events - acknowledge receipt
      return res.status(200).json({ success: true, message: 'Event received' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 