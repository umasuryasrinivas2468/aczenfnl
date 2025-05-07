/**
 * Server Configuration
 * Using hardcoded values since there seem to be issues with dotenv
 */

// These would normally come from environment variables
// But we're hardcoding them since .env loading is problematic
const CASHFREE_CONFIG = {
  appId: '850529145692c9f93773ed2c0a925058',
  secretKey: 'cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01',
  apiVersion: '2022-09-01',
  environment: 'production'  // Using production environment as requested
};

console.log('Using hardcoded Cashfree configuration');
console.log('CASHFREE_APP_ID is set');
console.log('CASHFREE_SECRET_KEY is set');
console.log('CASHFREE_API_VERSION:', CASHFREE_CONFIG.apiVersion);
console.log('CASHFREE_ENV:', CASHFREE_CONFIG.environment);

module.exports = {
  // Server Configuration
  port: 5000,
  
  // Cashfree Configuration
  cashfree: {
    appId: CASHFREE_CONFIG.appId,
    secretKey: CASHFREE_CONFIG.secretKey,
    apiVersion: CASHFREE_CONFIG.apiVersion,
    environment: CASHFREE_CONFIG.environment,
    // Ensure we use the correct base URL for production
    baseUrl: CASHFREE_CONFIG.environment.toLowerCase() === 'production' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg',
  },
  
  // Environment Variables Format for .env file
  envFormat: `
# Server Configuration
PORT=5000

# Cashfree Configuration
CASHFREE_APP_ID=YOUR_APP_ID
CASHFREE_SECRET_KEY=YOUR_SECRET_KEY
CASHFREE_API_VERSION=2022-09-01
CASHFREE_ENV=sandbox  # sandbox or production
  `
}; 

