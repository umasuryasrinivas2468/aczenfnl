const crypto = require('crypto');
const config = require('../config');

/**
 * Middleware to validate Cashfree webhook signature
 * Documentation: https://docs.cashfree.com/docs/webhook
 */
function validateWebhookSignature(req, res, next) {
  try {
    // Extract the signature from the headers
    const signature = req.headers['x-webhook-signature'] || 
                      req.headers['x-cashfree-signature'] || 
                      req.headers['x-signature'];
    
    // If there's no signature, reject the webhook
    if (!signature) {
      return res.status(401).json({ 
        error: 'Missing signature header' 
      });
    }
    
    // Get the raw request body as a string
    const payload = JSON.stringify(req.body);
    
    // Create HMAC with SHA256
    const hmac = crypto.createHmac('sha256', config.cashfree.secretKey);
    hmac.update(payload);
    const computedSignature = hmac.digest('hex');
    
    // Compare signatures (case-insensitive comparison)
    if (signature.toLowerCase() !== computedSignature.toLowerCase()) {
      console.warn('Webhook signature validation failed', {
        receivedSignature: signature,
        computedSignature: computedSignature
      });
      
      return res.status(401).json({ 
        error: 'Invalid signature' 
      });
    }
    
    // If the signature is valid, proceed to the next middleware/handler
    next();
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return res.status(500).json({ 
      error: 'Internal server error while validating webhook signature' 
    });
  }
}

/**
 * Process different types of Cashfree webhook events
 * @param {Object} event - The webhook event payload
 * @returns {Object} - Processed information from the event
 */
function processWebhookEvent(event) {
  try {
    const eventType = event.event_type || event.type;
    const eventData = event.data || {};
    
    // Common information
    const result = {
      orderId: eventData.order_id,
      eventType: eventType,
      processed: true,
      timestamp: new Date().toISOString()
    };
    
    switch(eventType) {
      case 'PAYMENT_SUCCESS':
        return {
          ...result,
          status: 'success',
          paymentId: eventData.payment_id,
          amount: eventData.order_amount,
          paymentMethod: eventData.payment_method
        };
        
      case 'PAYMENT_FAILED':
        return {
          ...result,
          status: 'failed',
          paymentId: eventData.payment_id,
          failureReason: eventData.payment_error,
          errorCode: eventData.error_code
        };
        
      case 'PAYMENT_USER_DROPPED':
        return {
          ...result,
          status: 'dropped',
          paymentSessionId: eventData.payment_session_id
        };
        
      case 'PAYMENT_PENDING':
        return {
          ...result,
          status: 'pending',
          paymentId: eventData.payment_id,
          pendingReason: eventData.pending_reason
        };
      
      default:
        return {
          ...result,
          status: 'unknown',
          originalEvent: eventType,
          processed: false
        };
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return {
      error: 'Failed to process webhook event',
      errorMessage: error.message,
      processed: false
    };
  }
}

module.exports = {
  validateWebhookSignature,
  processWebhookEvent
}; 