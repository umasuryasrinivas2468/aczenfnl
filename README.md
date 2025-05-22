# Cashfree UPI Intent Integration for Capacitor

This repository demonstrates how to implement Cashfree's UPI Intent payment flow in a Capacitor mobile application. UPI Intent provides a seamless payment experience by directly opening UPI apps installed on the user's device.

## Features

- Direct integration with Cashfree's payment gateway
- UPI Intent flow for better mobile payment experience
- Deep link handling for payment callbacks
- Works with all popular UPI apps (Google Pay, PhonePe, Paytm, etc.)
- Configurable app URL scheme for deep linking

## Prerequisites

- Cashfree merchant account with API credentials
- Capacitor-based mobile application
- Backend server to create payment orders and generate payment session IDs

## Implementation Steps

### 1. Install Dependencies

```bash
npm install @capacitor/core @capacitor/app @cashfreepayments/cashfree-js
```

### 2. Configure Capacitor for Deep Linking

#### In `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourapp.id',
  appName: 'Your App',
  webDir: 'dist',
  server: {
    androidScheme: 'yourappscheme'
  }
};

export default config;
```

#### For Android (`AndroidManifest.xml`):

Add the following inside the `<activity>` tag:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="yourappscheme" android:host="cashfree-callback" />
</intent-filter>
```

#### For iOS (`Info.plist`):

Add the following to support UPI apps:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>phonepe</string>
  <string>tez</string>
  <string>paytmmp</string>
  <string>bhim</string>
  <string>credpay</string>
</array>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>yourappscheme</string>
    </array>
  </dict>
</array>
```

### 3. Create Order on Backend

Your backend should create an order using Cashfree's API and return the `order_id` and `payment_session_id` to your frontend.

Example backend endpoint:

```javascript
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, userData } = req.body;
    
    // Create order with Cashfree API
    const orderData = await cashfree.createOrder({
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userData.customerId,
        customer_name: userData.customerName,
        customer_email: userData.customerEmail,
        customer_phone: userData.customerPhone
      }
    });
    
    res.json({
      success: true,
      data: {
        order_id: orderData.order_id,
        payment_session_id: orderData.payment_session_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### 4. Implement UPI Intent Checkout in Frontend

Use the `CashfreeMobileCheckout` component to handle UPI Intent payments:

```jsx
<CashfreeMobileCheckout
  paymentSessionId={paymentSessionId}
  orderId={orderId}
  amount={amount}
  onSuccess={handlePaymentSuccess}
  onFailure={handlePaymentFailure}
  buttonText="Pay with UPI"
  appScheme="yourappscheme"
/>
```

### 5. Handle Deep Link Callbacks

The `CashfreeMobileCheckout` component automatically sets up listeners for deep link callbacks using Capacitor's App plugin. When a payment is completed, the UPI app will redirect back to your app using the configured URL scheme.

## Key Configuration Parameters

- `paymentMethod: "upi"` - Specifies UPI as the payment method
- `upiMode: "intent"` - Forces UPI Intent flow for better mobile experience
- `redirectTarget: "mobile"` - Required for Capacitor apps to open UPI apps
- `redirectUrl: "yourappscheme://cashfree-callback"` - Deep link URL for payment callbacks

## Testing

1. Run your app on a physical device (UPI Intent doesn't work in emulators)
2. Create an order and initiate payment
3. Select a UPI app from the list
4. Complete the payment in the UPI app
5. Verify that you're redirected back to your app with the payment status

## Resources

- [Cashfree React Native UPI Intent Documentation](https://www.cashfree.com/docs/payments/online/mobile/react-native#upi-intent-checkout)
- [Capacitor Deep Linking Documentation](https://capacitorjs.com/docs/apis/app#handling-deep-links)
- [Cashfree UPI Intent Support for JS SDK](https://www.cashfree.com/docs/payments/online/mobile/misc/upi_intent_support_js_sdk)

## License

MIT
