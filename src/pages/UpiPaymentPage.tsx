import React, { useState } from 'react';
import UpiPayment from '../components/UpiPayment';
import { PaymentStatus } from '../services/upiPaymentService';
import { UpiPaymentService } from '../services/upiPaymentService';

interface OrderDetails {
  id: string;
  amount: string;
  description: string;
}

const UpiPaymentPage: React.FC = () => {
  // Set the UPI merchant details
  const merchantUpiId = "yourupi@bank"; // Replace with your actual UPI ID
  const merchantName = "Your Company Name"; // Replace with your merchant name
  
  // Example order details (in a real app, this would come from your order system)
  const [order] = useState<OrderDetails>({
    id: `ORDER_${Date.now()}`,
    amount: "100.00",
    description: "Product Purchase"
  });
  
  const [paymentResult, setPaymentResult] = useState<{
    status: string;
    message: string;
    transactionId?: string;
  } | null>(null);
  
  // Check if device supports UPI
  const upiService = UpiPaymentService.getInstance();
  const isMobile = upiService.isMobileDevice();
  const supportsUpi = upiService.supportsUpi();
  
  // Handle successful payment
  const handlePaymentSuccess = (data: PaymentStatus) => {
    console.log('Payment successful:', data);
    setPaymentResult({
      status: 'success',
      message: 'Your payment was successful!',
      transactionId: data.transactionId
    });
    
    // Here you would typically:
    // 1. Update your UI to show success
    // 2. Update your order state in your system
    // 3. Redirect to an order confirmation page
  };
  
  // Handle failed payment
  const handlePaymentFailure = (data: PaymentStatus) => {
    console.log('Payment failed:', data);
    setPaymentResult({
      status: 'failure',
      message: 'Your payment was unsuccessful. Please try again.',
      transactionId: data.transactionId
    });
  };
  
  // Handle pending payment
  const handlePaymentPending = (data: PaymentStatus) => {
    console.log('Payment pending:', data);
    setPaymentResult({
      status: 'pending',
      message: 'Your payment is being processed. Please wait.',
      transactionId: data.transactionId
    });
  };
  
  // Direct UPI deep link (for testing)
  const testUpiDeepLink = () => {
    // Generate a transaction ID
    const transactionId = upiService.generateTransactionId();
    
    // Create the UPI parameters
    const urlParams = new URLSearchParams({
      pa: merchantUpiId,
      pn: merchantName,
      am: order.amount,
      tn: order.description,
      tr: order.id,
      tid: transactionId,
      cu: 'INR'
    });
    
    // Create the UPI URL
    const upiUrl = `upi://pay?${urlParams.toString()}`;
    
    // Redirect to UPI app
    window.location.href = upiUrl;
    
    console.log('Opened UPI deep link:', upiUrl);
  };
  
  return (
    <div className="upi-payment-page">
      <h1>Complete Your Payment</h1>
      
      <div className="order-details">
        <h2>Order Summary</h2>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Amount:</strong> ₹{order.amount}</p>
        <p><strong>Description:</strong> {order.description}</p>
      </div>
      
      {paymentResult && (
        <div className={`payment-result payment-result-${paymentResult.status}`}>
          <h3>Payment {paymentResult.status}</h3>
          <p>{paymentResult.message}</p>
          {paymentResult.transactionId && (
            <p><small>Transaction ID: {paymentResult.transactionId}</small></p>
          )}
        </div>
      )}
      
      {!isMobile && (
        <div className="device-warning">
          <p>UPI payments work best on mobile devices with UPI apps installed.</p>
        </div>
      )}
      
      <div className="payment-section">
        <h2>Payment Options</h2>
        
        <UpiPayment
          amount={order.amount}
          upiId={merchantUpiId}
          payeeName={merchantName}
          description={order.description}
          orderId={order.id}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onPending={handlePaymentPending}
        />
        
        {/* Alternative payment methods can be added here */}
      </div>
      
      {/* For testing only - direct UPI deep link without component */}
      {process.env.NODE_ENV === 'development' && (
        <div className="testing-tools">
          <h3>Testing Tools</h3>
          <button 
            className="test-upi-link-button"
            onClick={testUpiDeepLink}
            disabled={!supportsUpi}
          >
            Test Direct UPI Deep Link
          </button>
          <p><small>Platform: {Capacitor.getPlatform()}</small></p>
          <p><small>Is Mobile: {isMobile ? 'Yes' : 'No'}</small></p>
          <p><small>Supports UPI: {supportsUpi ? 'Yes' : 'No'}</small></p>
        </div>
      )}
      
      <div className="payment-instructions">
        <h3>How it works</h3>
        <ol>
          <li>Click the "Pay via UPI" button</li>
          <li>You'll be redirected to your UPI app (Google Pay, PhonePe, etc.)</li>
          <li>Complete the payment in your UPI app</li>
          <li>You'll be returned to this page to see your payment status</li>
        </ol>
      </div>
    </div>
  );
};

export default UpiPaymentPage; 