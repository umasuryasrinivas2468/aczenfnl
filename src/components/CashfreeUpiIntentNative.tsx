import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

// In a real React Native app, you would use these imports:
// import { 
//   CFPaymentGatewayService, 
//   CFErrorResponse,
//   CFUPIIntentCheckoutPayment,
//   CFEnvironment
// } from 'react-native-cashfree-pg-sdk';

interface CashfreeUpiIntentNativeProps {
  orderId: string;
  amount: number;
  paymentSessionId: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
  appId?: string;
  environment?: 'SANDBOX' | 'PRODUCTION';
  debug?: boolean;
}

const CashfreeUpiIntentNative: React.FC<CashfreeUpiIntentNativeProps> = ({
  orderId,
  amount,
  paymentSessionId,
  onSuccess,
  onFailure,
  buttonText = "Pay with UPI",
  className = "",
  appId = "YOUR_APP_ID", // Replace with your actual Cashfree App ID
  environment = "PRODUCTION",
  debug = true
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sdkInitialized, setSdkInitialized] = useState<boolean>(false);
  const { toast } = useToast();
  const isNativeApp = Capacitor.isNativePlatform();

  useEffect(() => {
    // Initialize the SDK when component mounts
    if (isNativeApp) {
      initializeSdk();
    }
    
    return () => {
      // Cleanup when component unmounts
      if (isNativeApp) {
        cleanupSdk();
      }
    };
  }, []);

  const initializeSdk = () => {
    if (debug) console.log("Initializing Cashfree SDK...");
    
    try {
      // In a real React Native app:
      /*
      // Set the environment
      const env = environment === 'PRODUCTION' 
        ? CFEnvironment.PRODUCTION 
        : CFEnvironment.SANDBOX;
        
      // Initialize the SDK
      CFPaymentGatewayService.getInstance().setCallback({
        onVerify: (orderID: string) => {
          if (debug) console.log("Payment verified for order:", orderID);
          
          // Verify payment status with your backend
          verifyPaymentStatus(orderID).then(result => {
            if (result.success) {
              if (onSuccess) onSuccess({
                orderId: orderID,
                status: 'SUCCESS',
                paymentMode: 'UPI_INTENT'
              });
            } else {
              if (onFailure) onFailure({
                message: 'Payment verification failed',
                orderId: orderID
              });
            }
          });
        },
        onError: (error: CFErrorResponse, orderID: string) => {
          if (debug) console.error("Payment error:", error, "for order:", orderID);
          if (onFailure) onFailure({
            message: error.message || 'Payment failed',
            code: error.code,
            orderId: orderID
          });
        }
      });
      */
      
      if (debug) console.log("Cashfree SDK initialized successfully");
      setSdkInitialized(true);
      
    } catch (error) {
      console.error("Failed to initialize Cashfree SDK:", error);
      toast({
        variant: "destructive",
        title: "SDK Error",
        description: "Failed to initialize payment gateway"
      });
    }
  };

  const cleanupSdk = () => {
    // In a real React Native app:
    /*
    try {
      // Remove callbacks
      CFPaymentGatewayService.getInstance().setCallback(null);
    } catch (error) {
      console.error("Error cleaning up SDK:", error);
    }
    */
  };

  const handleUpiIntentPayment = async () => {
    if (!isNativeApp) {
      toast({
        variant: "destructive",
        title: "Platform Error",
        description: "UPI Intent is only supported on native mobile apps"
      });
      return;
    }

    if (!paymentSessionId) {
      toast({
        variant: "destructive",
        title: "Missing Session ID",
        description: "Payment session ID is required"
      });
      return;
    }

    if (!sdkInitialized) {
      toast({
        variant: "destructive",
        title: "SDK Error",
        description: "Payment gateway not initialized"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (debug) {
        console.log("Starting UPI Intent payment with params:", {
          paymentSessionId,
          orderId,
          amount,
          appId
        });
      }
      
      // In a real React Native app:
      /*
      // Create UPI Intent payment params
      const upiIntentParams: CFUPIIntentCheckoutPayment = {
        paymentSessionId: paymentSessionId,
        orderID: orderId,
        appId: appId
      };

      // Start UPI Intent payment
      await CFPaymentGatewayService.getInstance().doUPIPayment(upiIntentParams);
      */
      
      // For demo purposes in Capacitor, show a toast
      toast({
        title: "UPI Intent Initiated",
        description: "This would open a UPI app in a real React Native environment"
      });

      // Simulate success after 2 seconds for demo
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            orderId: orderId,
            status: 'SUCCESS',
            paymentMode: 'UPI_INTENT'
          });
        }
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error("UPI Intent payment error:", error);
      if (onFailure) {
        onFailure({
          message: error instanceof Error ? error.message : 'Payment failed',
          orderId: orderId
        });
      }
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate UPI payment"
      });
      setIsLoading(false);
    }
  };

  // Debug function to check if UPI apps are installed
  const checkUpiApps = () => {
    // In a real React Native app:
    /*
    import { Linking } from 'react-native';
    
    const upiSchemes = [
      'upi://', 'gpay://', 'phonepe://', 'paytmmp://', 'bhim://'
    ];
    
    upiSchemes.forEach(scheme => {
      Linking.canOpenURL(scheme).then(supported => {
        console.log(`${scheme} supported: ${supported}`);
      }).catch(err => {
        console.error(`Error checking ${scheme}:`, err);
      });
    });
    */
    
    console.log("Would check for installed UPI apps in a real React Native environment");
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleUpiIntentPayment}
        disabled={isLoading || !paymentSessionId || !isNativeApp || !sdkInitialized}
        className={`${className} ${isLoading ? 'opacity-70' : ''}`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span>Processing...</span>
          </div>
        ) : (
          buttonText
        )}
      </Button>
      
      {debug && (
        <div className="text-xs text-gray-500">
          <p>SDK Initialized: {sdkInitialized ? 'Yes' : 'No'}</p>
          <p>Native App: {isNativeApp ? 'Yes' : 'No'}</p>
          <p>Payment Session ID: {paymentSessionId ? paymentSessionId.substring(0, 10) + '...' : 'Not set'}</p>
          <p>Order ID: {orderId || 'Not set'}</p>
          <button 
            onClick={checkUpiApps}
            className="text-blue-500 underline mt-1"
          >
            Check UPI Apps
          </button>
        </div>
      )}
    </div>
  );
};

export default CashfreeUpiIntentNative;

// Helper function to verify payment status with your backend
async function verifyPaymentStatus(orderId: string): Promise<{ success: boolean, data?: any }> {
  try {
    // This would be an API call to your backend
    // For demo purposes, we're returning success
    return { success: true };
  } catch (error) {
    console.error("Payment verification error:", error);
    return { success: false };
  }
} 