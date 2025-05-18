import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Share2, Download, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateReceipt } from '@/services/upiIntentService';
import PaymentReceipt from '@/components/PaymentReceipt';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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
        console.log("Location state:", location.state);
        
        // Check if we have data in location state
        if (location.state && location.state.orderId) {
          const { orderId, amount, metalType: metal, timestamp } = location.state;
          console.log(`Found orderId ${orderId} in location state`);
          
          // Set metal type
          if (metal) {
            setMetalType(metal);
          }
          
          // Create a simple receipt from state data
          setReceiptData({
            orderId,
            amount,
            status: 'PAID',
            date: timestamp || new Date().toISOString(),
            paymentMethod: 'UPI',
            customerName: user?.fullName || 'Customer',
            transactionId: orderId
          });
          
          // Try to update investment if needed
      if (!investmentUpdated) {
            await updateInvestmentTotal(orderId, amount, metal, user.id);
        setInvestmentUpdated(true);
      }
    } else {
          // Try to get from URL params
          const searchParams = new URLSearchParams(location.search);
          const orderId = searchParams.get('order_id');
          const metal = searchParams.get('metal_type') || 'gold';
      
      if (orderId) {
            // Set metal type if available
            if (metal && (metal === 'gold' || metal === 'silver')) {
              setMetalType(metal as 'gold' | 'silver');
            }
            
            // Try to get pending transaction from localStorage
            const pendingTxJson = localStorage.getItem('pendingTransaction');
            if (pendingTxJson) {
              try {
                const pendingTx = JSON.parse(pendingTxJson);
                if (pendingTx.orderId === orderId) {
                  setReceiptData({
                    orderId,
                    amount: pendingTx.amount,
          status: 'PAID',
                    date: pendingTx.timestamp || new Date().toISOString(),
                    paymentMethod: pendingTx.paymentMethod || 'UPI',
                    customerName: user?.fullName || 'Customer',
                    transactionId: orderId
                  });
        
        // Update investments if not already updated
        if (!investmentUpdated) {
                    await updateInvestmentTotal(orderId, pendingTx.amount, metal as 'gold' | 'silver', user.id);
                    setInvestmentUpdated(true);
                  }
                  
                  // Clear the pending transaction
                  localStorage.removeItem('pendingTransaction');
                }
              } catch (e) {
                console.error('Error parsing pendingTransaction:', e);
              }
            } else {
              // Check database directly
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
                  paymentMethod: data.payment_method || 'UPI',
                  customerName: user?.fullName || 'Customer',
                  transactionId: data.payment_id || data.order_id
                });
                
                // Update investment if needed
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
                // As a last resort, try the receipt API
                try {
                  const receipt = await generateReceipt(orderId);
                  setReceiptData(receipt);
                  
                  // Still update investment if possible
                  if (!investmentUpdated && receipt.amount > 0) {
                    await updateInvestmentTotal(orderId, receipt.amount, metal as 'gold' | 'silver', user.id);
          setInvestmentUpdated(true);
                  }
                } catch (receiptError) {
                  console.error('Error generating receipt:', receiptError);
                  toast.error('Could not find transaction details');
                  
                  // Create minimal receipt as fallback
                  setReceiptData({
                    orderId,
                    amount: 0,
                    status: 'PENDING',
                    date: new Date().toISOString(),
                    paymentMethod: 'UPI',
                    customerName: user?.fullName || 'Customer',
                    transactionId: orderId
                  });
                }
              }
            }
          } else {
            // No order ID found, show error
            toast.error('Transaction details not found');
            setTimeout(() => navigate('/dashboard'), 2000);
          }
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
      console.log(`Updating investment for ${metalType}, amount: ${amount}`);
      
      // 1. Update transaction status to completed if not already
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('status')
        .eq('order_id', orderId)
        .single();
      
      if (!txError && txData && txData.status !== 'completed') {
        await supabase
          .from('transactions')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
      }
      
      // 2. Get current investment record
      const { data: investmentData, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('metal_type', metalType)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching investment:', fetchError);
      }
      
      // Calculate weight - use default price if not available
      let currentPrice = metalType === 'gold' ? 5500 : 70;
      const weight = amount / currentPrice;
      
      // 3. Update or create investment record
      if (investmentData) {
        // Update existing investment
        const { error: updateError } = await supabase
          .from('investments')
          .update({
            amount: investmentData.amount + amount,
            weight_in_grams: (investmentData.weight_in_grams || 0) + weight,
            updated_at: new Date().toISOString()
          })
          .eq('id', investmentData.id);
        
        if (updateError) {
          console.error('Error updating investment:', updateError);
        } else {
          console.log('Updated existing investment record');
        }
      } else {
        // Create new investment record
        const { error: insertError } = await supabase
          .from('investments')
          .insert({
            user_id: userId,
            metal_type: metalType,
            amount: amount,
            weight_in_grams: weight,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating investment:', insertError);
        } else {
          console.log('Created new investment record');
        }
      }
      
      // 4. Update local storage for client-side access
      updateLocalStorage(userId, orderId, amount, metalType, weight);
      
      return true;
    } catch (error) {
      console.error('Error updating investment total:', error);
      return false;
    }
  };

  // Update local storage
  const updateLocalStorage = (
    userId: string,
    orderId: string,
    amount: number,
    metalType: 'gold' | 'silver',
    weight: number
  ) => {
    try {
      const userInvestmentsStr = localStorage.getItem('userInvestments');
      
      if (userInvestmentsStr) {
        try {
          const userInvestments = JSON.parse(userInvestmentsStr);
        
        // Create transaction record
        const transaction = {
            id: `tx_${Date.now()}`,
          type: metalType,
          amount: amount,
            date: new Date().toISOString(),
          status: 'completed',
            orderId: orderId
          };
          
          // Check if transaction already exists
          const existingTransaction = userInvestments.transactions.find(
            (tx: any) => tx.orderId === orderId
          );
          
          if (!existingTransaction) {
            // Update investments object
        const updatedInvestments = {
              ...userInvestments,
              userId: userId, // Ensure user ID is set
              totalInvestment: userInvestments.totalInvestment + amount,
          investments: {
                ...userInvestments.investments,
            [metalType]: {
                  ...userInvestments.investments[metalType],
                  amount: userInvestments.investments[metalType].amount + amount,
                  weight: userInvestments.investments[metalType].weight + weight
                }
              },
              transactions: [transaction, ...userInvestments.transactions]
            };
            
            // Save back to localStorage
        localStorage.setItem('userInvestments', JSON.stringify(updatedInvestments));
            console.log('Updated local investments storage');
          }
        } catch (error) {
          console.error('Error updating local storage investments:', error);
          
          // Create new storage if parsing failed
          createDefaultStorage(userId, orderId, amount, metalType, weight);
        }
      } else {
        // Create default storage if none exists
        createDefaultStorage(userId, orderId, amount, metalType, weight);
      }
    } catch (error) {
      console.error('Error in updateLocalStorage:', error);
    }
  };

  // Create default local storage
  const createDefaultStorage = (
    userId: string,
    orderId: string,
    amount: number,
    metalType: 'gold' | 'silver',
    weight: number
  ) => {
    const defaultInvestments = {
      userId,
      totalInvestment: amount,
      investments: {
        gold: {
          amount: metalType === 'gold' ? amount : 0,
          weight: metalType === 'gold' ? weight : 0
        },
        silver: {
          amount: metalType === 'silver' ? amount : 0,
          weight: metalType === 'silver' ? weight : 0
        }
      },
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: metalType,
          amount: amount,
          date: new Date().toISOString(),
          status: 'completed',
          orderId: orderId
        }
      ]
    };
    
    localStorage.setItem('userInvestments', JSON.stringify(defaultInvestments));
    console.log('Created default userInvestments in localStorage');
  };

  // Handle share receipt
  const handleShare = async () => {
    try {
      if (!receiptData) return;
      
      const shareData = {
        title: 'Payment Receipt',
        text: `Successfully invested ₹${receiptData.amount} in ${metalType}. Transaction ID: ${receiptData.transactionId}`,
        url: window.location.href,
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast.success('Receipt details copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      toast.error('Failed to share receipt');
    }
  };

  // Handle download receipt
  const handleDownload = () => {
    // Placeholder - You can implement PDF generation here
    toast.success('Receipt will be downloaded soon');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900/40 to-gray-900 text-white">
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
              <Share2 size={22} />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mb-4"></div>
            <p className="text-gray-400">Loading transaction details...</p>
          </div>
        ) : !receiptData ? (
          <div className="flex flex-col items-center justify-center h-60">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-gray-400">Transaction details not found</p>
            <Button 
              variant="outline"
              className="mt-4 border-green-600 text-green-400 hover:bg-green-900/20"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount and Transaction Status */}
            <div className="bg-gradient-to-b from-green-900/40 to-gray-900 rounded-xl p-6 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-1">₹{receiptData.amount.toFixed(2)}</h2>
                <p className="text-gray-400 mb-6">from Cashfree Payments</p>
                
                <div className="inline-block bg-black/30 px-4 py-2 rounded-lg mb-6">
                  <p className="text-sm uppercase tracking-wide text-green-400">CASHFREE</p>
                </div>
                
                <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <p className="text-xl font-medium text-green-400 mb-1">Received</p>
                <p className="text-sm text-gray-400 mb-4">
                  {receiptData.date ? new Date(receiptData.date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Date not available'}
                </p>
                
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-sm text-gray-400">TXN ID: {receiptData.transactionId || receiptData.orderId}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                    <Download size={14} />
                  </Button>
                </div>
              </div>
              
              {/* Decorative dots */}
              <div className="absolute top-10 left-4 w-2 h-2 bg-green-400/30 rounded-full"></div>
              <div className="absolute top-20 right-10 w-2 h-2 bg-green-400/30 rounded-full"></div>
              <div className="absolute bottom-10 left-20 w-2 h-2 bg-green-400/30 rounded-full"></div>
              <div className="absolute right-6 top-40 w-2 h-2 bg-green-400/30 rounded-full"></div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6"
                onClick={() => navigate('/history')}
              >
                View Transaction History
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

export default PaymentSuccess; 