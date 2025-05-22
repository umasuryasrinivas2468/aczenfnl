import { Capacitor } from '@capacitor/core';
import axios from 'axios';

// API credentials - normally would be stored in environment variables
const API_KEY = "850529145692c9f93773ed2c0a925058";
const API_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

/**
 * Initiates Cashfree UPI payment through deeplink for mobile devices
 * @param orderId The order ID for the payment
 * @param amount The payment amount
 * @param customerDetails Customer information for the payment
 * @returns Promise resolving to the payment result
 */
export const initiateUpiDeepLink = async (
  orderId: string,
  amount: number,
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  }
) => {
  // Check if running on mobile device
  if (!Capacitor.isNativePlatform()) {
    throw new Error("UPI deep linking is only supported on mobile devices");
  }

  try {
    // 1. Create an order with Cashfree API
    const orderResponse = await createOrder(orderId, amount, customerDetails);
    
    // 2. Create a payment using the UPI payment method
    const paymentResponse = await createUpiPayment(orderResponse.order_token, customerDetails.phone);
    
    // 3. Get the payment link to open in the UPI app
    const paymentLink = paymentResponse.data.payment_link;
    
    // 4. Open the UPI app
    openUpiDeepLink(paymentLink);
    
    return {
      success: true,
      orderId: orderId,
      paymentLink: paymentLink
    };
  } catch (error) {
    console.error("UPI deep link initiation failed:", error);
    throw error;
  }
};

/**
 * Creates an order with Cashfree
 */
const createOrder = async (
  orderId: string, 
  amount: number, 
  customerDetails: { name: string; email: string; phone: string }
) => {
  const API_URL = 'https://api.cashfree.com/pg/orders';
  
  const payload = {
    "order_id": orderId,
    "order_amount": amount,
    "order_currency": "INR",
    "customer_details": {
      "customer_id": orderId.split("_")[1], // Use part of order ID as customer ID
      "customer_name": customerDetails.name,
      "customer_email": customerDetails.email,
      "customer_phone": customerDetails.phone
    },
    "order_meta": {
      "return_url": "https://aczenfnl.com/payment-status?order_id={order_id}"
    }
  };
  
  const response = await axios.post(API_URL, payload, {
    headers: {
      'x-api-version': '2025-01-01',
      'x-client-id': API_KEY,
      'x-client-secret': API_SECRET,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
};

/**
 * Creates UPI payment for an order
 */
const createUpiPayment = async (orderToken: string, customerPhone: string) => {
  const API_URL = 'https://api.cashfree.com/pg/orders/pay';
  
  const payload = {
    "payment_session_id": orderToken,
    "payment_method": {
      "upi": {
        "channel": "link",
        "phone": customerPhone
      }
    }
  };
  
  return axios.post(API_URL, payload, {
    headers: {
      'x-api-version': '2025-01-01',
      'x-client-id': API_KEY,
      'x-client-secret': API_SECRET,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Opens the UPI deep link URL to trigger the appropriate UPI app
 */
const openUpiDeepLink = (deepLinkUrl: string) => {
  // Open the deep link URL which will trigger the UPI app
  window.location.href = deepLinkUrl;
};

/**
 * Verify payment status for a given order
 */
export const verifyUpiPayment = async (orderId: string) => {
  try {
    const response = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET
      }
    });
    
    return {
      orderId: response.data.order_id,
      status: response.data.order_status,
      paymentDetails: response.data.payments[0] || {}
    };
  } catch (error) {
    console.error("Payment verification failed:", error);
    throw error;
  }
}; 