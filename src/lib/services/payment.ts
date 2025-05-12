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
  paymentLink?: string;
}

export class PaymentService {
  static async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const orderId = `order_${Date.now()}`;
      
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
        
        if (orderData.payment_session_id) {
          const paymentUrl = `https://payments.cashfree.com/order/#${orderData.payment_session_id}`;
          console.log('Redirecting to payment URL:', paymentUrl);
          
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
  
  static async verifyPayment(orderId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${API_URL}/api/payment-status/${orderId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to verify payment');
      }
      
      const data = await response.json();
      
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