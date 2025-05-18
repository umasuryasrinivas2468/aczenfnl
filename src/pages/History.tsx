import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getTransactionDetails, TransactionDetails } from '@/services/paymentService';
import TransactionHistory from '@/components/TransactionHistory';
import { useUser } from '@clerk/clerk-react';

interface Transaction {
  id: string;
  type: 'gold' | 'silver';
  amount: number;
  date: string;
  status: string;
  transactionId?: string;
  orderId?: string;
  paymentDetails?: TransactionDetails;
}

interface UserInvestments {
  totalInvestment: number;
  investments: any;
  transactions: Transaction[];
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

const History = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [userInvestments, setUserInvestments] = useLocalStorage<UserInvestments>('userInvestments', defaultInvestments);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibilityState, setVisibilityState] = useState(document.visibilityState);

  // Function to load pending transactions from localStorage
  const loadPendingTransactions = (): Transaction[] => {
    try {
      const pendingTxJson = localStorage.getItem('pendingTransaction');
      if (!pendingTxJson) return [];
      
      const pendingTx = JSON.parse(pendingTxJson);
      if (!pendingTx) return [];
      
      // If it's a single transaction object, wrap in array
      const pendingTransactions = Array.isArray(pendingTx) ? pendingTx : [pendingTx];
      
      return pendingTransactions.map(tx => ({
        ...tx,
        // Ensure the transaction has required fields
        id: tx.id || `pending_${Date.now()}`,
        status: tx.status || 'pending',
        date: tx.date || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error loading pending transactions:', error);
      return [];
    }
  };

  // Function to manually check and clean up completed transactions
  const checkAndCleanupPendingTransactions = async () => {
    try {
      const pendingTxJson = localStorage.getItem('pendingTransaction');
      if (!pendingTxJson) return;
      
      const pendingTx = JSON.parse(pendingTxJson);
      if (!pendingTx) return;
      
      // Convert to array if single object
      const pendingTransactions = Array.isArray(pendingTx) ? pendingTx : [pendingTx];
      
      // Skip if no transactions with orderIds
      if (!pendingTransactions.some(tx => tx.orderId)) return;
      
      console.log('Checking payment status for pending transactions:', pendingTransactions);
      
      let removedTransactions = [];
      let remainingTransactions = [];
      
      // Check each transaction
      for (const transaction of pendingTransactions) {
        if (!transaction.orderId) {
          remainingTransactions.push(transaction);
          continue;
        }
        
        try {
          // Get payment details from API
          const paymentDetails = await getTransactionDetails(transaction.orderId);
          
          if (paymentDetails.status === 'SUCCESS' || paymentDetails.status === 'FAILURE') {
            // This transaction is complete, move to userInvestments
            const updatedTransaction = {
              ...transaction,
              status: paymentDetails.status === 'SUCCESS' ? 'completed' : 'failed',
            };
            
            // Add to removedTransactions list for userInvestments
            removedTransactions.push(updatedTransaction);
          } else {
            // Still pending, keep in pendingTransactions
            remainingTransactions.push(transaction);
          }
        } catch (error) {
          console.error(`Error checking transaction ${transaction.id}:`, error);
          remainingTransactions.push(transaction);
        }
      }
      
      // Update localStorage: remove completed transactions
      if (remainingTransactions.length === 0) {
        localStorage.removeItem('pendingTransaction');
        console.log('All pending transactions completed, removed pendingTransaction from localStorage');
      } else if (remainingTransactions.length !== pendingTransactions.length) {
        localStorage.setItem('pendingTransaction', 
          remainingTransactions.length === 1 ? 
            JSON.stringify(remainingTransactions[0]) : 
            JSON.stringify(remainingTransactions)
        );
        console.log('Some transactions still pending, updated pendingTransaction in localStorage');
      }
      
      // Add completed transactions to userInvestments if needed
      if (removedTransactions.length > 0) {
        const currentInvestments = { ...userInvestments };
        
        // Add each transaction if not already in userInvestments
        removedTransactions.forEach(tx => {
          if (!currentInvestments.transactions.some(
            t => t.id === tx.id || (t.orderId && t.orderId === tx.orderId)
          )) {
            currentInvestments.transactions.push(tx);
          }
        });
        
        // Update userInvestments in localStorage
        setUserInvestments(currentInvestments);
        console.log('Added completed transactions to userInvestments:', removedTransactions);
      }
      
      // Force a reload of data if anything changed
      if (removedTransactions.length > 0) {
        fetchPaymentDetails(true);
      }
    } catch (error) {
      console.error('Error in checkAndCleanupPendingTransactions:', error);
    }
  };

  // Function to fetch payment details
  const fetchPaymentDetails = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else if (loading === false) {
      setLoading(true);
    }

    try {
      // Get all transactions from both sources
      const pendingTransactions = loadPendingTransactions();
      const allTransactions = [...userInvestments.transactions, ...pendingTransactions];
      
      // Remove any duplicates (in case a pending transaction was moved to userInvestments)
      const uniqueTransactions = allTransactions.filter((tx, index, self) => 
        index === self.findIndex(t => t.id === tx.id || (t.orderId && t.orderId === tx.orderId))
      );

      const updatedTransactions = await Promise.all(
        uniqueTransactions.map(async (transaction) => {
          // Skip if there's no orderId
          if (!transaction.orderId) {
            return {
              ...transaction,
              paymentDetails: null
            };
          }

          // See if it already has payment details (was looked up previously)
          if (transaction.paymentDetails) {
            // Skip refresh lookup unless forced
            if (!forceRefresh) {
              return transaction;
            }
          }

          try {
            const paymentDetails = await getTransactionDetails(transaction.orderId);
            return {
              ...transaction,
              status: paymentDetails.status === 'SUCCESS' ? 'completed' : 
                      paymentDetails.status === 'FAILURE' ? 'failed' : 'pending',
              paymentDetails
            };
          } catch (error) {
            console.error(`Error fetching payment details for ${transaction.id}:`, error);
            return transaction;
          }
        })
      );

      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPaymentDetails();
    checkAndCleanupPendingTransactions();
  }, []);

  // Set up visibility change event handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking for payment updates');
        // Only refresh if we've been away for at least 5 seconds
        const lastVisibleTime = Number(localStorage.getItem('lastVisibleTime') || '0');
        const currentTime = Date.now();
        if (currentTime - lastVisibleTime > 5000) {
          checkAndCleanupPendingTransactions();
          fetchPaymentDetails(true);
        }
      } else {
        localStorage.setItem('lastVisibleTime', Date.now().toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Force refresh on a timer for pending transactions
  useEffect(() => {
    // Only run if we have transactions with pending status
    const hasPendingTransactions = transactions.some(tx => 
      tx.status === 'pending' && tx.orderId
    );
    
    if (hasPendingTransactions) {
      console.log('Has pending transactions, setting up refresh timer');
      
      const refreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          console.log('Checking pending transactions status...');
          checkAndCleanupPendingTransactions();
          fetchPaymentDetails(true);
        }
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [transactions]);

  const handleRefresh = () => {
    fetchPaymentDetails(true);
    checkAndCleanupPendingTransactions();
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-6">
      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-lg shadow-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isSignedIn ? (
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-lg overflow-hidden">
          <TransactionHistory />
        </div>
      ) : (
        <div className="text-center py-10 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-lg">
          <p className="text-gray-400 mb-4">Please sign in to view your transaction history</p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          >
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
