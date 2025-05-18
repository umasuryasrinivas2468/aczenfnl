import React from 'react';
import { PaymentStatus } from '../services/upiPaymentService';

interface UpiPaymentStatusProps {
  status: PaymentStatus | null;
  isLoading: boolean;
  onRetry?: () => void;
  onStartOver?: () => void;
  onViewHistory?: () => void;
}

const UpiPaymentStatus: React.FC<UpiPaymentStatusProps> = ({
  status,
  isLoading,
  onRetry,
  onStartOver,
  onViewHistory
}) => {
  if (isLoading) {
    return (
      <div className="upi-payment-status upi-payment-status-loading">
        <div className="upi-status-icon">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
          </svg>
        </div>
        <h3>Verifying Payment</h3>
        <p>Please wait while we verify your payment status...</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusContent = () => {
    switch (status.status) {
      case 'success':
        return (
          <>
            <div className="upi-status-icon upi-status-success">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Payment Successful</h3>
            <p>{status.message || 'Your payment has been completed successfully.'}</p>
            <div className="upi-payment-details">
              <p><strong>Transaction ID:</strong> {status.transactionId}</p>
              <p><strong>Amount:</strong> ₹{status.amount}</p>
              {status.responseCode && (
                <p><small>Response Code: {status.responseCode}</small></p>
              )}
            </div>
            {onViewHistory && (
              <button className="upi-btn upi-btn-secondary" onClick={onViewHistory}>
                View Transaction History
              </button>
            )}
          </>
        );
      
      case 'failure':
        return (
          <>
            <div className="upi-status-icon upi-status-failure">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3>Payment Failed</h3>
            <p>{status.message || 'Your payment could not be processed.'}</p>
            <div className="upi-payment-details">
              <p><strong>Transaction ID:</strong> {status.transactionId}</p>
              {status.responseCode && (
                <p><small>Response Code: {status.responseCode}</small></p>
              )}
            </div>
            <div className="upi-payment-actions">
              {onRetry && (
                <button className="upi-btn upi-btn-primary" onClick={onRetry}>
                  Retry Payment
                </button>
              )}
              {onStartOver && (
                <button className="upi-btn upi-btn-secondary" onClick={onStartOver}>
                  Start Over
                </button>
              )}
            </div>
          </>
        );
      
      case 'pending':
        return (
          <>
            <div className="upi-status-icon upi-status-pending">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Payment Pending</h3>
            <p>{status.message || 'Your payment is being processed. Please wait.'}</p>
            <div className="upi-payment-details">
              <p><strong>Transaction ID:</strong> {status.transactionId}</p>
            </div>
            <div className="upi-payment-actions">
              {onRetry && (
                <button className="upi-btn upi-btn-secondary" onClick={onRetry}>
                  Retry Opening UPI Apps
                </button>
              )}
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="upi-status-icon upi-status-unknown">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3>Payment Status Unknown</h3>
            <p>{status.message || 'We could not determine the status of your payment.'}</p>
            <div className="upi-payment-details">
              <p><strong>Transaction ID:</strong> {status.transactionId}</p>
            </div>
            <div className="upi-payment-actions">
              {onRetry && (
                <button className="upi-btn upi-btn-primary" onClick={onRetry}>
                  Check Status Again
                </button>
              )}
              {onStartOver && (
                <button className="upi-btn upi-btn-secondary" onClick={onStartOver}>
                  Start Over
                </button>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className={`upi-payment-status upi-payment-status-${status.status}`}>
      {getStatusContent()}
    </div>
  );
};

export default UpiPaymentStatus; 