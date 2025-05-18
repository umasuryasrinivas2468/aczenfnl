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
    
    // Log platform information from Capacitor
    console.log('Capacitor Platform:', Capacitor.getPlatform());
    console.log('Is Native Platform:', Capacitor.isNativePlatform());
    
    // More comprehensive detection for Android devices and webviews
    const isAndroid = (
      // Very broad Android detection
      /android/i.test(userAgent) ||
      
      // Standard Android WebView checks
      /wv/.test(userAgent) || 
      
      // TWA (Trusted Web Activity) or PWA on Android
      (/android/.test(userAgent) && /chrome/.test(userAgent) && 'standalone' in window.navigator) ||
      
      // Additional checks for web-to-app converters
      (/android/.test(userAgent) && (/version\//.test(userAgent) || /samsungbrowser/.test(userAgent) || /webview/.test(userAgent))) ||
      
      // Check for Capacitor Android
      (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android')
    );
    
    console.log('Is Android Environment:', isAndroid);
    return isAndroid;
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
  console.log("Generating UPI Intent URL with params:", params);
  
  // Format amount to have exactly 2 decimal places
  const formattedAmount = parseFloat(params.amount.toString()).toFixed(2);
  
  // Basic UPI URL with required parameters
  const upiUrl = `upi://pay?pa=${encodeURIComponent(params.vpa)}&pn=${encodeURIComponent(params.payeeName)}&am=${formattedAmount}&cu=INR`;
  
  // Add additional parameters - some apps may not support all params
  const fullUpiUrl = `${upiUrl}&tn=${encodeURIComponent(params.description)}&tr=${encodeURIComponent(params.transactionRef)}&mc=${encodeURIComponent(params.merchantCode)}`;
  
  // Store both URLs for fallback purposes
  localStorage.setItem('last_upi_url', fullUpiUrl);
  localStorage.setItem('basic_upi_url', upiUrl);
  
  console.log("Generated UPI URL:", fullUpiUrl);
  console.log("Basic UPI URL fallback:", upiUrl);
  
  return fullUpiUrl;
};

// Let's add a function to try opening UPI with fallbacks if needed
const openUpiUrl = (primaryUrl: string): void => {
  try {
    console.log("Attempting to open UPI URL:", primaryUrl);
    
    // Store the URL we're attempting to open
    localStorage.setItem('last_attempted_upi_url', primaryUrl);
    
    // Get the basic URL (fallback)
    const basicUrl = localStorage.getItem('basic_upi_url');
    
    // First try the full URL
    window.location.href = primaryUrl;
    
    // If the primary URL fails to open UPI app after 1 second, try the basic URL
    if (basicUrl && basicUrl !== primaryUrl) {
      setTimeout(() => {
        console.log("Trying fallback basic UPI URL:", basicUrl);
        localStorage.setItem('upi_fallback_used', 'true');
        window.location.href = basicUrl;
      }, 1000);
    }
  } catch (error) {
    console.error("Error opening UPI URL:", error);
    
    // Try with the basic URL as last resort
    const basicUrl = localStorage.getItem('basic_upi_url');
    if (basicUrl) {
      console.log("Using emergency basic UPI URL fallback");
      window.location.href = basicUrl;
    }
  }
};

/**
 * Initiates a UPI Intent payment that will open UPI apps on the device
 */
export const initiateUpiIntentPayment = async (params: UpiPaymentParams): Promise<void> => {
  // Create order in Cashfree first, regardless of platform
  try {
    console.log(`Initiating UPI payment for order ${params.orderId} (${params.amount} INR)`);
    
    // Ensure all required parameters are present
    console.log("UPI Payment Parameters:", JSON.stringify(params, null, 2));
    
    // Check if we should use direct UPI intent (bypassing Cashfree)
    const useDirectUpiIntent = localStorage.getItem('use_direct_upi') === 'true';
    if (useDirectUpiIntent) {
      console.log("Using direct UPI intent mode - bypassing Cashfree");
      
      // Track the transaction in memory
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
      
      // Store payment information in localStorage 
      localStorage.setItem('current_upi_payment', JSON.stringify({
        orderId: params.orderId,
        amount: params.amount,
        timestamp: new Date().toISOString(),
        metalType: params.metalType
      }));
      
      // Record transaction in Supabase
      await recordTransaction({
        order_id: params.orderId,
        amount: params.amount,
        customer_id: params.userId,
        status: 'PENDING',
        payment_method: 'UPI',
        transaction_type: 'DEPOSIT',
        vpa: params.vpa,
        description: params.description || `Payment for ${params.metalType} worth ₹${params.amount}`,
        metadata: {
          metal_type: params.metalType,
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
          userId: params.userId
        }
      });

      console.log(`Transaction recorded in Supabase for order: ${params.orderId}`);
      
      // Generate and open UPI URL directly
      const upiUrl = generateUpiIntentUrl({
        vpa: params.vpa,
        amount: params.amount,
        payeeName: 'Aczen Technologies',
        transactionId: params.orderId,
        transactionRef: params.orderId,
        description: params.description || `Payment for ${params.metalType} worth ₹${params.amount}`,
        merchantCode: 'ACZEN',
      });
      
      console.log("DIRECT UPI PAYMENT INITIATED", {
        time: new Date().toISOString(),
        orderId: params.orderId,
        amount: params.amount,
        upiUrl: upiUrl
      });
      
      // Open UPI app with fallback mechanism
      openUpiUrl(upiUrl);
      return;
    }
    
    // Try to create Cashfree order if not using direct UPI intent
    let cashfreeOrderCreated = false;
    try {
      const orderResult = await createCashfreeOrder({
        orderId: params.orderId,
        amount: params.amount,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        userId: params.userId,
        metalType: params.metalType
      });
      
      console.log("Cashfree Order Result:", orderResult);
      
      if (!orderResult) {
        console.error("Failed to create Cashfree order");
        // Don't throw, continue with direct UPI
      } else {
        console.log(`Cashfree order created successfully: ${params.orderId}`);
        cashfreeOrderCreated = true;
      }
    } catch (cashfreeError) {
      console.error("Cashfree Order Creation Error:", cashfreeError);
      // Don't throw, continue with direct UPI
    }

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

    // Record transaction in Supabase
    await recordTransaction({
      order_id: params.orderId,
      amount: params.amount,
      customer_id: params.userId,
      status: 'PENDING',
      payment_method: 'UPI',
      transaction_type: 'DEPOSIT',
      vpa: params.vpa,
      description: params.description || `Payment for ${params.metalType} worth ₹${params.amount}`,
      metadata: {
        metal_type: params.metalType,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone,
        cashfree_order_created: cashfreeOrderCreated,
        userId: params.userId
      }
    });

    console.log(`Transaction recorded in Supabase for order: ${params.orderId}`);

    // Check if running on Android WebView (including converted web-to-app)
    const isAndroid = isAndroidWebView();
    console.log(`Device environment: ${isAndroid ? 'Android/Mobile' : 'Web/Desktop'}`);

    // Store payment information in localStorage 
    localStorage.setItem('current_upi_payment', JSON.stringify({
      orderId: params.orderId,
      amount: params.amount,
      timestamp: new Date().toISOString(),
      metalType: params.metalType
    }));

    // Force Android UPI intent for testing
    const forceUpiIntent = localStorage.getItem('force_upi_intent') === 'true';
    // Always use UPI intent if Cashfree order creation failed
    if (isAndroid || forceUpiIntent || !cashfreeOrderCreated) {
      if (forceUpiIntent) {
        console.log("Forcing UPI Intent for testing purposes");
      }
      if (!cashfreeOrderCreated) {
        console.log("Using UPI Intent because Cashfree order creation failed");
      }
      
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
      
      console.log(`Opening UPI app with URL: ${upiUrl}`);
      
      // Log the payment initiation
      console.log("PAYMENT INITIATED", {
        time: new Date().toISOString(),
        orderId: params.orderId,
        amount: params.amount,
        upiUrl: upiUrl
      });
      
      // Use our new opener function with fallbacks
      openUpiUrl(upiUrl);
    } else if (cashfreeOrderCreated) {
      // For web, redirect to Cashfree payment page 
      try {
        const paymentLink = await createCashfreePaymentLink(params.orderId);
        console.log("Cashfree Payment Link:", paymentLink);
        
        if (paymentLink) {
          console.log(`Redirecting to Cashfree payment page: ${paymentLink}`);
          window.location.href = paymentLink;
        } else {
          throw new Error('Failed to create payment link');
        }
      } catch (paymentLinkError) {
        console.error("Payment Link Creation Error:", paymentLinkError);
        
        // Fallback to direct UPI intent if payment link creation fails
        console.log("Falling back to direct UPI intent due to payment link error");
        const upiUrl = generateUpiIntentUrl({
          vpa: params.vpa,
          amount: params.amount,
          payeeName: 'Aczen Technologies',
          transactionId: params.orderId,
          transactionRef: params.orderId,
          description: params.description || `Payment of ₹${params.amount}`,
          merchantCode: 'ACZEN',
        });
        
        console.log(`Opening UPI app with URL: ${upiUrl}`);
        openUpiUrl(upiUrl);
      }
    }

    return;
  } catch (error) {
    console.error('Failed to initiate UPI payment:', error);
    
    // Last resort fallback - try direct UPI intent if all else fails
    try {
      console.log("EMERGENCY FALLBACK: Attempting direct UPI intent");
      const upiUrl = generateUpiIntentUrl({
        vpa: params.vpa,
        amount: params.amount,
        payeeName: 'Aczen Technologies',
        transactionId: params.orderId,
        transactionRef: params.orderId,
        description: params.description || `Payment of ₹${params.amount}`,
        merchantCode: 'ACZEN',
      });
      
      console.log(`Emergency fallback: Opening UPI app with URL: ${upiUrl}`);
      openUpiUrl(upiUrl);
      return;
    } catch (fallbackError) {
      console.error("Even emergency fallback failed:", fallbackError);
      throw error;
    }
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
    const returnUrl = `${appBaseUrl}/payment-success?order_id=${params.orderId}&metal_type=${params.metalType}`;
    
    console.log(`Creating Cashfree order with webhook URL: ${webhookUrl}`);
    
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
    console.log('Attempting to record transaction in Supabase:', transaction.order_id);
    
    // Try to use Supabase if available
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          order_id: transaction.order_id,
          amount: transaction.amount,
          user_id: transaction.customer_id,  // Use user_id instead of customer_id
          status: transaction.status,
          payment_method: transaction.payment_method,
          metal_type: transaction.metadata.metal_type,  // Add metal_type from metadata
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error recording transaction in Supabase:', error);
    } else {
      console.log('Successfully inserted transaction in Supabase:', data);
    }
  } catch (error) {
    console.error('Failed to record transaction in Supabase:', error);
    // Don't throw here to prevent blocking the payment flow
  }
};

/**
 * Checks the payment status for a specific order ID using Cashfree API
 * Based on Cashfree's documentation: https://www.cashfree.com/devstudio/preview/pg/web/checkout#getOrder
 */
export const checkPaymentStatus = async (orderId: string): Promise<'PENDING' | 'PAID' | 'FAILED'> => {
  try {
    console.log(`Checking payment status for order: ${orderId}`);
    
    // Try to check payment status with Cashfree API
    try {
      const response = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}`, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': API_KEY,
          'x-client-secret': API_SECRET
        }
      });
      
      // Get full order data
      const orderData = response.data;
      console.log(`Cashfree API response for ${orderId}:`, orderData);
      
      // Convert Cashfree status to our status format
      const orderStatus = orderData.order_status;
      console.log(`Cashfree payment status for ${orderId}: ${orderStatus}`);
      
      // Check for payment status in the payments array if available
      if (orderData.payments && orderData.payments.length > 0) {
        const paymentStatus = orderData.payments[0].payment_status;
        console.log(`Payment status from payments array: ${paymentStatus}`);
        
        if (paymentStatus === 'SUCCESS') {
          // Update local status
          updatePaymentStatus(orderId, 'PAID', orderData.payments[0]);
          return 'PAID';
        } else if (paymentStatus === 'FAILED') {
          // Update local status
          updatePaymentStatus(orderId, 'FAILED', orderData.payments[0]);
          return 'FAILED';
        }
      }
      
      // Fall back to order status if payment details not available
      if (orderStatus === 'PAID') {
        // Update local status
        updatePaymentStatus(orderId, 'PAID', { cf_payment_id: orderData.cf_order_id });
        return 'PAID';
      } else if (orderStatus === 'ACTIVE') {
        return 'PENDING';
      } else if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(orderStatus)) {
        // Update local status
        updatePaymentStatus(orderId, 'FAILED');
        return 'FAILED';
      }
      
      return 'PENDING';
    } catch (error: any) {
      console.error('Error checking payment status with Cashfree API:', error?.response?.data || error);
      
      // If we get a not found response, try using the getPaymentsForOrder API
      if (error?.response?.status === 404 || error?.response?.status === 400) {
        try {
          console.log(`Trying getPaymentsForOrder API for order ${orderId}`);
          const paymentsResponse = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}/payments`, {
            headers: {
              'x-api-version': '2022-09-01',
              'x-client-id': API_KEY,
              'x-client-secret': API_SECRET
            }
          });
          
          console.log(`Payments response for ${orderId}:`, paymentsResponse.data);
          
          // Check if there are any successful payments
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const firstPayment = paymentsResponse.data[0];
            
            if (firstPayment.payment_status === 'SUCCESS') {
              updatePaymentStatus(orderId, 'PAID', firstPayment);
              return 'PAID';
            } else if (firstPayment.payment_status === 'FAILED') {
              updatePaymentStatus(orderId, 'FAILED', firstPayment);
              return 'FAILED';
            }
          }
        } catch (paymentsError) {
          console.error('Error checking payments for order:', paymentsError);
        }
      }
      
      // Continue to fallbacks if API call fails
    }
    
    // Fallback to checking in-memory data
    if (pendingTransactions[orderId]) {
      console.log(`Using in-memory status for ${orderId}: ${pendingTransactions[orderId].status}`);
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

      console.log(`Using Supabase status for ${orderId}: ${data.status}`);
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
    console.log(`Updating payment status for ${orderId} to ${status}`);
    
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
      } else {
        console.log('Successfully updated transaction in Supabase');
        
        // If payment is successful, update the investment total
        if (status === 'PAID') {
          await updateInvestmentTotal(orderId);
        }
      }
    } catch (error) {
      console.error('Failed to update payment status in Supabase:', error);
    }
    
    // Also update local storage for client-side tracking
    try {
      // Get transaction from memory
      const tx = pendingTransactions[orderId];
      if (tx && status === 'PAID') {
        // Update user investments in localStorage
        updateLocalInvestments(tx.orderId, tx.amount, tx.metadata?.metalType || 'gold');
      }
    } catch (err) {
      console.error('Error updating local investments:', err);
    }
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
  }
};

/**
 * Updates the investment total in Supabase and local storage
 */
const updateInvestmentTotal = async (orderId: string): Promise<void> => {
  try {
    console.log(`Updating investment for order ${orderId}`);
    
    // Get transaction details from Supabase
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (txError || !txData) {
      console.error('Error fetching transaction:', txError);
      return;
    }
    
    const userId = txData.user_id || txData.metadata?.userId;
    const amount = txData.amount;
    const metalType = txData.metadata?.metalType || 'gold';
    
    if (!userId || !amount) {
      console.error('Missing user ID or amount for investment update');
      return;
    }
    
    console.log(`Updating investment for user ${userId}, amount ${amount}, metal ${metalType}`);
    
    // Get current investment record
    const { data: investmentData, error: investmentError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .eq('metal_type', metalType)
      .single();
    
    if (investmentError && investmentError.code !== 'PGRST116') {
      console.error('Error fetching investment:', investmentError);
    }
    
    // If record exists, update it, otherwise create new record
    if (investmentData) {
      const { error: updateError } = await supabase
        .from('investments')
        .update({
          amount: investmentData.amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentData.id);
      
      if (updateError) {
        console.error('Error updating investment:', updateError);
      } else {
        console.log('Successfully updated investment record');
      }
    } else {
      // Create new investment record
      const { error: insertError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          metal_type: metalType,
          amount: amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating investment:', insertError);
      } else {
        console.log('Successfully created new investment record');
      }
    }
    
    // Update local storage for client-side tracking
    updateLocalInvestments(orderId, amount, metalType);
  } catch (error) {
    console.error('Failed to update investment total:', error);
  }
};

/**
 * Updates local storage with investment data for faster client-side access
 */
const updateLocalInvestments = (orderId: string, amount: number, metalType: string): void => {
  try {
    console.log(`Updating local investments: ${metalType}, amount: ${amount}`);
    
    // Get current investments from localStorage
    const userInvestmentsStr = localStorage.getItem('userInvestments');
    if (!userInvestmentsStr) {
      console.error('No userInvestments found in localStorage');
      return;
    }
    
    const userInvestments = JSON.parse(userInvestmentsStr);
    
    // Create transaction record
    const transaction = {
      id: `tx_${Date.now()}`,
      type: metalType,
      amount: amount,
      date: new Date().toISOString(),
      status: 'completed',
      orderId: orderId
    };
    
    // Check if this transaction already exists
    const existingTransaction = userInvestments.transactions.find(
      (tx: any) => tx.orderId === orderId
    );
    
    if (!existingTransaction) {
      // Get current price for weight calculation (fallback to default if not available)
      let currentPrice = metalType === 'gold' ? 5500 : 70;
      try {
        // Try to get prices from localStorage if available
        const pricesStr = localStorage.getItem('metalPrices');
        if (pricesStr) {
          const prices = JSON.parse(pricesStr);
          currentPrice = metalType === 'gold' ? prices.gold : prices.silver;
        }
      } catch (e) {
        console.error('Error parsing metal prices:', e);
      }
      
      // Calculate weight
      const weight = amount / currentPrice;
      
      // Update investments object
      const updatedInvestments = {
        ...userInvestments,
        totalInvestment: userInvestments.totalInvestment + amount,
        investments: {
          ...userInvestments.investments,
          [metalType]: {
            ...userInvestments.investments[metalType],
            amount: userInvestments.investments[metalType].amount + amount,
            weight: userInvestments.investments[metalType].weight + weight
          }
        },
        transactions: [transaction, ...userInvestments.transactions]
      };
      
      // Save back to localStorage
      localStorage.setItem('userInvestments', JSON.stringify(updatedInvestments));
      
      console.log(`Successfully updated local investments: ${JSON.stringify({
        totalInvestment: updatedInvestments.totalInvestment,
        [metalType]: updatedInvestments.investments[metalType]
      })}`);
    } else {
      console.log('Transaction already exists in local storage');
    }
  } catch (error) {
    console.error('Error updating local investments:', error);
  }
}

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