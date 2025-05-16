// This is a Vercel serverless function for manually updating payment status
// This is primarily for testing purposes and should be protected in production

import { connectToDatabase } from '../lib/mongodb';

export default async function handler(req, res) {
  // CORS headers for cross-domain requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get parameters from request body
    const { transactionId, status, message } = req.body;

    // Validate required fields
    if (!transactionId || !status) {
      return res.status(400).json({ error: 'Missing required parameters (transactionId, status)' });
    }

    // Validate status value
    const validStatuses = ['success', 'failure', 'pending', 'unknown'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    console.log(`Manually updating status for transaction ${transactionId} to ${status}`);
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Find the payment record
    const payment = await db.collection('payments').findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update payment status in database
    await db.collection('payments').updateOne(
      { transactionId },
      { 
        $set: {
          status,
          updatedAt: new Date(),
          message: message || (status === 'success' ? 'Payment successful' : 
                             status === 'failure' ? 'Payment failed' : 
                             'Payment is being processed'),
          // Record that this was a manual update
          manualUpdate: {
            timestamp: new Date(),
            previousStatus: payment.status,
            source: req.headers['user-agent'] || 'unknown'
          },
          // Add to status logs
          statusLogs: [
            ...(payment.statusLogs || []),
            {
              status,
              timestamp: new Date(),
              isManual: true
            }
          ]
        } 
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      transactionId,
      status,
      message: `Payment status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error updating payment status',
      message: error.message
    });
  }
} 