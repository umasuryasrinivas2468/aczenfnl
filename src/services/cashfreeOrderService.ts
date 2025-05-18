import axios from 'axios';
import { supabase } from '@/lib/supabase';

// Correct credentials to match upiIntentService.ts
const API_KEY = "850529145692c9f93773ed2c0a925058";
const API_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
const CASHFREE_API_BASE = 'https://api.cashfree.com/pg';

// Types for order verification
export interface CashfreeOrderVerification {
  order_id: string;
  order_status: 'PAID' | 'ACTIVE' | 'FAILED' | 'CANCELLED' | string;
  order_amount: string;
  order_currency: string;
  cf_order_id: string;
  payment_method?: {
    upi?: {
      upi_id?: string;
      channel?: string;
    };
  };
  created_at: string;
  customer_details?: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  payments?: {
    cf_payment_id: string;
    payment_status: string;
    payment_amount: number;
    payment_time: string;
    payment_method: {
      type: string;
    };
    payment_message?: string;
  }[];
}

export interface TransactionRecord {
  user_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  metal_type: 'gold' | 'silver';
  status: 'completed' | 'failed' | 'pending';
  payment_method: string;
  weight_in_grams?: number;
}

/**
 * Verify the status of a Cashfree order
 */
export const verifyOrderStatus = async (orderId: string): Promise<CashfreeOrderVerification> => {
  try {
    const response = await axios.get(`${CASHFREE_API_BASE}/orders/${orderId}`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error verifying order status:', error);
    throw new Error('Failed to verify payment status');
  }
};

/**
 * Save transaction to Supabase and update investment totals
 */
export const saveTransactionAndUpdateInvestment = async (
  transactionData: TransactionRecord
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Saving transaction and updating investment:", transactionData);
    
    // Insert transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData);
    
    if (transactionError) {
      console.error('Error saving transaction:', transactionError);
      return { success: false, error: transactionError };
    }
    
    // Get current investment record
    const { data: investmentData, error: investmentFetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', transactionData.user_id)
      .eq('metal_type', transactionData.metal_type)
      .single();
    
    // Calculate weight in grams
    const weight = await calculateMetalWeight(
      transactionData.metal_type, 
      transactionData.amount
    );
    
    if (investmentFetchError && investmentFetchError.code !== 'PGRST116') {
      console.error('Error fetching investment:', investmentFetchError);
    }
    
    // If investment exists, update it, otherwise create a new record
    if (investmentData) {
      const { error: investmentError } = await supabase
        .from('investments')
        .update({
          amount: investmentData.amount + transactionData.amount,
          weight_in_grams: (investmentData.weight_in_grams || 0) + weight,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentData.id);
      
      if (investmentError) {
        console.error('Error updating investment:', investmentError);
        return { success: false, error: investmentError };
      }
    } else {
      // Create new investment record
      const { error: insertError } = await supabase
        .from('investments')
        .insert({
          user_id: transactionData.user_id,
          metal_type: transactionData.metal_type,
          amount: transactionData.amount,
          weight_in_grams: weight,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating investment:', insertError);
        return { success: false, error: insertError };
      }
    }
    
    // Also update localStorage for client-side access
    try {
      updateLocalInvestment(transactionData.user_id, transactionData.metal_type, transactionData.amount, weight);
    } catch (e) {
      console.error('Error updating local investment data:', e);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error processing payment update:', error);
    return { success: false, error };
  }
};

/**
 * Update local storage with investment data for client access
 */
const updateLocalInvestment = (
  userId: string,
  metalType: 'gold' | 'silver',
  amount: number,
  weight: number
): void => {
  try {
    // Get existing investments from localStorage
    const userInvestmentsStr = localStorage.getItem('userInvestments');
    if (!userInvestmentsStr) {
      console.log('No userInvestments found in localStorage, creating default');
      
      // Create default structure if it doesn't exist
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
            status: 'completed'
          }
        ]
      };
      
      localStorage.setItem('userInvestments', JSON.stringify(defaultInvestments));
      return;
    }
    
    // Update existing investments
    const userInvestments = JSON.parse(userInvestmentsStr);
    
    // Create transaction record
    const transaction = {
      id: `tx_${Date.now()}`,
      type: metalType,
      amount: amount,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    // Update investments object
    const updatedInvestments = {
      ...userInvestments,
      userId: userId,
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
    console.log(`Updated local investments for ${metalType}`);
  } catch (error) {
    console.error('Error updating local investments:', error);
  }
};

/**
 * Calculate metal weight based on amount and current price
 */
export const calculateMetalWeight = async (
  metalType: 'gold' | 'silver',
  amount: number
): Promise<number> => {
  try {
    // Try to get latest metal price from database
    const { data, error } = await supabase
      .from('metal_prices')
      .select('price_per_gram')
      .eq('type', metalType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      // Fallback to default prices if database query fails
      const defaultPrices = {
        gold: 5500,
        silver: 70
      };
      return amount / defaultPrices[metalType];
    }
    
    // Calculate weight using price from database
    return amount / data.price_per_gram;
  } catch (error) {
    console.error('Error calculating metal weight:', error);
    // Fallback to default calculation
    const defaultPrice = metalType === 'gold' ? 5500 : 70;
    return amount / defaultPrice;
  }
};

/**
 * Verify payment status using Cashfree's "Get Payments for an Order" API
 * Based on https://www.cashfree.com/devstudio/preview/pg/web/checkout#getOrder
 */
export const getPaymentsForOrder = async (orderId: string): Promise<{
  success: boolean;
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'FAILED';
  paymentDetails?: any;
}> => {
  try {
    console.log(`Fetching payments for order: ${orderId}`);
    
    const response = await axios.get(`${CASHFREE_API_BASE}/orders/${orderId}/payments`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Payments response for ${orderId}:`, response.data);
    
    // If there are no payments, return as pending
    if (!response.data || !response.data.length) {
      return { 
        success: true, 
        paymentStatus: 'PENDING' 
      };
    }
    
    // Check the first (latest) payment status
    const latestPayment = response.data[0];
    
    if (latestPayment.payment_status === 'SUCCESS') {
      // Update the local transaction record
      try {
        const { error } = await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            payment_id: latestPayment.cf_payment_id,
            transaction_details: latestPayment,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
        
        if (error) {
          console.error('Error updating transaction in Supabase:', error);
        }
      } catch (error) {
        console.error('Failed to update transaction in Supabase:', error);
      }
      
      return { 
        success: true, 
        paymentStatus: 'SUCCESS',
        paymentDetails: latestPayment
      };
    } else if (latestPayment.payment_status === 'FAILED') {
      // Update the local transaction record
      try {
        const { error } = await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            payment_id: latestPayment.cf_payment_id,
            transaction_details: latestPayment,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
        
        if (error) {
          console.error('Error updating transaction in Supabase:', error);
        }
      } catch (error) {
        console.error('Failed to update transaction in Supabase:', error);
      }
      
      return { 
        success: true, 
        paymentStatus: 'FAILED',
        paymentDetails: latestPayment
      };
    }
    
    // If none of the above, return as pending
    return { 
      success: true, 
      paymentStatus: 'PENDING',
      paymentDetails: latestPayment
    };
  } catch (error: any) {
    console.error('Error fetching payments for order:', error?.response?.data || error);
    return { success: false };
  }
};

/**
 * Check if a payment has been verified by webhook
 * This is more reliable than API polling as it checks if our webhook has already 
 * processed and recorded the payment
 */
export const checkWebhookVerifiedPayment = async (orderId: string): Promise<{
  verified: boolean;
  status?: 'completed' | 'failed' | 'pending';
  paymentDetails?: any;
}> => {
  try {
    console.log(`Checking webhook-verified payment for order: ${orderId}`);
    
    // Query the transactions table to see if this order was updated by webhook
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error) {
      console.error('Error querying transaction:', error);
      return { verified: false };
    }
    
    if (!data) {
      return { verified: false };
    }
    
    // Check if transaction has been updated by webhook
    // We know it's webhook-updated if it has transaction_details
    if (data.transaction_details && (data.status === 'completed' || data.status === 'failed')) {
      console.log(`Found webhook-verified payment: ${orderId}, status: ${data.status}`);
      return {
        verified: true,
        status: data.status,
        paymentDetails: data.transaction_details
      };
    }
    
    // If transaction has updated timestamp more recent than created timestamp, 
    // it might have been updated by webhook
    if (data.updated_at && new Date(data.updated_at) > new Date(data.created_at)) {
      return {
        verified: true,
        status: data.status,
        paymentDetails: data.transaction_details
      };
    }
    
    return { verified: false };
  } catch (error) {
    console.error('Error checking webhook-verified payment:', error);
    return { verified: false };
  }
}; 