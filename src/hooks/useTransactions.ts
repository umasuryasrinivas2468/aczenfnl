import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Transaction, getUserTransactions, checkAndUpdatePendingTransactions } from '@/services/transactionService';

// Extended type to handle both database status and local status
type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'completed';

// Custom hook to fetch and manage user transactions
export const useTransactions = () => {
  const { user, isSignedIn } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!isSignedIn || !user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      // First check and update any pending transactions
      await checkAndUpdatePendingTransactions(user.id);
      
      // Then fetch all transactions
      const { data, error: transactionsError } = await getUserTransactions(user.id);
      
      if (transactionsError) {
        setError('Failed to fetch transaction history.');
        console.error(transactionsError);
      } else if (data) {
        // Normalize status values - some might be stored as 'completed' instead of 'PAID'
        const normalizedData = data.map(tx => ({
          ...tx,
          // @ts-ignore - Workaround for type checking as we know 'completed' could be a status value
          status: tx.status === 'completed' ? 'PAID' : tx.status
        }));
        setTransactions(normalizedData);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when the user changes
  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchTransactions();
    } else {
      // Reset state when user is not signed in
      setTransactions([]);
      setLoading(false);
      setError(null);
    }
  }, [isSignedIn, user?.id]);

  // Return gold and silver transactions separately and the totals
  const goldTransactions = transactions.filter(tx => tx.metal_type && tx.metal_type.toLowerCase() === 'gold');
  const silverTransactions = transactions.filter(tx => tx.metal_type && tx.metal_type.toLowerCase() === 'silver');
  
  // Calculate totals for completed transactions only
  // Consider both 'PAID' and 'completed' as successful statuses
  const isCompletedTransaction = (tx: Transaction) => 
    // @ts-ignore - Workaround for type checking as we know 'completed' could be a status value
    tx.status === 'PAID' || tx.status === 'completed';
    
  const completedTransactions = transactions.filter(isCompletedTransaction);
  
  const totalAmount = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const goldAmount = completedTransactions
    .filter(tx => tx.metal_type && tx.metal_type.toLowerCase() === 'gold')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const silverAmount = completedTransactions
    .filter(tx => tx.metal_type && tx.metal_type.toLowerCase() === 'silver')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Set up auto-refresh on a timer
  useEffect(() => {
    // Refresh data every 30 seconds to keep it current
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && isSignedIn) {
        console.log('Auto-refreshing transaction data');
        fetchTransactions();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [isSignedIn]);

  return {
    transactions,
    goldTransactions,
    silverTransactions,
    totalAmount,
    goldAmount,
    silverAmount,
    loading,
    error,
    refreshTransactions: fetchTransactions
  };
}; 