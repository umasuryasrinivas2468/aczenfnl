/**
 * Cashfree Client Utilities
 * This file contains helper functions for frontend integration with Cashfree
 */

// Sample HTML/JS for integrating with frontend
const cashfreeIntegrationSample = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cashfree Payment Integration</title>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      border-radius: 4px;
    }
    .error {
      color: red;
    }
  </style>
</head>
<body>
  <h1>Cashfree Payment Demo</h1>
  
  <div class="form-group">
    <label for="amount">Amount (₹)</label>
    <input type="number" id="amount" min="1" value="100">
  </div>
  
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" placeholder="John Doe">
  </div>
  
  <div class="form-group">
    <label for="phone">Phone Number</label>
    <input type="tel" id="phone" placeholder="9999999999">
  </div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" placeholder="john@example.com">
  </div>
  
  <button onclick="makePayment()">Pay Now</button>
  
  <div id="error" class="error"></div>
  
  <script>
    // Initialize Cashfree
    const cashfree = new Cashfree({
      mode: "sandbox" // "production" for live environment
    });
    
    async function makePayment() {
      try {
        // Clear previous errors
        document.getElementById('error').innerText = '';
        
        // Get form values
        const amount = document.getElementById('amount').value;
        const customerName = document.getElementById('name').value;
        const customerPhone = document.getElementById('phone').value;
        const customerEmail = document.getElementById('email').value;
        
        // Validate form
        if (!amount || !customerPhone) {
          document.getElementById('error').innerText = 'Amount and Phone are required';
          return;
        }
        
        // Create order through your backend API
        const orderResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            customerName,
            customerPhone,
            customerEmail,
          }),
        });
        
        const orderData = await orderResponse.json();
        
        if (!orderData.success) {
          throw new Error(orderData.message || 'Failed to create order');
        }
        
        // Extract payment session ID from order response
        const paymentSessionId = orderData.data.payment_session_id;
        
        // Initialize the checkout
        const checkoutOptions = {
          paymentSessionId,
          returnUrl: window.location.origin + '/payment-return',
        };
        
        // Open Cashfree checkout
        cashfree.checkout(checkoutOptions).then(function(result){
          // Handle payment success/failure
          if (result.error) {
            document.getElementById('error').innerText = result.error.message || 'Payment failed';
          }
          
          console.log('Checkout Result:', result);
        });
      } catch (error) {
        console.error('Payment error:', error);
        document.getElementById('error').innerText = error.message || 'Something went wrong';
      }
    }
  </script>
</body>
</html>
`;

// Instructions for frontend integration
const integrationSteps = `
# Cashfree Integration Steps

## Server Setup
1. Create a new order using the '/api/payments/create-order' endpoint
2. Pass the required parameters (amount, customer details)
3. Get the payment_session_id from the response

## Frontend Integration
1. Include the Cashfree SDK:
   \`<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>\`
2. Initialize Cashfree:
   \`const cashfree = new Cashfree({ mode: "sandbox" });\`
3. Get payment_session_id from your backend
4. Call checkout method with the payment_session_id:
   \`cashfree.checkout({ paymentSessionId })\`
5. Handle the payment result

## Webhooks
1. Set up a webhook listener at '/api/payments/webhook'
2. Validate the webhook signature
3. Process payment status updates

## Order Status
1. Use '/api/payments/order/:orderId' to check order status
2. Update your database accordingly
`;

module.exports = {
  cashfreeIntegrationSample,
  integrationSteps,
}; 