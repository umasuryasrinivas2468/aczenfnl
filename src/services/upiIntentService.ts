import axios from 'axios';
import { App } from '@capacitor/app';
import { verifyUpiPayment } from '@/services/paymentService';

// Declare Capacitor global and extend AppPlugin
declare global {
  interface Window {
    Capacitor: any;
  }
}

// Add missing openUrl method to AppPlugin
declare module '@capacitor/app' {
  interface AppPlugin {
    openUrl(options: { url: string }): Promise<void>;
  }
}

// UPI Payment parameters
export interface UpiPaymentParams {
  orderId: string;
  amount: number;
  payeeName: string;
  payeeVpa: string;
  description?: string;
  currency?: string;
  transactionRef?: string;
}

// Generate a UPI intent URL
export const generateUpiIntentUrl = (params: UpiPaymentParams): string => {
  if (!params.orderId || !params.amount || !params.payeeVpa || !params.payeeName) {
    throw new Error('Missing required UPI parameters');
  }

  const urlParams = new URLSearchParams();
  urlParams.append('pa', params.payeeVpa);
  urlParams.append('pn', params.payeeName);
  urlParams.append('am', params.amount.toString());
  urlParams.append('tr', params.transactionRef || params.orderId);
  urlParams.append('cu', params.currency || 'INR');
  urlParams.append('tn', params.description || `Payment for order ${params.orderId}`);

  return `upi://pay?${urlParams.toString()}`;
};

// Check if device supports UPI
export const supportsUpi = (): boolean => {
  return /android/i.test(navigator.userAgent);
};

// Open UPI app with intent URL
export const openUpiApp = async (upiUrl: string): Promise<boolean> => {
  try {
    // Store the payment start time for verification
    localStorage.setItem('upi_payment_start_time', Date.now().toString());
    localStorage.setItem('upi_pending_transaction', upiUrl.split('tr=')[1]?.split('&')[0] || '');

    if (window.Capacitor) {
      // Use Capacitor to open URL in native app
      await App.openUrl({ url: upiUrl });
      return true;
    } else {
      // Fallback for browser
      window.location.href = upiUrl;
      return true;
    }
  } catch (error) {
    console.error('Error opening UPI app:', error);
    return false;
  }
};

// Initiate UPI Intent payment
export const initiateUpiIntentPayment = async (params: UpiPaymentParams): Promise<void> => {
  try {
    // Generate UPI URL
    const upiUrl = generateUpiIntentUrl(params);
    
    // Open UPI app
    const opened = await openUpiApp(upiUrl);
    
    if (!opened) {
      throw new Error('Failed to open UPI app');
    }
    
    // Set up app state listener for when user returns from UPI app
    setupAppStateListener(params.orderId);
    
  } catch (error) {
    console.error('Error initiating UPI payment:', error);
    throw error;
  }
};

// Set up listener for app state changes
const setupAppStateListener = (orderId: string) => {
  if (window.Capacitor) {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App has come back to foreground, check payment status
        const pendingTxnId = localStorage.getItem('upi_pending_transaction');
        
        if (pendingTxnId && pendingTxnId === orderId) {
          setTimeout(() => {
            verifyUpiPaymentStatus(orderId);
          }, 1000);
        }
      }
    });
  } else {
    // For browser testing, set up a focus event
    window.addEventListener('focus', () => {
      const pendingTxnId = localStorage.getItem('upi_pending_transaction');
      
      if (pendingTxnId && pendingTxnId === orderId) {
        setTimeout(() => {
          verifyUpiPaymentStatus(orderId);
        }, 1000);
      }
    });
  }
};

// Verify UPI payment status
export const verifyUpiPaymentStatus = async (orderId: string): Promise<any> => {
  try {
    // Clear pending transaction
    localStorage.removeItem('upi_pending_transaction');
    
    // Generate a mock UPI transaction ID for demo purposes
    const mockUpiTxnId = `UPI_${Date.now()}`;
    
    // Verify payment with our backend API
    const result = await verifyUpiPayment(orderId, mockUpiTxnId, 'SUCCESS');
    
    if (result.status === 'completed') {
      // Payment successful
      dispatchPaymentEvent('success', orderId, result);
      return result;
    } else if (result.status === 'pending') {
      // Payment still pending, start polling
      startPaymentStatusPolling(orderId);
      return result;
    } else {
      // Payment failed
      dispatchPaymentEvent('failure', orderId, result);
      return result;
    }
  } catch (error) {
    console.error('Error verifying UPI payment:', error);
    dispatchPaymentEvent('error', orderId, { error });
    throw error;
  }
};

// Start polling for payment status
const startPaymentStatusPolling = (orderId: string, attempts = 0) => {
  const MAX_ATTEMPTS = 5;
  const POLLING_INTERVAL = 3000; // 3 seconds
  
  if (attempts >= MAX_ATTEMPTS) {
    // Give up after max attempts
    dispatchPaymentEvent('timeout', orderId, { message: 'Payment verification timed out' });
    return;
  }
  
  setTimeout(async () => {
    try {
      const response = await axios.get(`/api/payment-status/${orderId}`);
      
      if (response.data.status === 'SUCCESS') {
        // Payment successful
        dispatchPaymentEvent('success', orderId, response.data);
      } else if (response.data.status === 'PENDING') {
        // Still pending, continue polling
        startPaymentStatusPolling(orderId, attempts + 1);
      } else {
        // Payment failed
        dispatchPaymentEvent('failure', orderId, response.data);
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
      // Continue polling despite error
      startPaymentStatusPolling(orderId, attempts + 1);
    }
  }, POLLING_INTERVAL);
};

// Dispatch payment status event
const dispatchPaymentEvent = (status: 'success' | 'failure' | 'pending' | 'timeout' | 'error', orderId: string, data: any) => {
  const event = new CustomEvent('upi_payment_status', {
    detail: {
      status,
      orderId,
      data
    }
  });
  
  window.dispatchEvent(event);
};

// Complete UPI payment flow
export const completeUpiPayment = async (params: UpiPaymentParams): Promise<any> => {
  try {
    // First initiate the payment
    await initiateUpiIntentPayment(params);
    
    // Return a promise that resolves when payment is complete
    return new Promise((resolve, reject) => {
      // Set up event listener for payment status
      const handlePaymentStatus = (event: any) => {
        const { status, orderId, data } = event.detail;
        
        if (orderId === params.orderId) {
          // Remove event listener
          window.removeEventListener('upi_payment_status', handlePaymentStatus);
          
          if (status === 'success') {
            resolve(data);
          } else {
            reject(new Error(`Payment ${status}: ${JSON.stringify(data)}`));
          }
        }
      };
      
      // Add event listener
      window.addEventListener('upi_payment_status', handlePaymentStatus);
      
      // Set timeout to reject if no response
      setTimeout(() => {
        window.removeEventListener('upi_payment_status', handlePaymentStatus);
        reject(new Error('Payment verification timed out'));
      }, 60000); // 1 minute timeout
    });
  } catch (error) {
    console.error('Error completing UPI payment:', error);
    throw error;
  }
}; 
