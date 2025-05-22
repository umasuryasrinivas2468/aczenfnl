import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Share2, Download, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentReceipt from '@/components/PaymentReceipt';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { checkPaymentStatus } from '@/services/paymentService';

// Receipt type
interface ReceiptData {
  orderId: string;
  amount: number;
  status: string;
  date: string;
  paymentMethod: string;
  customerName: string;
  transactionId: string;
  receiptUrl?: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metalType, setMetalType] = useState<'gold' | 'silver'>('gold');
  const [investmentUpdated, setInvestmentUpdated] = useState(false);

  // Get transaction data from navigation state or local storage
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        console.log("Fetching transaction details...");
        
        // Get orderId from URL params
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('orderId');
        const metal = searchParams.get('metal') || 'gold';
      
        if (orderId) {
          // Verify payment with our API
          try {
            const result = await checkPaymentStatus(orderId);
            console.log("Payment status check result:", result);
            
            // Only proceed if confirmed payment is successful
            if (result.status !== "SUCCESS") {
              console.warn("Payment not confirmed:", result);
              toast.error('Payment verification pending');
              // Still continue to show receipt in this case, but with pending status
            }
            
            // Set metal type if available
            if (metal && (metal === 'gold' || metal === 'silver')) {
              setMetalType(metal as 'gold' | 'silver');
            }
            
            const transactionData = result.transaction;
            
            // Create receipt from transaction data
            setReceiptData({
              orderId: transactionData.order_id,
              amount: transactionData.amount,
              status: result.status === 'SUCCESS' ? 'PAID' : 'PENDING',
              date: transactionData.created_at || new Date().toISOString(),
              paymentMethod: transactionData.payment_method || 'CUSTOM',
              customerName: user?.fullName || 'Customer',
              transactionId: transactionData.payment_id || transactionData.order_id
            });
            
            // Update investment if successful payment
            if (!investmentUpdated && result.status === 'SUCCESS') {
              await updateInvestmentTotal(
                transactionData.order_id,
                transactionData.amount,
                metal as 'gold' | 'silver',
                user.id
              );
              setInvestmentUpdated(true);
            }
          } catch (err) {
            console.error('Error verifying payment:', err);
            
            // Fallback to checking database directly
            try {
              const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();
              
              if (data && !error) {
                setReceiptData({
                  orderId: data.order_id,
                  amount: data.amount,
                  status: data.status === 'completed' ? 'PAID' : data.status,
                  date: data.created_at,
                  paymentMethod: data.payment_method || 'CUSTOM',
                  customerName: user?.fullName || 'Customer',
                  transactionId: data.payment_id || data.order_id
                });
                
                // Update investment if successful payment
                if (!investmentUpdated && data.status === 'completed') {
                  await updateInvestmentTotal(
                    data.order_id,
                    data.amount,
                    metal as 'gold' | 'silver',
                    user.id
                  );
                  setInvestmentUpdated(true);
                }
              } else {
                // Create minimal receipt as fallback
                toast.error('Transaction details incomplete');
                setReceiptData({
                  orderId,
                  amount: 0,
                  status: 'PENDING',
                  date: new Date().toISOString(),
                  paymentMethod: 'CUSTOM',
                  customerName: user?.fullName || 'Customer',
                  transactionId: orderId
                });
              }
            } catch (dbError) {
              console.error('Error fetching from database:', dbError);
              toast.error('Could not retrieve transaction details');
            }
          }
        } else {
          // No order ID found, show error
          toast.error('Transaction ID not found');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        toast.error('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTransactionDetails();
    }
  }, [location, navigate, user, investmentUpdated]);

  // Function to update investment totals
  const updateInvestmentTotal = async (
    orderId: string,
    amount: number,
    metalType: 'gold' | 'silver',
    userId: string
  ) => {
    try {
      // First, check if user has existing investments
      const { data: existingInvestment, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        console.error('Error fetching existing investment:', fetchError);
        return false;
      }
      
      // Get current metal prices
      const metalPrice = metalType === 'gold' ? 6300 : 75; // Default prices if API fails
      
      // Calculate weight in grams
      const weight = amount / metalPrice;
      
      if (existingInvestment) {
        // Update existing investment
        const { error: updateError } = await supabase
          .from('investments')
          .update({
            [`${metalType}_amount`]: existingInvestment[`${metalType}_amount`] + amount,
            [`${metalType}_weight`]: existingInvestment[`${metalType}_weight`] + weight,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating investment:', updateError);
          return false;
        }
      } else {
        // Create new investment record
        const { error: insertError } = await supabase
          .from('investments')
          .insert([{
            user_id: userId,
            [`${metalType}_amount`]: amount,
            [`${metalType}_weight`]: weight,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.error('Error creating investment:', insertError);
          return false;
        }
      }
      
      // Successfully updated investment
      console.log(`Investment updated for ${metalType}:`, { amount, weight });
      
      // Also update local storage for offline access
      updateLocalStorage(userId, orderId, amount, metalType, weight);
      
      return true;
    } catch (error) {
      console.error('Error updating investment total:', error);
      return false;
    }
  };

  // Update local storage with investment data
  const updateLocalStorage = (
    userId: string,
    orderId: string,
    amount: number,
    metalType: 'gold' | 'silver',
    weight: number
  ) => {
    try {
      // Get existing data
      const storageKey = `investments_${userId}`;
      const existingDataJson = localStorage.getItem(storageKey);
      
      if (existingDataJson) {
        // Update existing data
        const existingData = JSON.parse(existingDataJson);
        
        // Update total amounts
        existingData.totals[`${metalType}_amount`] = 
          (existingData.totals[`${metalType}_amount`] || 0) + amount;
        existingData.totals[`${metalType}_weight`] = 
          (existingData.totals[`${metalType}_weight`] || 0) + weight;
        
        // Add new transaction
        existingData.transactions.push({
          orderId,
          amount,
          metalType,
          weight,
          timestamp: new Date().toISOString()
        });
        
        // Store updated data
        localStorage.setItem(storageKey, JSON.stringify(existingData));
      } else {
        // Create new storage
        createDefaultStorage(userId, orderId, amount, metalType, weight);
      }
    } catch (error) {
      console.error('Error updating local storage:', error);
    }
  };

  // Create default storage structure
  const createDefaultStorage = (
    userId: string,
    orderId: string,
    amount: number,
    metalType: 'gold' | 'silver',
    weight: number
  ) => {
    const storageKey = `investments_${userId}`;
    
    const defaultData = {
      userId,
      totals: {
        gold_amount: metalType === 'gold' ? amount : 0,
        gold_weight: metalType === 'gold' ? weight : 0,
        silver_amount: metalType === 'silver' ? amount : 0,
        silver_weight: metalType === 'silver' ? weight : 0
      },
      transactions: [
        {
          orderId,
          amount,
          metalType,
          weight,
          timestamp: new Date().toISOString()
        }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(defaultData));
  };

  const handleShare = async () => {
    if (!receiptData) return;
    
    try {
      // Create data to share
      const shareData = {
        title: 'Payment Receipt',
        text: `Payment of ₹${receiptData.amount} successful. Order ID: ${receiptData.orderId}`,
        url: window.location.href
      };
      
      // Check if the Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(shareData.text + '\n' + shareData.url);
        toast.success('Receipt details copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      toast.error('Could not share receipt');
    }
  };

  const handleDownload = () => {
    if (!receiptData) return;
    
    try {
      // Get the receipt element
      const receiptElement = document.getElementById('payment-receipt');
      if (!receiptElement) {
        throw new Error('Receipt element not found');
      }
      
      // Use html2canvas to convert to image (assuming it's imported)
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(receiptElement).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          
          // Create download link
          const link = document.createElement('a');
          link.download = `Receipt-${receiptData.orderId}.png`;
          link.href = imgData;
          link.click();
        });
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Could not download receipt');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-20">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2 text-white"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-bold text-white">Payment Successful</h1>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 border-4 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading payment details...</p>
          </div>
        ) : receiptData ? (
          <>
            <div className="bg-green-900/20 rounded-xl border border-green-700/30 p-4 mb-6 flex items-center">
              <div className="bg-green-600 rounded-full p-2 mr-4">
                <CheckCircle size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-green-400">Payment Complete</h2>
                <p className="text-sm text-gray-300">
                  Your {metalType} purchase has been confirmed
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 mb-6" id="payment-receipt">
              <PaymentReceipt 
                orderId={receiptData.orderId}
                amount={receiptData.amount}
                date={receiptData.date}
                status={receiptData.status}
                customerName={receiptData.customerName}
                paymentMethod={receiptData.paymentMethod}
                metalType={metalType}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Button 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800"
                onClick={handleShare}
              >
                <Share2 size={18} className="mr-2" />
                Share Receipt
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800"
                onClick={handleDownload}
              >
                <Download size={18} className="mr-2" />
                Download
              </Button>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/dashboard')}
              >
                <Home size={18} className="mr-2" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800"
                onClick={() => navigate('/savings')}
              >
                <ArrowRight size={18} className="mr-2" />
                View Investments
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-red-900/20 rounded-xl border border-red-700/30 p-6 flex flex-col items-center">
            <AlertTriangle size={48} className="text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Transaction Not Found</h2>
            <p className="text-gray-400 text-center mb-6">
              We couldn't find details for this payment.
            </p>
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 