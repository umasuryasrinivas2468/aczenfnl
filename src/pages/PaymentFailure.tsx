import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { getTransactionDetails } from '@/services/paymentService';
import { updateTransactionStatus } from '@/services/transactionService';

interface FailureInfo {
  orderId: string;
  amount: number;
  metalType: 'gold' | 'silver';
  reason: string;
  status: string;
}

const PaymentFailure: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [failureInfo, setFailureInfo] = useState<FailureInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Get transaction data from query params or local storage
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        
        // Get order ID from URL params
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('order_id');
        const metalType = searchParams.get('metal_type') || 'gold';
        
        if (!orderId) {
          toast.error('Transaction details not found');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        // Try to get details from database
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('order_id', orderId)
          .single();
        
        if (data && !error) {
          setFailureInfo({
            orderId: data.order_id,
            amount: data.amount,
            metalType: data.metal_type as 'gold' | 'silver',
            reason: 'Your payment could not be processed',
            status: data.status
          });
          
          // If still pending, check status from Cashfree API
          if (data.status === 'PENDING') {
            try {
              const paymentDetails = await getTransactionDetails(orderId);
              
              if (paymentDetails.status === 'FAILURE') {
                // Update transaction status in database
                await updateTransactionStatus(orderId, 'FAILED');
                
                setFailureInfo(prev => prev ? {
                  ...prev,
                  status: 'FAILED',
                  reason: paymentDetails.failureReason || 'Your payment was declined'
                } : null);
              }
            } catch (apiError) {
              console.error('Error checking payment status:', apiError);
            }
          }
        } else {
          // Try to get from pending transaction in localStorage
          const pendingTxJson = localStorage.getItem('pendingTransaction');
          if (pendingTxJson) {
            try {
              const pendingTx = JSON.parse(pendingTxJson);
              if (pendingTx.orderId === orderId) {
                setFailureInfo({
                  orderId,
                  amount: pendingTx.amount,
                  metalType: (pendingTx.metalType || metalType) as 'gold' | 'silver',
                  reason: 'Your payment was not completed',
                  status: 'FAILED'
                });
              }
            } catch (e) {
              console.error('Error parsing pendingTransaction:', e);
            }
          } else {
            // Create basic failure info
            setFailureInfo({
              orderId,
              amount: 0,
              metalType: metalType as 'gold' | 'silver',
              reason: 'We could not find details for this transaction',
              status: 'FAILED'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        toast.error('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionDetails();
  }, [location, navigate]);

  // Handle retry payment
  const handleRetry = () => {
    if (!failureInfo) return;
    
    // Navigate back to checkout with the same details
    navigate('/checkout', { 
      state: { 
        amount: failureInfo.amount,
        metalType: failureInfo.metalType,
        isRetry: true,
        previousOrderId: failureInfo.orderId
      } 
    });
  };

  // Handle go back
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900/40 to-gray-900 text-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Top navigation and close button */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </Button>
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw size={22} />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500 mb-4"></div>
            <p className="text-gray-400">Loading transaction details...</p>
          </div>
        ) : !failureInfo ? (
          <div className="flex flex-col items-center justify-center h-60">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-400">Transaction details not found</p>
            <Button 
              variant="outline"
              className="mt-4 border-red-600 text-red-400 hover:bg-red-900/20"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount and Transaction Status */}
            <div className="bg-gradient-to-b from-red-900/40 to-gray-900 rounded-xl p-6 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-1">₹{failureInfo.amount.toFixed(2)}</h2>
                <p className="text-gray-400 mb-6">Payment Failed</p>
                
                <div className="inline-block bg-black/30 px-4 py-2 rounded-lg mb-6">
                  <p className="text-sm uppercase tracking-wide text-red-400">CASHFREE</p>
                </div>
                
                <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-2">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <p className="text-xl font-medium text-red-400 mb-1">Failed</p>
                <p className="text-sm text-gray-400 mb-4">
                  {failureInfo.reason || 'Your payment could not be processed'}
                </p>
                
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-sm text-gray-400">Order ID: {failureInfo.orderId.substring(0, 16)}...</p>
                </div>
              </div>
              
              {/* Decorative dots */}
              <div className="absolute top-10 left-4 w-2 h-2 bg-red-400/30 rounded-full"></div>
              <div className="absolute top-20 right-10 w-2 h-2 bg-red-400/30 rounded-full"></div>
              <div className="absolute bottom-10 left-20 w-2 h-2 bg-red-400/30 rounded-full"></div>
              <div className="absolute right-6 top-40 w-2 h-2 bg-red-400/30 rounded-full"></div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6"
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 py-6"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFailure; 