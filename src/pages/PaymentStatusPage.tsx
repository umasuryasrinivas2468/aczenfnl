import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentResult, processPaymentCallback, updateLocalTransactionStatus } from '../utils/paymentUtils';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentStatusPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Extract URL query parameters
        const queryParams = new URLSearchParams(location.search);
        
        // Process the payment result
        const result = await processPaymentCallback(queryParams);
        setPaymentResult(result);
        
        // Update local transaction status
        updateLocalTransactionStatus(result);
        
      } catch (error) {
        console.error('Error processing payment callback:', error);
        setPaymentResult({
          orderId: 'unknown',
          status: 'failure'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handlePaymentCallback();
  }, [location]);

  const getStatusDisplay = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center">
          <Clock className="h-16 w-16 text-yellow-500 animate-pulse mb-4" />
          <h2 className="text-xl font-semibold">Processing Payment</h2>
          <p className="text-gray-500 mt-2">Please wait while we verify your payment...</p>
        </div>
      );
    }

    if (!paymentResult) {
      return (
        <div className="flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Error Processing Payment</h2>
          <p className="text-gray-500 mt-2">We couldn't process your payment information.</p>
        </div>
      );
    }

    switch (paymentResult.status) {
      case 'success':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold">Payment Successful</h2>
            <p className="text-gray-500 mt-2">
              Your payment of {paymentResult.amount ? `₹${paymentResult.amount}` : ''} has been processed successfully.
            </p>
          </div>
        );
      case 'failure':
        return (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Payment Failed</h2>
            <p className="text-gray-500 mt-2">
              Your payment could not be processed. Please try again.
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <Clock className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold">Payment Pending</h2>
            <p className="text-gray-500 mt-2">
              Your payment is being processed. We'll update you once it's complete.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>
            Details about your recent transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getStatusDisplay()}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentStatusPage; 