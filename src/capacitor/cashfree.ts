import { Capacitor, registerPlugin } from '@capacitor/core';

// Define plugin interface
export interface CashfreePlugin {
  doWebPayment(options: {
    paymentSessionId: string;
    orderId: string;
    environment?: 'SANDBOX' | 'PRODUCTION';
  }): Promise<{ status: string; orderId: string }>;

  doUPIPayment(options: {
    paymentSessionId: string;
    orderId: string;
    environment?: 'SANDBOX' | 'PRODUCTION';
  }): Promise<{ status: string; orderId: string }>;
}

// Register the plugin - this will connect to our Native implementation in CashfreePlugin.java
const CashfreePayment = registerPlugin<CashfreePlugin>('CashfreePayment');

// Helper function to check if we're running on mobile
export const isMobileApp = () => Capacitor.isNativePlatform();

// Helper function to check if we're running on Android
export const isAndroidDevice = () => Capacitor.getPlatform() === 'android';

// Export the plugin - will be null on web
export const Cashfree = isMobileApp() ? CashfreePayment : null;