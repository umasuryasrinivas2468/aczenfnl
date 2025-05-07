# Android Cashfree SDK Integration Guide

This guide explains how the Cashfree Payment Gateway is integrated into the Android app using Capacitor.

## Implementation Overview

The Cashfree integration consists of:

1. A native Android plugin (`CashfreePlugin.java`) implementing the Cashfree SDK
2. A Capacitor bridge in TypeScript (`cashfree.ts`)
3. A React component (`CashfreePayment.tsx`) that handles the UI and payment flow

## How It Works

When a user clicks "Proceed to Pay" in the app:

1. The app creates a payment order through our backend API
2. The backend returns a payment session ID from Cashfree
3. The app passes this session ID to the native Android plugin
4. The native plugin initializes the Cashfree SDK with our credentials:
   - App ID: `850529145692c9f93773ed2c0a925058`
   - Secret Key: `cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01`
5. The Cashfree payment gateway UI opens within the app
6. The user completes the payment
7. The SDK calls back to our plugin with the result
8. The plugin notifies our React app about the success or failure

## Testing the Implementation

1. Build and run the Android app:
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. In Android Studio, run the app on your device or emulator

3. Navigate to the payment screen and click "Proceed to Pay"

4. The native Cashfree payment UI should appear

## Troubleshooting

If you encounter issues:

1. Check Android Studio Logcat for errors - look for tags "CashfreePlugin" or "CFPaymentGateway"

2. Verify that the Cashfree SDK dependencies are correctly added to `android/app/build.gradle`:
   ```gradle
   implementation 'com.cashfree.pg:api:2.2.0'
   implementation 'com.cashfree.pg:core:2.2.0'
   ```

3. Make sure the plugin is registered in `MainActivity.java`:
   ```java
   this.registerPlugin(CashfreePlugin.class);
   ```

4. If the payment UI doesn't appear, check that the session ID is being correctly passed

## Production Considerations

- The implementation is currently set to PRODUCTION mode
- The credentials are hardcoded in the `CashfreePlugin.java` file
- For security in a larger app, consider using environment variables or secure storage

## References

- [Cashfree Documentation](https://www.cashfree.com/docs/payments/online/mobile/android)
- [Cashfree Android SDK GitHub](https://github.com/cashfree/android-sdk) 