# Capacitor Plugins

This directory contains custom Capacitor plugins implemented for the Wealth Horizon Bloom application.

## Cashfree Payment Plugin

The Cashfree payment plugin provides a bridge between the web application and the native Android implementation of the Cashfree Payment SDK.

### Usage

```typescript
import { CashfreeCapacitor, isAndroidDevice } from '@/lib/capacitor/cashfree';

// Check if running on Android
if (isAndroidDevice()) {
  try {
    // Initiate a web payment
    const result = await CashfreeCapacitor.doWebPayment({
      paymentSessionId: 'your-payment-session-id',
      orderId: 'your-order-id',
      environment: 'SANDBOX' // or 'PRODUCTION'
    });
    
    if (result.status === 'success') {
      // Handle successful payment
      console.log('Payment successful for order:', result.orderId);
    } else {
      // Handle failed payment
      console.error('Payment failed:', result.message);
    }
  } catch (error) {
    // Handle errors
    console.error('Payment error:', error);
  }
}
```

### Available Methods

#### `doWebPayment(options)`

Initiates a web checkout payment flow using the Cashfree SDK.

Parameters:
- `options.paymentSessionId`: The payment session ID obtained from your backend
- `options.orderId`: The order ID for this transaction
- `options.environment`: The Cashfree environment ('SANDBOX' or 'PRODUCTION')

Returns:
- A Promise that resolves to a `CashfreePaymentResponse` object

#### `doUPIPayment(options)`

Initiates a UPI payment flow using the Cashfree SDK.

Parameters:
- Same as `doWebPayment()`

Returns:
- A Promise that resolves to a `CashfreePaymentResponse` object

### Helper Functions

#### `isAndroidDevice()`

A utility function that returns `true` if the application is running on an Android device.

## Implementation Details

This plugin communicates with the native Android code defined in `android/app/src/main/java/com/wealth/horizon/bloom/CashfreePlugin.java`.

The native plugin implements the Cashfree Android SDK and provides methods for payment processing that match those exposed by this JavaScript interface.

## Error Handling

All payment methods catch and log errors that occur during payment processing. Errors are also propagated back to the caller, allowing for proper error handling in the application.

## Testing

When testing the plugin:

1. Make sure to test on an actual Android device (or emulator) with Google Play Services installed
2. Ensure the necessary permissions are granted to the app
3. Use test credentials and test payment methods as described in the Android README 