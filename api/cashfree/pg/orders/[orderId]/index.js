import axios from 'axios';

// Cashfree API credentials
const CASHFREE_API_KEY = process.env.CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
const CASHFREE_API_BASE = "https://api.cashfree.com/pg";

/**
 * Determines payment status from Cashfree order response
 * @param orderResponse Response from Get Order API
 * @returns Simplified payment status (Success, Pending, or Failure)
 */
const determinePaymentStatus = (orderResponse) => {
  // If the response is not an array, convert it to one
  const transactions = Array.isArray(orderResponse) ? orderResponse : [orderResponse];
  
  // Check if any transaction has SUCCESS status
  if (transactions.filter(tx => 
    tx.payment_status === "SUCCESS" || 
    tx.order_status === "PAID" || 
    tx.status === "PAID" ||
    tx.status === "SUCCESS").length > 0) {
    return "Success";
  } 
  // Check if any transaction has PENDING status
  else if (transactions.filter(tx => 
    tx.payment_status === "PENDING" || 
    tx.order_status === "ACTIVE" || 
    tx.status === "PENDING").length > 0) {
    return "Pending";
  } 
  // Default to Failure if no Success or Pending status is found
  else {
    return "Failure";
  }
};

/**
 * Get order details and payments from Cashfree
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
    
    console.log(`Fetching order details for: ${orderId}`);
    
    // First, get the order details
    const orderResponse = await axios.get(`${CASHFREE_API_BASE}/orders/${orderId}`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_API_KEY,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const orderData = orderResponse.data;
    
    // Then get all payments for this order
    let paymentsData = [];
    try {
      const paymentsResponse = await axios.get(`${CASHFREE_API_BASE}/orders/${orderId}/payments`, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_API_KEY,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      paymentsData = paymentsResponse.data || [];
    } catch (paymentsError) {
      console.error('Error fetching payments:', paymentsError.message);
      // Continue without payments data if it fails
    }
    
    // Combine order data with payment data for verification
    const verificationData = [
      { order_status: orderData.order_status },
      ...paymentsData.map(payment => ({ payment_status: payment.payment_status }))
    ];
    
    // Determine the status using the verification util
    const paymentStatus = determinePaymentStatus(verificationData);
    
    // Add payment status and payments to the response
    const responseData = {
      ...orderData,
      payment_status: paymentStatus,
      payments: paymentsData,
      verified_status: paymentStatus
    };
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching order:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch order details',
      message: error.response?.data?.message || error.message
    });
  }
} 