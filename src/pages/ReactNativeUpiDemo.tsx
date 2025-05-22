import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Code, CreditCard, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CashfreeNativeUpiIntent from '@/components/CashfreeNativeUpiIntent';

const ReactNativeUpiDemo: React.FC = () => {
  const [amount, setAmount] = useState<string>("100");
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const createOrder = async () => {
    if (isCreatingOrder) return;

    setIsCreatingOrder(true);
    
    try {
      // Generate a unique order ID
      const newOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      setOrderId(newOrderId);
      
      // In a real implementation, this would be an API call to your backend
      // to create an order and get a payment session ID from Cashfree
      
      // For demo purposes, we're simulating a successful response
      setTimeout(() => {
        setPaymentSessionId(`session_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
        toast({
          title: "Order Created",
          description: `Order ID: ${newOrderId}`
        });
        setIsCreatingOrder(false);
      }, 1000);
      
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        variant: "destructive",
        title: "Order Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create order"
      });
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    toast({
      title: "Payment Successful",
      description: `Order ${data.orderId} paid successfully`
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
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">React Native UPI Intent Demo</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cashfree React Native UPI Intent</CardTitle>
          <CardDescription>
            Direct UPI Intent implementation using Cashfree's React Native SDK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="1"
                  max="100000"
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button onClick={createOrder} disabled={isCreatingOrder}>
                  {isCreatingOrder ? (
                    <div className="flex items-center">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </div>
            </div>
            
            {orderId && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-sm font-medium">Order ID: <span className="font-mono">{orderId}</span></p>
                {paymentSessionId && (
                  <p className="text-sm font-medium mt-1">Session ID: <span className="font-mono text-xs">{paymentSessionId}</span></p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <CashfreeNativeUpiIntent
            orderId={orderId}
            amount={Number(amount)}
            paymentSessionId={paymentSessionId}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            className="w-full"
            buttonText="Pay with UPI"
          />
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="code">Code Sample</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">React Native UPI Intent</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <p>This demo shows how to implement UPI Intent payment using Cashfree's React Native SDK.</p>
            <p>Key features:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Direct integration with UPI apps (GPay, PhonePe, etc.)</li>
              <li>No WebView or Load Checkout required</li>
              <li>Native payment experience</li>
              <li>Automatic app selection based on installed UPI apps</li>
              <li>Proper payment verification</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="implementation" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Code className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">Implementation Details</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• Uses <code>CFUPIIntentCheckoutPayment</code> for UPI Intent flow</p>
            <p>• Implements <code>doUPIPayment()</code> method from Cashfree SDK</p>
            <p>• Handles callbacks through <code>onVerify</code> and <code>onError</code></p>
            <p>• Verifies payment status with your backend</p>
            <p>• Based on <a href="https://www.cashfree.com/docs/payments/online/mobile/misc/upi_intent_support_js_sdk#react-native" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cashfree's official documentation</a></p>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <CreditCard className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">React Native Code Sample</h2>
          </div>
          <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-md overflow-auto">
{`// 1. Install the SDK
npm install react-native-cashfree-pg-sdk

// 2. Import required components
import { 
  CFPaymentGatewayService, 
  CFErrorResponse,
  CFUPIIntentCheckoutPayment 
} from 'react-native-cashfree-pg-sdk';

// 3. Set up payment callback
CFPaymentGatewayService.getInstance().setCallback({
  onVerify: (orderID) => {
    // Verify payment status with your backend
    verifyPaymentStatus(orderID);
  },
  onError: (error, orderID) => {
    console.error("Payment error:", error);
    // Handle payment failure
  }
});

// 4. Start UPI Intent payment
const upiIntentParams = {
  paymentSessionId: "session_id_from_backend",
  orderID: "order_id",
  appId: "YOUR_CASHFREE_APP_ID"
};

await CFPaymentGatewayService.getInstance().doUPIPayment(upiIntentParams);`}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReactNativeUpiDemo; 