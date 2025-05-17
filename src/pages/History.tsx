import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getTransactionDetails, TransactionDetails } from '@/services/paymentService';

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

          try {
            const paymentDetails = await getTransactionDetails(transaction.orderId);
            
            // If any payment that was previously pending is now successful or failed,
            // update the local storage data as well
            if (transaction.status === 'pending' && 
                paymentDetails && 
                (paymentDetails.status === 'SUCCESS' || paymentDetails.status === 'FAILURE')) {
              // Mark for update in local storage
              transaction.status = paymentDetails.status === 'SUCCESS' ? 'completed' : 'failed';
              
              // If this was a pendingTransaction that's now complete, try to move it to userInvestments
              if (pendingTransactions.some(pt => pt.id === transaction.id || pt.orderId === transaction.orderId)) {
                const pendingTxJson = localStorage.getItem('pendingTransaction');
                if (pendingTxJson) {
                  try {
                    const pendingTx = JSON.parse(pendingTxJson);
                    
                    // If it's a single transaction that matches
                    if (!Array.isArray(pendingTx) && 
                        (pendingTx.id === transaction.id || pendingTx.orderId === transaction.orderId)) {
                      localStorage.removeItem('pendingTransaction');
                    } 
                    // If it's an array, remove the matching transaction
                    else if (Array.isArray(pendingTx)) {
                      const updatedPendingTx = pendingTx.filter(pt => 
                        pt.id !== transaction.id && pt.orderId !== transaction.orderId
                      );
                      
                      if (updatedPendingTx.length === 0) {
                        localStorage.removeItem('pendingTransaction');
                      } else {
                        localStorage.setItem('pendingTransaction', JSON.stringify(updatedPendingTx));
                      }
                    }
                    
                    // Add to userInvestments if not already there
                    if (!userInvestments.transactions.some(t => 
                      t.id === transaction.id || t.orderId === transaction.orderId
                    )) {
                      setUserInvestments({
                        ...userInvestments,
                        transactions: [...userInvestments.transactions, transaction]
                      });
                    }
                  } catch (e) {
                    console.error('Error updating pendingTransaction:', e);
                  }
                }
              }
            }
            
            return {
              ...transaction,
              paymentDetails
            };
          } catch (error) {
            console.error(`Error fetching payment details for order ${transaction.orderId}:`, error);
            return {
              ...transaction,
              paymentDetails: null
            };
          }
        })
      );

      setTransactions(updatedTransactions);
      
      // Update local storage if transaction statuses have changed
      const userTxHasChanges = updatedTransactions.some((t, i) => {
        const originalTx = userInvestments.transactions.find(ut => 
          ut.id === t.id || (ut.orderId && ut.orderId === t.orderId)
        );
        return originalTx && originalTx.status !== t.status;
      });
      
      if (userTxHasChanges) {
        const updatedInvestments = {
          ...userInvestments,
          transactions: userInvestments.transactions.map(t => {
            const updated = updatedTransactions.find(ut => 
              ut.id === t.id || (ut.orderId && ut.orderId === t.orderId)
            );
            return updated || t;
          })
        };
        setUserInvestments(updatedInvestments);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      
      // Fall back to showing combined transactions without payment details
      const pendingTransactions = loadPendingTransactions();
      const allTransactions = [...userInvestments.transactions, ...pendingTransactions];
      
      // Remove any duplicates
      const uniqueTransactions = allTransactions.filter((tx, index, self) => 
        index === self.findIndex(t => t.id === tx.id || (t.orderId && t.orderId === tx.orderId))
      );
      
      setTransactions(uniqueTransactions);
    } finally {
      setLoading(false);
      if (forceRefresh) {
        setRefreshing(false);
      }
    }
  };

  // Handle visibility change to refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
      if (document.visibilityState === 'visible') {
        fetchPaymentDetails();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userInvestments]);

  // Initial data fetch
  useEffect(() => {
    fetchPaymentDetails();
    
    // Also check and cleanup pending transactions on load
    checkAndCleanupPendingTransactions();
  }, [userInvestments.transactions]);

  // Auto-refresh recent pending transactions
  useEffect(() => {
    // Find transactions that are pending and less than 10 minutes old
    const recentPendingTransactions = transactions.filter(t => {
      const isRecent = (new Date().getTime() - new Date(t.date).getTime()) < 10 * 60 * 1000; // 10 minutes
      const isPending = t.status === 'pending' || 
                        (t.paymentDetails && t.paymentDetails.status === 'PENDING');
      return isRecent && isPending && t.orderId;
    });
    
    if (recentPendingTransactions.length > 0 && visibilityState === 'visible') {
      // Set up refresh interval for recent pending transactions
      const refreshInterval = setInterval(() => {
        console.log("Auto-refreshing recent pending transactions");
        fetchPaymentDetails(true);
      }, 15000); // Refresh every 15 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [transactions, visibilityState]);

  const getStatusDisplay = (transaction: Transaction) => {
    // If we have payment details, use that status
    if (transaction.paymentDetails) {
      const { status, failureReason } = transaction.paymentDetails;
      
      if (status === 'SUCCESS') {
        return { text: 'Success', className: 'text-green-500' };
      } else if (status === 'PENDING') {
        return { text: 'Pending', className: 'text-yellow-500' };
      } else {
        return { 
          text: 'Failed', 
          className: 'text-red-500',
          reason: failureReason
        };
      }
    }
    
    // Fall back to original status
    return { 
      text: transaction.status, 
      className: transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500' 
    };
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPaymentDetails(true);
    checkAndCleanupPendingTransactions();
  };
  
  // Handle manual cleanup
  const handleForceCleanup = () => {
    checkAndCleanupPendingTransactions();
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-black text-white p-4 flex justify-center items-center">
        Loading transaction history...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="p-0 mr-3" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Transaction History</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleForceCleanup}
            >
              Fix Pending
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: Transaction) => {
                  const statusDisplay = getStatusDisplay(transaction);
                  
                  return (
                  <TableRow key={transaction.id} className="border-gray-800">
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>₹{transaction.amount}</TableCell>
                    <TableCell>
                        <span className={statusDisplay.className} title={statusDisplay.reason}>
                          {statusDisplay.text}
                      </span>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transaction history available
            </div>
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Transaction Details</h2>
            {transactions.map((transaction: Transaction) => {
              const statusDisplay = getStatusDisplay(transaction);
              const paymentId = transaction.paymentDetails?.paymentId || transaction.transactionId || transaction.id;
              
              return (
              <div key={transaction.id} className="mb-4 p-3 border border-gray-800 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Transaction ID</span>
                    <span>{paymentId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Date</span>
                  <span>{new Date(transaction.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Type</span>
                  <span className="capitalize">{transaction.type} purchase</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount</span>
                  <span>₹{transaction.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                    <span className={statusDisplay.className} title={statusDisplay.reason}>
                      {statusDisplay.text}
                  </span>
                  </div>
                  {statusDisplay.reason && (
                    <div className="mt-2 text-sm text-red-400">
                      Reason: {statusDisplay.reason}
                    </div>
                  )}
                  {transaction.paymentDetails?.paymentMethod && (
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-400">Payment Method</span>
                      <span>{transaction.paymentDetails.paymentMethod}</span>
                    </div>
                  )}
                  {transaction.orderId && (
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-400">Order ID</span>
                      <span className="text-xs truncate max-w-[180px]">{transaction.orderId}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
