// Simple Cashfree payment handler for web and mobile
import { Capacitor } from '@capacitor/core';

interface PaymentOptions {
  paymentSessionId: string;
  orderId: string;
}

export class CashfreePaymentWeb {
  async doWebPayment(options: PaymentOptions): Promise<any> {
    const { paymentSessionId, orderId } = options;
    
    // Construct payment URL
    const paymentUrl = `https://payments.cashfree.com/pg/view/checkout?payment_session_id=${paymentSessionId}`;
    
    if (Capacitor.isNativePlatform()) {
      // On native platforms, open the URL in the device's browser
      window.open(paymentUrl, '_blank');
    } else {
      // On web, open in new tab
      window.open(paymentUrl, '_blank');
    }
    
    // Return success status
    return {
      status: 'opened',
      orderId,
      message: 'Payment page opened in browser'
    };
  }

  async doUPIPayment(options: PaymentOptions): Promise<any> {
    // Simply use the web payment
    return this.doWebPayment(options);
  }
}
