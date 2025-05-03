import axios from 'axios';
import crypto from 'crypto';
import { cashfreeConfig } from '../config/cashfree.js';

/**
 * Class to handle all Cashfree API operations
 */
class CashfreeService {
  constructor() {
    this.apiBase = cashfreeConfig.apiBase;
    this.appId = cashfreeConfig.appId;
    this.secretKey = cashfreeConfig.secretKey;
    this.headers = {
      'x-api-version': '2022-09-01',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Created order details
   */
  async createOrder(orderData) {
    try {
      const response = await axios.post(
        `${this.apiBase}/orders`,
        orderData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get order details
   * @param {string} orderId - Order ID to fetch
   * @returns {Promise<Object>} - Order details
   */
  async getOrder(orderId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/orders/${orderId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all payments for an order
   * @param {string} orderId - Order ID to fetch payments for
   * @returns {Promise<Object>} - Payments list
   */
  async getPayments(orderId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/orders/${orderId}/payments`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get specific payment details
   * @param {string} orderId - Order ID
   * @param {string} paymentId - CF Payment ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentById(orderId, paymentId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/orders/${orderId}/payments/${paymentId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Process refund for an order
   * @param {string} orderId - Order ID to refund
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} - Refund details
   */
  async processRefund(orderId, refundData) {
    try {
      const response = await axios.post(
        `${this.apiBase}/orders/${orderId}/refunds`,
        refundData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param {Object} webhookData - Webhook data
   * @param {string} signature - Cashfree signature
   * @returns {boolean} - Whether signature is valid
   */
  verifyWebhookSignature(webhookData, signature) {
    try {
      const payload = JSON.stringify(webhookData);
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Generate payment URL for direct checkout
   * @param {string} orderId - Order ID
   * @param {number} amount - Payment amount
   * @returns {string} - Payment URL
   */
  generatePaymentURL(orderId, amount) {
    return `https://payments.cashfree.com/order/#/${this.appId}/${orderId}/${amount}`;
  }
}

export default new CashfreeService(); 