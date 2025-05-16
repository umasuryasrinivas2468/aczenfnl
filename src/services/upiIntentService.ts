import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

// API credentials - normally would be stored in environment variables
const API_KEY = "850529145692c9f93773ed2c0a925058";
const API_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

// Define the Merchant VPA
const MERCHANT_VPA = "aczentechnologiesp.cf@axisbank";

// Store for pending transactions (in-memory for demo)
const pendingTransactions: Record<string, {
  orderId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  timestamp: string;
  paymentMethod: string;
  metadata: Record<string, any>;
}> = {};

// Detect if running in WebView on Android, including web-to-app conversions
const isAndroidWebView = (): boolean => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Log user agent for debugging
    console.log('User Agent:', userAgent);
    
    // More comprehensive detection for Android devices and webviews
    return (
      // Very broad Android detection
      /android/i.test(userAgent) ||
      
      // Standard Android WebView checks
      /wv/.test(userAgent) || 
      
      // TWA (Trusted Web Activity) or PWA on Android
      (/android/.test(userAgent) && /chrome/.test(userAgent) && 'standalone' in window.navigator) ||
      
      // Additional checks for web-to-app converters
      (/android/.test(userAgent) && (/version\//.test(userAgent) || /samsungbrowser/.test(userAgent) || /webview/.test(userAgent))) ||
      
      // Check for Capacitor Android
      (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') ||
      
      // Force UPI Intent for testing (remove in production)
      (window.localStorage.getItem('force_upi_intent') === 'true')
    );
  }
  return false;
};

// Generates a unique order ID for UPI transactions that includes user ID and metal type
export const generateOrderId = (userId: string, metalType: string): string => {
  return `user_${userId}_${metalType}_${Date.now()}`;
};

// Interface for UPI payment parameters
interface UpiPaymentParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vpa: string;
  description?: string;
  userId: string;
  metalType: string;
}

/**
 * Initiates a UPI Intent payment that will open UPI apps on the device
 */
export const initiateUpiIntentPayment = async (params: UpiPaymentParams): Promise<void> => {
  // Create order in Cashfree first, regardless of platform
  try {
    await createCashfreeOrder({
      orderId: params.orderId,
      amount: params.amount,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      userId: params.userId,
      metalType: params.metalType
    });

    // Track the transaction in memory for demo
    pendingTransactions[params.orderId] = {
      orderId: params.orderId,
      amount: params.amount,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      paymentMethod: 'UPI',
      metadata: {
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        description: params.description || `Payment of ₹${params.amount}`,
        userId: params.userId,
        metalType: params.metalType
      }
    };

    // Also record in Supabase if available
    try {
      await recordTransaction({
        order_id: params.orderId,
        amount: params.amount,
        customer_id: params.customerEmail || params.customerPhone,
        status: 'PENDING',
        payment_method: 'UPI',
        transaction_type: 'DEPOSIT',
        vpa: MERCHANT_VPA,
        description: params.description || `Payment of ₹${params.amount}`,
        metadata: {
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          customerEmail: params.customerEmail,
          userId: params.userId,
          metalType: params.metalType
        }
      });
    } catch (error) {
      console.error('Failed to record transaction in Supabase:', error);
    }

    // Check if running on Android WebView (including converted web-to-app)
    const isAndroid = isAndroidWebView();

    if (isAndroid) {
      // Use UPI Intent URL for Android devices
      const upiUrl = generateUpiIntentUrl({
        vpa: params.vpa,
        amount: params.amount,
        payeeName: 'Aczen Technologies',
        transactionId: params.orderId,
        transactionRef: params.orderId,
        description: params.description || `Payment of ₹${params.amount}`,
        merchantCode: 'ACZEN',
      });
      window.location.href = upiUrl;
    } else {
      // For web, redirect to Cashfree payment page 
      const paymentLink = await createCashfreePaymentLink(params.orderId);
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Failed to create payment link');
      }
    }

    return;
  } catch (error) {
    console.error('Failed to initiate UPI payment:', error);
    throw error;
  }
};

/**
 * Creates a Cashfree payment link that works for both web and mobile
 */
const createCashfreePaymentLink = async (orderId: string): Promise<string | null> => {
  try {
    const response = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}/payment-link`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET
      }
    });
    
    return response.data.payment_link;
  } catch (error) {
    console.error('Failed to create payment link:', error);
    return null;
  }
};

/**
 * Creates an order in Cashfree for payment tracking
 */
export const createCashfreeOrder = async (params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId: string;
  metalType: string;
}): Promise<any> => {
  try {
    // Get the app base URL - using Vercel's deployment URL or fallback to origin
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    
    // Construct webhook URL with the app domain
    const webhookUrl = `${appBaseUrl}/api/webhooks/cashfree`;
    const returnUrl = `${appBaseUrl}/payment-success?order_id={order_id}`;
    
    const payload = {
      "order_id": params.orderId,
      "order_amount": params.amount,
      "order_currency": "INR",
      "customer_details": {
        "customer_id": params.customerEmail || params.customerPhone,
        "customer_name": params.customerName,
        "customer_email": params.customerEmail,
        "customer_phone": params.customerPhone
      },
      "order_meta": {
        "return_url": returnUrl,
        "notify_url": webhookUrl,
        "user_id": params.userId,
        "metal_type": params.metalType
      },
      "order_note": `Payment for ${params.metalType} worth ₹${params.amount}`,
      "order_tags": {
        "metal_type": params.metalType,
        "user_id": params.userId
      }
    };
    
    const response = await axios.post('https://api.cashfree.com/pg/orders', payload, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Order created in Cashfree:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create order in Cashfree:", error);
    return null;
  }
};

/**
 * Generates a UPI Intent URL based on the provided parameters
 */
const generateUpiIntentUrl = (params: {
  vpa: string;
  amount: number;
  payeeName: string;
  transactionId: string;
  transactionRef: string;
  description: string;
  merchantCode: string;
}): string => {
  // Create the UPI intent URL with all required parameters
  const upiUrl = `upi://pay?pa=${encodeURIComponent(params.vpa)}&pn=${encodeURIComponent(params.payeeName)}&am=${params.amount}&tr=${encodeURIComponent(params.transactionRef)}&tn=${encodeURIComponent(params.description)}&cu=INR&mc=${encodeURIComponent(params.merchantCode)}`;
  
  return upiUrl;
};

/**
 * Records a transaction in the database
 */
const recordTransaction = async (transaction: {
  order_id: string;
  amount: number;
  customer_id: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  payment_method: string;
  transaction_type: 'DEPOSIT' | 'WITHDRAWAL';
  vpa: string;
  description: string;
  metadata: Record<string, any>;
}) => {
  try {
    // Try to use Supabase if available
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          order_id: transaction.order_id,
          amount: transaction.amount,
          customer_id: transaction.customer_id,
          status: transaction.status,
          payment_method: transaction.payment_method,
          transaction_type: transaction.transaction_type,
          vpa: transaction.vpa,
          description: transaction.description,
          metadata: transaction.metadata,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error recording transaction in Supabase:', error);
    }
  } catch (error) {
    console.error('Failed to record transaction in Supabase:', error);
    // Don't throw here to prevent blocking the payment flow
  }
};

/**
 * Checks the payment status for a specific order ID using Cashfree API
 */
export const checkPaymentStatus = async (orderId: string): Promise<'PENDING' | 'PAID' | 'FAILED'> => {
  try {
    // Try to check payment status with Cashfree API
    try {
      const response = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}`, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': API_KEY,
          'x-client-secret': API_SECRET
        }
      });
      
      // Convert Cashfree status to our status format
      const orderStatus = response.data.order_status;
      console.log(`Cashfree payment status for ${orderId}: ${orderStatus}`);
      
      if (orderStatus === 'PAID') {
        return 'PAID';
      } else if (orderStatus === 'ACTIVE') {
        return 'PENDING';
      } else if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(orderStatus)) {
        return 'FAILED';
      }
      
      return 'PENDING';
    } catch (error) {
      console.error('Error checking payment status with Cashfree API:', error);
      // Continue to fallbacks if API call fails
    }
    
    // Fallback to checking in-memory data
    if (pendingTransactions[orderId]) {
      return pendingTransactions[orderId].status;
    }

    // Try Supabase as final fallback
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('status')
        .eq('order_id', orderId)
        .single();

      if (error) {
        console.error('Error checking payment status in Supabase:', error);
        return 'PENDING';
      }

      return data.status;
    } catch (error) {
      console.error('Failed to check payment status in Supabase:', error);
      return 'PENDING';
    }
  } catch (error) {
    console.error('Failed to check payment status:', error);
    return 'PENDING';
  }
};

/**
 * Updates the payment status for a specific order ID
 */
export const updatePaymentStatus = async (
  orderId: string, 
  status: 'PAID' | 'FAILED', 
  transactionDetails?: Record<string, any>
): Promise<void> => {
  try {
    // Update in-memory transaction
    if (pendingTransactions[orderId]) {
      pendingTransactions[orderId].status = status;
      if (transactionDetails) {
        pendingTransactions[orderId].metadata = {
          ...pendingTransactions[orderId].metadata,
          ...transactionDetails
        };
      }
    }

    // Try to update in Supabase if available
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: status,
          updated_at: new Date().toISOString(),
          ...(transactionDetails ? { transaction_details: transactionDetails } : {})
        })
        .eq('order_id', orderId);

      if (error) {
        console.error('Error updating payment status in Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to update payment status in Supabase:', error);
    }
  } catch (error) {
    console.error('Failed to update payment status:', error);
  }
};

/**
 * Updates the user's total investment amount after a successful payment
 */
const updateInvestmentTotal = async (orderId: string): Promise<void> => {
  try {
    // This is handled by the PaymentSuccess component now, using localStorage
    // But we could also update users table in Supabase if needed
    console.log("Investment updated in localStorage");
  } catch (error) {
    console.error('Failed to update investment total:', error);
  }
};

/**
 * Generates a payment receipt for a completed transaction
 */
export const generateReceipt = async (orderId: string): Promise<{
  orderId: string;
  amount: number;
  status: string;
  date: string;
  paymentMethod: string;
  customerName: string;
  transactionId: string;
  receiptUrl?: string;
}> => {
  try {
    // Try to get receipt data from Cashfree first
    try {
      const response = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}`, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': API_KEY,
          'x-client-secret': API_SECRET
        }
      });
      
      const orderData = response.data;
      
      return {
        orderId: orderData.order_id,
        amount: parseFloat(orderData.order_amount),
        status: orderData.order_status,
        date: new Date(orderData.created_at).toLocaleString(),
        paymentMethod: 'UPI',
        customerName: orderData.customer_details.customer_name || 'Customer',
        transactionId: orderData.cf_order_id || orderData.order_id,
        receiptUrl: `/receipt/${orderData.order_id}`
      };
    } catch (error) {
      console.error('Failed to get receipt from Cashfree:', error);
      // Continue to fallbacks
    }
    
    // Check in-memory storage as fallback
    if (pendingTransactions[orderId]) {
      const transaction = pendingTransactions[orderId];
      return {
        orderId: transaction.orderId,
        amount: transaction.amount,
        status: transaction.status,
        date: new Date(transaction.timestamp).toLocaleString(),
        paymentMethod: transaction.paymentMethod,
        customerName: transaction.metadata?.customerName || 'Customer',
        transactionId: transaction.orderId,
        receiptUrl: `/receipt/${transaction.orderId}`
      };
    }

    // Try Supabase as final fallback
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      throw new Error('Transaction not found');
    }

    return {
      orderId: data.order_id,
      amount: data.amount,
      status: data.status,
      date: new Date(data.created_at).toLocaleString(),
      paymentMethod: data.payment_method,
      customerName: data.metadata?.customerName || 'Customer',
      transactionId: data.order_id,
      receiptUrl: `/receipt/${data.order_id}`
    };
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    throw error;
  }
}; 