import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentReceipt from '@/components/PaymentReceipt';
import { usePreciousMetalPrices } from '@/hooks/usePreciousMetalPrices';
import { toast } from 'sonner';

interface PaymentDetails {
  orderId: string;
  amount: number;
  status: string;
  timestamp: string;
  paymentMethod: string;
  customerName?: string;
  type?: string; // Metal type: gold or silver
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gold: goldPrice, silver: silverPrice } = usePreciousMetalPrices();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [investmentUpdated, setInvestmentUpdated] = useState(false);

  useEffect(() => {
    // First try to get data from location state (from UPI flow)
    if (location.state) {
      const paymentData = location.state as PaymentDetails;
      setPaymentDetails(paymentData);
      
      // Update investments if not already updated
      if (!investmentUpdated) {
        updateInvestments(paymentData);
        setInvestmentUpdated(true);
      }
    } else {
      // Fallback to URL params (from Cashfree redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      const transactionId = urlParams.get('transaction_id');
      const amount = urlParams.get('amount') ? parseFloat(urlParams.get('amount')!) : 0;
      const metalType = urlParams.get('metal_type') || 'gold';
      
      if (orderId) {
        const paymentData = {
          orderId: orderId,
          amount: amount,
          status: 'PAID',
          timestamp: new Date().toISOString(),
          paymentMethod: 'Online Payment',
          transactionId: transactionId || orderId,
          type: metalType
        };
        
        setPaymentDetails(paymentData);
        
        // Update investments if not already updated
        if (!investmentUpdated) {
          updateInvestments(paymentData);
          setInvestmentUpdated(true);
        }
      }
    }
  }, [location, investmentUpdated]);

  // Function to update user investments
  const updateInvestments = (payment: any) => {
    if (!payment || !payment.amount) return;
    
    try {
      // Get current investments from localStorage
      const userInvestments = localStorage.getItem('userInvestments');
      if (userInvestments) {
        const investments = JSON.parse(userInvestments);
        
        // Default to gold investment if type not specified
        const metalType = payment.type || 'gold';
        const amount = parseFloat(payment.amount);
        
        // Calculate weight based on current price
        const currentPrice = metalType === 'gold' ? goldPrice : silverPrice;
        const weight = amount / currentPrice;
        
        // Create transaction record
        const transaction = {
          id: payment.orderId || payment.transactionId || `tx_${Date.now()}`,
          type: metalType,
          amount: amount,
          date: payment.timestamp || new Date().toISOString(),
          status: 'completed',
          paymentMethod: payment.paymentMethod || 'UPI'
        };

        // Update investments
        const updatedInvestments = {
          ...investments,
          totalInvestment: investments.totalInvestment + amount,
          investments: {
            ...investments.investments,
            [metalType]: {
              ...investments.investments[metalType],
              amount: investments.investments[metalType].amount + amount,
              weight: investments.investments[metalType].weight + weight
            }
          },
          transactions: [transaction, ...investments.transactions]
        };
        
        localStorage.setItem('userInvestments', JSON.stringify(updatedInvestments));
        
        // Show a success toast
        toast.success(`Successfully added ${amount.toFixed(2)} to your ${metalType} investment`);
      }
    } catch (error) {
      console.error("Error updating investments:", error);
      toast.error("Failed to update investment records");
    }
  };

  // Share receipt as image (for native mobile)
  const handleShareReceipt = () => {
    if (navigator.share && paymentDetails) {
      const text = `Payment Receipt for ${paymentDetails.orderId}`;
      navigator.share({
        title: 'Payment Receipt',
        text: text
      }).catch(err => {
        console.error('Error sharing:', err);
      });
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
        
        {paymentDetails ? (
          <>
            <PaymentReceipt data={paymentDetails} />
            
            <div className="mt-8 space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/history')}
              >
                View Transaction History
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p>Loading payment details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 