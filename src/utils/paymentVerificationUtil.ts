/**
 * Utility to determine payment status from order response
 */

export type PaymentStatus = 'Success' | 'Pending' | 'Failure';
export type Transaction = {
  payment_status?: string;
  order_status?: string;
  status?: string;
};

/**
 * Determines payment status from Cashfree order response
 * @param orderResponse Response from Get Order API
 * @returns Simplified payment status (Success, Pending, or Failure)
 */
export const determinePaymentStatus = (orderResponse: Transaction[] | Transaction): PaymentStatus => {
  // If the response is not an array, convert it to one
  const transactions = Array.isArray(orderResponse) ? orderResponse : [orderResponse];
  
  // Check if any transaction has SUCCESS status
  if (transactions.filter(tx => 
    tx.payment_status === "SUCCESS" || 
    tx.order_status === "PAID" || 
    tx.status === "PAID" ||
    tx.status === "SUCCESS").length > 0) {
    return "Success";
  } 
  // Check if any transaction has PENDING status
  else if (transactions.filter(tx => 
    tx.payment_status === "PENDING" || 
    tx.order_status === "ACTIVE" || 
    tx.status === "PENDING").length > 0) {
    return "Pending";
  } 
  // Default to Failure if no Success or Pending status is found
  else {
    return "Failure";
  }
};

/**
 * Maps the payment provider status to our internal status
 * @param providerStatus Status from payment provider
 * @returns Our internal status (PAID, PENDING, FAILED)
 */
export const mapProviderStatusToInternal = (providerStatus: string): 'PAID' | 'PENDING' | 'FAILED' => {
  // Map Cashfree status to our internal status
  switch (providerStatus) {
    case 'SUCCESS':
    case 'PAID':
      return 'PAID';
    case 'PENDING':
    case 'ACTIVE':
    case 'AWAITING_PAYMENT':
      return 'PENDING';
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
    case 'FAILURE':
      return 'FAILED';
    default:
      return 'PENDING'; // Default to pending for unknown statuses
  }
}; 