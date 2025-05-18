import axios from 'axios';

// Cashfree API credentials
const CASHFREE_API_KEY = process.env.CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
const CASHFREE_API_BASE = "https://api.cashfree.com/pg";

/**
 * Get payments for an order from Cashfree
 */
export default async function handler(req, res) {
  // Only allow GET for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    console.log(`Fetching payments for order: ${orderId}`);
    
    // Make API call to Cashfree
    const response = await axios.get(`${CASHFREE_API_BASE}/orders/${orderId}/payments`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_API_KEY,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Return the payments data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching payments:', error.response?.data || error.message);
    
    // For demo purposes, if API fails, return empty payments array
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Returning empty payments array for demo purposes');
      return res.status(200).json([]);
    }
    
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch payments',
      message: error.response?.data?.message || error.message
    });
  }
} 