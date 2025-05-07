# Cashfree Payment Gateway Integration

This guide provides detailed instructions for integrating Cashfree Payment Gateway with your Node.js application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Webhooks](#webhooks)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Cashfree account (Sandbox or Production)
- App ID and Secret Key from Cashfree

## Setup Instructions

1. **Install dependencies:**

```bash
npm install
```

2. **Create an environment file:**

Create a `.env` file in the project root with the following variables:

```
PORT=5000
CASHFREE_APP_ID=YOUR_APP_ID
CASHFREE_SECRET_KEY=YOUR_SECRET_KEY
CASHFREE_API_VERSION=2022-09-01
CASHFREE_ENV=sandbox
```

3. **Start the server:**

```bash
npm run dev
```

4. **Access the demo page:**

Open your browser and navigate to `http://localhost:5000`

## Environment Variables

| Variable | Description | Default Value |
|---------|-------------|---------------|
| PORT | Server port | 5000 |
| CASHFREE_APP_ID | Your Cashfree App ID | - |
| CASHFREE_SECRET_KEY | Your Cashfree Secret Key | - |
| CASHFREE_API_VERSION | Cashfree API version | 2022-09-01 |
| CASHFREE_ENV | Environment (`sandbox` or `production`) | sandbox |

## API Endpoints

### Create Order

```
POST /api/payments/create-order
```

**Request Body:**

```json
{
  "amount": "100",
  "customerName": "John Doe",
  "customerPhone": "9999999999",
  "customerEmail": "john@example.com",
  "orderId": "optional-custom-order-id",
  "returnUrl": "optional-custom-return-url"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cf_order_id": 1234567890,
    "order_id": "order_123456789",
    "entity": "order",
    "order_currency": "INR",
    "order_amount": 100,
    "order_status": "ACTIVE",
    "payment_session_id": "session_123456789012345678901234567890",
    "order_expiry_time": "2023-12-31T23:59:59+05:30",
    "order_note": "",
    "customer_details": {
      "customer_id": "customer_123456789",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "9999999999"
    }
  }
}
```

### Get Order Details

```
GET /api/payments/order/:orderId
```

### Get Payment Details for an Order

```
GET /api/payments/order-payments/:orderId
```

### Payment Success Callback

```
GET /api/payments/payment-success?order_id={order_id}
```

### Webhook Handler

```
POST /api/payments/webhook
```

## Frontend Integration

### 1. Include the Cashfree SDK

```html
<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
```

### 2. Initialize Cashfree

```javascript
const cashfree = new Cashfree({
  mode: "sandbox" // Use "production" for live environment
});
```

### 3. Create Order and Open Checkout

```javascript
// Create order via your backend API
const orderResponse = await fetch('/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: "100",
    customerName: "John Doe",
    customerPhone: "9999999999",
    customerEmail: "john@example.com"
  }),
});

const orderData = await orderResponse.json();
const paymentSessionId = orderData.data.payment_session_id;

// Open Cashfree checkout
cashfree.checkout({
  paymentSessionId,
  returnUrl: window.location.origin + '/api/payments/payment-success'
}).then(function(result) {
  console.log('Checkout Result:', result);
});
```

## Webhooks

Webhooks allow Cashfree to notify your application when payment events occur. The integration includes a webhook validation middleware to ensure the webhook requests are genuinely from Cashfree.

### 1. Set Up Webhook URL

In your Cashfree dashboard, set up your webhook URL as:

```
https://your-domain.com/api/payments/webhook
```

### 2. Events Processed

The webhook handler processes the following events:

- `PAYMENT_SUCCESS`
- `PAYMENT_FAILED`
- `PAYMENT_USER_DROPPED`
- `PAYMENT_PENDING`

## Testing

Use the following test cards for sandbox testing:

| Card Type | Card Number | Expiry | CVV |
|-----------|-------------|--------|-----|
| Success | 4111 1111 1111 1111 | Any future date | Any 3 digits |
| Failure | 4000 0000 0000 0002 | Any future date | Any 3 digits |

## Troubleshooting

### Common Issues

1. **Order creation fails**
   - Check if your App ID and Secret Key are correct
   - Verify that required parameters are provided

2. **Webhook signature validation fails**
   - Ensure that the secret key is the same as configured in your Cashfree dashboard
   - Check if the payload is being modified before validation

3. **SDK initialization fails**
   - Make sure you're including the SDK correctly
   - Check browser console for any errors

## Production Deployment

Before deploying to production:

1. Change `CASHFREE_ENV` to `production`
2. Update `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` with production credentials
3. Implement proper error handling and logging
4. Set up database storage for orders and payments
5. Implement proper security measures to protect sensitive data

For more information, refer to the [official Cashfree documentation](https://docs.cashfree.com/docs/). 