import { registerPlugin } from '@capacitor/core';

/**
 * Interface for Cashfree payment response
 */
export interface CashfreePaymentResponse {
  status: 'success' | 'failed';
  orderId?: string;
  message?: string;
  code?: string;
}

/**
 * Interface for Cashfree payment options
 */
export interface CashfreePaymentOptions {
  paymentSessionId: string;
  orderId: string;
  environment?: 'PRODUCTION' | 'SANDBOX';
}

/**
 * Define the plugin interface
 */
export interface CashfreePaymentPlugin {
  doWebPayment(options: CashfreePaymentOptions): Promise<CashfreePaymentResponse>;
  doUPIPayment(options: CashfreePaymentOptions): Promise<CashfreePaymentResponse>;
}

// Register the plugin with Capacitor
const CashfreePayment = registerPlugin<CashfreePaymentPlugin>('CashfreePayment');

/**
 * Cashfree Capacitor Plugin
 */
export class CashfreeCapacitor {
  /**
   * Start a web checkout payment
   * 
   * @param options Payment options
   * @returns Promise with payment response
   */
  static async doWebPayment(options: CashfreePaymentOptions): Promise<CashfreePaymentResponse> {
    try {
      return await CashfreePayment.doWebPayment(options);
    } catch (error) {
      console.error('Cashfree payment error:', error);
      throw error;
    }
  }
  
  /**
   * Start a UPI payment (Falls back to web checkout if UPI is not available)
   * 
   * @param options Payment options
   * @returns Promise with payment response
   */
  static async doUPIPayment(options: CashfreePaymentOptions): Promise<CashfreePaymentResponse> {
    try {
      return await CashfreePayment.doUPIPayment(options);
    } catch (error) {
      console.error('Cashfree UPI payment error:', error);
      throw error;
    }
  }
}

// Utility to check if running on an Android device
export const isAndroidDevice = (): boolean => {
  return typeof window !== 'undefined' && 
         window.navigator && 
         /android/i.test(window.navigator.userAgent);
}; 