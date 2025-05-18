import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTransactionDetails } from '@/services/paymentService';
import { getTransactionByOrderId } from '@/services/transactionService';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentStatus: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    // Check the payment status
    const checkPaymentStatus = async () => {
      try {
        setChecking(true);
        
        // Get order ID from URL or state
        const orderId = searchParams.get('order_id') || 
                       (location.state && location.state.orderId) || 
                       '';
        
        if (!orderId) {
          console.error('No order ID found');
          toast.error('Payment information not found');
          navigate('/');
          return;
        }
        
        // Get transaction from database
        const { data: transaction, error } = await getTransactionByOrderId(orderId);
        
        if (error) {
          console.error('Error fetching transaction:', error);
        }
        
        // Get status from transaction if available
        if (transaction) {
          console.log('Transaction found in database:', transaction);
          
          // Get metal type for redirects
          const metalType = transaction.metal_type || 'gold';
          
          // Check status and redirect accordingly
          if (transaction.status === 'PAID') {
            // Success case
            navigate(`/payment-success?order_id=${orderId}&metal_type=${metalType}`, {
              state: {
                orderId,
                amount: transaction.amount,
                metalType,
                timestamp: transaction.created_at
              }
            });
            return;
          } else if (transaction.status === 'FAILED') {
            // Failure case
            navigate(`/payment-failure?order_id=${orderId}&metal_type=${metalType}`, {
              state: {
                orderId,
                amount: transaction.amount,
                metalType,
                timestamp: transaction.created_at
              }
            });
            return;
          }
        }
        
        // If not resolved from database, try to get payment details from API
        try {
          console.log('Checking payment status from API for order:', orderId);
          const paymentDetails = await getTransactionDetails(orderId);
          
          // Default metal type if not found
          const metalType = 
            (transaction && transaction.metal_type) || 
            searchParams.get('metal_type') || 
            'gold';
          
          // Amount from transaction or default to 0
          const amount = 
            (transaction && transaction.amount) || 
            parseFloat(searchParams.get('amount') || '0');
          
          if (paymentDetails.status === 'SUCCESS') {
            // Success case
            navigate(`/payment-success?order_id=${orderId}&metal_type=${metalType}`, { 
              state: { 
                orderId, 
                amount,
                metalType, 
                timestamp: paymentDetails.date?.toISOString() || new Date().toISOString()
              } 
            });
          } else if (paymentDetails.status === 'FAILURE') {
            // Failure case
            navigate(`/payment-failure?order_id=${orderId}&metal_type=${metalType}`, { 
              state: { 
                orderId, 
                amount,
                metalType, 
                reason: paymentDetails.failureReason || 'Payment failed', 
                timestamp: paymentDetails.date?.toISOString() || new Date().toISOString()
              } 
            });
          } else {
            // Still pending case
            navigate(`/payment-pending?order_id=${orderId}&metal_type=${metalType}`, { 
              state: { 
                orderId, 
                amount,
                metalType, 
                timestamp: paymentDetails.date?.toISOString() || new Date().toISOString()
              } 
            });
          }
        } catch (apiError) {
          console.error('Error checking payment status from API:', apiError);
          
          // If API check fails, still redirect based on what we know
          const metalType = 
            (transaction && transaction.metal_type) || 
            searchParams.get('metal_type') || 
            'gold';
          
          if (transaction && transaction.status === 'PENDING') {
            navigate(`/payment-pending?order_id=${orderId}&metal_type=${metalType}`);
          } else {
            // Default to payment failure if we can't determine status
            navigate(`/payment-failure?order_id=${orderId}&metal_type=${metalType}`, {
              state: {
                orderId,
                amount: transaction ? transaction.amount : 0,
                metalType,
                reason: 'Could not determine payment status'
              }
            });
          }
        }
      } catch (error) {
        console.error('Error in payment status check:', error);
        toast.error('Failed to check payment status');
        navigate('/');
      } finally {
        setChecking(false);
      }
    };
    
    checkPaymentStatus();
  }, [location.search, location.state, navigate, searchParams]);

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center p-6">
        <div className="flex justify-center mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
        <h2 className="text-xl font-bold text-blue-400 mb-2">Checking Payment Status</h2>
        <p className="text-gray-400">Please wait while we verify your payment...</p>
      </div>
    </div>
  );
};

export default PaymentStatus; 