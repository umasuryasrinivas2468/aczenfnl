const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cashfreeRoutes = require('./api/create-cashfree-order');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With']
}));

// Additional security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");
  next();
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());

// Routes
app.use('/api', cashfreeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    message: 'Cashfree payment server is operational',
    version: '1.0.0',
    endpoints: {
      createOrder: '/api/create-cashfree-order',
      checkStatus: '/api/payment-status/:orderId'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
  console.log('Cashfree API Integration ready!');
});

module.exports = app; 