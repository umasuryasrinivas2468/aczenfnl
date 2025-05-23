import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

// Define global type for Cashfree in window object
declare global {
  interface Window {
    Cashfree?: any;
    cashfree?: any;
    cashfreeInstance?: any;
  }
}

interface CashfreeUpiIntentProps {
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

const CashfreeUpiIntent: React.FC<CashfreeUpiIntentProps> = ({
  paymentSessionId,
  orderId,
  amount,
  onSuccess,
  onFailure,
  buttonText = "Pay with UPI",
  className = "",
  autoInitiate = false,
  appScheme = "wealthhorizon"
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSdkReady, setIsSdkReady] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isNativeApp = Capacitor.isNativePlatform();
  const sdkLoadAttempted = useRef<boolean>(false);
  const cashfreeInstanceRef = useRef<any>(null);

  // Load and initialize the SDK immediately
  useEffect(() => {
    // Only load once
    if (sdkLoadAttempted.current) return;
    sdkLoadAttempted.current = true;
    
    const loadCashfreeSDK = async () => {
      // If SDK is already loaded globally
      if (window.cashfreeInstance) {
        console.log("Using existing Cashfree instance");
        cashfreeInstanceRef.current = window.cashfreeInstance;
        setIsSdkReady(true);
        
        // Auto-initiate payment
        if (autoInitiate && isMobile && paymentSessionId) {
          setTimeout(() => handleUpiPayment(), 100);
        }
        return;
      }
      
      if (window.Cashfree) {
        try {
          console.log("Cashfree SDK already available, creating instance");
          window.cashfreeInstance = window.Cashfree({ mode: "production" });
          cashfreeInstanceRef.current = window.cashfreeInstance;
          setIsSdkReady(true);
          
          // Auto-initiate payment
          if (autoInitiate && isMobile && paymentSessionId) {
            setTimeout(() => handleUpiPayment(), 100);
          }
          return;
        } catch (error) {
          console.error("Failed to create Cashfree instance:", error);
        }
      }
      
      console.log("Loading Cashfree SDK from CDN");
      
      // Create script tag
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      
      // Set up promise to handle script loading
      const scriptPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log("Cashfree SDK loaded from CDN");
          
          try {
            if (window.Cashfree) {
              // Create instance with production mode
              window.cashfreeInstance = window.Cashfree({ mode: "production" });
              cashfreeInstanceRef.current = window.cashfreeInstance;
              setIsSdkReady(true);
              resolve();
            } else {
              reject(new Error("SDK loaded but Cashfree not available"));
            }
          } catch (error) {
            console.error("Error creating Cashfree instance:", error);
            reject(error);
          }
        };
        
        script.onerror = (error) => {
          console.error("Error loading Cashfree SDK from CDN:", error);
          reject(error);
        };
      });
      
      // Add script to document
      document.body.appendChild(script);
      
      // Handle SDK loading
      try {
        await scriptPromise;
        console.log("Cashfree SDK initialized successfully");
        
        // Auto-initiate payment
        if (autoInitiate && isMobile && paymentSessionId) {
          setTimeout(() => handleUpiPayment(), 100);
        }
      } catch (error) {
        console.error("Failed to load or initialize Cashfree SDK:", error);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "Could not initialize payment gateway"
        });
      }
    };
    
    // Start loading SDK immediately
    loadCashfreeSDK();
  }, []);

  const handleUpiPayment = async () => {
    if (isLoading) return; // Prevent multiple calls
    
    // Use the instance from ref or window object
    const cashfree = cashfreeInstanceRef.current || window.cashfreeInstance;
    
    if (!cashfree) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Payment gateway not initialized"
      });
      return;
    }

    if (!paymentSessionId) {
      toast({
        variant: "destructive",
        title: "Missing Data",
        description: "No payment session ID provided"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // UPI Intent options optimized for quick launch
      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        paymentMethod: "upi",
        components: {
          upi: {
            upiMode: "intent",
            redirectUrl: `${appScheme}://cashfree-callback`
          }
        },
        // Callbacks
        onSuccess: (data: any) => {
          console.log("Payment success:", data);
          setIsLoading(false);
          if (onSuccess) onSuccess(data);
        },
        onFailure: (error: any) => {
          console.log("Payment failure:", error);
          setIsLoading(false);
          if (onFailure) onFailure(error);
        }
      };
      
      console.log("Starting UPI Intent checkout");
      
      // Trigger the checkout with minimal delay
      await cashfree.checkout(checkoutOptions);
      
    } catch (error) {
      console.error("UPI Intent checkout error:", error);
      setIsLoading(false);
      
      if (onFailure) {
        onFailure(error);
      } else {
        toast({
          variant: "destructive",
          title: "Checkout Error",
          description: error instanceof Error ? error.message : "Failed to start UPI Intent"
        });
      }
    }
  };

  return (
    <Button
      onClick={handleUpiPayment}
      disabled={isLoading}
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

export default CashfreeUpiIntent; 