# Cashfree Webhook Setup

This document explains how to set up and configure webhooks for Cashfree payments in your application.

## Why Webhooks?

Webhooks are essential for reliable payment processing because:

1. **Real-time Updates**: Webhooks provide instant notifications when payment status changes
2. **Reliability**: They work even if the user closes their browser after initiating payment
3. **Security**: Server-side verification is more secure than client-side polling

## Webhook Setup

### 1. Webhook Endpoint

The webhook endpoint for Cashfree notifications is:

```
https://your-domain.com/api/webhooks/cashfree
```

This endpoint is already implemented in the codebase at `/api/webhooks/cashfree.js`.

### 2. Configuring in Cashfree Dashboard

1. Log in to your [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/login)
2. Navigate to **Settings** > **Webhooks**
3. Click on **Add New Webhook**
4. Enter the webhook URL: `https://your-domain.com/api/webhooks/cashfree`
5. Select the following events:
   - Payment Success
   - Payment Failure
   - Order Status Change
6. Save the webhook configuration

### 3. Webhook Signature Verification

The webhook handler verifies the signature of incoming requests for security. Cashfree includes:

- `x-webhook-signature` - A base64-encoded HMAC-SHA256 signature
- `x-webhook-timestamp` - The timestamp when the webhook was triggered

Our webhook handler validates these to ensure the request is legitimate.

## Webhook Events

The webhook handles the following events:

1. **Payment Success**:
   - Updates the transaction status to "completed"
   - Updates the user's investment records
   - Stores payment details from Cashfree

2. **Payment Failure**:
   - Updates the transaction status to "failed"
   - Records the failure reason

## Testing Webhooks

To test webhooks locally:

1. Use a tool like [ngrok](https://ngrok.com/) to expose your local server
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL provided by ngrok
4. Update your webhook URL in the Cashfree dashboard temporarily
5. Make a test payment
6. Check your server logs for webhook processing

## Troubleshooting

Common webhook issues:

1. **Webhook URL Not Accessible**: Ensure your URL is publicly accessible
2. **Signature Verification Failure**: Check that you're using the correct secret key
3. **Events Not Received**: Verify webhook configuration in Cashfree dashboard

For detailed logs, check your server logs or Vercel logs if deployed there. 