import React, { useEffect, useState } from 'react';
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
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = isMobileApp();
  const isAndroid = isAndroidDevice();

  // Get server URL from current location
  const getServerUrl = () => {
    // For production, use a consistent server URL
    // For local development, derive from window.location
    if (process.env.NODE_ENV === 'production') {
      return 'https://wealth-horizon-bloom.com';
    }
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5002`; // Updated port to 5002
  };

  useEffect(() => {
    // Setup payment callback when component mounts
    if (typeof CFPaymentGatewayService !== 'undefined') {
      CFPaymentGatewayService.setCallback({
        onVerify: (orderID: string) => {
          console.log('Payment verified for order:', orderID);
          onPaymentSuccess(orderID);
        },
        onError: (error: any, orderID: string) => {
          console.error('Payment error:', error, 'for order:', orderID);
          onPaymentError(error, orderID);
        },
      });
    }

    // Clean up callback when component unmounts
    return () => {
      if (typeof CFPaymentGatewayService !== 'undefined') {
        CFPaymentGatewayService.removeCallback();
      }
    };
  }, [onPaymentSuccess, onPaymentError]);

  // Create an order from your backend
  const createOrder = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const data = await response.json();
      console.log('Order created successfully:', data);
      setPaymentSessionId(data.payment_session_id);
      
      // Auto-start checkout on mobile for better experience
      if (isMobile && Cashfree && data.payment_session_id) {
        if (isAndroid) {
          // Use UPI Intent for Android
          startUpiPayment(data.payment_session_id);
        } else {
          // Use Web Checkout for non-Android platforms
          startWebCheckout(data.payment_session_id);
        }
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  // Start web checkout
  const startWebCheckout = async (sessionId?: string) => {
    const paymentId = sessionId || paymentSessionId;
    
    if (!paymentId) {
      setError('Payment session ID is missing');
      return;
    }
    
    try {
      if (isMobile && Cashfree) {
        console.log('Starting mobile web payment with Cashfree plugin');
        // Use the Capacitor plugin on mobile
        const result = await Cashfree.doWebPayment({
          paymentSessionId: paymentId,
          orderId,
          environment: 'PRODUCTION'
        });
        
        console.log('Payment result:', result);
        if (result.status === 'success') {
          onPaymentSuccess(result.orderId);
        }
      } else {
        console.log('Redirecting to web checkout URL');
        // For web browsers, redirect to Cashfree hosted checkout URL
        window.location.href = `https://payments.cashfree.com/pg/view/checkout?payment_session_id=${paymentId}`;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to start web checkout');
      onPaymentError(error, orderId);
    }
  };

  // Start UPI Intent checkout for Android
  const startUpiPayment = async (sessionId?: string) => {
    const paymentId = sessionId || paymentSessionId;
    
    if (!paymentId) {
      setError('Payment session ID is missing');
      return;
    }
    
    try {
      if (isMobile && Cashfree) {
        console.log('Starting UPI intent payment with Cashfree plugin');
        // Use the Capacitor plugin UPI intent flow
        const result = await Cashfree.doUPIPayment({
          paymentSessionId: paymentId,
          orderId,
          environment: 'PRODUCTION'
        });
        
        console.log('UPI payment result:', result);
        if (result.status === 'success') {
          onPaymentSuccess(result.orderId);
        }
      } else {
        // Fallback to web checkout if UPI not available
        console.log('UPI not available, falling back to web checkout');
        startWebCheckout(paymentId);
      }
    } catch (error: any) {
      console.error('UPI payment error:', error);
      setError(error.message || 'Failed to start UPI payment');
      
      // Try web checkout as fallback
      try {
        console.log('Trying web checkout as fallback');
        startWebCheckout(paymentId);
      } catch (webError: any) {
        onPaymentError(webError, orderId);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Payment Options</h2>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <Button 
        onClick={createOrder}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Initialize Payment'}
      </Button>
      
      {paymentSessionId && !isMobile && (
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => startWebCheckout()}
            variant="outline"
            className="w-full"
          >
            Pay Online (Cards, Netbanking, UPI, etc.)
          </Button>
        </div>
      )}
      
      {/* Only show UPI button on Android when session is available and not auto-started */}
      {paymentSessionId && isAndroid && (
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => startUpiPayment()}
            variant="outline"
            className="w-full"
          >
            Pay with UPI Apps
          </Button>
        </div>
      )}
    </div>
  );
};

export default CashfreePayment; 