import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentStatus: React.FC = () => {
  const [status, setStatus] = useState<'success' | 'failure' | 'loading'>('loading');
  const [orderId, setOrderId] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const orderIdParam = queryParams.get('order_id');
    const paymentStatus = queryParams.get('status') || '';

    if (orderIdParam) {
      setOrderId(orderIdParam);
      
      // In a real implementation, you would verify the payment status with your backend
      // Here we're just using the status from URL parameters or setting a default
      if (paymentStatus.toLowerCase() === 'success') {
        setStatus('success');
      } else if (paymentStatus.toLowerCase() === 'failure') {
        setStatus('failure');
      } else {
        // Default to success for demo purposes
        // In a real app, you should verify with your backend
        setStatus('success');
      }
    }
  }, [location]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="text-white" size={24} />
          </Button>
          <h1 className="text-xl font-bold">Payment Status</h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 animate-fade-in flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-400">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Payment Successful</h2>
              <p className="text-gray-400 mb-4">Your transaction has been completed successfully.</p>
              <div className="bg-gray-800 p-3 rounded-lg w-full mb-4">
                <p className="text-sm text-gray-400">Order ID:</p>
                <p className="text-white break-all">{orderId}</p>
              </div>
              <Button className="w-full" onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </>
          )}

          {status === 'failure' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
              <p className="text-gray-400 mb-4">Sorry, your payment could not be processed.</p>
              <div className="bg-gray-800 p-3 rounded-lg w-full mb-4">
                <p className="text-sm text-gray-400">Order ID:</p>
                <p className="text-white break-all">{orderId}</p>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 mb-3" onClick={() => navigate('/checkout')}>
                Try Again
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus; 