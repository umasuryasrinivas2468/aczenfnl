import React, { useState, useEffect } from 'react';
import { PaymentService } from '../lib/services/payment';

// API URL for server status check
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

const PaymentPage: React.FC = () => {
  const [amount, setAmount] = useState<string>('100');
  const [metal, setMetal] = useState<string>('gold');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Customer details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_URL}`, { 
          method: 'GET',
          // Adding a timeout so we don't wait forever
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Server status check failed:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Check server status first
      if (serverStatus === 'offline') {
        throw new Error(`Cannot connect to payment server at ${API_URL}. Please make sure the server is running.`);
    }
    
      // Validate inputs
      if (!customerName.trim()) {
        throw new Error('Please enter your name');
      }
      
      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
    }
    
      if (!customerPhone.trim() || customerPhone.length < 10) {
        throw new Error('Please enter a valid phone number');
    }
    
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Process payment using PaymentService
      const result = await PaymentService.processPayment({
        amount: amountValue,
        metal,
        customerName,
        customerEmail,
        customerPhone
      });
      
      if (result.success) {
        setSuccess(`Payment initiated successfully! Order ID: ${result.orderId}`);
        // No need to redirect, processPayment already does this
      } else {
        setError(result.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment submission error:', error);
      setError(`Error: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Make a Payment</h1>
      
      {/* Server status indicator */}
      <div className={`text-center mb-4 p-2 rounded ${
        serverStatus === 'online' 
          ? 'bg-green-100 text-green-700' 
          : serverStatus === 'offline' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-yellow-100 text-yellow-700'
      }`}>
        Server status: {
          serverStatus === 'online' 
            ? '✅ Online' 
            : serverStatus === 'offline' 
              ? '❌ Offline (Please start the server)' 
              : '⏳ Checking...'
        }
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          
          {error.includes('server') && (
            <div className="mt-2 text-sm">
              <p>Troubleshooting tips:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Make sure the server is running: <code>cd server && npm run dev</code></li>
                <li>Check for errors in the server console</li>
                <li>Verify the API URL is correct in your environment variables</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metal Type
            </label>
          <select
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
          </div>
          
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
            </label>
            <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="1"
            required
          />
          </div>
          
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
          </div>
          
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
          </div>
          
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
          </div>
          
          <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={isLoading || serverStatus === 'offline'}
          >
          {isLoading ? 'Processing...' : 'Pay Now'}
          </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Secured by Cashfree Payment Gateway
        </div>
    </div>
  );
};

export default PaymentPage; 