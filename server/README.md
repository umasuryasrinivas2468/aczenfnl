# Wealth Horizon Bloom Server - Cashfree Integration

This server handles the backend integration with Cashfree Payment Gateway for the Wealth Horizon Bloom application.

## Setup

1. Install dependencies:
   ```
   cd server
   npm install
   ```

2. Configure Cashfree API credentials:
   - Copy `config/cashfree.example.js` to `config/cashfree.js`
   - Add your Cashfree API credentials to the new file
   - Never commit the `cashfree.js` file with real credentials to version control
   - Set the appropriate mode ('TEST' or 'PRODUCTION')

3. Start the server:
   ```
   npm run dev
   ```

## Cashfree Integration

This server provides a complete backend implementation for Cashfree payment gateway, including:

1. **Order Creation**: Creates payment orders in Cashfree
2. **Payment Status**: Retrieves payment status information
3. **Webhook Handling**: Processes payment success/failure notifications
4. **Refund Processing**: Allows refunding successful payments
5. **Payment Analytics**: Retrieves payment details and history

## API Endpoints

### Create Payment Order
- **Endpoint**: `POST /api/payments`
- **Description**: Creates a new order in Cashfree and returns payment URL
- **Request Body**:
  ```json
  {
    "amount": 100,
    "orderId": "order_1234567890",
    "metal": "gold",
    "customerInfo": {
      "name": "User Name",
      "email": "user@example.com",
      "phone": "9876543210"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "orderId": "order_1234567890",
      "orderAmount": 100,
      "paymentSessionId": "session_12345",
      "paymentURL": "https://payments.cashfree.com/...",
      "cfOrderId": "cf_order_12345",
      "orderStatus": "ACTIVE"
    }
  }
  ```

### Get Payment Status
- **Endpoint**: `GET /api/payments/:orderId`
- **Description**: Gets the status of a payment order
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "order_id": "order_1234567890",
      "order_amount": 100,
      "order_status": "PAID",
      "...": "other order details"
    }
  }
  ```

### Get All Payments for an Order
- **Endpoint**: `GET /api/payments/:orderId/all`
- **Description**: Gets all payments for a specific order
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "cf_payment_id": "12345",
        "payment_amount": 100,
        "payment_status": "SUCCESS",
        "...": "other payment details"
      }
    ]
  }
  ```

### Process Refund
- **Endpoint**: `POST /api/payments/:orderId/refund`
- **Description**: Processes a refund for a successful payment
- **Request Body**:
  ```json
  {
    "refundAmount": 100,
    "refundId": "refund_12345",
    "refundNote": "Customer requested refund"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "refund_id": "refund_12345",
      "refund_amount": 100,
      "refund_status": "PENDING",
      "...": "other refund details"
    }
  }
  ```

### Webhook Endpoint
- **Endpoint**: `POST /api/webhook/cashfree`
- **Description**: Handles Cashfree payment notifications
- **Usage**: Configure this URL in your Cashfree dashboard

## Implementation Details

### CashfreeService
The `CashfreeService` class in `services/cashfreeService.js` provides a clean abstraction for all Cashfree API operations:

- `createOrder(orderData)`: Creates a new payment order
- `getOrder(orderId)`: Gets order details
- `getPayments(orderId)`: Gets all payments for an order
- `getPaymentById(orderId, paymentId)`: Gets specific payment details
- `processRefund(orderId, refundData)`: Processes a refund
- `verifyWebhookSignature(webhookData, signature)`: Verifies webhook authenticity
- `generatePaymentURL(orderId, amount)`: Generates direct checkout URL

### Frontend Integration

Your frontend can integrate with this server in two ways:

1. **Direct URL Approach**:
   - Create order on backend
   - Redirect to `paymentURL` from response
   - Handle return to success page

2. **Cashfree SDK Approach**:
   - Create order on backend
   - Use `paymentSessionId` with Cashfree SDK
   - Initialize checkout with SDK on frontend

## Security Considerations

- **API Credentials Protection**:
  - All Cashfree credentials have been replaced with placeholders
  - Before running the application, you must add your own credentials in `config/cashfree.js`
  - Add `server/config/cashfree.js` to your `.gitignore` to prevent accidentally pushing credentials to GitHub
  - Consider using environment variables for production deployments

- **Environment Variable Alternative**:
  You can also use environment variables for credentials:
  ```
  # In your .env file
  CASHFREE_APP_ID=your_app_id_here
  CASHFREE_SECRET_KEY=your_secret_key_here
  CASHFREE_MODE=PRODUCTION
  ```

- **Webhook Signature Verification**:
  - All webhook notifications are verified using cryptographic signatures
  - Never skip signature verification in production

- **CORS Configuration**:
  - CORS is configured to restrict API access
  - Customize the CORS settings in `server/index.js` for production

## Testing

For testing, you can use the Cashfree test credentials and sandbox environment:
1. Update `config/cashfree.js` with test credentials
2. Set mode to 'TEST'
3. Use the sandbox API URL: `https://sandbox.cashfree.com/pg`

## Frontend Integration

The frontend React application communicates with this server to process payments. When a user clicks "Proceed to Payment", the frontend:

1. Generates a unique order ID
2. Makes a POST request to `/api/payments` with the order details
3. Receives a payment link and redirects the user
4. After payment, user is redirected to the success page which verifies the payment status

## Security

- All API credentials are stored server-side
- Signatures are used to verify payment callbacks
- CORS is enabled to allow only specific origins 