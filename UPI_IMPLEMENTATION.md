# UPI Payment Implementation for React + Capacitor / PWA

This documentation outlines how to implement UPI (Unified Payments Interface) payments in a React application that can be deployed on the web and converted to a mobile app using Capacitor or as a PWA.

## Overview

The implementation provides:

1. Deep linking to UPI apps on mobile devices
2. Platform detection to ensure UPI is only offered on supported devices
3. Payment status verification via backend API
4. Database storage of payment information
5. Webhook support for payment notifications

## Implementation Files

- `src/services/upiPaymentService.ts` - Core service for UPI payment handling
- `src/components/UpiPayment.tsx` - React component for UPI payment UI
- `src/pages/UpiPaymentPage.tsx` - Example page implementing the UPI payment flow
- `src/styles/upiPayment.css` - Styling for UPI components
- `api/webhook.js` - Serverless function for handling payment webhooks
- `lib/mongodb.js` - Database connection utility

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @capacitor/core axios mongodb
# If using Capacitor
npm install @capacitor/android @capacitor/ios
```

### 2. Import Styles

In your main CSS or App.tsx file, import the UPI payment styles:

```javascript
import './styles/upiPayment.css';
```

### 3. Configure Environment Variables

Create a `.env` file with the following variables:

```
REACT_APP_API_BASE_URL=/api
MONGODB_URI=mongodb+srv://your-connection-string
MONGODB_DB=your-database-name
```

For Vercel deployment, add these variables in the Vercel project settings.

### 4. Backend Setup

1. Deploy the webhook handler to Vercel
2. Set up a MongoDB database for storing payment information
3. Configure your UPI app provider (like Cashfree, Razorpay, etc.) to send webhooks to your endpoint

## Usage Example

```jsx
import React from 'react';
import UpiPayment from './components/UpiPayment';

const CheckoutPage = () => {
  // Payment event handlers
  const handleSuccess = (data) => {
    console.log('Payment successful:', data);
    // Update order status, redirect user, etc.
  };
  
  const handleFailure = (data) => {
    console.log('Payment failed:', data);
    // Show error message, allow retry, etc.
  };

  return (
    <div>
      <h1>Checkout</h1>
      
      <UpiPayment
        amount="100.00"
        upiId="merchant@upi"
        payeeName="Your Store Name"
        description="Order #123456"
        orderId="ORDER_123456"
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
};
```

## Mobile-Specific Considerations

### For Capacitor Apps

1. Add necessary permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<queries>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="upi" />
    </intent>
</queries>
```

2. Configure deep link handling in `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourapp.id',
  appName: 'Your App Name',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: ['your-api-domain.com']
  },
  plugins: {
    App: {
      handleIntentLinks: true
    }
  }
};

export default config;
```

### For PWAs

1. Register a service worker to handle payment status updates when the app is reopened after payment
2. Use the `pollPaymentStatus` method for more reliable payment status checking

## Troubleshooting

1. **UPI Deep Links Not Working:** 
   - Ensure your device has UPI apps installed
   - Check that the UPI ID format is correct
   - Verify that deep linking is properly configured in your mobile app

2. **Payment Status Not Updating:**
   - Check webhook endpoint is accessible
   - Verify database connection
   - Check payment parameters (transaction ID, etc.)

3. **Testing on Development:**
   - Use the test UPI deep link feature for local testing
   - Mock webhook callbacks using tools like Postman

## Security Considerations

1. Always validate webhook requests using signatures provided by your payment provider
2. Store sensitive payment information securely
3. Use HTTPS for all API endpoints
4. Implement proper error handling and logging

## Database Schema

The payment information in MongoDB follows this structure:

```javascript
{
  transactionId: String,     // Unique transaction ID
  referenceId: String,       // Your order/reference ID
  amount: String,            // Payment amount
  payeeAddress: String,      // UPI ID of recipient
  payeeName: String,         // Name of recipient
  description: String,       // Payment description
  status: String,            // 'initiated', 'success', 'failure', 'pending'
  providerStatus: String,    // Status from payment provider
  responseCode: String,      // Response code (if any)
  approvalRefNo: String,     // Approval reference (if any)
  createdAt: Date,           // When the payment was initiated
  updatedAt: Date            // When the payment was last updated
}
``` 