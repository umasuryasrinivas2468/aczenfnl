import React, { useEffect, useState } from 'react';
import { load } from "@cashfreepayments/cashfree-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';

interface CashfreeMobileCheckoutProps {
  paymentSessionId: string;
  orderId: string;
  amount: number;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
  autoInitiate?: boolean;
  appScheme?: string;
}

const CashfreeMobileCheckout: React.FC<CashfreeMobileCheckoutProps> = ({
  paymentSessionId,
  orderId,
  amount,
  onSuccess,
  onFailure,
  buttonText = "Pay Now",
  className = "",
  autoInitiate = false,
  appScheme = "wealthhorizon"
}) => {
  const [cashfree, setCashfree] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isNativeApp = Capacitor.isNativePlatform();

  // Initialize Cashfree SDK on component mount
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setIsLoading(true);
        const cashfreeInstance = await load({
          mode: "production" // Use "sandbox" for testing
        });
        console.log("Cashfree SDK initialized successfully");
        setCashfree(cashfreeInstance);
        
        // Auto-initiate payment if requested and on mobile
        if (autoInitiate && (isMobile || isNativeApp) && paymentSessionId) {
          setTimeout(() => {
            handlePayment();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
        if (onFailure) {
          onFailure({ message: "Failed to initialize payment gateway" });
        }
        toast({
          variant: "destructive",
          title: "SDK Error",
          description: "Failed to initialize payment gateway"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSDK();
    
    // Set up app URL open listener for Capacitor apps
    if (isNativeApp) {
      const appUrlOpenHandler = (event: URLOpenListenerEvent) => {
        console.log('App opened with URL:', event);
        handleDeepLink(event.url);
      };
      
      // Add the listener
      App.addListener('appUrlOpen', appUrlOpenHandler);
      
      // Return cleanup function
      return () => {
        App.removeAllListeners();
      };
    }
  }, [paymentSessionId, autoInitiate]);

  const handleDeepLink = (url: string) => {
    // Extract parameters from the deep link URL
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Check for payment status parameters
      const txStatus = params.get('txStatus') || params.get('status');
      const orderIdParam = params.get('orderId') || params.get('order_id');
      
      if (orderIdParam === orderId) {
        if (txStatus === 'SUCCESS' || txStatus === 'success') {
          const paymentData = {
            orderId: orderIdParam,
            txStatus,
            txTime: params.get('txTime') || params.get('transaction_time'),
            paymentId: params.get('paymentId') || params.get('cf_payment_id'),
            txMsg: params.get('txMsg') || params.get('message')
          };
          
          handlePaymentSuccess(paymentData);
        } else {
          handlePaymentFailure({
            message: params.get('txMsg') || params.get('message') || 'Payment failed',
            code: txStatus
          });
        }
      }
    } catch (error) {
      console.error('Error processing deep link:', error);
    }
  };

  const handlePayment = async () => {
    if (!cashfree) {
      toast({
        variant: "destructive",
        title: "SDK Error",
        description: "Payment gateway not initialized"
      });
      return;
    }

    if (!paymentSessionId) {
      toast({
        variant: "destructive",
        title: "Missing session ID",
        description: "No payment session ID provided"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Set the appropriate redirect target based on platform
      // "mobile" is specifically required for UPI Intent in Capacitor apps
      const redirectTarget = isNativeApp ? "mobile" : "_self";
      
      // Configure UPI Intent specifically for mobile
      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: redirectTarget,
        // Force UPI payment method for UPI Intent flow
        paymentMethod: "upi",
        components: {
          upi: {
            // Explicitly set upiMode to "intent" for UPI Intent flow
            upiMode: "intent",
            // Use app scheme for deep linking in Capacitor apps
            redirectUrl: `${appScheme}://cashfree-callback`
          }
        },
        // Optional theme customization
        theme: {
          primaryColor: "#3498db",
          secondaryColor: "#2ecc71",
          buttonTextColor: "#ffffff",
          primaryTextColor: "#ffffff",
          secondaryTextColor: "#f0f0f0"
        },
        // Callbacks for web mode (won't work in UPI Intent mode)
        onSuccess: (data: any) => {
          console.log("Payment success callback:", data);
          handlePaymentSuccess(data);
        },
        onFailure: (error: any) => {
          console.log("Payment failure callback:", error);
          handlePaymentFailure(error);
        },
        onError: (error: any) => {
          console.log("Payment error callback:", error);
          handlePaymentFailure(error);
        }
      };
      
      console.log("Initiating UPI Intent payment with options:", checkoutOptions);
      
      // Trigger Cashfree checkout
      await cashfree.checkout(checkoutOptions);
    } catch (error) {
      console.error("Checkout error:", error);
      if (onFailure) {
        onFailure(error);
      }
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to initialize checkout"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    if (onSuccess) {
      onSuccess(data);
    }
    toast({
      title: "Payment Successful",
      description: `Order ${orderId} paid successfully`
    });
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    if (onFailure) {
      onFailure(error);
    }
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error?.message || "Payment could not be processed"
    });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !cashfree || !paymentSessionId}
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
  );
};

export default CashfreeMobileCheckout; 