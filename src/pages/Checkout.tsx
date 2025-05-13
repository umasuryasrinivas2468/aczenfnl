import React, { useEffect, useState } from 'react';
import { createOrder } from '@/services/paymentService';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    Cashfree: any;
  }
}

const Checkout: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderToken, setOrderToken] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Add script to document head
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const handleCreateOrder = async () => {
    if (!user || amount <= 0) return;
    
    setIsLoading(true);
    try {
      const customerId = user.id;
      const customerPhone = user.primaryPhoneNumber?.toString() || "9999999999";
      
      const orderResponse = await createOrder(amount, customerId, customerPhone);
      console.log("Order created:", orderResponse);
      
      // Save the order token for checkout
      setOrderToken(orderResponse.order_token);
      setOrderId(orderResponse.order_id);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (!orderToken) return;
    
    try {
      const cashfree = new window.Cashfree({
        mode: "production"
      });
      
      cashfree.checkout({
        orderToken: orderToken,
        onSuccess: (data: any) => {
          console.log("Payment success:", data);
          navigate(`/payment-status?order_id=${orderId}&status=success`);
        },
        onFailure: (data: any) => {
          console.log("Payment failure:", data);
          navigate(`/payment-status?order_id=${orderId}&status=failure`);
        },
        onClose: () => {
          console.log("Payment closed by user");
        },
        components: {
          paymentInput: {
            disableStyles: false,
          }
        }
      });
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="text-white" size={24} />
          </Button>
          <h1 className="text-xl font-bold">Payment</h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6 animate-fade-in">
          <div className="mb-4">
            <Label htmlFor="amount" className="text-white">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={handleAmountChange}
              className="bg-gray-800 border-gray-700 text-white mt-2"
            />
          </div>

          {!orderToken ? (
            <Button 
              className="w-full mt-4" 
              onClick={handleCreateOrder}
              disabled={isLoading || amount <= 0}
            >
              {isLoading ? 'Processing...' : 'Create Order'}
            </Button>
          ) : (
            <Button 
              className="w-full mt-4 bg-green-600 hover:bg-green-700" 
              onClick={handlePayment}
            >
              Pay Now
            </Button>
          )}
        </div>

        {orderToken && (
          <div className="bg-gray-900 rounded-lg p-4 animate-fade-in">
            <h2 className="text-lg font-semibold mb-2">Order Created Successfully</h2>
            <p className="text-sm text-gray-400 mb-2">Your order has been created. Click the Pay Now button to proceed with payment.</p>
            <p className="text-xs text-gray-500 break-all">Order ID: {orderId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout; 