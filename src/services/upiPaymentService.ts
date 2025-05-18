import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import { App } from '@capacitor/app';

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
  private appReturnListener: any = null;
  private statusPollingInterval: any = null;
  
  private constructor() {
    // Setup app return listener for Capacitor
    if (Capacitor.isNativePlatform()) {
      this.setupAppStateListener();
    }
  }
  
  public static getInstance(): UpiPaymentService {
    if (!UpiPaymentService.instance) {
      UpiPaymentService.instance = new UpiPaymentService();
    }
    return UpiPaymentService.instance;
  }
  
  /**
   * Setup listener for app state changes (for Capacitor)
   */
  private setupAppStateListener() {
    try {
      // Remove existing listener if any
      if (this.appReturnListener) {
        this.appReturnListener.remove();
      }
      
      // Add new listener
      this.appReturnListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App has come back to foreground, check pending transactions
          this.checkPendingTransactionOnResume();
        }
      });
      
      console.log('App state listener set up for UPI payments');
    } catch (error) {
      console.error('Error setting up app state listener:', error);
    }
  }
  
  /**
   * Check pending transactions when app resumes
   */
  private async checkPendingTransactionOnResume() {
    const pendingTxnId = localStorage.getItem('pending_txn_id');
    const startTime = localStorage.getItem('upi_payment_start_time');
    
    if (pendingTxnId && startTime) {
      console.log('App resumed, checking pending UPI transaction:', pendingTxnId);
      
      // Clear any existing polling interval
      if (this.statusPollingInterval) {
        clearInterval(this.statusPollingInterval);
      }
      
      // Perform an immediate check before starting polling
      try {
        const immediateStatus = await this.checkPaymentStatus(pendingTxnId);
        console.log('Immediate payment status check result:', immediateStatus);
        
        // If status is already resolved, trigger event right away
        if (immediateStatus.status === 'success' || immediateStatus.status === 'failure') {
          localStorage.removeItem('pending_txn_id');
          localStorage.removeItem('upi_payment_start_time');
          
          // Trigger an event with the final status
          const event = new CustomEvent('upi_status_updated', { 
            detail: { status: immediateStatus, finalUpdate: true } 
          });
          document.dispatchEvent(event);
          
          // Don't start polling if we already have a final status
          return;
        }
      } catch (error) {
        console.error('Error in immediate payment status check:', error);
      }
      
      // Start aggressive polling for status updates only if immediate check didn't resolve
      this.startStatusPolling(pendingTxnId, 15, 1500);
      
      // Trigger a custom event that components can listen for
      const event = new CustomEvent('upi_app_returned', { 
        detail: { transactionId: pendingTxnId } 
      });
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Start polling for payment status at short intervals
   */
  public startStatusPolling(transactionId: string, maxAttempts = 15, intervalMs = 2000) {
    let attempts = 0;
    
    // Clear any existing polling interval
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
    }
    
    console.log(`Starting UPI status polling for transaction ${transactionId}`);
    
    this.statusPollingInterval = setInterval(async () => {
      try {
        attempts++;
        console.log(`Polling attempt ${attempts} for transaction ${transactionId}`);
        
        const status = await this.checkPaymentStatus(transactionId);
        
        // If status is resolved or max attempts reached, stop polling
        if (status.status === 'success' || status.status === 'failure' || attempts >= maxAttempts) {
          clearInterval(this.statusPollingInterval);
          this.statusPollingInterval = null;
          
          // Trigger an event with the final status
          const event = new CustomEvent('upi_status_updated', { 
            detail: { status, finalUpdate: true } 
          });
          document.dispatchEvent(event);
          
          // If transaction is complete, clean up
          if (status.status === 'success' || status.status === 'failure') {
            localStorage.removeItem('pending_txn_id');
            localStorage.removeItem('upi_payment_start_time');
          }
          // If we still don't have a definitive status after max attempts,
          // we should prompt the user to check their UPI app or try again
          else if (attempts >= maxAttempts) {
            // Update status to let user know we couldn't determine the status
            const timeoutStatus: PaymentStatus = {
              ...status,
              message: "We couldn't verify your payment status. Please check your UPI app to confirm the payment status."
            };
            
            // Trigger an event with the timeout status
            const timeoutEvent = new CustomEvent('upi_status_updated', { 
              detail: { status: timeoutStatus, finalUpdate: true } 
            });
            document.dispatchEvent(timeoutEvent);
          }
        } else {
          // Trigger event for status update (not final)
          const event = new CustomEvent('upi_status_updated', { 
            detail: { status, finalUpdate: false } 
          });
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.error('Error in payment status polling:', error);
        
        // If too many errors, stop polling
        if (attempts >= maxAttempts) {
          clearInterval(this.statusPollingInterval);
          this.statusPollingInterval = null;
          
          // Create an error status to inform the user
          const errorStatus: PaymentStatus = {
            status: 'unknown',
            transactionId: transactionId,
            transactionRef: '',
            amount: '',
            message: "Error checking payment status. Please check your UPI app to confirm the payment."
          };
          
          // Trigger an event with the error status
          const errorEvent = new CustomEvent('upi_status_updated', { 
            detail: { status: errorStatus, finalUpdate: true } 
          });
          document.dispatchEvent(errorEvent);
        }
      }
    }, intervalMs);
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
        status: 'initiated',
        platform: Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web',
        deviceInfo: {
          isNative: Capacitor.isNativePlatform(),
          platform: Capacitor.getPlatform(),
          userAgent: navigator.userAgent
        }
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
    
    // For Capacitor, we need to handle the return differently
    if (Capacitor.isNativePlatform()) {
      console.log('Opening UPI URL in Capacitor native app:', upiUrl);
      
      // Use Capacitor App plugin to open URL externally
      try {
        App.openUrl({ url: upiUrl }).catch(error => {
          console.error('Error opening UPI URL in native app:', error);
        });
        
        return true;
      } catch (error) {
        console.error('Error opening UPI URL in native app:', error);
        return false;
      }
    } else {
      // For browser, use standard location.href
      try {
        // When the app returns, instead of redirecting to the uploaded screen,
        // we'll check the payment status directly
        window.location.href = upiUrl;
        return true;
      } catch (error) {
        console.error('Error opening UPI URL in browser:', error);
        return false;
      }
    }
  }
  
  /**
   * Directly update payment status to database (for testing)
   */
  public async updatePaymentStatus(transactionId: string, newStatus: string): Promise<PaymentStatus> {
    try {
      const response = await axios.post(`${this.backendUrl}/payments/update-status`, {
        transactionId,
        status: newStatus
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }
  
  /**
   * Check payment status via backend
   */
  public async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      console.log(`Checking payment status for transaction: ${transactionId}`);
      const response = await axios.get(`${this.backendUrl}/payments/status/${transactionId}`);
      console.log('Payment status response:', response.data);
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
  
  /**
   * Cleanup resources when no longer needed
   */
  public cleanup() {
    if (this.appReturnListener) {
      this.appReturnListener.remove();
      this.appReturnListener = null;
    }
    
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }
} 