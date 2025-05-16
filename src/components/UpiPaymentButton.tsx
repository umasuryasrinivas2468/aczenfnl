import React, { useState } from 'react';
import { useUpiPayment } from '../hooks/useUpiPayment';
import { Button } from './ui/button';
import { LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Capacitor } from '@capacitor/core';

interface UpiPaymentButtonProps {
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  label?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const UpiPaymentButton: React.FC<UpiPaymentButtonProps> = ({
  amount,
  customerDetails,
  label = 'Pay with UPI',
  onSuccess,
  onError,
  className = '',
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { startPayment, status, paymentStatus, checkStatus } = useUpiPayment({
    amount,
    customerDetails,
    onSuccess: (data) => {
      toast({
        title: 'Payment Initiated',
        description: 'Please complete the payment in your UPI app',
      });
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
      if (onError) onError(error);
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: 'Device Not Supported',
        description: 'UPI deep linking is only available on mobile devices',
        variant: 'destructive',
      });
      return;
    }

    // Validate customer information
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      toast({
        title: 'Missing Information',
        description: 'Customer name, email, and phone are required for UPI payment',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await startPayment();
      
      // We'll start polling for payment status
      // The status will be updated automatically through the hook
      
      // After some time (10 seconds), check if payment was completed
      setTimeout(() => {
        checkStatus().then(response => {
          // Check various status formats Cashfree might return
          const isSuccessful = 
            response?.data?.status === 'PAID' || 
            response?.data?.status === 'SUCCESS' ||
            response?.data?.paymentDetails?.status === 'SUCCESS';
            
          if (isSuccessful) {
            toast({
              title: 'Payment Successful',
              description: `₹${amount} paid successfully`,
              variant: 'default',
            });
          } else if (isProcessing) {
            // Still processing, show a reminder
            toast({
              title: 'Payment Pending',
              description: 'Please complete the payment in your UPI app',
            });
          }
        });
        
        setIsProcessing(false);
      }, 10000);
      
    } catch (error) {
      setIsProcessing(false);
    }
  };

  // Determine button state and appearance
  const getButtonContent = () => {
    if (isProcessing || status === 'loading') {
      return (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      );
    }
    
    // Check for various status formats Cashfree might return
    const isSuccessful = 
      paymentStatus?.status === 'PAID' || 
      paymentStatus?.status === 'SUCCESS' ||
      paymentStatus?.paymentDetails?.status === 'SUCCESS';
    
    if (isSuccessful) {
      return (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Payment Successful
        </>
      );
    }
    
    if (status === 'error') {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Try Again
        </>
      );
    }
    
    return label;
  };

  // Check for various status formats Cashfree might return
  const isSuccessful = 
    paymentStatus?.status === 'PAID' || 
    paymentStatus?.status === 'SUCCESS' ||
    paymentStatus?.paymentDetails?.status === 'SUCCESS';

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing || status === 'loading' || isSuccessful}
      className={`${className} ${
        isSuccessful ? 'bg-green-600 hover:bg-green-700' : ''
      }`}
    >
      {getButtonContent()}
    </Button>
  );
}; 