import { Capacitor } from '@capacitor/core';

interface CashfreePaymentConfig {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  appId: string;
  orderNote?: string;
  orderMeta?: {
    [key: string]: string;
  };
  source?: string;
  paymentOption?: string;
  pcfToken: string;
}

class CashfreeAndroid {
  private static readonly APP_ID = '850529145692c9f93773ed2c0a925058';
  private static readonly API_URL = 'http://192.168.1.7:5000'; // Use local IPv4 address for physical device testing

  static async initializePayment(config: Partial<CashfreePaymentConfig>) {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Not running on native Android platform');
      }

      // First create order on our server
      const orderResponse = await fetch(`${this.API_URL}/api/create-cashfree-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderAmount: config.orderAmount,
          orderId: config.orderId,
          customerDetails: {
            customerId: `customer_${Date.now()}`,
            customerName: config.customerName,
            customerEmail: config.customerEmail,
            customerPhone: config.customerPhone
          }
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();
      
      // Initialize native Android payment
      const paymentConfig = {
        orderId: orderData.order_id,
        orderAmount: config.orderAmount?.toString(),
        orderCurrency: 'INR',
        customerName: config.customerName,
        customerPhone: config.customerPhone,
        customerEmail: config.customerEmail,
        appId: this.APP_ID,
        orderNote: config.orderNote || 'Test payment',
        orderMeta: {
          return_url: 'https://example.com/payment-status?order_id={order_id}',
          notify_url: 'https://example.com/api/cashfree-webhook'
        },
        source: 'android-app',
        pcfToken: orderData.payment_session_id
      };

      // Call native Android code through Capacitor
      return await (window as any).CashfreePGSDK.startPaymentWEB(paymentConfig);
    } catch (error) {
      console.error('Cashfree Android payment error:', error);
      throw error;
    }
  }

  static async verifyPayment(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/api/payment-status/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
}

export default CashfreeAndroid; 