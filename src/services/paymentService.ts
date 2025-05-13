import axios from 'axios';

// API credentials - normally would be stored in environment variables
const API_KEY = "850529145692c9f93773ed2c0a925058";
const API_SECRET = "cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01";

// Function to generate a unique order ID
export const generateOrderId = () => {
  return `aczen_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Function to create an order through our proxy
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
    "order_amount": amount,
    "order_currency": "INR",
    "order_id": orderId,
    "customer_details": {
      "customer_id": customerDetails.customerId,
      "customer_phone": customerDetails.customerPhone,
      "customer_name": customerDetails.customerName || "",
      "customer_email": customerDetails.customerEmail || ""
    },
    "order_meta": {
      "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
    }
  };

  // Add order note if provided
  if (orderNote) {
    payload["order_note"] = orderNote;
  }

  try {
    // Use the proxy endpoint defined in vite.config.ts
    const response = await axios.post('/api/cashfree/pg/orders', payload, {
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
      payment_session_id: response.data.payment_session_id,
      order_status: response.data.order_status,
      order_amount: response.data.order_amount
    };
  } catch (error: any) {
    console.error('Error creating order:', error.response ? error.response.data : error);
    throw error;
  }
}; 