import express from 'express';
import { 
  initiatePayment, 
  getPaymentStatus, 
  handleWebhook, 
  getPaymentsForOrder,
  processRefund
} from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payments - Create a new payment order
router.post('/', initiatePayment);

// GET /api/payments/:orderId - Get payment status for a specific order
router.get('/:orderId', getPaymentStatus);

// GET /api/payments/:orderId/all - Get all payments for an order
router.get('/:orderId/all', getPaymentsForOrder);

// POST /api/payments/:orderId/refund - Process refund for an order
router.post('/:orderId/refund', processRefund);

// POST /api/payments/webhook - Handle Cashfree webhooks
router.post('/webhook', handleWebhook);

export default router; 