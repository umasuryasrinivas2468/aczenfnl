import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';
import { ensureCashfreeSDK, getCashfreeInstance } from '@/utils/cashfreeLoader';

// Define global type for Cashfree in window object
declare global {
  interface Window {
    Cashfree?: any;
    cashfree?: any;
  }
}

interface CashfreeCheckoutProps {
  orderId: string;
  amount: number;
  upiLink?: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
  paymentSessionId?: string;
  appScheme?: string;
}

const CashfreeCheckout: React.FC<CashfreeCheckoutProps> = ({
  orderId,
  amount,
  upiLink,
  onSuccess,
  onFailure,
  buttonText = "Pay Now",
  className = "",
  paymentSessionId,
  appScheme = "wealthhorizon"
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSdkReady, setIsSdkReady] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isNativeApp = Capacitor.isNativePlatform();
  const sdkLoadAttempted = useRef<boolean>(false);
  const cashfreeInstanceRef = useRef<any>(null);

  // Load Cashfree SDK using the new utility
  useEffect(() => {
    // Only attempt to load once
    if (sdkLoadAttempted.current) return;
    sdkLoadAttempted.current = true;
    
    const initSDK = async () => {
      try {
        setIsLoading(true);
        const instance = await ensureCashfreeSDK();
        cashfreeInstanceRef.current = instance;
        setIsSdkReady(true);
        
        // Auto-initiate payment on mobile if we have a payment session ID
        if (isMobile && paymentSessionId) {
          setTimeout(() => {
            handleCashfreePayment();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
        toast({
          variant: "destructive",
          title: "SDK Error",
          description: "Failed to initialize payment gateway"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initSDK();
  }, [paymentSessionId]);

  const handleCashfreePayment = async () => {
    const cashfreeInstance = cashfreeInstanceRef.current || getCashfreeInstance();
    
    if (!cashfreeInstance) {
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
      
      // Fall back to UPI link if available
      if (upiLink) {
        handleUpiPayment();
      }
      return;
    }

    try {
      setIsLoading(true);
      
      // Re-ensure SDK is ready before proceeding
      const freshInstance = await ensureCashfreeSDK();
      cashfreeInstanceRef.current = freshInstance;
      
      // Configure checkout options with UPI Intent for mobile
      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        // Specify UPI as payment method for mobile devices
        ...(isMobile && { paymentMethod: "upi" }),
        components: {
          upi: {
            // Force UPI Intent mode for better mobile experience
            upiMode: "intent",
            // App scheme for deep linking in native apps
            redirectUrl: `${appScheme}://cashfree-callback`
          }
        },
        // Optional callbacks for web mode
        onSuccess: (data: any) => {
          console.log("Payment success callback:", data);
          if (onSuccess) onSuccess(data);
        },
        onFailure: (error: any) => {
          console.log("Payment failure callback:", error);
          if (onFailure) onFailure(error);
        }
      };
      
      console.log("Initiating Cashfree payment with options:", checkoutOptions);
      
      // Trigger Cashfree checkout using the v3 SDK
      await freshInstance.checkout(checkoutOptions);
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

  // Legacy UPI link handling
  const handleUpiPayment = () => {
    if (!upiLink) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No UPI payment link available"
      });
      return;
    }
    
    console.log("Opening UPI link:", upiLink);
    
    // Store the UPI URL for recovery
    localStorage.setItem('last_upi_url', upiLink);
    
    // Open the UPI link
    window.location.href = upiLink;
  };

  const handlePayment = async () => {
    // Prefer Cashfree SDK with payment session ID
    if (paymentSessionId) {
      handleCashfreePayment();
    } 
    // Fall back to direct UPI link if available
    else if (upiLink) {
      handleUpiPayment();
    } 
    else {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "No payment method available"
      });
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || (!cashfreeInstanceRef.current && !upiLink)}
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

export default CashfreeCheckout; 