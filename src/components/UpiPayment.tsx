import React, { useState, useEffect } from 'react';
import { UpiPaymentService, UpiPaymentParams, PaymentStatus } from '../services/upiPaymentService';

interface UpiPaymentProps {
  amount: string;
  upiId: string;
  payeeName: string;
  description?: string;
  orderId: string;
  onSuccess?: (data: PaymentStatus) => void;
  onFailure?: (data: PaymentStatus) => void;
  onPending?: (data: PaymentStatus) => void;
}

const UpiPayment: React.FC<UpiPaymentProps> = ({
  amount,
  upiId,
  payeeName,
  description = 'Payment',
  orderId,
  onSuccess,
  onFailure,
  onPending
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [supportsUpi, setSupportsUpi] = useState<boolean>(false);
  
  const upiService = UpiPaymentService.getInstance();
  
  useEffect(() => {
    // Check if the device likely supports UPI
    setSupportsUpi(upiService.supportsUpi());
  }, []);
  
  // Check for payment status on component mount (for handling returns from UPI apps)
  useEffect(() => {
    const checkPendingPayment = async () => {
      const pendingTxnId = localStorage.getItem('pending_txn_id');
      const startTime = localStorage.getItem('upi_payment_start_time');
      
      if (pendingTxnId && startTime) {
        const elapsedTime = Date.now() - parseInt(startTime);
        
        // Only check if it's within a reasonable time window (15 minutes)
        if (elapsedTime < 15 * 60 * 1000) {
          try {
            setIsLoading(true);
            
            // Poll for payment status
            const status = await upiService.pollPaymentStatus(pendingTxnId);
            setPaymentStatus(status);
            
            // Handle based on status
            if (status.status === 'success' && onSuccess) {
              onSuccess(status);
              // Clear local storage after successful check
              localStorage.removeItem('pending_txn_id');
              localStorage.removeItem('upi_payment_start_time');
            } else if (status.status === 'failure' && onFailure) {
              onFailure(status);
              // Clear local storage after failed check
              localStorage.removeItem('pending_txn_id');
              localStorage.removeItem('upi_payment_start_time');
            } else if (onPending) {
              onPending(status);
            }
          } catch (error) {
            setError('Failed to check payment status');
            console.error('Error checking payment status:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };
    
    checkPendingPayment();
  }, []);
  
  const handlePayment = async () => {
    if (!supportsUpi) {
      setError('UPI payment is not supported on this device');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate transaction ID
      const transactionId = upiService.generateTransactionId();
      
      // Create payment params
      const paymentParams: UpiPaymentParams = {
        pa: upiId,
        pn: payeeName,
        tn: description,
        am: amount,
        cu: 'INR',
        tid: transactionId,
        tr: orderId
      };
      
      // Initialize payment in backend
      const { upiUrl } = await upiService.initializePayment(paymentParams);
      
      // Store transaction ID for checking status later
      localStorage.setItem('pending_txn_id', transactionId);
      
      // Open UPI app
      const opened = upiService.openUpiApp(upiUrl);
      
      if (!opened) {
        setError('Could not open UPI app');
        localStorage.removeItem('pending_txn_id');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError('Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };
  
  // For web testing, allow manual status check
  const checkStatus = async () => {
    const pendingTxnId = localStorage.getItem('pending_txn_id');
    
    if (!pendingTxnId) {
      setError('No pending transaction found');
      return;
    }
    
    try {
      setIsLoading(true);
      const status = await upiService.checkPaymentStatus(pendingTxnId);
      setPaymentStatus(status);
      
      if (status.status === 'success' && onSuccess) {
        onSuccess(status);
      } else if (status.status === 'failure' && onFailure) {
        onFailure(status);
      } else if (onPending) {
        onPending(status);
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setError('Failed to check payment status');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="upi-payment-container">
      {error && (
        <div className="upi-payment-error">
          {error}
        </div>
      )}
      
      {!supportsUpi && (
        <div className="upi-payment-warning">
          UPI payments are only supported on mobile devices with UPI apps installed.
        </div>
      )}
      
      <button 
        className="upi-payment-button"
        onClick={handlePayment}
        disabled={isLoading || !supportsUpi}
      >
        {isLoading ? 'Processing...' : `Pay ₹${amount} via UPI`}
      </button>
      
      {paymentStatus && (
        <div className={`upi-payment-status upi-payment-status-${paymentStatus.status}`}>
          <p>Payment {paymentStatus.status}</p>
          {paymentStatus.message && <p>{paymentStatus.message}</p>}
        </div>
      )}
      
      {/* For web testing only */}
      {upiService.isMobileDevice() && !upiService.supportsUpi() && (
        <button 
          className="upi-payment-check-button"
          onClick={checkStatus}
          disabled={isLoading}
        >
          Check Payment Status
        </button>
      )}
    </div>
  );
};

export default UpiPayment; 