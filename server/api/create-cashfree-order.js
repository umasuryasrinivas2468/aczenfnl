// Import required modules
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();

// Cashfree API configuration - Using production credentials
const CASHFREE_CLIENT_ID = '850529145692c9f93773ed2c0a925058';
const CASHFREE_CLIENT_SECRET = 'cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01';
const CASHFREE_API_VERSION = '2023-08-01'; // Current API version
const CASHFREE_ENVIRONMENT = 'https://api.cashfree.com'; // Production environment URL

// Create a Cashfree order
router.post('/create-cashfree-order', async (req, res) => {
  try {
    const { orderAmount, orderId, customerDetails } = req.body;

    if (!orderAmount || !orderId || !customerDetails) {
      return res.status(400).json({ 
        error: 'Missing required parameters: orderAmount, orderId, or customerDetails' 
      });
    }

    // Basic validation
    if (!customerDetails.customerId || !customerDetails.customerEmail || !customerDetails.customerPhone) {
      return res.status(400).json({ 
        error: 'Customer details incomplete' 
      });
    }

    // Create order request body
    const orderData = {
      order_amount: orderAmount,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_name: customerDetails.customerName || 'Customer',
        customer_email: customerDetails.customerEmail,
        customer_phone: customerDetails.customerPhone
      },
      order_meta: {
        return_url: `${req.headers.origin || 'https://wealth-horizon-bloom.com'}/payment-status?order_id={order_id}`,
        notify_url: `${req.headers.origin || 'https://wealth-horizon-bloom.com'}/api/cashfree-webhook`
      }
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    // Make API request to Cashfree
    const response = await axios.post(
      `${CASHFREE_ENVIRONMENT}/pg/orders`,
      orderData,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-version': CASHFREE_API_VERSION,
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET
        }
      }
    );

    console.log('Cashfree API response:', response.data);

    // Send response back to client
    return res.status(201).json({
      order_id: response.data.order_id,
      payment_session_id: response.data.payment_session_id
    });

  } catch (error) {
    console.error('Cashfree order creation error:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to create payment order'
    });
  }
});

// Verify payment status
router.get('/payment-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(
      `${CASHFREE_ENVIRONMENT}/pg/orders/${orderId}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-version': CASHFREE_API_VERSION,
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Payment status check error:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to check payment status'
    });
  }
});

// Handle Cashfree webhook notifications
router.post('/cashfree-webhook', (req, res) => {
  try {
    // Get the webhook signature from header
    const cashfreeSignature = req.headers['x-webhook-signature'];
    
    if (!cashfreeSignature) {
      console.error('Webhook signature missing');
      return res.status(400).send('Signature verification failed');
    }
    
    // Get the webhook payload
    const webhookBody = req.body;
    const webhookTimestamp = req.headers['x-webhook-timestamp'] || '';
    
    // Convert webhook body to string
    const webhookBodyString = JSON.stringify(webhookBody);
    
    // Log webhook payload for debugging
    console.log('Cashfree webhook received:', webhookBodyString);
    console.log('Webhook timestamp:', webhookTimestamp);
    
    // Verify webhook signature
    // Format: HMAC-SHA256(webhook_client_secret, timestamp + webhook payload)
    const data = webhookTimestamp + webhookBodyString;
    const computedSignature = crypto
      .createHmac('sha256', CASHFREE_CLIENT_SECRET)
      .update(data)
      .digest('base64');
    
    const isSignatureValid = cashfreeSignature === computedSignature;
    
    if (!isSignatureValid) {
      console.error('Webhook signature verification failed');
      return res.status(400).send('Signature verification failed');
    }
    
    // Process the webhook based on event type
    const event = webhookBody.data;
    const eventType = webhookBody.event_type;
    const orderId = event.order?.order_id;
    
    console.log(`Processing ${eventType} event for order: ${orderId}`);
    
    // Handle different event types
    switch (eventType) {
      case 'ORDER_PAID':
        // Handle successful payment
        console.log(`Payment successful for order ${orderId}`);
        // Here you would update your database to mark the order as paid
        break;
        
      case 'PAYMENT_FAILED':
        // Handle failed payment
        console.log(`Payment failed for order ${orderId}`);
        // Here you would update your database to mark the payment as failed
        break;
        
      case 'PAYMENT_USER_DROPPED':
        // Handle user dropped from payment flow
        console.log(`User dropped from payment flow for order ${orderId}`);
        // Here you would update your database accordingly
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    // Always return 200 to acknowledge receipt
    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router; 