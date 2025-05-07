// API URL - hardcode to use port 5000 always
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  paymentLink?: string;
}

/**
 * Payment Service to handle Cashfree payments
 */
export class PaymentService {
  /**
   * Process a payment using Cashfree
   * 
   * @param details Payment details
   * @returns Payment result
   */
  static async processPayment(details: PaymentDetails): Promise<PaymentResult> {
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
      
      // Step 1: Create order on the backend
      try {
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
            }
          })
        });
        
        if (!createOrderResponse.ok) {
          const errorData = await createOrderResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${createOrderResponse.status}`);
        }
        
        const orderData = await createOrderResponse.json();
        console.log('Order created:', orderData);
        
        // Step 2: Redirect to Cashfree payment page
        if (orderData.payment_session_id) {
          const paymentUrl = `https://payments.cashfree.com/order/#${orderData.payment_session_id}`;
          console.log('Redirecting to payment URL:', paymentUrl);
          
          // Redirect to payment page
          window.location.href = paymentUrl;
          
          return {
            success: true,
            orderId: orderData.order_id,
            paymentLink: paymentUrl
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