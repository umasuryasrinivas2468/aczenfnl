import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { initiateUpiIntentPayment, verifyUpiPaymentStatus, UpiPaymentParams } from '@/services/upiIntentService';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface UpiIntentPaymentProps {
  orderId: string;
  amount: number;
  payeeName: string;
  payeeVpa: string;
  description?: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  onPending?: () => void;
  buttonText?: string;
  className?: string;
}

const UpiIntentPayment: React.FC<UpiIntentPaymentProps> = ({
  orderId,
  amount,
  payeeName,
  payeeVpa,
  description,
  onSuccess,
  onFailure,
  onPending,
  buttonText = 'Pay with UPI',
  className = ''
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failure' | 'pending'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Set up event listener for payment status updates
  useEffect(() => {
    const handlePaymentStatus = (event: any) => {
      const { status, orderId: eventOrderId, data } = event.detail;
      
      // Only process events for this payment
      if (eventOrderId === orderId) {
        if (status === 'success') {
          setStatus('success');
          setPaymentData(data);
          if (onSuccess) onSuccess(data);
        } else if (status === 'failure') {
          setStatus('failure');
          setError(data.message || 'Payment failed');
          if (onFailure) onFailure(data);
        } else if (status === 'pending') {
          setStatus('pending');
          if (onPending) onPending();
        } else if (status === 'timeout' || status === 'error') {
          setStatus('failure');
          setError(data.message || 'Payment verification failed');
          if (onFailure) onFailure(data);
        }
        
        setLoading(false);
      }
    };
    
    // Add event listener
    window.addEventListener('upi_payment_status', handlePaymentStatus);
    
    // Clean up
    return () => {
      window.removeEventListener('upi_payment_status', handlePaymentStatus);
    };
  }, [orderId, onSuccess, onFailure, onPending]);

  // Handle payment initiation
  const handlePayment = async () => {
    try {
      setLoading(true);
      setStatus('loading');
      setError(null);
      
      // Create payment params
      const paymentParams: UpiPaymentParams = {
        orderId,
        amount,
        payeeName,
        payeeVpa,
        description: description || `Payment for order ${orderId}`
      };
      
      // Initiate payment
      await initiateUpiIntentPayment(paymentParams);
      
      // Status will be updated by the event listener
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setStatus('failure');
      setError(error.message || 'Failed to initiate payment');
      setLoading(false);
      
      if (onFailure) onFailure(error);
    }
  };

  // Handle manual verification
  const handleVerify = async () => {
    try {
      setLoading(true);
      
      // Verify payment status
      const result = await verifyUpiPaymentStatus(orderId);
      
      // Status will be updated by the event listener
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setStatus('failure');
      setError(error.message || 'Failed to verify payment');
      setLoading(false);
      
      if (onFailure) onFailure(error);
    }
  };

  // Render status indicator
  const renderStatus = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="mr-2" size={16} />
            <span>Payment successful</span>
          </div>
        );
      case 'failure':
        return (
          <div className="flex items-center text-red-500">
            <XCircle className="mr-2" size={16} />
            <span>{error || 'Payment failed'}</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <AlertTriangle className="mr-2" size={16} />
            <span>Payment pending verification</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {status === 'idle' || status === 'loading' ? (
        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 ${className}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      ) : (
        <>
          {renderStatus()}
          
          {status === 'pending' && (
            <Button 
              onClick={handleVerify} 
              disabled={loading}
              variant="outline"
              className="mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default UpiIntentPayment; 