import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CashfreeMobileCheckout from '@/components/CashfreeMobileCheckout';

const MobileCheckoutDemo: React.FC = () => {
  const [amount, setAmount] = useState<string>("100");
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const createOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to continue"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive", 
        title: "Invalid amount",
        description: "Please enter a valid amount"
      });
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Prepare user data for the order
      const userData = {
        customerId: user.id,
        customerName: user.fullName || "User",
        customerEmail: user.primaryEmailAddress?.emailAddress || "",
        customerPhone: user.primaryPhoneNumber?.phoneNumber || ""
      };

      // Create order via your backend
      const response = await fetch("https://backend-36le.onrender.com/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          metal: "gold", // Default to gold, you can make this dynamic
          userData
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create order");
      }

      const orderData = result.data;
      console.log("Order created successfully:", orderData);

      // Set the order ID and payment session ID
      setOrderId(orderData.order_id);
      
      // Use the payment session ID from the backend response
      if (orderData.payment_session_id) {
        setPaymentSessionId(orderData.payment_session_id);
      } else {
        console.warn("No payment session ID received from backend");
        toast({
          variant: "destructive",
          title: "Missing session ID",
          description: "Backend did not return a payment session ID"
        });
      }
      
      toast({
        title: "Order Created",
        description: `Order ${orderData.order_id} created successfully`
      });
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create order"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    toast({
      title: "Payment Successful",
      description: "Your payment was processed successfully"
    });
    
    // Navigate to success page
    navigate('/payment-success', {
      state: {
        orderId: orderId,
        amount: parseFloat(amount),
        metalType: 'gold',
        timestamp: new Date().toISOString(),
        verified: true
      }
    });
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error?.message || "Payment could not be processed"
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Mobile UPI Checkout</h1>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <Label htmlFor="amount" className="text-white mb-2 block">Amount (INR)</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={handleAmountChange}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {!orderId ? (
          <Button 
            className="w-full mt-4" 
            onClick={createOrder}
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? 'Processing...' : 'Create Order'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-400">Order ID: <span className="text-white">{orderId}</span></p>
              <p className="text-sm text-gray-400 mt-1">Amount: <span className="text-white">₹{amount}</span></p>
              <p className="text-sm text-gray-400 mt-1">Session ID: <span className="text-white">{paymentSessionId.substring(0, 20)}...</span></p>
            </div>
            
            <CashfreeMobileCheckout
              paymentSessionId={paymentSessionId}
              orderId={orderId}
              amount={parseFloat(amount)}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              buttonText="Pay with UPI"
              className="w-full bg-green-600 hover:bg-green-700"
              autoInitiate={false}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">How it works</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
          <li>Enter an amount and create an order</li>
          <li>Click "Pay with UPI" to launch the payment flow</li>
          <li>On mobile devices, this will automatically open UPI apps</li>
          <li>In a Capacitor app, it uses the "mobile" redirect target</li>
          <li>After payment, you'll be redirected back to the app</li>
        </ul>
      </div>
      
      {/* Technical Notes */}
      <div className="bg-gray-900 rounded-lg p-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Technical Notes</h2>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Uses Cashfree's JS SDK with <code>redirectTarget: "mobile"</code></p>
          <p>• Handles deep linking through Capacitor's App plugin</p>
          <p>• Processes payment callbacks automatically</p>
          <p>• Works in both web and native mobile contexts</p>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckoutDemo; 