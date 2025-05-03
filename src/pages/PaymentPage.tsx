import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CashfreePayment from '@/components/payment/CashfreePayment';
import { useNavigate } from 'react-router-dom';
import { isMobileApp } from "../capacitor/cashfree";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('100');
  const [description, setDescription] = useState('Payment for services');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const isMobile = isMobileApp();

  // For development/demo purposes, you can prefill the form
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Populate with test data in development mode
      if (!customerName && !customerEmail && !customerPhone) {
        setCustomerName('Test User');
        setCustomerEmail('test@example.com');
        setCustomerPhone('9876543210');
      }
    }
  }, [customerName, customerEmail, customerPhone]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!customerName.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!customerPhone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(customerPhone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (parsedAmount > 100000) {
      newErrors.amount = 'Amount cannot exceed ₹100,000';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartPayment = () => {
    if (validateForm()) {
      setPaymentStarted(true);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    setPaymentStatus('success');
    setStatusMessage(`Payment successful! Order ID: ${orderId}`);
    setPaymentStarted(false);
    
    // Navigate to payment success page after a short delay
    setTimeout(() => {
      navigate(`/payment-status?order_id=${orderId}`);
    }, 1000);
  };

  const handlePaymentError = (error: any, orderId: string) => {
    setPaymentStatus('error');
    setStatusMessage(`Payment failed: ${error.message || 'Unknown error'}`);
    setPaymentStarted(false);
  };

  const resetForm = () => {
    setAmount('100');
    setDescription('Payment for services');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setPaymentStarted(false);
    setPaymentStatus(null);
    setStatusMessage('');
    setErrors({});
  };

  return (
    <div className="container mx-auto max-w-md py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Make a Payment</h1>
      
      {paymentStatus === 'success' && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
          {statusMessage}
        </div>
      )}
      
      {paymentStatus === 'error' && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
          {statusMessage}
          <button 
            className="underline ml-2"
            onClick={() => setPaymentStarted(false)}
          >
            Try again
          </button>
        </div>
      )}
      
      {!paymentStarted ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="Enter amount"
            />
            {errors.amount && <p className="mt-1 text-red-500 text-sm">{errors.amount}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Payment for..."
            />
            {errors.description && <p className="mt-1 text-red-500 text-sm">{errors.description}</p>}
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter your name"
            />
            {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>}
          </div>
          
          <button
            onClick={handleStartPayment}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {isMobile ? 'Pay Now' : 'Proceed to Payment'}
          </button>
        </div>
      ) : (
        <>
          <CashfreePayment
            orderAmount={Number(amount)}
            orderId={`order_${uuidv4().replace(/-/g, '')}`}
            customerDetails={{
              customerId: `customer_${uuidv4().replace(/-/g, '')}`,
              customerName,
              customerEmail,
              customerPhone
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
          <button
            onClick={() => setPaymentStarted(false)}
            className="mt-4 text-blue-600 text-sm"
          >
            ← Back to payment details
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentPage; 