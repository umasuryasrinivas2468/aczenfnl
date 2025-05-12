const axios = require('axios');

// Cashfree API credentials from your server
const CASHFREE_CLIENT_ID = '850529145692c9f93773ed2c0a925058';
const CASHFREE_CLIENT_SECRET = 'cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01';
const CASHFREE_API_VERSION = '2022-09-01';

// Test both production and sandbox environments
async function testCashfreeCredentials() {
  console.log('Testing Cashfree API credentials...');
  
  const environments = [
    {
      name: 'Production',
      url: 'https://api.cashfree.com/pg'
    },
    {
      name: 'Sandbox',
      url: 'https://sandbox.cashfree.com/pg'
    }
  ];

  for (const env of environments) {
    console.log(`\nTesting ${env.name} environment (${env.url})`);
    
    try {
      // Create a simple test order
      const orderId = `test_order_${Date.now()}`;
      const orderData = {
        order_amount: 1,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: `test_customer_${Date.now()}`,
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '9876543210'
        },
        order_meta: {
          return_url: 'https://example.com/return?order_id={order_id}',
          notify_url: 'https://example.com/notify'
        }
      };
      
      const response = await axios.post(
        `${env.url}/orders`,
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
      
      console.log(`✅ ${env.name} API authentication successful!`);
      console.log('Order created with ID:', response.data.order_id);
      
    } catch (error) {
      console.error(`❌ ${env.name} API authentication failed:`, error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.log(`The credentials are not valid for ${env.name} environment.`);
      } else if (error.response?.status === 403) {
        console.log(`The credentials don't have permission for ${env.name} environment.`);
      }
    }
  }
}

testCashfreeCredentials().catch(err => {
  console.error('Test script error:', err);
}); 