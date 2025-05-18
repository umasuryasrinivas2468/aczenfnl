import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, RefreshCw, CheckCircle2, Clipboard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { getTransactionDetails } from '@/services/paymentService';
import { updateTransactionStatus, callCashfreeNotify } from '@/services/transactionService';

interface PendingInfo {
  orderId: string;
  amount: number;
  metalType: 'gold' | 'silver';
  status: string;
  upiUrl?: string;
  created?: string;
}

const PaymentPending: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [pendingInfo, setPendingInfo] = useState<PendingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Get transaction data from query params or local storage
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        
        // Get order ID from URL params
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('order_id');
        const metalType = searchParams.get('metal_type') || 'gold';
        const upiUrl = searchParams.get('upi_url') || '';
        
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
          setPendingInfo({
            orderId: data.order_id,
            amount: data.amount,
            metalType: data.metal_type as 'gold' | 'silver',
            status: data.status,
            upiUrl: upiUrl,
            created: data.created_at
          });
          
          // If not pending, redirect to appropriate page
          if (data.status === 'PAID') {
            toast.success('Payment completed successfully!');
            setTimeout(() => navigate(`/payment-success?order_id=${orderId}&metal_type=${data.metal_type}`), 1000);
            return;
          } else if (data.status === 'FAILED') {
            setTimeout(() => navigate(`/payment-failure?order_id=${orderId}&metal_type=${data.metal_type}`), 1000);
            return;
          }
        } else {
          // Try to get from pending transaction in localStorage
          const pendingTxJson = localStorage.getItem('pendingTransaction');
          if (pendingTxJson) {
            try {
              const pendingTx = JSON.parse(pendingTxJson);
              if (pendingTx.orderId === orderId) {
                setPendingInfo({
                  orderId,
                  amount: pendingTx.amount,
                  metalType: (pendingTx.metalType || metalType) as 'gold' | 'silver',
                  status: 'PENDING',
                  upiUrl: pendingTx.upiUrl || upiUrl,
                  created: pendingTx.timestamp
                });
              }
            } catch (e) {
              console.error('Error parsing pendingTransaction:', e);
            }
          } else {
            // Create basic pending info
            setPendingInfo({
              orderId,
              amount: 0,
              metalType: metalType as 'gold' | 'silver',
              status: 'PENDING',
              upiUrl: upiUrl
            });
            
            // Try to get amount from Cashfree
            try {
              const details = await getTransactionDetails(orderId);
              if (details && details.amount > 0) {
                setPendingInfo(prev => prev ? {
                  ...prev,
                  amount: details.amount
                } : null);
              }
            } catch (detailsError) {
              console.error('Error fetching transaction details:', detailsError);
            }
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

  // Function to check transaction status
  const checkTransactionStatus = useCallback(async () => {
    if (!pendingInfo || !pendingInfo.orderId) return;
    
    setChecking(true);
    try {
      // Try to call Cashfree notify URL first to ensure updated status
      try {
        const notifyResult = await callCashfreeNotify(pendingInfo.orderId, 'PENDING');
        console.log('Notify URL result:', notifyResult);
      } catch (notifyError) {
        console.warn('Could not call notify URL:', notifyError);
      }
      
      // Check transaction status using Cashfree API
      const details = await getTransactionDetails(pendingInfo.orderId);
      
      // Update local status
      if (details.status === 'SUCCESS') {
        // Update database
        await updateTransactionStatus(pendingInfo.orderId, 'PAID');
        
        toast.success('Payment completed successfully!');
        setTimeout(() => navigate(`/payment-success?order_id=${pendingInfo.orderId}&metal_type=${pendingInfo.metalType}`), 1000);
      } else if (details.status === 'FAILURE') {
        // Update database
        await updateTransactionStatus(pendingInfo.orderId, 'FAILED');
        
        toast.error('Payment failed');
        setTimeout(() => navigate(`/payment-failure?order_id=${pendingInfo.orderId}&metal_type=${pendingInfo.metalType}`), 1000);
      } else {
        // Get the latest status from database to see if webhook updated it
        const { data: latestTx } = await supabase
          .from('transactions')
          .select('status')
          .eq('order_id', pendingInfo.orderId)
          .single();
          
        if (latestTx && latestTx.status !== 'PENDING') {
          if (latestTx.status === 'PAID') {
            toast.success('Payment completed successfully!');
            setTimeout(() => navigate(`/payment-success?order_id=${pendingInfo.orderId}&metal_type=${pendingInfo.metalType}`), 1000);
            return;
          } else if (latestTx.status === 'FAILED') {
            toast.error('Payment failed');
            setTimeout(() => navigate(`/payment-failure?order_id=${pendingInfo.orderId}&metal_type=${pendingInfo.metalType}`), 1000);
            return;
          }
        }
        
        toast.info('Payment is still processing. Please wait a moment and try again.');
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      toast.error('Could not verify payment status');
    } finally {
      setChecking(false);
    }
  }, [pendingInfo, navigate]);

  // Auto-refresh status on an interval
  useEffect(() => {
    if (!pendingInfo) return;
    
    // Check status immediately
    checkTransactionStatus();
    
    // Set up interval to check every 10 seconds
    const interval = setInterval(() => {
      checkTransactionStatus();
      setTimeElapsed(prev => prev + 10);
    }, 10000);
    
    // Time counter interval (every second)
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    // Clear interval on unmount
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [pendingInfo, checkTransactionStatus]);

  // Handle copy UPI URL
  const handleCopyUpiUrl = () => {
    if (!pendingInfo?.upiUrl) return;
    
    navigator.clipboard.writeText(pendingInfo.upiUrl)
      .then(() => toast.success('UPI URL copied to clipboard'))
      .catch(err => {
        console.error('Could not copy UPI URL:', err);
        toast.error('Failed to copy UPI URL');
      });
  };

  // Handle try again UPI URL
  const handleOpenUpiUrl = () => {
    if (!pendingInfo?.upiUrl) return;
    
    window.open(pendingInfo.upiUrl, '_blank');
  };

  // Handle go back
  const handleGoBack = () => {
    navigate('/');
  };

  // Format time elapsed
  const formatTimeElapsed = () => {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900/40 to-gray-900 text-white">
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
              onClick={checkTransactionStatus}
            >
              <RefreshCw size={22} className={checking ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500 mb-4"></div>
            <p className="text-gray-400">Loading transaction details...</p>
          </div>
        ) : !pendingInfo ? (
          <div className="flex flex-col items-center justify-center h-60">
            <Clock className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-gray-400">Transaction details not found</p>
            <Button 
              variant="outline"
              className="mt-4 border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount and Transaction Status */}
            <div className="bg-gradient-to-b from-yellow-900/40 to-gray-900 rounded-xl p-6 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-1">₹{pendingInfo.amount.toFixed(2)}</h2>
                <p className="text-gray-400 mb-6">Payment Processing</p>
                
                <div className="inline-block bg-black/30 px-4 py-2 rounded-lg mb-6">
                  <p className="text-sm uppercase tracking-wide text-yellow-400">CASHFREE</p>
                </div>
                
                <div className="mx-auto w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <p className="text-xl font-medium text-yellow-400 mb-1">Pending</p>
                <p className="text-sm text-gray-400 mb-4">
                  Your payment is being processed
                </p>
                
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-sm text-gray-400">Order ID: {pendingInfo.orderId.substring(0, 16)}...</p>
                </div>
              </div>
              
              {/* Decorative dots */}
              <div className="absolute top-10 left-4 w-2 h-2 bg-yellow-400/30 rounded-full"></div>
              <div className="absolute top-20 right-10 w-2 h-2 bg-yellow-400/30 rounded-full"></div>
              <div className="absolute bottom-10 left-20 w-2 h-2 bg-yellow-400/30 rounded-full"></div>
              <div className="absolute right-6 top-40 w-2 h-2 bg-yellow-400/30 rounded-full"></div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-4">
              <div className="flex gap-3 items-start">
                <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-100 mb-1">Payment In Progress</p>
                  <p className="text-xs text-gray-400">The payment may take a few minutes to process. You can check the status by refreshing this page or view your transaction history.</p>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white py-6"
                onClick={checkTransactionStatus}
                disabled={checking}
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
                Check Status
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 py-6"
                onClick={() => navigate('/history')}
              >
                View Transaction History
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPending; 