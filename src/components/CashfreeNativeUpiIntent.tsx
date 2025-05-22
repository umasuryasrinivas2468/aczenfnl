import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

// Import the Cashfree React Native SDK
// Note: This is a mock import since we're in a Capacitor project
// In a real React Native project, you would use:
// import { CFPaymentGatewayService, CFErrorResponse, CFPaymentComponentParams, CFDropCheckoutPayment, CFUPIIntentCheckoutPayment } from 'react-native-cashfree-pg-sdk';

interface CashfreeNativeUpiIntentProps {
  orderId: string;
  amount: number;
  paymentSessionId: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
}

const CashfreeNativeUpiIntent: React.FC<CashfreeNativeUpiIntentProps> = ({
  orderId,
  amount,
  paymentSessionId,
  onSuccess,
  onFailure,
  buttonText = "Pay with UPI",
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const isNativeApp = Capacitor.isNativePlatform();

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

    setIsLoading(true);

    try {
      // This code would work in a real React Native environment
      // For this Capacitor project, we're showing the implementation pattern

      /*
      // 1. Create UPI Intent payment params
      const upiIntentParams: CFUPIIntentCheckoutPayment = {
        paymentSessionId: paymentSessionId,
        orderID: orderId,
        appId: "YOUR_APP_ID_HERE", // Replace with your Cashfree App ID
      };

      // 2. Register callbacks for payment events
      CFPaymentGatewayService.getInstance().setCallback({
        onVerify: (orderID: string) => {
          console.log("Payment verified for order:", orderID);
          
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
          console.error("Payment error:", error, "for order:", orderID);
          if (onFailure) onFailure({
            message: error.message || 'Payment failed',
            code: error.code,
            orderId: orderID
          });
        }
      });

      // 3. Start UPI Intent payment
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

  return (
    <Button
      onClick={handleUpiIntentPayment}
      disabled={isLoading || !paymentSessionId || !isNativeApp}
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

export default CashfreeNativeUpiIntent;

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