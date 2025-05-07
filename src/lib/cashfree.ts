/**
 * Cashfree wrapper for browser environment
 * This file serves as a compatibility layer between the cashfree-pg package and our browser app
 */

// Interface to match the expected API of the payment gateway
export interface CashfreeInterface {
  initialize(appId: string, secretKey: string, environment: string): Promise<void>;
}

class CashfreeService implements CashfreeInterface {
  private appId: string = '';
  private secretKey: string = '';
  private environment: string = 'TEST';
  
  async initialize(appId: string, secretKey: string, environment: string): Promise<void> {
    this.appId = appId;
    this.secretKey = secretKey;
    this.environment = environment;
    console.log('Cashfree initialized with simplified wrapper');
  }
  
  // Helper to generate payment URLs (similar to what was in BuyDialog.tsx)
  generatePaymentUrl(params: {
    code: string;
    amount: string;
    orderId: string;
    orderDescription: string;
    source: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }): string {
    const urlParams = new URLSearchParams({
      code: params.code,
      amount: params.amount,
      orderId: params.orderId,
      orderDescription: params.orderDescription,
      source: params.source
    });
    
    // Add customer info if available
    if (params.customerName) urlParams.append('customerName', params.customerName);
    if (params.customerEmail) urlParams.append('customerEmail', params.customerEmail);
    if (params.customerPhone) urlParams.append('customerPhone', params.customerPhone);
    
    return `https://payments.cashfree.com/forms?${urlParams.toString()}`;
  }
}

// Export a singleton instance
export const cashfreeService = new CashfreeService(); 