import { Capacitor } from '@capacitor/core';
import axios from 'axios';

// UPI Payment interface
export interface UpiPaymentParams {
  pa: string;       // Payee Address (UPI ID)
  pn: string;       // Payee Name
  mc?: string;      // Merchant Code (optional)
  tid: string;      // Transaction ID - unique for each transaction
  tr: string;       // Transaction Reference - can be order ID
  am: string;       // Amount
  cu?: string;      // Currency (default: INR)
  url?: string;     // URL for status communication (optional)
  tn?: string;      // Transaction note (optional)
}

// Payment status interface
export interface PaymentStatus {
  status: 'success' | 'failure' | 'pending' | 'unknown';
  transactionId: string;
  transactionRef: string;
  amount: string;
  message?: string;
  responseCode?: string;
  timestamp?: number;
}

// UPI Payment Service
export class UpiPaymentService {
  private static instance: UpiPaymentService;
  private backendUrl: string = process.env.REACT_APP_BACKEND_URL || '/api';
  
  private constructor() {}
  
  public static getInstance(): UpiPaymentService {
    if (!UpiPaymentService.instance) {
      UpiPaymentService.instance = new UpiPaymentService();
    }
    return UpiPaymentService.instance;
  }
  
  /**
   * Check if device supports UPI deep linking
   */
  public isMobileDevice(): boolean {
    // Check if the app is running in a Capacitor native container
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    
    // If not in Capacitor, check if it's a mobile browser
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod|mobile/i.test(userAgent.toLowerCase());
  }
  
  /**
   * Check if the device likely supports UPI apps
   */
  public supportsUpi(): boolean {
    // UPI is primarily supported on Android devices
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android/i.test(userAgent.toLowerCase()) || Capacitor.getPlatform() === 'android';
  }
  
  /**
   * Generate UPI deep link URL
   */
  public generateUpiUrl(params: UpiPaymentParams): string {
    // Ensure required parameters are provided
    if (!params.pa || !params.pn || !params.am || !params.tid || !params.tr) {
      throw new Error('Missing required UPI parameters');
    }
    
    // Set default currency if not provided
    if (!params.cu) {
      params.cu = 'INR';
    }
    
    // Build URL parameters
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.append(key, value);
    });
    
    // Create deep link URL
    return `upi://pay?${urlParams.toString()}`;
  }
  
  /**
   * Initialize payment by creating record in database
   */
  public async initializePayment(params: UpiPaymentParams): Promise<{ transactionId: string; upiUrl: string }> {
    try {
      // First, register the transaction in the backend
      const response = await axios.post(`${this.backendUrl}/payments/init`, {
        transactionId: params.tid,
        referenceId: params.tr,
        amount: params.am,
        payeeAddress: params.pa,
        payeeName: params.pn,
        description: params.tn || 'Payment',
        status: 'initiated'
      });
      
      // Generate deep link URL
      const upiUrl = this.generateUpiUrl(params);
      
      return {
        transactionId: params.tid,
        upiUrl
      };
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      throw error;
    }
  }
  
  /**
   * Open UPI deep link
   */
  public openUpiApp(upiUrl: string): boolean {
    if (!this.isMobileDevice()) {
      return false;
    }
    
    // Record start time before redirection (for polling)
    localStorage.setItem('upi_payment_start_time', Date.now().toString());
    
    // Redirect to UPI URL
    window.location.href = upiUrl;
    return true;
  }
  
  /**
   * Check payment status via backend
   */
  public async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await axios.get(`${this.backendUrl}/payments/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return {
        status: 'unknown',
        transactionId,
        transactionRef: '',
        amount: '',
        message: 'Failed to fetch payment status'
      };
    }
  }
  
  /**
   * Poll payment status until resolved or timeout
   */
  public async pollPaymentStatus(
    transactionId: string, 
    maxAttempts = 10, 
    intervalMs = 3000
  ): Promise<PaymentStatus> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkStatus = async () => {
        try {
          const status = await this.checkPaymentStatus(transactionId);
          
          // If status is resolved, return it
          if (status.status === 'success' || status.status === 'failure') {
            resolve(status);
            return;
          }
          
          // If max attempts reached, resolve with the current status
          if (++attempts >= maxAttempts) {
            resolve(status);
            return;
          }
          
          // Otherwise, try again after interval
          setTimeout(checkStatus, intervalMs);
        } catch (error) {
          reject(error);
        }
      };
      
      // Start checking
      checkStatus();
    });
  }
  
  /**
   * Generate a unique transaction ID
   */
  public generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
} 