import axios from 'axios';
import { determinePaymentStatus, mapProviderStatusToInternal } from '@/utils/paymentVerificationUtil';

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
    console.log(`Fetching transaction details for order: ${orderId}`);
    
    // Define API URL - use the proxy for consistency with order creation
    const API_URL = `/api/cashfree/pg/orders/${orderId}`;
    
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
    console.log("Transaction details response:", response.data);
    
    // Get payments for this order
    let paymentsData;
    try {
      const paymentsResponse = await fetchOrderPayments(orderId);
      paymentsData = Array.isArray(paymentsResponse) ? paymentsResponse : [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      paymentsData = [];
    }
    
    // Combine order data with payment data for verification
    const orderData = response.data;
    const verificationData = [
      { order_status: orderData.order_status },
      ...paymentsData.map((payment: any) => ({ payment_status: payment.payment_status }))
    ];
    
    // Determine the status using the verification util
    const paymentStatus = determinePaymentStatus(verificationData);
    
    // Map to our internal status format
    const status = paymentStatus === 'Success' ? 'SUCCESS' : 
                   paymentStatus === 'Pending' ? 'PENDING' : 'FAILURE';
    
    // Extract customer details if available
    const customerDetails = orderData.customer_details || {};
    
    // Find a payment ID if one exists
    const paymentId = paymentsData.length > 0 ? paymentsData[0].cf_payment_id : undefined;
    
    // Build the transaction details
    const transactionDetails: TransactionDetails = {
      orderId: orderId,
      amount: parseFloat(orderData.order_amount || '0'),
      status: status,
      date: new Date(orderData.created_at || Date.now()),
      paymentId: paymentId,
      paymentMethod: paymentsData.length > 0 ? paymentsData[0].payment_method : undefined,
      customerDetails: {
        name: customerDetails.customer_name,
        phone: customerDetails.customer_phone,
        email: customerDetails.customer_email
      },
      failureReason: status === 'FAILURE' ? paymentsData.length > 0 ? paymentsData[0].error_details : 'Payment failed' : undefined
    };
    
    return transactionDetails;
  } catch (error: any) {
    console.error('Error getting transaction details:', 
      error.response ? error.response.data : error.message);
    
    // Return a basic error response
    return {
      orderId: orderId,
      amount: 0,
      status: 'FAILURE',
      date: new Date(),
      failureReason: error.response ? 
        (error.response.data ? error.response.data.message : 'API error') : 
        error.message
    };
  }
}; 