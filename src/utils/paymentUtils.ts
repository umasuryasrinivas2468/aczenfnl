import { verifyUpiPayment } from '../services/cashfreeUpiService';

export interface PaymentResult {
  orderId: string;
  status: 'success' | 'failure' | 'pending';
  paymentId?: string;
  paymentMethod?: string;
  amount?: number;
}

/**
 * Processes payment callback URL parameters
 * This is useful for handling redirects from payment gateways
 */
export const processPaymentCallback = async (queryParams: URLSearchParams): Promise<PaymentResult> => {
  const orderId = queryParams.get('order_id');
  const status = queryParams.get('status');
  
  if (!orderId) {
    return {
      orderId: 'unknown',
      status: 'failure'
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
      paymentId: paymentDetails.cfPaymentId || paymentDetails.payment_id,
      paymentMethod: paymentDetails.paymentMethod || 'upi',
      amount: paymentDetails.amount
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Fallback to using the status from URL parameters
    if (status) {
      return {
        orderId,
        status: status.toLowerCase() === 'success' ? 'success' : 'failure'
      };
    }
    
    return {
      orderId,
      status: 'pending'
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
    
    if (pendingTransactionJson) {
      const pendingTransaction = JSON.parse(pendingTransactionJson);
      
      // Verify this is for the same order
      if (pendingTransaction.id === paymentResult.orderId) {
        // Update transaction status
        pendingTransaction.status = paymentResult.status === 'success' ? 'completed' : 'failed';
        
        // Get existing investments
        const userInvestmentsJson = localStorage.getItem('userInvestments');
        
        if (userInvestmentsJson) {
          const userInvestments = JSON.parse(userInvestmentsJson);
          
          // Only update investments if payment was successful
          if (paymentResult.status === 'success') {
            // Update total investment
            userInvestments.totalInvestment += pendingTransaction.amount;
            
            // Update specific metal investment
            const metal = pendingTransaction.type; // 'gold' or 'silver'
            userInvestments.investments[metal].amount += pendingTransaction.amount;
            
            // Calculate metal weight based on approximate rate
            const metalPrice = metal === 'gold' ? 5500 : 70; // Sample rates per gram
            const weightInGrams = pendingTransaction.amount / metalPrice;
            userInvestments.investments[metal].weight += weightInGrams;
          }
          
          // Add transaction to history regardless of status
          userInvestments.transactions.push(pendingTransaction);
          
          // Save updated investments
          localStorage.setItem('userInvestments', JSON.stringify(userInvestments));
          
          // Remove pending transaction
          localStorage.removeItem('pendingTransaction');
          
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
}; 