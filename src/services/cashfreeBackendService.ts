import axios from 'axios';

// Cashfree API credentials - in production, these should be stored securely on your backend
// These are just placeholders for the demo
const API_KEY = "TEST123456789ABCDEFGHIJKL";
const API_SECRET = "TEST987654321ABCDEFGHIJKL";

// API URLs
const SANDBOX_BASE_URL = "https://sandbox.cashfree.com/pg";
const PRODUCTION_BASE_URL = "https://api.cashfree.com/pg";

interface OrderParams {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
  notifyUrl?: string;
  paymentMethods?: string;
}

interface PaymentVerificationParams {
  orderId: string;
  environment?: 'SANDBOX' | 'PRODUCTION';
}

/**
 * Creates an order with Cashfree
 * In a real application, this should be done on your backend server
 */
export const createCashfreeOrder = async (
  params: OrderParams,
  environment: 'SANDBOX' | 'PRODUCTION' = 'PRODUCTION'
): Promise<{ success: boolean; orderId?: string; paymentSessionId?: string; error?: string }> => {
  try {
    const baseUrl = environment === 'PRODUCTION' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
    
    // This is a mock implementation - in a real app, this would be a call to your backend
    console.log(`Creating Cashfree order (${environment}):`, params);
    
    // Simulate a backend API call
    // In production, this would be a call to your backend which would then call Cashfree
    const mockResponse = {
      success: true,
      orderId: params.orderId,
      paymentSessionId: `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return mockResponse;
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Verifies payment status with Cashfree
 * In a real application, this should be done on your backend server
 */
export const verifyPaymentStatus = async (
  params: PaymentVerificationParams
): Promise<{ success: boolean; status?: string; paymentDetails?: any; error?: string }> => {
  try {
    const baseUrl = params.environment === 'PRODUCTION' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
    
    // This is a mock implementation - in a real app, this would be a call to your backend
    console.log(`Verifying payment status for order: ${params.orderId}`);
    
    // Simulate a backend API call
    // In production, this would be a call to your backend which would then call Cashfree
    const mockResponse = {
      success: true,
      status: "PAID", // PAID, FAILED, PENDING
      paymentDetails: {
        orderId: params.orderId,
        orderAmount: "100.00",
        orderCurrency: "INR",
        orderStatus: "PAID",
        paymentMode: "UPI",
        paymentTime: new Date().toISOString(),
        txStatus: "SUCCESS",
        txMsg: "Transaction successful",
        txTime: new Date().toISOString(),
        referenceId: `ref_${Date.now()}`,
        paymentInstrument: {
          type: "UPI",
          utr: `UTR${Math.floor(Math.random() * 1000000000)}`,
          vpa: "customer@upi"
        }
      }
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return mockResponse;
  } catch (error) {
    console.error("Error verifying payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Actual implementation of createCashfreeOrder that would be used in production
 * This is for reference only and is not used in the demo
 */
export const createCashfreeOrderReal = async (
  params: OrderParams,
  environment: 'SANDBOX' | 'PRODUCTION' = 'PRODUCTION'
): Promise<any> => {
  try {
    const baseUrl = environment === 'PRODUCTION' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
    
    const payload = {
      order_id: params.orderId,
      order_amount: params.amount,
      order_currency: params.currency || "INR",
      customer_details: {
        customer_id: params.customerEmail || params.customerPhone,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone
      },
      order_meta: {
        return_url: params.returnUrl || `${window.location.origin}/payment-status?order_id=${params.orderId}`,
        notify_url: params.notifyUrl
      },
      order_note: "Payment for order",
      order_tags: {
        source: "mobile_app"
      }
    };
    
    const response = await axios.post(`${baseUrl}/orders`, payload, {
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
    };
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Actual implementation of verifyPaymentStatus that would be used in production
 * This is for reference only and is not used in the demo
 */
export const verifyPaymentStatusReal = async (
  params: PaymentVerificationParams
): Promise<any> => {
  try {
    const baseUrl = params.environment === 'PRODUCTION' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
    
    const response = await axios.get(`${baseUrl}/orders/${params.orderId}`, {
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET
      }
    });
    
    return {
      success: true,
      status: response.data.order_status,
      paymentDetails: response.data
    };
  } catch (error) {
    console.error("Error verifying payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}; 