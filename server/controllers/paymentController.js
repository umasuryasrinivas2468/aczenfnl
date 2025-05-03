import { cashfreeConfig } from '../config/cashfree.js';
import cashfreeService from '../services/cashfreeService.js';

/**
 * Create an order with Cashfree
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const initiatePayment = async (req, res) => {
  try {
    const { amount, orderId, metal, customerInfo } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: 'Amount and orderId are required' });
    }
    
    console.log("Payment request received:", { amount, orderId, metal });
    
    // Set default customer info if not provided
    const customer = customerInfo || {
      name: "Demo User",
      email: "demo.user@example.com",
      phone: "9876543210"
    };

    // Create Cashfree order with their API
    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_note: `Purchase of ${metal || 'precious metal'}`,
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone
      },
      order_meta: {
        return_url: `${req.headers.origin || 'http://localhost:5173'}/payment-success?order_id={order_id}&order_token={order_token}`,
        notify_url: `${req.headers.origin || 'http://localhost:5173'}/api/webhook/cashfree`
      }
    };
    
    console.log("Creating order with Cashfree:", JSON.stringify(orderData, null, 2));

    // Call Cashfree service to create order
    const orderResponse = await cashfreeService.createOrder(orderData);
    console.log("Cashfree order response:", JSON.stringify(orderResponse, null, 2));

    // Generate direct payment URL
    const paymentURL = cashfreeService.generatePaymentURL(orderId, amount);
    
    // Return combined data to frontend
    return res.status(200).json({
      success: true,
      data: {
        orderId: orderResponse.order_id,
        orderAmount: orderResponse.order_amount,
        paymentSessionId: orderResponse.payment_session_id,
        paymentURL: paymentURL,
        cfOrderId: orderResponse.cf_order_id,
        orderStatus: orderResponse.order_status
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    console.error('Error details:', error.response?.data || 'No detailed error info');
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate payment',
      error: error.message || 'Unknown error'
    });
  }
};

/**
 * Get payment status from Cashfree
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    
    // Get order details from Cashfree
    const orderDetails = await cashfreeService.getOrder(orderId);
    console.log("Order status response:", JSON.stringify(orderDetails, null, 2));
    
    return res.status(200).json({
      success: true,
      data: orderDetails
    });
  } catch (error) {
    console.error('Payment status error:', error);
    console.error('Error details:', error.response?.data || 'No detailed error info');
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment status',
      error: error.message || 'Unknown error'
    });
  }
};

/**
 * Webhook handler for Cashfree payment status updates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleWebhook = async (req, res) => {
  try {
    const eventData = req.body;
    const signature = req.headers['x-webhook-signature'];
    
    console.log("Received webhook from Cashfree:", JSON.stringify(eventData, null, 2));
    
    // Verify webhook signature if provided
    if (signature) {
      const isValid = cashfreeService.verifyWebhookSignature(eventData, signature);
      if (!isValid) {
        console.warn("Invalid webhook signature received");
        // Still continue processing as this is optional
      }
    }
    
    // Process different event types
    if (eventData.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      // Handle successful payment
      const orderDetails = eventData.data.order;
      const paymentDetails = eventData.data.payment;
      
      console.log(`Payment successful for order ${orderDetails.order_id}`);
      
      // In a real implementation, you would update your database here
    } else if (eventData.type === 'PAYMENT_FAILED_WEBHOOK') {
      // Handle failed payment
      const orderDetails = eventData.data.order;
      const errorDetails = eventData.data.error_details;
      
      console.log(`Payment failed for order ${orderDetails.order_id}: ${errorDetails?.error_description || 'Unknown error'}`);
      
      // In a real implementation, you would update your database here
    }
    
    // Always return 200 to acknowledge receipt
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent retries
    return res.status(200).json({ success: false, error: error.message });
  }
};

/**
 * Get all payments for an order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPaymentsForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    
    // Get all payments for this order
    const payments = await cashfreeService.getPayments(orderId);
    
    return res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payments for order',
      error: error.message
    });
  }
};

/**
 * Process refund for an order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundAmount, refundId, refundNote } = req.body;
    
    if (!orderId || !refundAmount || !refundId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID, refund amount, and refund ID are required' 
      });
    }
    
    const refundData = {
      refund_amount: parseFloat(refundAmount),
      refund_id: refundId,
      refund_note: refundNote || `Refund for order ${orderId}`
    };
    
    // Process refund through Cashfree service
    const refundResult = await cashfreeService.processRefund(orderId, refundData);
    
    return res.status(200).json({
      success: true,
      data: refundResult
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
}; 