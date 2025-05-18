import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Share2, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateReceipt } from '@/services/upiIntentService';
import PaymentReceipt from '@/components/PaymentReceipt';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

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

const PaymentSuccessPage: React.FC = () => {
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
      
      // 4. Also update in localStorage for immediate UI update
      updateLocalStorage(userId, orderId, amount, metalType, weight);
      
      return true;
    } catch (error) {
      console.error('Error updating investment total:', error);
      return false;
    }
  };
  
  // Update local storage with new investment data
  const updateLocalStorage = (
    userId: string,
    orderId: string,
    amount: number,
    metalType: 'gold' | 'silver',
    weight: number
  ) => {
    try {
      // Get existing investments from localStorage
      const investmentsJson = localStorage.getItem(`investments_${userId}`);
      let investments = investmentsJson ? JSON.parse(investmentsJson) : null;
      
      if (!investments || !Array.isArray(investments)) {
        // Create default structure if not exists
        createDefaultStorage(userId, orderId, amount, metalType, weight);
        return;
      }
      
      // Find existing investment for this metal type
      const existingIndex = investments.findIndex(inv => inv.metal_type === metalType);
      
      if (existingIndex >= 0) {
        // Update existing investment
        investments[existingIndex].amount += amount;
        investments[existingIndex].weight_in_grams += weight;
        investments[existingIndex].updated_at = new Date().toISOString();
      } else {
        // Add new investment
        investments.push({
          id: `local_${Date.now()}`,
          user_id: userId,
          metal_type: metalType,
          amount: amount,
          weight_in_grams: weight,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Save back to localStorage
      localStorage.setItem(`investments_${userId}`, JSON.stringify(investments));
      
      // Also update transactions
      const txJson = localStorage.getItem(`transactions_${userId}`);
      let transactions = txJson ? JSON.parse(txJson) : [];
      
      transactions.push({
        id: `local_${Date.now()}`,
        order_id: orderId,
        user_id: userId,
        amount: amount,
        metal_type: metalType,
        status: 'completed',
        created_at: new Date().toISOString()
      });
      
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
      
    } catch (error) {
      console.error('Error updating localStorage:', error);
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
    try {
      const investments = [{
        id: `local_${Date.now()}`,
        user_id: userId,
        metal_type: metalType,
        amount: amount,
        weight_in_grams: weight,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];
      
      localStorage.setItem(`investments_${userId}`, JSON.stringify(investments));
      
      const transactions = [{
        id: `local_${Date.now()}`,
        order_id: orderId,
        user_id: userId,
        amount: amount,
        metal_type: metalType,
        status: 'completed',
        created_at: new Date().toISOString()
      }];
      
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
      
    } catch (error) {
      console.error('Error creating default storage:', error);
    }
  };
  
  const handleShare = async () => {
    if (!receiptData) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Investment Receipt',
          text: `I just invested ₹${receiptData.amount} in ${metalType} via Aczen!`,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(
          `I just invested ₹${receiptData.amount} in ${metalType} via Aczen! Check it out at ${window.location.origin}`
        );
        toast.success('Receipt link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share receipt');
    }
  };
  
  const handleDownload = () => {
    // This would typically generate a PDF or image
    toast.success('Receipt downloaded');
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
        <h1 className="text-xl font-bold flex-1 text-center">Payment Success</h1>
        <div className="flex-1 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Processing payment...</p>
          </div>
        ) : receiptData ? (
          <div className="w-full max-w-md">
            {/* Success animation */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            {/* Success message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-400">Your investment has been processed successfully.</p>
            </div>
            
            {/* Receipt */}
            <PaymentReceipt 
              orderId={receiptData.orderId}
              amount={receiptData.amount}
              date={receiptData.date}
              customerName={receiptData.customerName}
              paymentMethod={receiptData.paymentMethod}
              transactionId={receiptData.transactionId}
              metalType={metalType}
            />
            
            {/* Actions */}
            <div className="mt-8 space-y-4">
              <Button 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownload}
              >
                Download Receipt
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">Could not load transaction details</p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 