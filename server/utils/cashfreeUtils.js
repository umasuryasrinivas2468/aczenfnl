import crypto from 'crypto';
import axios from 'axios';
import { cashfreeConfig } from '../config/cashfree.js';

/**
 * Generate signature for Cashfree payment requests
 * @param {Object} data - Data to sign
 * @returns {string} - Generated signature
 */
export const generateSignature = (data) => {
  const signatureData = Object.keys(data)
    .sort()
    .map(key => `${key}${data[key]}`)
    .join('');
  
  return crypto
    .createHmac('sha256', cashfreeConfig.secretKey)
    .update(signatureData)
    .digest('hex');
};

/**
 * Create a new order in Cashfree
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order details
 */
export const createOrder = async (orderData) => {
  try {
    const headers = {
      'x-api-version': '2022-09-01',
      'x-client-id': cashfreeConfig.appId,
      'x-client-secret': cashfreeConfig.secretKey,
      'Content-Type': 'application/json'
    };

    const url = `${cashfreeConfig.apiBase}/orders`;
    console.log('Posting to URL:', url);
    console.log('Order data:', JSON.stringify(orderData));

    const response = await axios.post(
      url, 
      orderData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating Cashfree order:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to create payment order');
  }
};

/**
 * Get payment details for an order
 * @param {string} orderId - Order ID to fetch
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentDetails = async (orderId) => {
  try {
    const headers = {
      'x-api-version': '2022-09-01',
      'x-client-id': cashfreeConfig.appId,
      'x-client-secret': cashfreeConfig.secretKey
    };

    const response = await axios.get(
      `${cashfreeConfig.apiBase}/orders/${orderId}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching payment details:', error.response?.data || error.message);
    throw new Error('Failed to fetch payment details');
  }
}; 