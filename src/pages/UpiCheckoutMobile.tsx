import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { createOrder } from '@/services/paymentService';
import UpiIntentPayment from '@/components/UpiIntentPayment';
import { useToast } from '@/components/ui/use-toast';
import { initiateUpiIntentPayment, UpiPaymentParams } from '@/services/upiIntentService';

// Mock implementation of CFUPIIntentCheckoutPayment for demonstration
class CFUPIIntentCheckoutPayment {
  sessionId: string;
  theme: string;
  
  constructor(sessionId: string, theme: string) {
    this.sessionId = sessionId;
    this.theme = theme;
  }
}

// Mock implementation of CFPaymentGatewayService for demonstration
class CFPaymentGatewayService {
  private static instance: CFPaymentGatewayService;
  
  private constructor() {}
  
  public static getInstance(): CFPaymentGatewayService {
    if (!CFPaymentGatewayService.instance) {
      CFPaymentGatewayService.instance = new CFPaymentGatewayService();
    }
    return CFPaymentGatewayService.instance;
  }
  
  public static async doUPIPayment(payment: CFUPIIntentCheckoutPayment): Promise<void> {
    // Extract order details from the session ID
    const orderDetails = await CFPaymentGatewayService.getOrderDetailsFromSession(payment.sessionId);
    
    // Use our UPI Intent service to handle the payment
    const upiParams: UpiPaymentParams = {
      orderId: orderDetails.orderId,
      amount: orderDetails.amount,
      payeeName: orderDetails.payeeName,
      payeeVpa: orderDetails.payeeVpa,
      description: `Payment for order ${orderDetails.orderId}`
    };
    
    // Initiate UPI payment
    await initiateUpiIntentPayment(upiParams);
    
    console.log('Processing UPI payment with session:', payment.sessionId);
  }
  
  private static async getOrderDetailsFromSession(sessionId: string): Promise<any> {
    // In a real implementation, this would call an API to get order details
    // Extract order ID from session ID
    const orderId = sessionId.split('_')[0];
    
    // For now, we'll just return mock data
    return {
      orderId: orderId,
      amount: 100,
      payeeName: 'Aczen Finance',
      payeeVpa: 'aczen@upi'
    };
  }
}

// Make these classes available globally for demonstration
(window as any).CFUPIIntentCheckoutPayment = CFUPIIntentCheckoutPayment;
(window as any).CFPaymentGatewayService = CFPaymentGatewayService;

const UpiCheckoutMobile: React.FC = () => {
  const [amount, setAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentSessionId, setPaymentSessionId] = useState<string>('');
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // UPI payment configuration
  const payeeVpa = "aczen@upi"; // Replace with actual merchant UPI ID
  const payeeName = "Aczen Finance"; // Replace with actual merchant name
  
  // Read amount from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const amountParam = searchParams.get('amount');
    
    if (amountParam) {
      const parsedAmount = parseFloat(amountParam);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        setAmount(parsedAmount);
      }
    }
  }, [location.search]);

  const handleCreateOrder = async () => {
    if (!user || amount <= 0) return;
    
    setIsLoading(true);
    try {
      const customerId = user.id;
      const customerPhone = user.primaryPhoneNumber?.toString() || "9999999999";
      const customerName = user.fullName || "";
      const customerEmail = user.primaryEmailAddress?.emailAddress || "";
      
      const orderResponse = await createOrder(
        amount, 
        {
          customerId: customerId,
          customerPhone: customerPhone,
          customerName: customerName,
          customerEmail: customerEmail
        }
      );
      
      console.log("Order created:", orderResponse);
      
      // Save the order ID and payment session ID
      setOrderId(orderResponse.order_id);
      setPaymentSessionId(`${orderResponse.order_id}_${Date.now()}`);
      
      toast({
        title: "Order Created",
        description: `Order #${orderResponse.order_id} created successfully.`,
        duration: 3000
      });
      
      // Automatically initiate UPI payment using CFUPIIntentCheckoutPayment
      initiateUpiPaymentWithCashfree(orderResponse.order_id);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initiateUpiPaymentWithCashfree = (orderId: string) => {
    try {
      // Create a session ID (in a real app, this would come from the backend)
      const sessionId = `${orderId}_${Date.now()}`;
      setPaymentSessionId(sessionId);
      
      // Create CFUPIIntentCheckoutPayment instance
      const upiPayment = new CFUPIIntentCheckoutPayment(
        sessionId,
        "light" // theme
      );
      
      // Process payment using CFPaymentGatewayService
      CFPaymentGatewayService.doUPIPayment(upiPayment);
      
      console.log('UPI Intent payment initiated with session:', sessionId);
    } catch (error) {
      console.error('Error initiating UPI payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate UPI payment.",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data);
    toast({
      title: "Payment Successful",
      description: "Your payment was processed successfully.",
      duration: 3000
    });
    
    // Redirect to success page
    setTimeout(() => {
      navigate(`/payment-success?orderId=${orderId}`);
    }, 1500);
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    toast({
      title: "Payment Failed",
      description: error.message || "Your payment could not be processed.",
      variant: "destructive",
      duration: 3000
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="text-white" size={24} />
        </Button>
        <h1 className="text-xl font-bold">UPI Payment</h1>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <CreditCard size={32} className="text-white" />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-2">Amount</p>
          <h2 className="text-3xl font-bold">₹{amount.toFixed(2)}</h2>
        </div>
        
        {!orderId ? (
          <Button 
            className="w-full"
            onClick={handleCreateOrder}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Create Order & Pay'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded-md">
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="text-sm font-mono">{orderId}</p>
            </div>
            
            <UpiIntentPayment
              orderId={orderId}
              amount={amount}
              payeeName={payeeName}
              payeeVpa={payeeVpa}
              description={`Payment for order ${orderId}`}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              buttonText="Pay Now with UPI"
              className="w-full"
            />
          </div>
        )}
      </div>
      
      <div className="text-center text-xs text-gray-500">
        <p>Your payment is secure and encrypted</p>
        <p className="mt-1">We do not store your UPI details</p>
      </div>
    </div>
  );
};

export default UpiCheckoutMobile; 