import { supabase } from '@/lib/supabase';

// API credentials for Cashfree
const CASHFREE_CLIENT_ID = "850529145692c9f93773ed2c0a925058"; // Replace with your actual client ID
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01"; // Replace with your actual client secret

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED';
export interface PaymentResponse {
  cf_payment_id?: string;
  payment_status?: PaymentStatus;
  payment_method?: string;
  payment_amount?: number;
  payment_time?: string;
  payment_message?: string;
  error_details?: {
    error_code?: string;
    error_description?: string;
  };
}

/**
 * Verifies the payment status of a UPI transaction
 * @param orderId Order ID for the payment to verify
 * @returns Object containing status, payment details and any error info
 */
export const verifyUpiPayment = async (orderId: string): Promise<{
  success: boolean;
  status: PaymentStatus;
  paymentDetails: PaymentResponse | null;
  error?: string;
}> => {
  try {
    // API endpoint
    const endpoint = `https://api.cashfree.com/pg/orders/${orderId}/payments`;
    
    // Make the API call using fetch
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CLIENT_ID,
        'x-client-secret': CASHFREE_CLIENT_SECRET,
        'Accept': 'application/json',
        'x-api-version': '2022-09-01', // Using current version as '2025-01-01' is not yet available
      }
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check if we have a valid response
    if (!response.ok) {
      console.error('Error from Cashfree API:', data);
      return {
        success: false,
        status: 'PENDING', // Default to pending if we can't verify
        paymentDetails: null,
        error: data.message || 'Failed to verify payment status'
      };
    }
    
    // If there are no payments, consider it pending
    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: true,
        status: 'PENDING',
        paymentDetails: null
      };
    }
    
    // Get the most recent payment (in case there are multiple)
    const latestPayment = data[0];
    
    // Return the payment status
    return {
      success: true,
      status: latestPayment.payment_status as PaymentStatus,
      paymentDetails: latestPayment
    };
  } catch (error) {
    console.error('Error verifying UPI payment:', error);
    return {
      success: false,
      status: 'PENDING', // Default to pending if there's an error
      paymentDetails: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Updates the transaction status in Supabase
 * @param orderId Order ID
 * @param status New status
 * @returns Success flag and any error
 */
export const updateTransactionStatus = async (
  orderId: string, 
  status: 'PENDING' | 'PAID' | 'FAILED'
): Promise<{ success: boolean; error?: any }> => {
  try {
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
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update transaction status:', error);
    return { success: false, error };
  }
};

/**
 * Updates the investment record when a payment is successful
 * @param userId User ID
 * @param orderId Order ID
 * @param amount Payment amount
 * @param metalType Type of metal (gold or silver)
 * @returns Success flag and any error
 */
export const updateInvestmentRecord = async (
  userId: string,
  orderId: string,
  amount: number,
  metalType: 'gold' | 'silver'
): Promise<{ success: boolean; error?: any }> => {
  try {
    // First check if transaction already exists and is paid
    const { data: existingTransaction, error: txError } = await supabase
      .from('transactions')
      .select('status')
      .eq('order_id', orderId)
      .single();
    
    // If transaction is already marked as paid, skip updating
    if (!txError && existingTransaction && existingTransaction.status === 'PAID') {
      console.log(`Transaction ${orderId} is already paid, skipping investment update`);
      return { success: true };
    }
    
    // Update transaction status to paid
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'PAID',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);
    
    if (updateError) {
      console.error('Error updating transaction status:', updateError);
      return { success: false, error: updateError };
    }
    
    // Calculate metal weight - use default price if not available
    const defaultPrice = metalType === 'gold' ? 5500 : 70;
    const weight = amount / defaultPrice;
    
    // Check if investment record exists
    const { data: existingInvestment, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .eq('metal_type', metalType)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // 'PGRST116' is "No rows found" error
      console.error('Error fetching existing investment:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // If investment record exists, update it, otherwise create a new one
    if (existingInvestment) {
      // Update existing investment
      const { error: updateInvestmentError } = await supabase
        .from('investments')
        .update({
          amount: existingInvestment.amount + amount,
          weight_in_grams: (existingInvestment.weight_in_grams || 0) + weight,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInvestment.id);
      
      if (updateInvestmentError) {
        console.error('Error updating investment:', updateInvestmentError);
        return { success: false, error: updateInvestmentError };
      }
    } else {
      // Create new investment record
      const { error: createError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          metal_type: metalType,
          amount: amount,
          weight_in_grams: weight,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (createError) {
        console.error('Error creating investment:', createError);
        return { success: false, error: createError };
      }
    }
    
    // Update local storage for client-side usage
    try {
      updateLocalInvestmentData(userId, orderId, amount, metalType, weight);
    } catch (localError) {
      console.error('Error updating local storage:', localError);
      // Continue even if local storage update fails
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating investment record:', error);
    return { success: false, error };
  }
};

/**
 * Updates local storage with investment data for immediate use in the UI
 */
const updateLocalInvestmentData = (
  userId: string,
  orderId: string,
  amount: number,
  metalType: 'gold' | 'silver',
  weight: number
) => {
  try {
    // Get existing data or create default
    const userInvestmentsStr = localStorage.getItem('userInvestments');
    let userInvestments = userInvestmentsStr ? JSON.parse(userInvestmentsStr) : {
      userId,
      totalInvestment: 0,
      investments: {
        gold: { amount: 0, weight: 0, weightUnit: 'grams' },
        silver: { amount: 0, weight: 0, weightUnit: 'grams' }
      },
      transactions: []
    };
    
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
    const existingTxIndex = userInvestments.transactions.findIndex(
      (tx: any) => tx.orderId === orderId
    );
    
    if (existingTxIndex >= 0) {
      // Update existing transaction
      userInvestments.transactions[existingTxIndex] = {
        ...userInvestments.transactions[existingTxIndex],
        status: 'completed'
      };
    } else {
      // Add new transaction
      userInvestments.transactions.unshift(transaction);
      
      // Update investment amounts
      userInvestments.totalInvestment += amount;
      userInvestments.investments[metalType].amount += amount;
      userInvestments.investments[metalType].weight += weight;
    }
    
    // Save back to localStorage
    localStorage.setItem('userInvestments', JSON.stringify(userInvestments));
  } catch (error) {
    console.error('Error updating local investment data:', error);
    throw error;
  }
}; 