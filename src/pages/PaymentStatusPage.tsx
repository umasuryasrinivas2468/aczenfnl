import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentResult, processPaymentCallback, updateLocalTransactionStatus } from '../utils/paymentUtils';
import { CheckCircle2, AlertCircle, Clock, ArrowLeft, Home, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Separator } from '@/components/ui/separator';
import { verifyOrderStatus, saveTransactionAndUpdateInvestment, calculateMetalWeight, CashfreeOrderVerification } from '@/services/cashfreeOrderService';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { verifyUpiPayment, updateTransactionStatus, updateInvestmentRecord } from '@/utils/upiPaymentVerifier';

interface UserInvestments {
  totalInvestment: number;
  investments: {
    gold: {
      type: string;
      amount: number;
      weight: number;
      weightUnit: string;
    };
    silver: {
      type: string;
      amount: number;
      weight: number;
      weightUnit: string;
    }
  };
  transactions: any[];
}

const defaultInvestments: UserInvestments = {
  totalInvestment: 0,
  investments: {
    gold: {
      type: 'gold',
      amount: 0,
      weight: 0,
      weightUnit: 'grams',
    },
    silver: {
      type: 'silver',
      amount: 0,
      weight: 0,
      weightUnit: 'grams',
    }
  },
  transactions: []
};

const PaymentStatusPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [orderDetails, setOrderDetails] = useState<CashfreeOrderVerification | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [userInvestments, setUserInvestments] = useLocalStorage<UserInvestments>('userInvestments', defaultInvestments);
  const [metalType, setMetalType] = useState<'gold' | 'silver'>('gold');
  const [transactionAdded, setTransactionAdded] = useState(false);
  const [dbUpdateStatus, setDbUpdateStatus] = useState<{success: boolean, error?: any} | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const MAX_RETRIES = 3;

  // Define these functions at component level before they're used
  // Handle successful payment with database updates
  const handleSuccessfulPayment = async (orderId: string, verificationResult: any) => {
    // Create payment result
    const paymentResult: PaymentResult = {
      orderId,
      status: 'success',
      paymentId: verificationResult.paymentDetails?.cf_payment_id,
      paymentMethod: verificationResult.paymentDetails?.payment_method?.type || 'upi',
      amount: verificationResult.paymentDetails?.payment_amount || parseFloat(orderDetails?.order_amount || '0')
    };
    
    setPaymentResult(paymentResult);
    
    // Update local transaction status
    updateLocalTransactionStatus(paymentResult);
    updateUserInvestments(paymentResult);
    
    // If user is signed in, update database records
    if (isSignedIn && user) {
      try {
        // Get payment amount from available sources
        const amount = verificationResult.paymentDetails?.payment_amount || 
                        parseFloat(orderDetails?.order_amount || '0') ||
                        getAmountFromLocalStorage(orderId);
        
        if (amount > 0) {
          // Update transaction in database
          await updateTransactionStatus(orderId, 'PAID');
          
          // Update investment record
          const investmentResult = await updateInvestmentRecord(
            user.id,
            orderId,
            amount,
            metalType
          );
          
          setDbUpdateStatus({ success: investmentResult.success, error: investmentResult.error });
          
          if (investmentResult.success) {
            toast.success('Investment recorded successfully');
          } else {
            toast.error('Failed to record investment');
          }
        }
      } catch (error) {
        console.error('Error updating database records:', error);
        setDbUpdateStatus({ success: false, error });
      }
    }
    
    // Redirect to success page after a brief delay
    setTimeout(() => {
      navigate(`/success?order_id=${orderId}&metal_type=${metalType}`);
    }, 2000);
  };
  
  // Handle failed payment
  const handleFailedPayment = async (orderId: string, verificationResult: any) => {
    // Create payment result for failed payment
    const paymentResult: PaymentResult = {
      orderId,
      status: 'failure',
      paymentId: verificationResult.paymentDetails?.cf_payment_id,
      errorMessage: verificationResult.paymentDetails?.payment_message || 'Payment failed'
    };
    
    setPaymentResult(paymentResult);
    
    // Update local transaction status
    updateLocalTransactionStatus(paymentResult);
    updateUserInvestments(paymentResult);
    
    // Update transaction status in database if user is signed in
    if (isSignedIn && user) {
      try {
        await updateTransactionStatus(orderId, 'FAILED');
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
    }
  };
  
  // Get amount from local storage if needed
  const getAmountFromLocalStorage = (orderId: string): number => {
    try {
      const pendingTxJson = localStorage.getItem('pendingTransaction');
      if (pendingTxJson) {
        const pendingTx = JSON.parse(pendingTxJson);
        if (pendingTx.orderId === orderId || pendingTx.id === orderId) {
          return pendingTx.amount || 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error getting amount from local storage:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Try to get metal type from URL params or localStorage
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get('type');
    const orderId = queryParams.get('order_id');
    
    if (typeParam === 'gold' || typeParam === 'silver') {
      setMetalType(typeParam);
    } else {
      const pendingTxJson = localStorage.getItem('pendingTransaction');
      if (pendingTxJson) {
        try {
          const pendingTx = JSON.parse(pendingTxJson);
          if (pendingTx.type === 'gold' || pendingTx.type === 'silver') {
            setMetalType(pendingTx.type);
          }
        } catch (e) {
          console.error('Error parsing pendingTransaction:', e);
        }
      }
    }

    const handlePaymentCallback = async () => {
      try {
        setIsProcessing(true);
        
        // Extract URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('order_id');
        
        if (orderId) {
          // First try the direct UPI payment verification from upiPaymentVerifier
          try {
            setVerificationInProgress(true);
            const verificationResult = await verifyUpiPayment(orderId);
            
            if (verificationResult.success) {
              if (verificationResult.status === 'SUCCESS') {
                // Payment is successful - update records
                await handleSuccessfulPayment(orderId, verificationResult);
              } else if (verificationResult.status === 'FAILED') {
                // Handle failed payment
                await handleFailedPayment(orderId, verificationResult);
              } else {
                // If pending but we have retries left, try cashfree order verification
                if (retryCount < MAX_RETRIES) {
                  setRetryCount(prev => prev + 1);
                  await verifyWithCashfreeOrder(orderId);
                } else {
                  // Max retries reached, fallback to regular callback processing
                  processRegularCallback(queryParams);
                }
              }
            } else {
              // Verification had an error, try Cashfree order verification
              await verifyWithCashfreeOrder(orderId);
            }
          } catch (error) {
            console.error('Error in direct UPI verification:', error);
            // Fallback to Cashfree order verification
            await verifyWithCashfreeOrder(orderId);
          }
        } else {
          // No order ID, use regular processing
          processRegularCallback(queryParams);
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        setPaymentResult({
          orderId: 'unknown',
          status: 'failure',
          errorMessage: 'Error processing payment'
        });
      } finally {
        setIsProcessing(false);
        setVerificationInProgress(false);
      }
    };
    
    // New function to verify with Cashfree order API
    const verifyWithCashfreeOrder = async (orderId: string) => {
      try {
        const orderDetails = await verifyOrderStatus(orderId);
        setOrderDetails(orderDetails);
        
        // Determine payment status based on order status
        if (orderDetails.order_status === 'PAID') {
          await handleSuccessfulPayment(orderId, {
            status: 'SUCCESS',
            success: true,
            paymentDetails: orderDetails.payments?.[0] || null
          });
        } else if (['FAILED', 'CANCELLED'].includes(orderDetails.order_status)) {
          await handleFailedPayment(orderId, {
            status: 'FAILED',
            success: true,
            paymentDetails: null
          });
        } else {
          // Still pending, fall back to regular callback
          processRegularCallback(new URLSearchParams(location.search));
        }
      } catch (error) {
        console.error('Error verifying with Cashfree order:', error);
        // Fallback to regular callback processing as last resort
        processRegularCallback(new URLSearchParams(location.search));
      }
    };
    
    const processRegularCallback = async (queryParams: URLSearchParams) => {
      try {
        // Process the payment result using the existing utility
        const result = await processPaymentCallback(queryParams);
        setPaymentResult(result);
        
        // Update local transaction status
        updateLocalTransactionStatus(result);
        
        // Update user investments
        updateUserInvestments(result);
        
        // If payment was successful, redirect to success page
        if (result.status === 'success') {
          setTimeout(() => {
            navigate(`/success?order_id=${result.orderId}&metal_type=${metalType}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error in processRegularCallback:', error);
        setPaymentResult({
          orderId: 'unknown',
          status: 'failure',
          errorMessage: 'Could not process payment information'
        });
      }
    };

    handlePaymentCallback();
  }, [location, navigate, isSignedIn, user, metalType, retryCount]);

  // Function to update user investments
  const updateUserInvestments = (payment: PaymentResult) => {
    if (!payment || !payment.orderId) return;
    
    try {
      // Get pending transaction details
      const pendingTxJson = localStorage.getItem('pendingTransaction');
      if (!pendingTxJson) return;
      
      const pendingTx = JSON.parse(pendingTxJson);
      if (!pendingTx) return;
      
      // Create transaction record with status from payment result
      const transaction = {
        id: payment.orderId,
        paymentId: payment.paymentId,
        type: pendingTx.type || metalType,
        amount: pendingTx.amount || payment.amount || 0,
        date: new Date().toISOString(),
        status: payment.status === 'success' ? 'completed' : 
                payment.status === 'failure' ? 'failed' : 'pending',
        paymentMethod: payment.paymentMethod || pendingTx.paymentMethod || 'UPI',
        orderId: payment.orderId
      };
      
      // Clone the current investments
      const updatedInvestments = { ...userInvestments };
      
      // Only update total investment and metal amounts if payment was successful
      if (payment.status === 'success') {
        const amount = transaction.amount;
        updatedInvestments.totalInvestment += amount;
        
        // Update specific metal investment
        const metal = transaction.type;
        if (metal === 'gold' || metal === 'silver') {
          // Calculate metal weight based on current price (approximate)
          const metalPrice = metal === 'gold' ? 5500 : 70; // Sample rates per gram
          const weightInGrams = amount / metalPrice;
          
          updatedInvestments.investments[metal].amount += amount;
          updatedInvestments.investments[metal].weight += weightInGrams;
        }
      }
      
      // Add to transaction history regardless of status
      if (!updatedInvestments.transactions.some(tx => tx.id === transaction.id)) {
        updatedInvestments.transactions.unshift(transaction);
        setUserInvestments(updatedInvestments);
        setTransactionAdded(true);
      }
      
      // Remove pending transaction
      localStorage.removeItem('pendingTransaction');
      
    } catch (error) {
      console.error("Error updating investments:", error);
    }
  };

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
            <p className="text-gray-500 mt-2 text-center">
              Your payment of {paymentResult.amount ? `₹${paymentResult.amount}` : ''} has been processed successfully.
            </p>
            
            <div className="w-full bg-gray-800 rounded-lg p-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount</span>
                <span className="font-semibold">₹{paymentResult.amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Payment ID</span>
                <span className="text-xs break-all">{paymentResult.paymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Metal Type</span>
                <span className="capitalize">{metalType}</span>
              </div>
              <Separator className="my-2 bg-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID</span>
                <span className="text-xs break-all">{paymentResult.orderId}</span>
              </div>
              
              {isSignedIn && dbUpdateStatus && (
                <div className="mt-3 text-sm text-center">
                  {dbUpdateStatus.success ? (
                    <span className="text-green-500">Investment recorded in your account</span>
                  ) : (
                    <span className="text-yellow-500">Local record saved. Will sync when connection restored.</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full mt-6">
              <Button 
                onClick={() => navigate('/success?order_id=' + paymentResult.orderId + '&metal_type=' + metalType)}
                className="w-full mb-2"
              >
                View Payment Slip
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Redirecting to your payment slip...
            </p>
          </div>
        );
      case 'failure':
        return (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Payment Failed</h2>
            <p className="text-gray-500 mt-2 text-center">
              {paymentResult.errorMessage || "Your payment could not be processed. Please try again."}
            </p>
            
            {paymentResult.orderId !== 'unknown' && (
              <div className="w-full bg-gray-800 rounded-lg p-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Order ID</span>
                  <span className="text-xs break-all">{paymentResult.orderId}</span>
                </div>
                {orderDetails && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Status</span>
                      <span className="text-red-500">{orderDetails.order_status}</span>
                    </div>
                    {orderDetails.payments && orderDetails.payments[0]?.payment_message && (
                      <div className="mt-1 text-sm text-red-400">
                        {orderDetails.payments[0].payment_message}
                      </div>
                    )}
                  </div>
                )}
                {transactionAdded && (
                  <div className="mt-2 text-sm text-gray-400">
                    This transaction has been added to your history.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <Clock className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold">Payment Pending</h2>
            <p className="text-gray-500 mt-2 text-center">
              Your payment is being processed. We'll update you once it's complete.
            </p>
            
            {paymentResult.orderId !== 'unknown' && (
              <div className="w-full bg-gray-800 rounded-lg p-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Order ID</span>
                  <span className="text-xs break-all">{paymentResult.orderId}</span>
                </div>
                {orderDetails && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Status</span>
                      <span className="text-yellow-500">{orderDetails.order_status}</span>
                    </div>
                  </div>
                )}
                {transactionAdded && (
                  <div className="mt-2 text-sm text-gray-400">
                    This transaction has been added to your history with pending status.
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleManualRetry}
              variant="outline"
              className="mt-6"
              disabled={verificationInProgress}
            >
              {verificationInProgress ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 border-t-white rounded-full" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Status Again
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 mt-3">
              UPI payments sometimes take a minute to reflect. Please check again.
            </p>
          </div>
        );
    }
  };

  // Add retry button functionality for manual retry
  const handleManualRetry = async () => {
    if (verificationInProgress) return;
    
    setVerificationInProgress(true);
    setIsProcessing(true);
    
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('order_id');
    
    if (orderId) {
      try {
        // Try direct UPI verification again
        const verificationResult = await verifyUpiPayment(orderId);
        
        if (verificationResult.success && verificationResult.status !== 'PENDING') {
          // Status is now determined - update UI
          if (verificationResult.status === 'SUCCESS') {
            await handleSuccessfulPayment(orderId, verificationResult);
          } else {
            await handleFailedPayment(orderId, verificationResult);
          }
        } else {
          // Try Cashfree order verification as fallback
          const orderDetails = await verifyOrderStatus(orderId);
          setOrderDetails(orderDetails);
          
          if (orderDetails.order_status === 'PAID') {
            await handleSuccessfulPayment(orderId, {
              status: 'SUCCESS', 
              success: true,
              paymentDetails: orderDetails.payments?.[0] || null
            });
          } else if (['FAILED', 'CANCELLED'].includes(orderDetails.order_status)) {
            await handleFailedPayment(orderId, {
              status: 'FAILED',
              success: true,
              paymentDetails: null
            });
          } else {
            toast.info('Payment is still being processed. Please check again later.');
          }
        }
      } catch (error) {
        console.error('Error in manual retry:', error);
        toast.error('Failed to verify payment. Please try again.');
      } finally {
        setVerificationInProgress(false);
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="text-white" size={24} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <Home className="text-white" size={24} />
          </Button>
        </div>
      
        <Card className="w-full border-gray-800 bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription className="text-gray-400">
              Details about your recent transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getStatusDisplay()}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/history')}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <History size={16} />
              View Transaction History
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStatusPage; 