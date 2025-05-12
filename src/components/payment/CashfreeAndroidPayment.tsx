import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CashfreeAndroid from '@/capacitor/cashfree-android';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

const CashfreeAndroidPayment: React.FC<{
  amount: number;
  onSuccess: (orderId: string) => void;
  onError: (error: any) => void;
}> = ({ amount, onSuccess, onError }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Validate customer info
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all customer information",
        });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerInfo.email)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid email address",
        });
        return;
      }

      // Basic phone validation (10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(customerInfo.phone)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid 10-digit phone number",
        });
        return;
      }

      // Initialize payment
      const orderId = `order_${Date.now()}`;
      const result = await CashfreeAndroid.initializePayment({
        orderId,
        orderAmount: amount,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        paymentOption: paymentMethod.toUpperCase()
      });

      if (result.txStatus === 'SUCCESS') {
        toast({
          title: "Payment Successful",
          description: `Payment completed for order ${orderId}`,
        });
        onSuccess(orderId);
      } else {
        throw new Error(result.txMsg || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
      });
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: 'upi' | 'card') => setPaymentMethod(value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi">UPI</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">Card</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={customerInfo.name}
          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter 10-digit phone number"
          maxLength={10}
        />
      </div>

      <div className="pt-4">
        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : `Pay ₹${amount}`}
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Secured by Cashfree Payments
      </div>
    </div>
  );
};

export default CashfreeAndroidPayment; 