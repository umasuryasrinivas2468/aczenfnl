import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PaymentStatus {
  status: 'success' | 'failure' | 'pending' | 'processing' | 'unknown';
  orderId: string;
  message?: string;
}

const PaymentSuccess: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'unknown',
    orderId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to get server URL
  const getServerUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://wealth-horizon-bloom.com';
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5001`;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('order_id');
    
    if (!orderId) {
      setPaymentStatus({
        status: 'unknown',
        orderId: '',
        message: 'Invalid payment session. Order ID not found.'
      });
      setIsLoading(false);
      return;
    }

    // Verify payment status from server
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`${getServerUrl()}/api/payment-status/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to verify payment status');
        }
        
        const data = await response.json();
        
        // Process payment status
        if (data.order_status === 'PAID') {
          setPaymentStatus({
            status: 'success',
            orderId: data.order_id,
            message: 'Payment completed successfully!'
          });
        } else if (data.order_status === 'ACTIVE') {
          setPaymentStatus({
            status: 'pending',
            orderId: data.order_id,
            message: 'Payment is being processed. Please wait.'
          });
        } else {
          setPaymentStatus({
            status: 'failure',
            orderId: data.order_id,
            message: data.payment_message || 'Payment was not successful'
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus({
          status: 'unknown',
          orderId: orderId || '',
          message: 'Unable to verify payment status. Please contact support.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [location.search]);

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-500" />;
      case 'failure':
        return <XCircle className="w-20 h-20 text-red-500" />;
      case 'pending':
      case 'processing':
        return <AlertCircle className="w-20 h-20 text-yellow-500" />;
      default:
        return <AlertCircle className="w-20 h-20 text-gray-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'Payment Successful';
      case 'failure':
        return 'Payment Failed';
      case 'pending':
      case 'processing':
        return 'Payment Processing';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'failure':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'pending':
      case 'processing':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg border ${getStatusColor()}`}>
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Verifying payment status...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {getStatusIcon()}
            <h1 className="text-2xl font-bold mt-6 mb-2">{getStatusTitle()}</h1>
            <p className="mb-6">{paymentStatus.message}</p>
            
            {paymentStatus.orderId && (
              <div className="mb-6 w-full p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium break-all">{paymentStatus.orderId}</p>
              </div>
            )}
            
            <button
              onClick={handleBackToHome}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 