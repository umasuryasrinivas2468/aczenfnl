const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cashfreeRoutes = require('./api/create-cashfree-order');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// CORS configuration
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

// Middleware
app.use(express.json());

// Routes
app.use('/api', cashfreeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://192.168.1.6:${PORT}`);
});

module.exports = app; 