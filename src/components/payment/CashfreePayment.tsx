import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Cashfree, isMobileApp, isAndroidDevice } from "../../capacitor/cashfree";

// These imports will be available when using the SDK through Capacitor
// We're declaring them as types here so TypeScript doesn't complain
type CFSession = {
  payment_session_id: string;
  order_id: string;
  environment: 'SANDBOX' | 'PRODUCTION';
};

type CFCallback = {
  onVerify: (orderId: string) => void;
  onError: (error: any, orderId: string) => void;
};

// Type definitions for the Cashfree SDK objects
interface CFPaymentGatewayService {
  setCallback(callback: CFCallback): void;
  removeCallback(): void;
  doPayment(session: CFSession, callback: CFCallback): void;
}

interface CFThemeBuilder {
  setNavigationBarBackgroundColor(color: string): CFThemeBuilder;
  setNavigationBarTextColor(color: string): CFThemeBuilder;
  setPrimaryTextColor(color: string): CFThemeBuilder;
  setSecondaryTextColor(color: string): CFThemeBuilder;
  setButtonBackgroundColor(color: string): CFThemeBuilder;
  setButtonTextColor(color: string): CFThemeBuilder;
  setPrimaryFont(fontName: string): CFThemeBuilder;
  setBackgroundColor(color: string): CFThemeBuilder;
  build(): CFTheme;
}

interface CFTheme {
  getNavigationBarBackgroundColor(): string;
  getNavigationBarTextColor(): string;
}

interface CFEnvironment {
  PRODUCTION: string;
  SANDBOX: string;
}

// These will be initialized by the Capacitor plugin
declare const CFPaymentGatewayService: CFPaymentGatewayService;
declare const CFSession: { new(paymentSessionId: string, orderId: string, environment: 'SANDBOX' | 'PRODUCTION'): CFSession };
declare const CFThemeBuilder: { new(): CFThemeBuilder };
declare const CFEnvironment: CFEnvironment;

// Declare the global Cashfree JS SDK
declare global {
  interface Window {
    Cashfree: any;
  }
}

// Production credentials
const PROD_APP_ID = "850529145692c9f93773ed2c0a925058";
const PROD_SECRET_KEY = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

// Test credentials (keeping for reference but using production by default)
const TEST_APP_ID = "TEST10401621b07dc6fbcf2ab23955c912610401";
const TEST_SECRET_KEY = "cfsk_ma_test_e5544b1e437f252b39ad6b0144784582_c0cccdef";
const TEST_SESSION_ID = "session_KfY9Kwpf6QHk";

// Current environment settings
const USE_PRODUCTION = true; // Set to true to use production environment
const CURRENT_APP_ID = USE_PRODUCTION ? PROD_APP_ID : TEST_APP_ID;
const CURRENT_SECRET_KEY = USE_PRODUCTION ? PROD_SECRET_KEY : TEST_SECRET_KEY;
const CASHFREE_ENV = USE_PRODUCTION ? "production" : "test";
const NATIVE_ENV = USE_PRODUCTION ? "PRODUCTION" : "SANDBOX";

interface CashfreePaymentProps {
  orderAmount: number;
  orderId: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: any, orderId: string) => void;
}

const CashfreePayment: React.FC<CashfreePaymentProps> = ({
  orderAmount,
  orderId,
  customerDetails,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const isMobile = isMobileApp();
  const isAndroid = isAndroidDevice();

  // Initialize Cashfree SDK instance
  useEffect(() => {
    // Load the Cashfree JS SDK if it hasn't been loaded yet and we're not on Android
    if (!isMobile || !isAndroid) {
      const existingScript = document.getElementById('cashfree-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'cashfree-script';
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isMobile, isAndroid]);

  // Get server URL from current location
  const getServerUrl = () => {
    // For production, use a consistent server URL
    // For local development, derive from window.location
    if (process.env.NODE_ENV === 'production') {
      return 'https://wealth-horizon-bloom.com';
    }
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port || '5002';
    return `${protocol}//${hostname}:${port}`; // Use current port or fallback to 5002
  };

  // Create an order from your backend and initiate payment
  const initiatePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For testing purposes using direct test session ID, but not in production mode
      if (!USE_PRODUCTION && process.env.NODE_ENV !== 'production' && TEST_SESSION_ID) {
        console.log('Using test session ID for development environment');
        setPaymentSessionId(TEST_SESSION_ID);
        
        // For browser or iOS, use Cashfree JS SDK
        if (window.Cashfree) {
          const cashfree = window.Cashfree({
            mode: "test",
          });
          
          const checkoutOptions = {
            paymentSessionId: TEST_SESSION_ID,
            redirectTarget: "_self", // Load in the same window
          };
          
          cashfree.checkout(checkoutOptions).then(function(result: any) {
            if (result.error) {
              console.error("Checkout error:", result.error);
              setError(result.error.message || 'Payment failed');
              onPaymentError(result.error, orderId);
            }
            // Success handling will happen on the redirect URL
          });
        } else {
          // Fallback to redirect if SDK is not loaded
          console.log('Cashfree SDK not loaded, redirecting to payment URL');
          window.location.href = `https://payments.cashfree.com/order/#${TEST_SESSION_ID}`;
        }
        
        setIsLoading(false);
        return;
      }
      
      // Normal flow - fetch session ID from backend
      const apiUrl = `${getServerUrl()}/api/create-cashfree-order`;
      
      console.log('Creating order with:', {
        orderAmount,
        orderId,
        customerDetails,
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderAmount,
          orderId,
          customerDetails,
          // Pass the credentials to the backend
          appId: CURRENT_APP_ID,
          secretKey: CURRENT_SECRET_KEY,
          environment: CASHFREE_ENV
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const data = await response.json();
      console.log('Order created successfully:', data);
      
      if (!data.payment_session_id) {
        throw new Error('No payment session ID received from server');
      }

      setPaymentSessionId(data.payment_session_id);

      // Handle payment based on platform
      if (isMobile && isAndroid && Cashfree) {
        // For Android, use the native Capacitor plugin
        console.log('Starting Android payment with session ID:', data.payment_session_id);
        try {
          const result = await Cashfree.doWebPayment({
            paymentSessionId: data.payment_session_id,
            orderId: orderId,
            environment: NATIVE_ENV
          });
          
          if (result && result.status === 'success') {
            onPaymentSuccess(result.orderId);
          } else {
            onPaymentError({ message: 'Payment failed or was cancelled' }, orderId);
          }
        } catch (err: any) {
          console.error('Android payment error:', err);
          setError(err.message || 'Payment failed');
          onPaymentError(err, orderId);
        }
      } else {
        // For browser or iOS, use Cashfree JS SDK
        if (window.Cashfree) {
          const cashfree = window.Cashfree({
            mode: CASHFREE_ENV,
          });
          
          const checkoutOptions = {
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self", // Load in the same window
          };
          
          cashfree.checkout(checkoutOptions).then(function(result: any) {
            if (result.error) {
              console.error("Checkout error:", result.error);
              setError(result.error.message || 'Payment failed');
              onPaymentError(result.error, orderId);
            }
            // Success handling will happen on the redirect URL
          });
        } else {
          // Fallback to redirect if SDK is not loaded
          console.log('Cashfree SDK not loaded, redirecting to payment URL');
          const paymentUrl = data.payment_link || 
            `https://payments.cashfree.com/pg/view/checkout?payment_session_id=${data.payment_session_id}`;
          window.location.href = paymentUrl;
        }
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      setError(err.message || 'Failed to initiate payment');
      onPaymentError(err, orderId);
    } finally {
      setIsLoading(false);
    }
  };

  // For direct testing of the checkout with the provided test session ID
  // Only available in non-production environments
  const testDirectCheckout = () => {
    if (!USE_PRODUCTION && TEST_SESSION_ID) {
      if (window.Cashfree) {
        const cashfree = window.Cashfree({
          mode: "test",
        });
        
        cashfree.checkout({
          paymentSessionId: TEST_SESSION_ID,
          redirectTarget: "_self",
        });
      } else {
        window.location.href = `https://payments.cashfree.com/order/#${TEST_SESSION_ID}`;
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Payment Details</h2>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium">₹{orderAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-medium text-sm truncate max-w-[200px]">{orderId}</span>
        </div>
        {!USE_PRODUCTION && process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 text-xs text-amber-600 font-medium">
            Test Environment
          </div>
        )}
        {USE_PRODUCTION && (
          <div className="mt-2 text-xs text-green-600 font-medium">
            Production Environment
          </div>
        )}
      </div>
      
      <Button 
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md"
        onClick={initiatePayment}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Proceed to Pay'}
      </Button>
      
      {!USE_PRODUCTION && process.env.NODE_ENV !== 'production' && (
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md mt-2"
          onClick={testDirectCheckout}
        >
          Test Direct Checkout
        </Button>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-4">
        Secured by Cashfree Payment Gateway
      </div>
    </div>
  );
};

export default CashfreePayment; 