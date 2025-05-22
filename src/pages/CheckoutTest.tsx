import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const CheckoutTest: React.FC = () => {
  const [amount, setAmount] = useState<string>('100');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpiCheckout = () => {
    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to UPI checkout page with amount
    navigate(`/upi-checkout?amount=${amount}`);
  };

  const handleRegularCheckout = () => {
    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to regular checkout page with amount
    navigate(`/checkout?amount=${amount}`);
  };

  // Example code for CFUPIIntentCheckoutPayment
  const exampleCode = `
// Create a UPI Intent payment
const upiPayment = new CFUPIIntentCheckoutPayment(
  session,
  theme
);

// Process the payment
CFPaymentGatewayService.doUPIPayment(upiPayment);
  `;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-white">Payment Test</h1>
      
      <Tabs defaultValue="upi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upi">UPI Intent</TabsTrigger>
          <TabsTrigger value="regular">Regular Checkout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upi">
          <Card>
            <CardHeader>
              <CardTitle>UPI Intent Payment</CardTitle>
              <CardDescription>
                Test UPI Intent payment flow for mobile apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upi-amount">Amount (₹)</Label>
                  <Input 
                    id="upi-amount" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount" 
                  />
                </div>
                
                <div className="bg-gray-800 p-3 rounded-md text-xs font-mono text-gray-300">
                  <pre>{exampleCode}</pre>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleUpiCheckout}>
                Test UPI Intent Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle>Regular Checkout</CardTitle>
              <CardDescription>
                Test the standard checkout flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="regular-amount">Amount (₹)</Label>
                <Input 
                  id="regular-amount" 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleRegularCheckout}>
                Go to Regular Checkout
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckoutTest; 