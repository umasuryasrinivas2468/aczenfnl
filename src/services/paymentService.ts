import axios from 'axios';

// API credentials - normally would be stored in environment variables
const API_KEY = "850529145692c9f93773ed2c0a925058";
const API_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

// Cashfree SDK interface
declare global {
  interface Window {
    Cashfree: any;
    cashfree: any;
  }
}

// Function to initialize Cashfree SDK
export const initializeCashfreeSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Cashfree) {
      const cashfree = window.Cashfree({
        mode: "production"
      });
      window.cashfree = cashfree;
      resolve(cashfree);
    } else {
      // If SDK is not loaded, attempt to load it
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.onload = () => {
          const cashfree = window.Cashfree({
            mode: "production"
          });
          window.cashfree = cashfree;
          resolve(cashfree);
        };
        script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
        document.body.appendChild(script);
      } else {
        reject(new Error('Cannot load Cashfree SDK in a non-browser environment'));
      }
    }
  });
};

// Function to generate a unique order ID
export const generateOrderId = () => {
  return `aczen_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Function to create an order through our proxy
export const createOrder = async (
  amount: number, 
  customerDetails: {
    customerId: string;
    customerPhone: string;
    customerName?: string;
    customerEmail?: string;
  },
  orderNote?: string
) => {
  const orderId = generateOrderId();
  
  const payload = {
    "order_amount": amount,
    "order_currency": "INR",
    "order_id": orderId,
    "customer_details": {
      "customer_id": customerDetails.customerId,
      "customer_phone": customerDetails.customerPhone,
      "customer_name": customerDetails.customerName || "",
      "customer_email": customerDetails.customerEmail || ""
    },
    "order_meta": {
      "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
    }
  };

  // Add order note if provided
  if (orderNote) {
    payload["order_note"] = orderNote;
  }

  // Define API URL - use the proxy for both development and production
  const API_URL = '/api/cashfree/pg/orders';

  try {
    // Make API call
    const response = await axios.post(API_URL, payload, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the response for debugging
    console.log("Cashfree API response:", response.data);
    
    // Extract order details
    const orderDetails = {
      order_id: response.data.order_id || response.data.cf_order_id || orderId,
      payment_session_id: response.data.payment_session_id || response.data.order_token,
      order_status: response.data.order_status || "ACTIVE",
      order_amount: response.data.order_amount || amount
    };
    
    // Immediately fetch payments for this order (for testing/verification)
    try {
      console.log("Fetching initial payments data for new order:", orderDetails.order_id);
      const paymentsData = await fetchOrderPayments(orderDetails.order_id);
      console.log("Initial payments data:", paymentsData);
      
      // Include payments data in the response
      return {
        ...orderDetails,
        payments: paymentsData
      };
    } catch (paymentError) {
      console.warn("Could not fetch initial payments data:", paymentError.message);
      // Continue with the order creation process even if payment fetch fails
      return orderDetails;
    }
  } catch (error: any) {
    console.error('Error creating order:', error.response ? error.response.data : error);
    
    // For demo purposes, if API fails, create a mock payment session
    // This is just to demonstrate the flow - remove in production
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock payment session for demonstration');
      const mockOrderDetails = {
        order_id: orderId,
        payment_session_id: "demo_session_" + orderId,
        order_status: "ACTIVE",
        order_amount: amount
      };
      
      // Even for mock orders, try to fetch payments to test the flow
      try {
        const mockPayments = await fetchOrderPayments(orderId);
        return {
          ...mockOrderDetails,
          payments: mockPayments
        };
      } catch (mockPaymentError) {
        console.warn("Mock payment fetch failed:", mockPaymentError.message);
        return mockOrderDetails;
      }
    }
    
    throw error;
  }
};

// Function to fetch payments for an order using the Cashfree SDK
export const fetchOrderPayments = async (orderId: string) => {
  try {
    // For browser SDK, we need to use REST API instead as the browser SDK doesn't have PGOrderFetchPayments
    // Define API URL - use the proxy for consistency with order creation
    const API_URL = `/api/cashfree/pg/orders/${orderId}/payments`;

    // Make API call
    const response = await axios.get(API_URL, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the response for debugging
    console.log("Cashfree payments fetch response:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payments:', 
      error.response ? error.response.data : error.message);
    throw error;
  }
};

// Test function to call right after clicking Pay Now
export const testFetchPayments = async (orderId: string) => {
  console.log("Testing payment fetch for order:", orderId);
  
  try {
    // Wait a brief moment to simulate order creation in Cashfree system
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch payments (likely will show pending or no payments yet)
    console.log("Fetching payments immediately after Pay Now click:");
    const paymentsData = await fetchOrderPayments(orderId);
    console.log("Initial payments data:", paymentsData);
    
    // For testing: Set up a few intervals to check again after short delays
    // This helps see the payment status updates as they happen
    const checkIntervals = [2000, 5000, 10000]; // 2s, 5s, 10s
    
    checkIntervals.forEach(interval => {
      setTimeout(async () => {
        try {
          console.log(`Checking payments after ${interval/1000}s wait:`);
          const updatedPayments = await fetchOrderPayments(orderId);
          console.log(`Payments data after ${interval/1000}s:`, updatedPayments);
        } catch (err) {
          console.error(`Error checking payments after ${interval/1000}s:`, err);
        }
      }, interval);
    });
    
    return paymentsData;
  } catch (error) {
    console.error("Error in test payment fetch:", error);
    throw error;
  }
};

// Types for transaction history
export interface TransactionDetails {
  orderId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  date: Date;
  paymentId?: string;
  paymentMethod?: string;
  customerDetails?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  failureReason?: string;
}

// Function to process payment data for transaction history
export const getTransactionDetails = async (orderId: string): Promise<TransactionDetails> => {
  try {
    // Fetch payment data for the order
    const paymentData = await fetchOrderPayments(orderId);
    
    // Create base transaction details
    const transactionDetails: TransactionDetails = {
      orderId: orderId,
      amount: 0,
      status: 'PENDING',
      date: new Date(),
    };
    
    // Check if payment data exists and is not empty
    if (!paymentData || 
        (Array.isArray(paymentData) && paymentData.length === 0) || 
        Object.keys(paymentData).length === 0) {
      // If no payment data or empty array response, mark as failure
      transactionDetails.status = 'FAILURE';
      transactionDetails.failureReason = 'No payment data found';
      return transactionDetails;
    }
    
    // Convert to array if not already
    const transactions = Array.isArray(paymentData) ? paymentData : [paymentData];
    
    // Apply exact status logic from user's code
    if (transactions.filter(tx => tx.payment_status === "SUCCESS").length > 0) {
      // If any transaction is SUCCESS, mark as success
      transactionDetails.status = 'SUCCESS';
      
      // Find the successful transaction to get details
      const successTx = transactions.find(tx => tx.payment_status === "SUCCESS");
      if (successTx) {
        transactionDetails.amount = successTx.payment_amount || 0;
        transactionDetails.paymentId = successTx.cf_payment_id || successTx.payment_id;
        transactionDetails.paymentMethod = successTx.payment_method?.type || 'Unknown';
        
        // Add customer details if available
        if (successTx.customer_details) {
          transactionDetails.customerDetails = {
            name: successTx.customer_details.customer_name,
            phone: successTx.customer_details.customer_phone,
            email: successTx.customer_details.customer_email
          };
        }
      }
    } else if (transactions.filter(tx => tx.payment_status === "PENDING").length > 0) {
      // If any transaction is PENDING (and none are SUCCESS), mark as pending
      transactionDetails.status = 'PENDING';
      
      // Find a pending transaction to get details
      const pendingTx = transactions.find(tx => tx.payment_status === "PENDING");
      if (pendingTx) {
        transactionDetails.amount = pendingTx.payment_amount || 0;
        transactionDetails.paymentId = pendingTx.cf_payment_id || pendingTx.payment_id;
      }
    } else {
      // If no SUCCESS or PENDING transactions, mark as failure
      transactionDetails.status = 'FAILURE';
      
      // Find a transaction to get details and failure reason
      if (transactions.length > 0) {
        const latestTx = transactions[0];
        transactionDetails.amount = latestTx.payment_amount || 0;
        transactionDetails.paymentId = latestTx.cf_payment_id || latestTx.payment_id;
        transactionDetails.failureReason = latestTx.payment_message || 'Payment not successful';
      } else {
        transactionDetails.failureReason = 'No successful or pending payments found';
      }
    }
    
    // Log the determined status for debugging
    console.log(`Order ${orderId} status determined as: ${transactionDetails.status}`);
    
    return transactionDetails;
  } catch (error) {
    console.error('Error processing transaction details:', error);
    // Return basic failure transaction
    return {
      orderId: orderId,
      amount: 0,
      status: 'FAILURE',
      date: new Date(),
      failureReason: 'Error fetching transaction data'
    };
  }
}; 