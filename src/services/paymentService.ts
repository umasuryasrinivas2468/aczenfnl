import axios from 'axios';

// API credentials - normally would be stored in environment variables
const API_KEY = "850529145692c9f93773ed2c0a925058";
const API_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";
// Use proxy URL instead of direct Cashfree API
const BASE_URL = "/api/cashfree/pg/orders";

// Function to generate a unique order ID
export const generateOrderId = () => {
  return `aczen_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Function to create an order
export const createOrder = async (amount: number, customerId: string, customerPhone: string) => {
  const orderId = generateOrderId();
  
  const payload = {
    "order_amount": amount,
    "order_currency": "INR",
    "order_id": orderId,
    "customer_details": {
      "customer_id": customerId,
      "customer_phone": customerPhone
    },
    "order_meta": {
      "return_url": `${window.location.origin}/payment-status?order_id={order_id}`
    }
  };

  try {
    const response = await axios.post(BASE_URL, payload, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': API_KEY,
        'x-client-secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the response for debugging
    console.log("Cashfree API response:", response.data);
    
    // Return formatted data
    return {
      order_id: response.data.order_id,
      order_token: response.data.order_token,
      order_status: response.data.order_status,
      order_amount: response.data.order_amount
    };
  } catch (error: any) {
    console.error('Error creating order:', error.response ? error.response.data : error);
    throw error;
  }
}; 