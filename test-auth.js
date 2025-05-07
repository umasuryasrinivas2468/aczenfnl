import axios from 'axios';

// Cashfree API credentials from your config
const CASHFREE_CLIENT_ID = '850529145692c9f93773ed2c0a925058';
const CASHFREE_CLIENT_SECRET = 'cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01';
const CASHFREE_API_VERSION = '2022-09-01';

async function testAuth() {
  console.log('Testing Cashfree API authentication...');
  
  try {
    // Create a test order to check authentication
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
      'https://api.cashfree.com/pg/orders',
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
    
    console.log('Authentication successful!');
    console.log('Response status:', response.status);
    console.log('Order created:', response.data);
  } catch (error) {
    console.error('Authentication failed!');
    console.error('Response status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Error details:', error.response?.data);
  }
}

testAuth(); 