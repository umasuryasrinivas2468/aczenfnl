import { verifyUpiPayment } from '../services/cashfreeUpiService';

export interface PaymentResult {
  orderId: string;
  status: 'success' | 'failure' | 'pending';
  paymentId?: string;
  paymentMethod?: string;
  amount?: number;
  errorMessage?: string;
}

/**
 * Processes payment callback URL parameters
 * This is useful for handling redirects from payment gateways
 */
export const processPaymentCallback = async (queryParams: URLSearchParams): Promise<PaymentResult> => {
  const orderId = queryParams.get('order_id');
  const status = queryParams.get('status');
  const paymentId = queryParams.get('payment_id');
  const errorMessage = queryParams.get('error_message') || queryParams.get('message');
  
  if (!orderId) {
    return {
      orderId: 'unknown',
      status: 'failure',
      errorMessage: 'No order ID provided'
    };
  }

  // For Cashfree UPI payments, verify the payment status with the API
  try {
    const verificationResult = await verifyUpiPayment(orderId);
    
    // Map the status to a consistent format
    let mappedStatus: 'success' | 'failure' | 'pending';
    
    switch (verificationResult.status) {
      case 'PAID':
      case 'SUCCESS':
        mappedStatus = 'success';
        break;
      case 'FAILED':
      case 'FAILURE':
      case 'CANCELLED':
        mappedStatus = 'failure';
        break;
      default:
        mappedStatus = 'pending';
    }
    
    // Get payment details from verificationResult
    const paymentDetails = verificationResult.paymentDetails || {};
    
    return {
      orderId,
      status: mappedStatus,
      paymentId: paymentDetails.cfPaymentId || paymentDetails.payment_id || paymentId,
      paymentMethod: paymentDetails.paymentMethod || 'upi',
      amount: paymentDetails.amount,
      errorMessage: mappedStatus === 'failure' ? (paymentDetails.errorMessage || errorMessage || 'Payment failed') : undefined
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Fallback to using the status from URL parameters
    if (status) {
      return {
        orderId,
        status: status.toLowerCase() === 'success' ? 'success' : 'failure',
        paymentId: paymentId,
        errorMessage: status.toLowerCase() !== 'success' ? (errorMessage || 'Payment verification failed') : undefined
      };
    }
    
    return {
      orderId,
      status: 'pending',
      paymentId: paymentId
    };
  }
};

/**
 * Updates local storage with payment result
 */
export const updateLocalTransactionStatus = (paymentResult: PaymentResult): boolean => {
  try {
    // Check for pending transaction in localStorage
    const pendingTransactionJson = localStorage.getItem('pendingTransaction');
    
    if (!pendingTransactionJson) {
      console.log('No pending transaction found in localStorage');
      return false;
    }
    
    const pendingTransaction = JSON.parse(pendingTransactionJson);
    
    // If empty or invalid data, return false
    if (!pendingTransaction || typeof pendingTransaction !== 'object') {
      console.log('Invalid pending transaction data');
      return false;
    }
    
    // Handle both single transaction and array of transactions
    const isArray = Array.isArray(pendingTransaction);
    const transactions = isArray ? pendingTransaction : [pendingTransaction];
    
    // Find the transaction that matches this order ID
    const matchingTxIndex = transactions.findIndex(
      tx => tx.id === paymentResult.orderId || tx.orderId === paymentResult.orderId
    );
    
    if (matchingTxIndex === -1) {
      console.log('No matching transaction found');
      return false;
    }
    
    // Get the transaction and update its status
    const transaction = transactions[matchingTxIndex];
    transaction.status = paymentResult.status === 'success' ? 'completed' : 
                         paymentResult.status === 'failure' ? 'failed' : 'pending';
    transaction.paymentId = paymentResult.paymentId || transaction.paymentId;
    
    // Get existing investments
    const userInvestmentsJson = localStorage.getItem('userInvestments');
    
    if (!userInvestmentsJson) {
      console.log('No userInvestments found in localStorage');
      return false;
    }
    
    const userInvestments = JSON.parse(userInvestmentsJson);
    
    // Only update investments if payment was successful
    if (paymentResult.status === 'success') {
      // Update total investment
      userInvestments.totalInvestment += transaction.amount;
      
      // Update specific metal investment
      const metal = transaction.type; // 'gold' or 'silver'
      if (metal === 'gold' || metal === 'silver') {
        userInvestments.investments[metal].amount += transaction.amount;
        
        // Calculate metal weight based on approximate rate
        const metalPrice = metal === 'gold' ? 5500 : 70; // Sample rates per gram
        const weightInGrams = transaction.amount / metalPrice;
        userInvestments.investments[metal].weight += weightInGrams;
      } else {
        console.warn(`Invalid metal type: ${metal}, defaulting to gold`);
        userInvestments.investments.gold.amount += transaction.amount;
        const weightInGrams = transaction.amount / 5500;
        userInvestments.investments.gold.weight += weightInGrams;
      }
    }
    
    // Add transaction to history regardless of status
    // Check if it's already in the transactions array
    const existingTxIndex = userInvestments.transactions.findIndex(
      (tx: any) => tx.id === transaction.id || tx.orderId === transaction.orderId
    );
    
    if (existingTxIndex === -1) {
      // Add to beginning of array
      userInvestments.transactions.unshift(transaction);
    } else {
      // Update existing transaction
      userInvestments.transactions[existingTxIndex] = transaction;
    }
    
    // Save updated investments
    localStorage.setItem('userInvestments', JSON.stringify(userInvestments));
    
    // Remove matching transaction from pendingTransaction
    if (isArray) {
      const updatedTransactions = transactions.filter((_, i) => i !== matchingTxIndex);
      
      if (updatedTransactions.length === 0) {
        localStorage.removeItem('pendingTransaction');
      } else if (updatedTransactions.length === 1) {
        localStorage.setItem('pendingTransaction', JSON.stringify(updatedTransactions[0]));
      } else {
        localStorage.setItem('pendingTransaction', JSON.stringify(updatedTransactions));
      }
    } else {
      // If it was a single transaction, simply remove it
      localStorage.removeItem('pendingTransaction');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
}; 