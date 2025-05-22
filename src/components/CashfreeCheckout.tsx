import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

// Define global type for Cashfree in window object
declare global {
  interface Window {
    Cashfree?: any;
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
  const [cashfree, setCashfree] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isNativeApp = Capacitor.isNativePlatform();

  // Load Cashfree SDK from CDN
  useEffect(() => {
    const loadCashfreeSDK = () => {
      // Check if SDK is already loaded
      if (window.Cashfree) {
        console.log("Cashfree SDK already loaded");
        setCashfree(window.Cashfree);
        return;
      }

      setIsLoading(true);
      
      // Create script tag
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js';
      script.async = true;
      
      script.onload = () => {
        console.log("Cashfree SDK loaded from CDN");
        if (window.Cashfree) {
          setCashfree(window.Cashfree);
          
          // Auto-initiate payment on mobile if we have a payment session ID
          if (isMobile && paymentSessionId) {
            setTimeout(() => {
              handleCashfreePayment(window.Cashfree);
            }, 500);
          }
        } else {
          console.error("Failed to load Cashfree SDK from CDN");
          toast({
            variant: "destructive",
            title: "SDK Error",
            description: "Failed to initialize payment gateway"
          });
        }
        setIsLoading(false);
      };
      
      script.onerror = (error) => {
        console.error("Error loading Cashfree SDK from CDN:", error);
        toast({
          variant: "destructive",
          title: "SDK Error",
          description: "Failed to load payment gateway"
        });
        setIsLoading(false);
      };
      
      // Add script to document
      document.body.appendChild(script);
      
      // Clean up on unmount
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };
    
    loadCashfreeSDK();
  }, [paymentSessionId]);

  const handleCashfreePayment = async (cf = cashfree) => {
    if (!cf) {
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
      
      // Set the appropriate redirect target based on platform
      const redirectTarget = isNativeApp ? "mobile" : "_self";
      
      // Configure checkout options with UPI Intent for mobile
      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: redirectTarget,
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
      
      // Trigger Cashfree checkout
      await cf.checkout(checkoutOptions);
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

  const handlePayment = () => {
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
      disabled={isLoading || (!cashfree && !upiLink)}
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