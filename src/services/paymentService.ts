import axios from 'axios';

// Function to generate a unique order ID
export const generateOrderId = () => {
  return `aczen_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Function to create an order through our backend API
export const createOrder = async (
  amount: number, 
  customerDetails: {
    customerId: string;
    customerPhone: string;
    customerName?: string;
    customerEmail?: string;
  },
  orderNote?: string
) => {
  const orderId = generateOrderId();
  
  const payload = {
    amount,
    metal: orderNote || 'GOLD', // Use orderNote as metal type if provided
    userData: {
      customerId: customerDetails.customerId,
      customerPhone: customerDetails.customerPhone,
      customerName: customerDetails.customerName || "",
      customerEmail: customerDetails.customerEmail || ""
    },
    paymentMethod: 'CUSTOM'
  };

  try {
    // Make API call to our backend
    const response = await axios.post('/api/create-order', payload);
    
    // Log the response for debugging
    console.log("Order API response:", response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create order');
    }
    
    // Extract order details
    const orderDetails = {
      order_id: response.data.data.order_id,
      order_status: response.data.data.status,
      order_amount: response.data.data.amount,
      customer_details: response.data.data.customer_details
    };
    
    return orderDetails;
  } catch (error: any) {
    console.error('Error creating order:', error.response ? error.response.data : error);
    
    // For demo purposes, if API fails, create a mock order
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock order for demonstration');
      return {
        order_id: orderId,
        order_status: "ACTIVE",
        order_amount: amount,
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_name: customerDetails.customerName || "",
          customer_email: customerDetails.customerEmail || "",
          customer_phone: customerDetails.customerPhone
        }
      };
    }
    
    throw error;
  }
};

// Function to update payment status
export const updatePaymentStatus = async (orderId: string, status: 'SUCCESS' | 'FAILURE' | 'PENDING', paymentId?: string) => {
  try {
    const response = await axios.post(`/api/update-payment-status/${orderId}`, {
      status,
      paymentId
    });
    
    console.log("Payment status update response:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating payment status:', error.response ? error.response.data : error);
    throw error;
  }
};

// Function to check payment status
export const checkPaymentStatus = async (orderId: string) => {
  try {
    const response = await axios.get(`/api/payment-status/${orderId}`);
    
    console.log("Payment status check response:", response.data);
    
    return {
      orderId: response.data.orderId,
      status: response.data.status,
      transaction: response.data.transaction
    };
  } catch (error: any) {
    console.error('Error checking payment status:', error.response ? error.response.data : error);
    throw error;
  }
};

// Function to verify UPI payment
export const verifyUpiPayment = async (orderId: string, upiTxnId?: string, status?: 'SUCCESS' | 'FAILURE' | 'PENDING') => {
  try {
    const response = await axios.post(`/api/verify-upi-payment/${orderId}`, {
      upiTxnId: upiTxnId || `UPI_${Date.now()}`, // Generate a mock UPI transaction ID if not provided
      status: status || 'SUCCESS' // Default to success for demonstration
    });
    
    console.log("UPI payment verification response:", response.data);
    
    return {
      success: response.data.success,
      orderId: response.data.orderId,
      status: response.data.status,
      upiTxnId: response.data.upiTxnId
    };
  } catch (error: any) {
    console.error('Error verifying UPI payment:', error.response ? error.response.data : error);
    throw error;
  }
};

// Function to get transaction details from payment provider
export const getTransactionDetails = async (orderId: string) => {
  try {
    // First try to get details from our API
    const response = await axios.get(`/api/transaction-details/${orderId}`);
    
    console.log("Transaction details response:", response.data);
    
    return {
      orderId: response.data.orderId,
      status: response.data.status,
      amount: response.data.amount,
      paymentId: response.data.paymentId,
      paymentMethod: response.data.paymentMethod,
      timestamp: response.data.timestamp
    };
  } catch (error: any) {
    console.error('Error getting transaction details:', error.response ? error.response.data : error);
    
    // For demo purposes, return mock data if API fails
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock transaction details for demonstration');
      return {
        orderId,
        status: 'SUCCESS', // Default to success for demonstration
        amount: 1000, // Default amount
        paymentId: `MOCK_${Date.now()}`,
        paymentMethod: 'UPI',
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
};

// Types for transaction history
export interface TransactionDetails {
  orderId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  date: Date;
  paymentId?: string;
  paymentMethod?: string;
  customerDetails?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  failureReason?: string;
}

// Function to complete a payment (simulated payment)
export const completePayment = async (orderId: string) => {
  try {
    // This would typically integrate with a payment gateway
    // For now, we'll just update the status directly
    const result = await updatePaymentStatus(orderId, 'SUCCESS', `SIMULATED_${Date.now()}`);
    
    return {
      success: true,
      orderId,
      status: 'SUCCESS',
      message: 'Payment completed successfully'
    };
  } catch (error: any) {
    console.error('Error completing payment:', error);
    return {
      success: false,
      orderId,
      status: 'FAILURE',
      message: error.message || 'Payment failed'
    };
  }
}; 