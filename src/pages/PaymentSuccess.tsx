import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PaymentStatus {
  status: 'success' | 'failure' | 'pending' | 'processing' | 'unknown';
  orderId: string;
  message?: string;
  amount?: string;
  paymentMethod?: string;
}

const PaymentSuccess: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'unknown',
    orderId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to get server URL - ALWAYS use port 5004
  const getServerUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://wealth-horizon-bloom.com';
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5004`; // Hardcoded to 5004
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('order_id');
    // Note: order_token is removed as it's no longer supported
    const cfOrderStatus = queryParams.get('cf_order_status'); // Cashfree status
    
    if (!orderId) {
      setPaymentStatus({
        status: 'unknown',
        orderId: '',
        message: 'Invalid payment session. Order ID not found.'
      });
      setIsLoading(false);
      return;
    }

    // If Cashfree sends direct status, we can use it for immediate feedback
    if (cfOrderStatus) {
      if (cfOrderStatus === 'SUCCESS' || cfOrderStatus === 'PAID') {
        setPaymentStatus({
          status: 'success',
          orderId: orderId,
          message: 'Payment completed successfully!'
        });
        setIsLoading(false);
        return;
      } else if (cfOrderStatus === 'FAILED') {
        setPaymentStatus({
          status: 'failure',
          orderId: orderId,
          message: 'Payment failed. Please try again.'
        });
        setIsLoading(false);
        return;
      }
    }

    // Verify payment status from server
    const checkPaymentStatus = async () => {
      try {
        const serverUrl = getServerUrl();
        console.log(`Checking payment status at: ${serverUrl}/api/payment-status/${orderId}`);
        
        const response = await fetch(`${serverUrl}/api/payment-status/${orderId}`)
          .catch(err => {
            console.error('Network error fetching payment status:', err);
            setServerError(`Network error: Could not connect to the server at ${serverUrl}. Please make sure the server is running.`);
            throw err;
          });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Error response from server:', errorText);
          setServerError(`Server error (${response.status}): ${errorText}`);
          throw new Error('Failed to verify payment status');
        }
        
        const data = await response.json().catch(err => {
          console.error('Error parsing server response:', err);
          setServerError('Invalid response from server. The response was not valid JSON.');
          throw err;
        });
        
        console.log('Payment status response:', data);
        
        // Process payment status
        if (data.order_status === 'PAID') {
          setPaymentStatus({
            status: 'success',
            orderId: data.order_id,
            message: 'Payment completed successfully!',
            amount: data.order_amount,
            paymentMethod: data.payment_method?.payment_method_type
          });
        } else if (data.order_status === 'ACTIVE') {
          setPaymentStatus({
            status: 'pending',
            orderId: data.order_id,
            message: 'Payment is being processed. Please wait.',
            amount: data.order_amount
          });
        } else {
          setPaymentStatus({
            status: 'failure',
            orderId: data.order_id,
            message: data.payment_message || 'Payment was not successful',
            amount: data.order_amount
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Only set unknown status if we don't already have a server error
        if (!serverError) {
        setPaymentStatus({
          status: 'unknown',
          orderId: orderId || '',
          message: 'Unable to verify payment status. Please contact support.'
        });
        }
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

  const handleTryAgain = () => {
    navigate('/payment');
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
            {serverError ? (
              <>
                <XCircle className="w-20 h-20 text-red-500" />
                <h1 className="text-2xl font-bold mt-6 mb-2">Server Error</h1>
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded border border-red-200">
                  <p>{serverError}</p>
                  
                  <div className="mt-4 text-sm">
                    <p className="font-semibold">Troubleshooting:</p>
                    <ul className="text-left list-disc pl-5 mt-1">
                      <li>Make sure the server is running on port 5004</li>
                      <li>Try running the server with: <code className="bg-red-100 px-1">cd server && node index.js</code></li>
                      <li>Check for errors in the server console</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
            {getStatusIcon()}
            <h1 className="text-2xl font-bold mt-6 mb-2">{getStatusTitle()}</h1>
            <p className="mb-6">{paymentStatus.message}</p>
            
            {paymentStatus.orderId && (
              <div className="mb-6 w-full p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium break-all">{paymentStatus.orderId}</p>
                
                {paymentStatus.amount && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Amount</p>
                    <p className="font-medium">₹{paymentStatus.amount}</p>
                  </>
                )}
                
                {paymentStatus.paymentMethod && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Payment Method</p>
                    <p className="font-medium">{paymentStatus.paymentMethod}</p>
                  </>
                )}
              </div>
                )}
              </>
            )}
            
            <div className="w-full space-y-3">
              <button
                onClick={handleBackToHome}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
              >
                Back to Home
              </button>
              
              {(paymentStatus.status === 'failure' || serverError) && (
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors w-full"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 