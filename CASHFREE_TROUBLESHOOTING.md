# Troubleshooting Cashfree Integration

## Common Errors and Solutions

### "Failed to fetch" Error

This error indicates that the frontend is unable to connect to the backend server.

#### Check if the server is running:

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Verify the server is running by visiting:
   ```
   http://localhost:5003
   ```

4. You should see a JSON response with server status.

#### Check API URL Configuration:

1. Make sure your frontend is using the correct API URL:
   - The default URL in `src/lib/services/payment.ts` should match your server port (usually 5003)
   - Or create a `.env` file in your project root with:
     ```
     VITE_API_URL=http://localhost:5003
     ```

2. Restart your frontend development server after changing the `.env` file.

#### Network Issues:

1. Check for CORS errors in the browser console (F12)
2. Ensure the server CORS configuration allows your frontend origin
3. Try using a different port if there's a port conflict

### "No request found with code..." Error

This error occurs when the frontend tries to use a direct payment URL without generating a token from the backend.

#### Solution:

1. Ensure you're using the proper backend token generation flow:
   - Create order on backend
   - Generate token on backend
   - Use the token for payment

2. Check that the API endpoint `/api/create-payment-token` is properly set up in your backend.

### Payment Link Not Working

If the payment link is generated but doesn't work properly:

1. Check the Cashfree credentials in your server configuration
2. Make sure you're using the correct API version
3. Verify the order parameters (amount, currency, etc.)
4. Check that return_url and notify_url are properly set

## Server-Side Logging

If you're still encountering issues, check the server logs:

1. Look for error messages in the server console
2. Check the response status codes and error messages
3. Try making a direct API request to the server using a tool like Postman

## Test Mode vs Production

Ensure you're using the correct environment:

1. For testing, use Cashfree's TEST environment and test credentials
2. For production, use the PRODUCTION environment and your live credentials
3. Test credentials will not work in production mode and vice versa

## Contact Support

If you're still experiencing issues:

1. Gather detailed error logs from both frontend and backend
2. Contact Cashfree support with your App ID and detailed error information
3. Make sure to include information about your integration method (backend token generation) 