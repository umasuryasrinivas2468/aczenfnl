// This is a Vercel serverless function for handling UPI payment webhooks
// Place this file in the /api directory at your project root for Vercel deployment

import { connectToDatabase } from '../lib/mongodb'; // Adjust based on your database setup

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Received webhook:', JSON.stringify(req.body, null, 2));

  try {
    // Get webhook data from request body
    const { 
      txnId,         // Transaction ID 
      txnRef,        // Transaction Reference (order ID)
      amount,        // Payment amount
      status,        // SUCCESS, FAILURE, etc.
      responseCode,  // Response code from UPI provider
      approvalRefNo, // Approval reference number
      // Other fields may be present depending on your UPI provider
    } = req.body;

    // Validate required fields
    if (!txnId || !status) {
      console.error('Missing required parameters in webhook:', { txnId, status });
      return res.status(400).json({ error: 'Missing required webhook parameters' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Find the payment record
    const payment = await db.collection('payments').findOne({ transactionId: txnId });
    
    if (!payment) {
      console.error(`Payment not found for transaction ID: ${txnId}`);
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Map UPI provider status to our internal status
    let internalStatus = 'pending';
    if (status === 'SUCCESS') {
      internalStatus = 'success';
    } else if (['FAILURE', 'FAILED', 'DECLINED'].includes(status)) {
      internalStatus = 'failure';
    }
    
    console.log(`Updating payment status for ${txnId}: ${status} -> ${internalStatus}`);
    
    // Update payment status in database
    await db.collection('payments').updateOne(
      { transactionId: txnId },
      { 
        $set: {
          status: internalStatus,
          providerStatus: status,
          responseCode,
          approvalRefNo,
          updatedAt: new Date(),
          message: status === 'SUCCESS' ? 'Payment successful' : `Payment ${status.toLowerCase()}`,
          // Store full webhook payload for debugging
          webhookData: req.body,
          // Store a log of status changes
          statusLogs: [
            ...(payment.statusLogs || []),
            {
              status: internalStatus,
              providerStatus: status,
              timestamp: new Date(),
              responseCode
            }
          ]
        } 
      }
    );
    
    // For Capacitor/mobile apps, we might want to notify the app
    // This would typically be done through a push notification service
    // or through polling from the app side
    
    // Log the webhook data for debugging
    console.log('Payment webhook processed:', {
      txnId,
      status,
      internalStatus,
      amount,
      timestamp: new Date().toISOString()
    });
    
    // Send successful response
    res.status(200).json({ 
      success: true,
      message: `Status updated to ${internalStatus}`
    });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    
    // Return error but with 200 status to prevent retries from the UPI provider
    // (unless you want retries, then use 500)
    res.status(200).json({ 
      success: false,
      error: 'Internal server error processing webhook' 
    });
  }
} 