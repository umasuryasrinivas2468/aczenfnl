# Cashfree Payment Gateway Integration - Quick Start Guide

This guide will help you quickly test and verify the Cashfree payment gateway integration.

## Step 1: Start the Server

In PowerShell, start the server with:

```powershell
cd server
npm run dev
```

The server should start on port 5002.

## Step 2: Test the Integration

### Option 1: Using the Test Page

1. Open `payment-test.html` in your browser
2. Fill in the payment details (or use the defaults)
3. Click "Proceed to Pay"
4. Complete the payment on the Cashfree payment page
5. You'll be redirected back to the application after payment

### Option 2: Using the Application 

1. Start the React application with:
   ```powershell
   npm run dev
   ```

2. Navigate to the payment flow in your application
3. Click "Proceed to Pay" 
4. Complete the payment on the Cashfree payment page

## Notes on the Implementation

- **API Credentials**: Using App ID: `850529145692c9f93773ed2c0a925058` and secret key as provided
- **Environment**: Set to PRODUCTION environment
- **Payment Flow**: 
  1. Frontend initiates payment request
  2. Backend creates Cashfree order
  3. User is redirected to Cashfree payment page
  4. After payment, user is redirected back to the application
  5. Payment status is verified by the backend

## Android-Specific Integration

The Android integration has been set up to handle both web checkout and UPI intent payments. The native Cashfree SDK is integrated through a Capacitor plugin.

To test on Android:
1. Make sure you have Android Studio installed
2. Build the Android app with:
   ```
   npx cap sync android
   npx cap open android
   ```
3. Run the app on your device or emulator

## Troubleshooting

If you encounter any issues:

1. **Server Communication Error**: Make sure the server is running on port 5002
2. **Payment Error**: Verify that the Cashfree credentials are correct in `server/config/cashfree.js`
3. **Android Integration Issues**: Check the Logcat output in Android Studio for detailed error messages

For more details, refer to the [Cashfree documentation](https://www.cashfree.com/docs/payments/online/mobile/android). 