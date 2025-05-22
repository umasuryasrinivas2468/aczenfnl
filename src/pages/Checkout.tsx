import React, { useState } from 'react';
import { createOrder, completePayment } from '@/services/paymentService';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const Checkout: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      // Save the order ID and set order created to true
      setOrderId(orderResponse.order_id);
      setOrderCreated(true);
      
      toast({
        title: "Order Created",
        description: `Order #${orderResponse.order_id} created successfully.`,
        duration: 3000
      });
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

  const handlePayment = async () => {
    if (!orderId) return;
    
    setIsProcessingPayment(true);
    try {
      const result = await completePayment(orderId);
      
      if (result.success) {
        setPaymentComplete(true);
        toast({
          title: "Payment Successful",
          description: "Your payment was processed successfully.",
          duration: 3000
        });
        
        // Redirect to success page after short delay
        setTimeout(() => {
          navigate('/payment-success?orderId=' + orderId);
        }, 1500);
      } else {
        toast({
          title: "Payment Failed",
          description: result.message || "Your payment could not be processed.",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsProcessingPayment(false);
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
          {!paymentComplete ? (
            <>
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
                  disabled={orderCreated}
                />
              </div>

              {!orderCreated ? (
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
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Processing Payment...' : 'Pay Now'}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
                <Check className="text-white" size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-400">Redirecting to confirmation page...</p>
            </div>
          )}
        </div>

        {orderCreated && !paymentComplete && (
          <div className="bg-gray-900 rounded-lg p-4 animate-fade-in">
            <h2 className="text-lg font-semibold mb-2">Order Created Successfully</h2>
            <p className="text-sm text-gray-400 mb-2">Your order has been created. Click the Pay Now button to proceed with payment.</p>
            <p className="text-xs text-gray-500 break-all">Order ID: {orderId}</p>
            <p className="text-xs text-gray-500 mt-2">Amount: ₹{amount.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout; 