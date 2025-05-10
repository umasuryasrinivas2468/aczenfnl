const API_URL = import.meta.env.VITE_API_URL || 'https://aczenfnl.onrender.com';

export interface PaymentDetails {
  amount: number;
  metal: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod?: 'card' | 'upi';
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  message?: string;
  paymentSessionId?: string;
}

/**
 * Modern PaymentService using the new Cashfree JS SDK
 */
export class PaymentService {
  /**
   * Create a payment session and return the session ID
   * 
   * @param details Payment details
   * @returns Payment result with session ID
   */
  static async createPaymentSession(details: PaymentDetails): Promise<PaymentResult> {
    try {
      // Generate order ID client-side
      const orderId = `order_${Date.now()}`;
      
      // Store transaction data in local storage
      const transactionData = {
        id: orderId,
        type: details.metal,
        amount: details.amount,
        date: new Date().toISOString(),
        status: 'pending'
      };
      
      localStorage.setItem('pendingTransaction', JSON.stringify(transactionData));
      
      console.log(`Making API request to: ${API_URL}/api/create-cashfree-order`);
      
      try {
        // Create order on the backend
        const createOrderResponse = await fetch(`${API_URL}/api/create-cashfree-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderAmount: details.amount,
            orderId: orderId,
            customerDetails: {
              customerId: `customer_${Date.now()}`,
              customerName: details.customerName,
              customerEmail: details.customerEmail,
              customerPhone: details.customerPhone
            },
            // Add planType based on the metal selection
            planType: details.metal,
            // Add order note directly
            orderNote: `Customer selected ${details.metal.toUpperCase()} plan`
          })
        });
        
        if (!createOrderResponse.ok) {
          const errorData = await createOrderResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${createOrderResponse.status}`);
        }
        
        const orderData = await createOrderResponse.json();
        console.log('Order created:', orderData);
        
        // Return the payment session ID instead of redirecting
        if (orderData.payment_session_id) {
          return {
            success: true,
            orderId: orderData.order_id,
            paymentSessionId: orderData.payment_session_id
          };
        } else {
          throw new Error('No payment session ID received from server');
        }
      } catch (networkError: any) {
        console.error('Network error:', networkError);
        throw new Error(`Network error - Make sure your server is running at ${API_URL}: ${networkError.message}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown payment error'
      };
    }
  }
  
  /**
   * Verify payment status
   * 
   * @param orderId Order ID to verify
   * @returns Payment verification result
   */
  static async verifyPayment(orderId: string): Promise<PaymentResult> {
    try {
      // Call the backend API to verify the payment
      const response = await fetch(`${API_URL}/api/payment-status/${orderId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to verify payment');
      }
      
      const data = await response.json();
      
      // Check the payment status from Cashfree
      const isPaymentSuccessful = data.order_status === 'PAID';
      
      return {
        success: isPaymentSuccessful,
        orderId,
        message: isPaymentSuccessful 
          ? 'Payment verified successfully' 
          : `Payment status: ${data.order_status}`
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify payment'
      };
    }
  }
} 