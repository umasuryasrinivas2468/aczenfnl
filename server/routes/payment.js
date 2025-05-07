const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();
const config = require('../config');
const { validateWebhookSignature, processWebhookEvent } = require('../middleware/cashfreeWebhook');
const { Cashfree } = require('cashfree-pg');

// Initialize Cashfree with v4 style 
try {
  // Set credentials (these should be the same as in index.js, but we set them again for safety)
  Cashfree.XClientId = config.cashfree.appId;
  Cashfree.XClientSecret = config.cashfree.secretKey;
  
  // FORCE PRODUCTION ENVIRONMENT
  Cashfree.XEnvironment = 'PRODUCTION';

  console.log('Cashfree SDK initialized in payment routes with:');
  console.log('Environment:', Cashfree.XEnvironment);
  console.log('App ID is configured:', !!Cashfree.XClientId);
  console.log('Secret Key is configured:', !!Cashfree.XClientSecret);
  console.log('Base URL will be:', 'https://api.cashfree.com/pg');
} catch (err) {
  console.error('Error initializing Cashfree SDK in payment routes:', err);
}

// Environment variables for Cashfree
const APP_ID = config.cashfree.appId;
const SECRET_KEY = config.cashfree.secretKey;
const API_VERSION = config.cashfree.apiVersion;
const BASE_URL = config.cashfree.baseUrl;
const ENV = config.cashfree.environment;

// Debug logging
console.log('Cashfree Configuration:', {
  APP_ID: APP_ID || 'Not set',
  SECRET_KEY: SECRET_KEY ? 'Is set (hidden for security)' : 'Not set',
  API_VERSION,
  BASE_URL,
  ENV
});
console.log('Environment Variables:', {
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || 'Not set',
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY ? 'Is set (hidden for security)' : 'Not set',
  CASHFREE_API_VERSION: process.env.CASHFREE_API_VERSION || 'Not set',
  CASHFREE_ENV: process.env.CASHFREE_ENV || 'Not set'
});

/**
 * Create Order API - this endpoint will create a new order on Cashfree using the SDK
 * POST /api/payments/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { 
      amount, 
      customerName, 
      customerPhone, 
      customerEmail,
      orderId = `order_${Date.now()}`,
      frontendDomain,
      returnUrl
    } = req.body;

    // Validate required fields
    if (!amount || !customerPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and customer phone are required' 
      });
    }

    // Validate Cashfree credentials
    if (!APP_ID || !SECRET_KEY) {
      console.error('Cashfree credentials missing:', { 
        APP_ID: APP_ID || 'Not set',
        SECRET_KEY: SECRET_KEY ? 'Is set (hidden)' : 'Not set',
        ENV
      });
      
      return res.status(500).json({
        success: false,
        message: 'Cashfree credentials not configured',
        debug: {
          APP_ID: APP_ID ? 'Set' : 'Not set',
          SECRET_KEY: SECRET_KEY ? 'Set' : 'Not set',
          ENV
        }
      });
    }

    // For production environment, we need to use HTTPS URLs
    // Cashfree will reject HTTP URLs in production
    
    // Use the frontendDomain if provided, otherwise fall back to a default
    const domain = frontendDomain || 'https://your-secure-domain.com';
    
    // Ensure the domain is HTTPS
    const secureDomain = domain.startsWith('https://') ? domain : `https://${domain}`;
    
    // Create return and webhook URLs
    const secureReturnUrl = returnUrl && returnUrl.startsWith('https://') 
      ? returnUrl 
      : `${secureDomain}/payment-success?order_id={order_id}`;
    
    const webhookUrl = `${secureDomain}/api/payments/webhook`;
    
    console.log('Using secure URLs for Cashfree:', {
      returnUrl: secureReturnUrl,
      webhookUrl: webhookUrl
    });

    // Create the request object in Cashfree format
    const cashfreeRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerName || "Customer",
        customer_email: customerEmail || "customer@example.com",
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: secureReturnUrl,
        notify_url: webhookUrl,
      }
    };

    console.log('Creating order with Cashfree SDK:', JSON.stringify(cashfreeRequest, null, 2));

    // Using the Cashfree SDK to create the order
    try {
      // First try with the SDK method
      let response;
      try {
        response = await Cashfree.PGCreateOrder(API_VERSION, cashfreeRequest);
      } catch (sdkError) {
        console.warn('SDK method failed, trying direct API call:', sdkError.message);
        
        // If SDK method fails, use a direct API call
        response = await axios({
          method: 'post',
          url: 'https://api.cashfree.com/pg/orders',
          headers: {
            'x-client-id': APP_ID,
            'x-client-secret': SECRET_KEY,
            'x-api-version': API_VERSION,
            'Content-Type': 'application/json'
          },
          data: cashfreeRequest
        });
      }
      
      console.log('Order created successfully with SDK:', response.data);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: response.data
      });
    } catch (sdkError) {
      console.error('Cashfree SDK error:', sdkError);
      
      // Handle specific error details from SDK
      const errorDetails = sdkError.response && sdkError.response.data 
        ? sdkError.response.data 
        : { message: sdkError.message };
      
      res.status(500).json({
        success: false,
        message: 'Failed to create order with Cashfree SDK',
        error: errorDetails
      });
    }
  } catch (error) {
    console.error('Error creating order:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.response ? error.response.data : error.message,
    });
  }
});

/**
 * Get Order Details - fetch details of an order
 * GET /api/payments/order/:orderId
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Using Cashfree SDK to fetch order details
    try {
      // Using our patched PGFetchOrder method
      const response = await Cashfree.PGFetchOrder(API_VERSION, orderId);
      
      res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (sdkError) {
      console.error('Error fetching order with SDK:', sdkError);
      
      const errorDetails = sdkError.response && sdkError.response.data 
        ? sdkError.response.data 
        : { message: sdkError.message };
        
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order details with SDK',
        error: errorDetails
      });
    }
  } catch (error) {
    console.error('Error fetching order:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.response ? error.response.data : error.message,
    });
  }
});

/**
 * Get Payment Details for an Order
 * GET /api/payments/order-payments/:orderId
 */
router.get('/order-payments/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Using Cashfree SDK to fetch payment details
    try {
      // Using our patched PGFetchOrderPayments method
      const response = await Cashfree.PGFetchOrderPayments(API_VERSION, orderId);
      
      res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (sdkError) {
      console.error('Error fetching payment details with SDK:', sdkError);
      
      const errorDetails = sdkError.response && sdkError.response.data 
        ? sdkError.response.data 
        : { message: sdkError.message };
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details with SDK',
        error: errorDetails
      });
    }
  } catch (error) {
    console.error('Error fetching payment details:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.response ? error.response.data : error.message,
    });
  }
});

/**
 * Payment Success callback handler
 * GET /api/payments/payment-success
 */
router.get('/payment-success', (req, res) => {
  // This endpoint will be called by Cashfree after payment completion
  // You can redirect user to your frontend from here
  const orderId = req.query.order_id;
  
  res.send(`
    <html>
      <head>
        <title>Payment Status</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; margin-top: 50px; background-color: #f9f9f9; }
          .container { background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 30px; max-width: 500px; margin: 0 auto; }
          .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
          .order { margin-bottom: 20px; font-size: 18px; color: #333; }
          .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; font-weight: 600; }
          .button:hover { background-color: #45a049; }
          img.checkmark { width: 80px; height: 80px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://www.svgrepo.com/show/13650/success.svg" alt="Success" class="checkmark">
          <div class="success">Payment Processed!</div>
          <div class="order">Order ID: ${orderId}</div>
          <p>We are verifying your payment. You will be redirected to your account shortly.</p>
          <a href="/" class="button">Return to Home</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * Webhook handler for payment notifications
 * POST /api/payments/webhook
 */
router.post('/webhook', validateWebhookSignature, (req, res) => {
  try {
    const event = req.body;
    console.log('Received webhook event:', JSON.stringify(event, null, 2));
    
    // Process the webhook event
    const processedEvent = processWebhookEvent(event);
    console.log('Processed webhook event:', processedEvent);
    
    // Here you would typically update your database with the payment status
    // For example:
    // await updateOrderStatus(processedEvent.orderId, processedEvent.status);
    
    res.status(200).json({ 
      status: 'Webhook received and processed',
      processed: processedEvent
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router; 