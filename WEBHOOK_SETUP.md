# Cashfree Webhook Setup Guide

This guide explains how to set up and configure Cashfree webhooks to properly verify payment status in your application.

## What is a webhook?

A webhook is a way for Cashfree to notify your application in real-time when payment events occur. Instead of your app constantly polling the Cashfree API to check payment status, Cashfree will automatically send HTTP POST requests to your webhook endpoint whenever a payment's status changes.

## Why use webhooks?

Webhooks provide several advantages:

1. **Reliability**: Ensure payments are properly recorded even if users close their browser
2. **Security**: Properly verify payments server-side instead of relying on client-side verification
3. **Real-time**: Get immediate notifications when payment status changes
4. **Reduced API calls**: Minimize the need to poll Cashfree's API

## Implementation Steps

### 1. Set Up Your Webhook Endpoint

We've already created a webhook endpoint at:
```
/api/webhooks/cashfree
```

This endpoint handles Cashfree webhook notifications and updates your database accordingly.

### 2. Configure Cashfree Dashboard

1. Log in to your Cashfree merchant dashboard
2. Go to Settings > Webhooks
3. Click "Add New Webhook"
4. Configure the webhook:
   - **URL**: Enter your full webhook URL (e.g., `https://your-domain.com/api/webhooks/cashfree`)
   - **Events to Subscribe**: Select at minimum "Payment Success" and "Payment Failure"
   - **Secret Key**: Generate a strong secret key for signature verification
   - **Status**: Ensure it's set to "Active"

5. Save the configuration

### 3. Set Environment Variables

For security, set these environment variables in your hosting platform:

```
CASHFREE_SECRET_KEY=your_webhook_secret_key
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks/cashfree
```

### 4. Deploy Your Application

Make sure your application is deployed to a publicly accessible URL so Cashfree can send webhook events to it.

### 5. Test the Webhook

1. Make a test payment
2. Check your server logs to ensure the webhook is receiving events
3. Verify that the payment was properly recorded in your database

## Webhook Security

The webhook endpoint verifies the signature of incoming requests to ensure they come from Cashfree. This security feature prevents fraud.

In production, update the `verifyWebhookSignature` function in the webhook handler to properly implement cryptographic verification using the provided secret key.

## Webhook Events

The implemented webhook handles the following Cashfree events:

1. **PAYMENT_SUCCESS**: When a payment is successfully completed
2. **PAYMENT_FAILED**: When a payment fails for any reason

## Troubleshooting

If webhooks aren't working:

1. Check that your webhook URL is publicly accessible
2. Verify environment variables are correctly set
3. Look for any errors in your server logs
4. Ensure the webhook is configured as "Active" in Cashfree dashboard
5. Verify your webhook handler is correctly processing the events

## Local Development

For local development and testing, you can use tools like ngrok to expose your local server to the internet with a temporary URL.

```bash
ngrok http 3000
```

Then update your Cashfree webhook URL to the ngrok URL. 