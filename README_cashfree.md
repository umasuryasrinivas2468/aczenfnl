# Cashfree Integration

This project includes a complete Cashfree Payment Gateway integration with a separate backend server to handle payment processing securely.

## Setup

### 1. Backend Server Setup

```sh
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Configure Cashfree API credentials
# Open server/config/cashfree.js and update with your actual credentials

# Start the server
npm run dev
```

### 2. Frontend Setup

```sh
# In a new terminal, install dependencies for the main project
npm install

# Create a .env file in the root directory with:
# VITE_API_URL=http://localhost:5000

# Start the frontend development server
npm run dev
```

### 3. Run Both Together

```sh
# Install concurrently if you haven't already
npm install --save-dev concurrently

# Run both frontend and backend
npm run dev:full
```

## How It Works

1. **Frontend**:
   - The BuyDialog component collects payment details (metal type and amount)
   - When a user clicks "Proceed to Payment", it calls the backend API
   - After receiving the payment link, it redirects the user to Cashfree's payment page
   - After payment completion, user is redirected back to the application's payment success page

2. **Backend**:
   - Handles secure communication with Cashfree API
   - Stores sensitive API credentials
   - Creates payment orders
   - Verifies payment status
   - Provides payment status to the frontend

3. **Payment Flow**:
   - User initiates payment in the app
   - Backend creates payment order in Cashfree
   - User is redirected to Cashfree payment page
   - User completes payment on Cashfree
   - User is redirected back to the app
   - App verifies payment status with backend
   - App updates user's portfolio if payment was successful

## Directory Structure

```
/
├── src/                          # Frontend code
│   ├── components/
│   │   └── BuyDialog.tsx         # Payment initiation component
│   └── pages/
│       └── PaymentSuccess.tsx    # Payment success page
└── server/                       # Backend server
    ├── config/
    │   └── cashfree.js           # Cashfree API configuration
    ├── controllers/
    │   └── paymentController.js  # Payment API handlers
    ├── routes/
    │   └── paymentRoutes.js      # API routes
    ├── utils/
    │   └── cashfreeUtils.js      # Cashfree API utility functions
    ├── index.js                  # Main server file
    └── package.json              # Server dependencies
```

## Security Considerations

- All Cashfree API credentials are stored on the server-side only
- CORS is configured to restrict API access
- Payment verification is done to ensure transaction integrity 