import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cashfree API credentials
const CASHFREE_API_KEY = process.env.CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

/**
 * Verify Cashfree webhook signature
 */
function verifyWebhookSignature(payload, signature, timestamp) {
  try {
    // Create the data string that was used to generate the signature
    const data = payload + CASHFREE_SECRET_KEY + timestamp;
    
    // Generate a signature using the data and your secret key
    const computedSignature = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(data)
      .digest('base64');
    
    // Compare the computed signature with the received signature
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Calculate metal weight based on amount and price
 */
async function calculateMetalWeight(metalType, amount) {
  try {
    // Try to get latest metal price from database
    const { data, error } = await supabase
      .from('metal_prices')
      .select('price_per_gram')
      .eq('type', metalType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      // Fallback to default prices if database query fails
      const defaultPrices = {
        gold: 5500,
        silver: 70
      };
      return amount / defaultPrices[metalType];
    }
    
    // Calculate weight using price from database
    return amount / data.price_per_gram;
  } catch (error) {
    console.error('Error calculating metal weight:', error);
    // Fallback to default calculation
    const defaultPrice = metalType === 'gold' ? 5500 : 70;
    return amount / defaultPrice;
  }
}

/**
 * Update investment totals
 */
async function updateInvestment(userId, orderId, amount, metalType) {
  try {
    console.log(`Updating investment for user ${userId}, amount ${amount}, metal ${metalType}`);
    
    // Calculate weight based on current price
    const weight = await calculateMetalWeight(metalType, amount);
    
    // Check if investment record exists
    const { data: investmentData, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .eq('metal_type', metalType)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching investment:', fetchError);
    }
    
    if (investmentData) {
      // Update existing investment
      const { error: updateError } = await supabase
        .from('investments')
        .update({
          amount: investmentData.amount + amount,
          weight_in_grams: (investmentData.weight_in_grams || 0) + weight,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentData.id);
      
      if (updateError) {
        console.error('Error updating investment:', updateError);
      } else {
        console.log('Successfully updated investment record');
      }
    } else {
      // Create new investment record
      const { error: insertError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          metal_type: metalType,
          amount: amount,
          weight_in_grams: weight,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating investment:', insertError);
      } else {
        console.log('Successfully created new investment record');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating investment:', error);
    return false;
  }
}

/**
 * Cashfree webhook handler
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Received Cashfree webhook:', JSON.stringify(req.body, null, 2));
    
    // Get webhook signature and timestamp from headers
    const signature = req.headers['x-webhook-signature'] || '';
    const timestamp = req.headers['x-webhook-timestamp'] || '';
    
    // Skip signature verification in development environments
    const isProduction = process.env.NODE_ENV === 'production';
    const payloadString = JSON.stringify(req.body);
    
    // Verify webhook signature in production
    if (isProduction && (!signature || !timestamp || !verifyWebhookSignature(payloadString, signature, timestamp))) {
      console.error('Invalid webhook signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }
    
    // Extract data from webhook payload
    const { 
      data: {
        order: {
          order_id: orderId,
          order_amount: amount,
          order_status: orderStatus,
          order_tags: orderTags
        },
        payment: {
          cf_payment_id: paymentId,
          payment_status: paymentStatus
        }
      },
      event_time: eventTime
    } = req.body;
    
    // Extract user ID and metal type from order tags
    const userId = orderTags?.user_id;
    const metalType = orderTags?.metal_type || 'gold';
    
    if (!orderId || !paymentStatus) {
      console.error('Missing required webhook parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Processing webhook for order ${orderId}, status: ${paymentStatus}`);
    
    // Map Cashfree status to our internal status
    let internalStatus;
    if (paymentStatus === 'SUCCESS') {
      internalStatus = 'completed';
    } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentStatus)) {
      internalStatus = 'failed';
    } else {
      internalStatus = 'pending';
    }
    
    // Update transaction in Supabase
    const { error: txError } = await supabase
      .from('transactions')
      .update({
        status: internalStatus,
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
        transaction_details: req.body
      })
      .eq('order_id', orderId);
    
    if (txError) {
      console.error('Error updating transaction:', txError);
    } else {
      console.log(`Updated transaction status to ${internalStatus}`);
    }
    
    // If payment is successful, update investment totals
    if (internalStatus === 'completed' && userId) {
      await updateInvestment(userId, orderId, parseFloat(amount), metalType);
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: `Webhook processed, status: ${internalStatus}` 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return 200 to acknowledge receipt (to prevent Cashfree from retrying)
    return res.status(200).json({ 
      success: false, 
      message: 'Error processing webhook' 
    });
  }
} 