/**
 * Cashfree Integration Test
 * 
 * This file contains tests for the Cashfree payment gateway integration.
 * Run with Node.js: node test/cashfree-test.js
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');

// Constants for testing
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const APP_ID = config.cashfree.appId || process.env.CASHFREE_APP_ID;
const SECRET_KEY = config.cashfree.secretKey || process.env.CASHFREE_SECRET_KEY;
const API_VERSION = config.cashfree.apiVersion || process.env.CASHFREE_API_VERSION || '2022-09-01';
const CASHFREE_URL = config.cashfree.baseUrl || 'https://sandbox.cashfree.com/pg';

// Test data
const testOrder = {
  amount: '100',
  customerName: 'Test User',
  customerPhone: '9999999999',
  customerEmail: 'test@example.com',
  orderId: `test_order_${Date.now()}`,
};

// Color for console logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.magenta}===== CASHFREE INTEGRATION TEST =====\n${colors.reset}`);
  console.log(`${colors.blue}Testing environment: ${config.cashfree.environment}${colors.reset}`);
  console.log(`${colors.blue}API URL: ${CASHFREE_URL}${colors.reset}`);
  console.log(`${colors.blue}Server URL: ${BASE_URL}\n${colors.reset}`);
  
  try {
    // Check if API credentials are configured
    if (!APP_ID || !SECRET_KEY) {
      console.log(`${colors.red}❌ ERROR: Cashfree credentials not configured${colors.reset}`);
      console.log(`${colors.yellow}Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in your .env file${colors.reset}`);
      return;
    }
    
    // Test 1: Server connectivity
    await testServerConnectivity();
    
    // Test 2: Create Order
    const orderResult = await testCreateOrder();
    if (!orderResult.success) return;
    
    // Test 3: Get Order Details
    await testGetOrder(orderResult.orderId);
    
    // Test 4: Simulate Webhook
    await testSimulateWebhook(orderResult.orderId);
    
    console.log(`\n${colors.green}✅ All tests completed successfully!${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Test failed with error:${colors.reset}`);
    console.error(error.message || error);
    
    if (error.response) {
      console.log(`${colors.red}Status:${colors.reset}`, error.response.status);
      console.log(`${colors.red}Response data:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

/**
 * Test server connectivity
 */
async function testServerConnectivity() {
  try {
    console.log(`${colors.cyan}Testing server connectivity...${colors.reset}`);
    const response = await axios.get(BASE_URL);
    console.log(`${colors.green}✅ Server is running${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Failed to connect to server at ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}Make sure your server is running${colors.reset}`);
    throw new Error('Server connectivity test failed');
  }
}

/**
 * Test create order endpoint
 */
async function testCreateOrder() {
  try {
    console.log(`${colors.cyan}Testing create order endpoint...${colors.reset}`);
    
    const response = await axios.post(`${BASE_URL}/api/payments/create-order`, testOrder);
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ Order created successfully${colors.reset}`);
      console.log(`${colors.blue}Order ID:${colors.reset}`, response.data.data.order_id);
      console.log(`${colors.blue}Payment Session ID:${colors.reset}`, response.data.data.payment_session_id);
      
      return {
        success: true,
        orderId: response.data.data.order_id,
        paymentSessionId: response.data.data.payment_session_id
      };
    } else {
      console.log(`${colors.red}❌ Failed to create order${colors.reset}`);
      console.log(response.data);
      return { success: false };
    }
  } catch (error) {
    console.log(`${colors.red}❌ Failed to create order${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response data:`, error.response.data);
    } else {
      console.log(error.message);
    }
    return { success: false };
  }
}

/**
 * Test get order endpoint
 */
async function testGetOrder(orderId) {
  try {
    console.log(`\n${colors.cyan}Testing get order endpoint...${colors.reset}`);
    
    const response = await axios.get(`${BASE_URL}/api/payments/order/${orderId}`);
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ Order details retrieved successfully${colors.reset}`);
      console.log(`${colors.blue}Order Status:${colors.reset}`, response.data.data.order_status);
      return true;
    } else {
      console.log(`${colors.red}❌ Failed to get order details${colors.reset}`);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Failed to get order details${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response data:`, error.response.data);
    } else {
      console.log(error.message);
    }
    return false;
  }
}

/**
 * Test webhook functionality by simulating a webhook event
 */
async function testSimulateWebhook(orderId) {
  try {
    console.log(`\n${colors.cyan}Testing webhook processing...${colors.reset}`);
    
    // Create a mock webhook event
    const webhookEvent = {
      event_time: new Date().toISOString(),
      event_type: 'PAYMENT_SUCCESS',
      data: {
        order_id: orderId,
        order_amount: testOrder.amount,
        order_currency: 'INR',
        payment_id: `pay_test_${Date.now()}`,
        payment_status: 'SUCCESS',
        payment_message: 'Transaction successful',
        payment_method: 'card',
        payment_time: new Date().toISOString()
      }
    };
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(JSON.stringify(webhookEvent));
    const signature = hmac.digest('hex');
    
    // Send webhook request
    const response = await axios.post(
      `${BASE_URL}/api/payments/webhook`, 
      webhookEvent,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature
        }
      }
    );
    
    if (response.status === 200) {
      console.log(`${colors.green}✅ Webhook processed successfully${colors.reset}`);
      console.log(`${colors.blue}Webhook Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log(`${colors.red}❌ Failed to process webhook${colors.reset}`);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Failed to process webhook${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response data:`, error.response.data);
    } else {
      console.log(error.message);
    }
    return false;
  }
}

// Run the tests
runTests().catch(console.error); 