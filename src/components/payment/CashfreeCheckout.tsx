import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CashfreeCheckoutProps {
  paymentSessionId: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

// Define Cashfree global type
declare global {
  interface Window {
    Cashfree: any;
  }
}

const CashfreeCheckout = ({
  paymentSessionId,
  buttonText = "Pay Now",
  className = "",
  disabled = false
}: CashfreeCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const { toast } = useToast();
  
  // Load the Cashfree SDK directly
  useEffect(() => {
    console.log("CashfreeCheckout component mounted");
    
    // Check if script already exists
    const existingScript = document.getElementById('cashfree-script');
    if (existingScript) {
      console.log("Cashfree SDK script already exists");
      setIsSDKLoaded(true);
      return;
    }
    
    console.log("Loading Cashfree SDK script...");
    const script = document.createElement('script');
    script.id = 'cashfree-script';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Cashfree SDK loaded successfully!");
      setIsSDKLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error("Error loading Cashfree SDK:", error);
      toast({
        variant: "destructive",
        title: "SDK Loading Error",
        description: "Failed to load payment SDK. Please try again.",
      });
    };
    
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      // We don't remove the script on unmount as other components might need it
    };
  }, [toast]);

  const doPayment = async () => {
    if (!paymentSessionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing payment session ID",
      });
      return;
    }

    if (!isSDKLoaded || !window.Cashfree) {
      toast({
        variant: "destructive",
        title: "SDK Not Ready",
        description: "Payment SDK is still loading. Please try again.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Starting payment with session:", paymentSessionId);
      
      // Initialize Cashfree with configuration
      const cashfree = new window.Cashfree({
        mode: "production" // Use "sandbox" for testing
      });
      
      console.log("Cashfree initialized:", cashfree);
      
      let checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self",
      };
      
      console.log("Calling cashfree.checkout with options:", checkoutOptions);
      const result = await cashfree.checkout(checkoutOptions);
      
      console.log("Checkout result:", result);
      
      if (result.error) {
        throw new Error(result.error.message || "Payment failed");
      }
      
    } catch (error: any) {
      console.error("Payment error:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
      });
    }
  };

  return (
    <div className="row">
      <p>Click below to open the checkout page in current tab</p>
      <Button
        onClick={doPayment}
        disabled={disabled || isLoading || !isSDKLoaded}
        className={className || "btn btn-primary"}
        id="renderBtn"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : !isSDKLoaded ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading SDK...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );
};

export default CashfreeCheckout; 