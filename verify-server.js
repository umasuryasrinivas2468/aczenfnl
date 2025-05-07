const fetch = require('node-fetch');

// Server URL
const SERVER_URL = 'https://aczenfnl.onrender.com/';

async function testServer() {
  console.log('Testing Cashfree Payment Server...');
  
  try {
    // Test 1: Basic Server Connectivity
    console.log('\n1. Testing basic server connectivity...');
    const rootResponse = await fetch(SERVER_URL);
    
    if (rootResponse.ok) {
      const data = await rootResponse.json();
      console.log('✅ Server is running!');
      console.log('Server response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Server is not responding correctly. Status:', rootResponse.status);
      console.error('Make sure the server is running with: cd server && npm run dev');
      return;
    }
    
    // Test 2: Create Order Endpoint
    console.log('\n2. Testing order creation endpoint...');
    const orderData = {
      orderAmount: 100,
      orderId: `test_order_${Date.now()}`,
      customerDetails: {
        customerId: `test_customer_${Date.now()}`,
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '9876543210'
      }
    };
    
    const orderResponse = await fetch(`${SERVER_URL}/api/create-cashfree-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (orderResponse.ok) {
      const orderResult = await orderResponse.json();
      console.log('✅ Order created successfully!');
      console.log('Order ID:', orderResult.order_id);
      
      // Test 3: Generate Payment Token
      console.log('\n3. Testing payment token generation...');
      const tokenResponse = await fetch(`${SERVER_URL}/api/create-payment-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderResult.order_id })
      });
      
      if (tokenResponse.ok) {
        const tokenResult = await tokenResponse.json();
        console.log('✅ Payment token generated successfully!');
        console.log('Payment Link:', tokenResult.payment_link);
      } else {
        const tokenError = await tokenResponse.text();
        console.error('❌ Failed to generate payment token. Status:', tokenResponse.status);
        console.error('Error:', tokenError);
      }
    } else {
      const orderError = await orderResponse.text();
      console.error('❌ Failed to create order. Status:', orderResponse.status);
      console.error('Error:', orderError);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Make sure the server is running at', SERVER_URL);
  }
}

testServer(); 