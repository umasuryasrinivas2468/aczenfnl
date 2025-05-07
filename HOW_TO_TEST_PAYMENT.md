# How to Test the Cashfree Payment Integration

Follow these steps to test the Cashfree payment integration in your application:

## Setup and Prerequisites

1. Make sure port 5004 is free (no other applications using it)
2. Your Cashfree production credentials are already configured in the server code:
   - Client ID: 850529145692c9f93773ed2c0a925058
   - Secret: cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01

## Step 1: Start the Payment Server

1. Run the server:
   ```
   cd server && node index.js
   ```
   
   Or simply run the batch file:
   ```
   start-payment-server.bat
   ```

2. Verify the server is running by opening: 
   ```
   http://localhost:5004
   ```
   
   You should see a JSON response indicating the server is operational.

## Step 2: Start the Frontend

1. Open a new terminal/command prompt
2. Start the frontend development server:
   ```
   npm run dev
   ```
3. Navigate to the application (default is http://localhost:5173)

## Step 3: Test the Payment Flow

1. Click on "Buy" in the application
2. Fill in the payment form:
   - Select Gold or Silver
   - Enter an amount (between ₹1 and ₹5000)
   - Select a payment method (Card or UPI)
   - Enter customer information if prompted
   - Click "Proceed to Payment"

3. You should be redirected to the Cashfree payment page
   - This confirms the integration is working correctly
   - You can complete a test payment using test card details:
     - Card Number: 4111 1111 1111 1111
     - Expiry: Any future date
     - CVV: Any 3 digits
     - Name: Any name

4. After completing the payment, you'll be redirected back to the application
   - Note: Since we're using example.com as the return URL, you may need to manually navigate back to your application

## Troubleshooting

If you encounter any issues:

1. **Server Won't Start**:
   - Check if port 5004 is already in use
   - Use the command: `netstat -ano | findstr :5004`
   - Kill the process using: `taskkill /F /PID <process_id>`

2. **Payment Redirect Fails**:
   - Check the browser console for errors
   - Verify the server is running on port 5004
   - Check the server logs for API errors

3. **API Errors**:
   - Check server console for detailed error messages
   - Common issues include invalid order data or authentication errors

4. **After Payment Completion**:
   - The return URL is set to example.com, so you'll need to manually return to your app
   - In production, update the return_url to your actual domain

## Important Notes

1. The current integration is using **PRODUCTION** credentials - real transactions will occur.
2. For a full production implementation, update all example.com URLs to your actual domain.
3. The server URL in the client code is hardcoded to use port 5004. 