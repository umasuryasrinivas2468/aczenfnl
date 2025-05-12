// Type definitions for Cashfree SDK
interface CashfreeConfig {
  mode: 'production' | 'test';
}

interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank';
}

interface CashfreeCheckoutResult {
  error?: {
    message: string;
    code: string;
  };
}

interface CashfreeInstance {
  checkout: (options: CashfreeCheckoutOptions) => Promise<CashfreeCheckoutResult>;
}

type CashfreeInitializer = (config: CashfreeConfig) => CashfreeInstance;

declare global {
  interface Window {
    Cashfree: CashfreeInitializer;
  }
} 