require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const config = require('./config');
const { Cashfree } = require('cashfree-pg');

// Initialize Cashfree with v4 style 
try {
  // Set credentials
  Cashfree.XClientId = config.cashfree.appId;
  Cashfree.XClientSecret = config.cashfree.secretKey;

  // FORCE PRODUCTION ENVIRONMENT
  Cashfree.XEnvironment = 'PRODUCTION';
  
  // Create a custom axios instance for Cashfree
  const cashfreeAxios = axios.create({
    baseURL: 'https://api.cashfree.com/pg',
    headers: {
      'x-client-id': config.cashfree.appId,
      'x-client-secret': config.cashfree.secretKey,
      'x-api-version': config.cashfree.apiVersion,
      'Content-Type': 'application/json'
    }
  });
  
  // Override Cashfree's default axios with our configured one
  // This is a bit of a hack, but necessary to force the production URL
  if (Cashfree.axios) {
    Cashfree.axios = cashfreeAxios;
  }

  // Print debug information for verification
  console.log('Cashfree SDK initialized with:');
  console.log('Environment:', Cashfree.XEnvironment);
  console.log('App ID is configured:', !!Cashfree.XClientId);
  console.log('Secret Key is configured:', !!Cashfree.XClientSecret);
  console.log('Base URL will be:', 'https://api.cashfree.com/pg');
} catch (err) {
  console.error('Error initializing Cashfree SDK:', err);
}

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const paymentRoutes = require('./routes/payment');
const verificationRoutes = require('./routes/verification');

// Use routes
app.use('/api/payments', paymentRoutes);
app.use('/api', verificationRoutes);

// Add API endpoint matching exactly the Cashfree documentation example
app.post('/api/create-cashfree-order', async (req, res) => {
  try {
    console.log('Received order request:', JSON.stringify(req.body, null, 2));
    
    // Extract request data
    const { 
      orderAmount, 
      orderId = `order_${Date.now()}`, 
      customerDetails,
      orderMeta,
      orderNote,
      planType
    } = req.body;
    
    // Log the extracted values for debugging
    console.log('Extracted values:');
    console.log('- orderNote:', orderNote);
    console.log('- planType:', planType);
    
    // Validate required fields
    if (!orderAmount || !customerDetails || !customerDetails.customerPhone) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // Create the order note based on plan type or use provided order note
    const finalOrderNote = orderNote || 
      (planType ? `Customer selected ${planType.toUpperCase()} plan` : 'Standard order');
    
    console.log('Using order note:', finalOrderNote);

    // Create the request payload exactly as in the Cashfree documentation
    const request = {
      order_amount: parseFloat(orderAmount),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: customerDetails.customerId || `customer_${Date.now()}`,
        customer_name: customerDetails.customerName || "Customer",
        customer_email: customerDetails.customerEmail || "customer@example.com",
        customer_phone: customerDetails.customerPhone
      },
      order_meta: orderMeta || {
        return_url: "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
      },
      order_note: finalOrderNote
    };

    console.log('Creating order with Cashfree SDK:', JSON.stringify(request, null, 2));
    console.log('Using API version:', config.cashfree.apiVersion);

    // Use Cashfree SDK to create the order
    try {
      console.log('Using API version:', config.cashfree.apiVersion);
      
      // Try to use the SDK method first
      let response;
      try {
        // Using our patched PGCreateOrder method that we added above
        response = await Cashfree.PGCreateOrder(config.cashfree.apiVersion, request);
      } catch (sdkError) {
        console.warn('SDK method failed, trying direct API call:', sdkError.message);
        
        // If SDK method fails, use a direct API call
        response = await axios({
          method: 'post',
          url: 'https://api.cashfree.com/pg/orders',
          headers: {
            'x-client-id': config.cashfree.appId,
            'x-client-secret': config.cashfree.secretKey,
            'x-api-version': config.cashfree.apiVersion,
            'Content-Type': 'application/json'
          },
          data: request
        });
      }
      
      console.log('Order created successfully:', response.data);
      
      // Return exact response format - no wrapping in success/data fields
      res.status(200).json(response.data);
    } catch (sdkError) {
      console.error('Cashfree SDK error:', sdkError);
      
      // Extract and return error details
      const errorResponse = sdkError.response && sdkError.response.data 
        ? sdkError.response.data 
        : { message: sdkError.message || 'Failed to create order' };
      
      res.status(500).json(errorResponse);
    }
  } catch (error) {
    console.error('Error processing order request:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Home route - serves the index.html from public folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Cashfree Environment: ${config.cashfree.environment}`);
  console.log(`Visit http://localhost:${PORT} to test payment integration`);
}); 