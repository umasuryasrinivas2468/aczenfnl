import { supabase } from '@/lib/supabase';
import { getTransactionDetails } from './paymentService';
import axios from 'axios';

// Define transaction data type
export interface Transaction {
  id?: string;
  order_id: string;
  user_id: string;
  amount: number;
  metal_type: 'gold' | 'silver' | string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  payment_method: string;
  created_at?: string;
}

// Function to get transaction history for a user
export const getUserTransactions = async (userId: string): Promise<{ data: Transaction[] | null; error: any }> => {
  try {
    console.log(`Fetching transactions for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return { data: null, error };
    }

    console.log(`Found ${data?.length || 0} transactions`);
    return { data, error: null };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return { data: null, error };
  }
};

// Function to get transaction by order ID
export const getTransactionByOrderId = async (orderId: string): Promise<{ data: Transaction | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching transaction by order ID:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Failed to fetch transaction by order ID:', error);
    return { data: null, error };
  }
};

// Function to call Cashfree's notify URL
export const callCashfreeNotify = async (orderId: string, status: string): Promise<{success: boolean, data?: any, error?: any}> => {
  try {
    // Constants for API authentication
    const API_KEY = process.env.REACT_APP_CASHFREE_API_KEY || "850529145692c9f93773ed2c0a925058";
    const API_SECRET = process.env.REACT_APP_CASHFREE_API_SECRET || "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
    
    // Notify URL for Cashfree 
    const notifyUrl = `/api/cashfree/pg/orders/${orderId}/notify`;
    
    console.log(`Calling Cashfree notify URL for order ${orderId} with status ${status}`);
    
    // Make API call
    const response = await axios.post(notifyUrl, 
      { status },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': API_KEY,
          'x-client-secret': API_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Notify URL response:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Error calling notify URL for order ${orderId}:`, 
      error.response ? error.response.data : error.message);
    return { success: false, error };
  }
};

// Function to update transaction status
export const updateTransactionStatus = async (
  orderId: string,
  status: 'PENDING' | 'PAID' | 'FAILED'
): Promise<{ success: boolean; error: any }> => {
  try {
    // First update in our database
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Error updating transaction status:', error);
      return { success: false, error };
    }
    
    // Then call Cashfree notify URL to ensure their system is updated
    await callCashfreeNotify(orderId, status);

    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to update transaction status:', error);
    return { success: false, error };
  }
};

// Function to check and call notify URL for all transactions in the database
export const syncAllTransactions = async (): Promise<{ updated: number; error: any }> => {
  try {
    console.log('Starting sync of all transactions with notify URL');
    
    // Fetch all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return { updated: 0, error };
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions to sync');
      return { updated: 0, error: null };
    }
    
    console.log(`Found ${transactions.length} transactions to sync`);
    
    let updatedCount = 0;
    let failedCount = 0;
    
    // Process each transaction
    for (const transaction of transactions) {
      try {
        // Get current status from payment provider
        const paymentDetails = await getTransactionDetails(transaction.order_id);
        
        // Map payment provider status to our status
        let newStatus: 'PENDING' | 'PAID' | 'FAILED';
        if (paymentDetails.status === 'SUCCESS') {
          newStatus = 'PAID';
        } else if (paymentDetails.status === 'FAILURE') {
          newStatus = 'FAILED';
        } else {
          newStatus = 'PENDING';
        }
        
        // Only update if status has changed
        if (newStatus !== transaction.status) {
          console.log(`Updating transaction ${transaction.order_id} status from ${transaction.status} to ${newStatus}`);
          
          // Update in database
          const { success } = await updateTransactionStatus(transaction.order_id, newStatus);
          
          if (success) {
            updatedCount++;
            console.log(`Successfully updated and notified for transaction ${transaction.order_id}`);
          } else {
            failedCount++;
            console.error(`Failed to update transaction ${transaction.order_id}`);
          }
        } else {
          // Even if status hasn't changed, still call notify URL to ensure consistency
          await callCashfreeNotify(transaction.order_id, transaction.status);
          console.log(`Called notify URL for transaction ${transaction.order_id} (status unchanged: ${transaction.status})`);
        }
      } catch (txError) {
        failedCount++;
        console.error(`Error processing transaction ${transaction.order_id}:`, txError);
      }
    }
    
    console.log(`Transaction sync completed. Updated: ${updatedCount}, Failed: ${failedCount}`);
    return { updated: updatedCount, error: null };
  } catch (error) {
    console.error('Failed to sync transactions:', error);
    return { updated: 0, error };
  }
};

// Function to check and update pending transaction statuses
export const checkAndUpdatePendingTransactions = async (userId?: string): Promise<{ updated: number; error: any }> => {
  try {
    // First try to use our API endpoint to check all transactions
    try {
      const apiUrl = `/api/check-transactions${userId ? `?userId=${userId}` : ''}`;
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.success) {
        console.log(`API updated ${response.data.updated} transactions`);
        return { updated: response.data.updated, error: null };
      }
    } catch (apiError) {
      console.warn('API check failed, falling back to direct check:', apiError);
      // Continue with direct check below if API fails
    }
    
    // Query for pending transactions
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('status', 'PENDING');
    
    // If userId is provided, only check that user's transactions
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Fetch pending transactions
    const { data: pendingTransactions, error } = await query;
    
    if (error) {
      console.error('Error fetching pending transactions:', error);
      return { updated: 0, error };
    }
    
    if (!pendingTransactions || pendingTransactions.length === 0) {
      console.log('No pending transactions to check');
      return { updated: 0, error: null };
    }
    
    console.log(`Checking ${pendingTransactions.length} pending transactions`);
    
    let updatedCount = 0;
    
    // Check each transaction with Cashfree
    for (const transaction of pendingTransactions) {
      try {
        // Get payment details from API
        const paymentDetails = await getTransactionDetails(transaction.order_id);
        
        // Map Cashfree status to our status
        let newStatus: 'PENDING' | 'PAID' | 'FAILED';
        if (paymentDetails.status === 'SUCCESS') {
          newStatus = 'PAID';
        } else if (paymentDetails.status === 'FAILURE') {
          newStatus = 'FAILED';
        } else {
          newStatus = 'PENDING'; // Keep as pending if still pending
          continue; // Skip update if status hasn't changed
        }
        
        // Update if status has changed
        if (newStatus !== transaction.status) {
          const { success } = await updateTransactionStatus(transaction.order_id, newStatus);
          if (success) {
            updatedCount++;
            console.log(`Updated transaction ${transaction.order_id} status to ${newStatus}`);
          }
        }
      } catch (txError) {
        console.error(`Error checking transaction ${transaction.order_id}:`, txError);
        // Continue with next transaction on error
      }
    }
    
    return { updated: updatedCount, error: null };
  } catch (error) {
    console.error('Failed to check and update transactions:', error);
    return { updated: 0, error };
  }
}; 