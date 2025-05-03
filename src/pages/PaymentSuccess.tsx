import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreciousMetalPrices } from '@/hooks/usePreciousMetalPrices';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { gold: goldPrice, silver: silverPrice } = usePreciousMetalPrices();
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  useEffect(() => {
    // Get transaction data from localStorage
    const pendingTransaction = localStorage.getItem('pendingTransaction');
    if (pendingTransaction) {
      const transaction = JSON.parse(pendingTransaction);
      
      // Get URL parameters from Cashfree Test Mode
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      const txStatus = urlParams.get('txStatus') || urlParams.get('txMsg');
      const txMsg = urlParams.get('txMsg');
      const txTime = urlParams.get('txTime') || new Date().toISOString();
      const referenceId = urlParams.get('referenceId') || urlParams.get('signature');
      
      // In test mode, we'll consider the payment successful if we have orderId
      if (orderId) {
        // Update transaction with success details
        const completedTransaction = {
          ...transaction,
          status: 'completed',
          transactionId: referenceId || `tx_${Date.now()}`,
          txTime: txTime,
          txMsg: txMsg || 'Payment completed'
        };
        
        setTransactionDetails(completedTransaction);
        
        // Update user investments in localStorage
        const userInvestments = localStorage.getItem('userInvestments');
        if (userInvestments) {
          const investments = JSON.parse(userInvestments);
          const metalType = transaction.type as 'gold' | 'silver';
          const amount = parseFloat(transaction.amount);
          
          // Calculate weight based on current price
          const currentPrice = metalType === 'gold' ? goldPrice : silverPrice;
          const weight = amount / currentPrice;
          
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
            transactions: [completedTransaction, ...investments.transactions]
          };
          
          localStorage.setItem('userInvestments', JSON.stringify(updatedInvestments));
        }
        
        // Clear pending transaction
        localStorage.removeItem('pendingTransaction');
      }
    }
  }, [goldPrice, silverPrice]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Home
        </Button>
        
        <div className="flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          
          {transactionDetails && (
            <div className="w-full bg-gray-900 rounded-lg p-4 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID</span>
                  <span>{transactionDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span>{new Date(transactionDetails.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Metal Type</span>
                  <span className="capitalize">{transactionDetails.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span>₹{transactionDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-500">Completed</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 w-full">
            <Button 
              className="w-full" 
              onClick={() => navigate('/history')}
            >
              View Transaction History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 