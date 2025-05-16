// This is a Vercel serverless function for checking UPI payment status
// Place this file in the /api directory at your project root for Vercel deployment

import { connectToDatabase } from '../lib/mongodb';

export default async function handler(req, res) {
  // CORS headers for cross-domain requests (important for mobile apps)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get transaction ID from query parameters
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ error: 'Missing transactionId parameter' });
    }

    console.log(`Checking status for transaction: ${transactionId}`);
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Find the payment record
    const payment = await db.collection('payments').findOne({ transactionId });
    
    if (!payment) {
      console.log(`Payment not found: ${transactionId}`);
      return res.status(404).json({
        status: 'unknown',
        transactionId,
        message: 'Transaction not found'
      });
    }
    
    // Prepare response
    const response = {
      status: payment.status || 'pending',
      transactionId: payment.transactionId,
      transactionRef: payment.referenceId || '',
      amount: payment.amount || '',
      message: payment.message || 'Payment is being processed',
      timestamp: payment.updatedAt ? payment.updatedAt.getTime() : Date.now(),
      lastChecked: new Date().toISOString()
    };
    
    // Log the status check for debugging
    console.log('Payment status check:', {
      transactionId,
      status: response.status,
      lastChecked: response.lastChecked
    });
    
    // Update the lastChecked field in the database
    await db.collection('payments').updateOne(
      { transactionId },
      { 
        $set: { 
          lastChecked: new Date(),
          // Add to the status check logs
          statusChecks: [
            ...(payment.statusChecks || []),
            {
              timestamp: new Date(),
              status: payment.status,
              source: req.headers['user-agent'] || 'unknown'
            }
          ]
        } 
      }
    );
    
    // Return the response
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Error checking payment status',
      error: error.message
    });
  }
} 