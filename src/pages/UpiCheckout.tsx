import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  initiateUpiIntentPayment, 
  generateOrderId
} from '@/services/upiIntentService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const UpiCheckout: React.FC = () => {
  const location = useLocation();
  const [amount, setAmount] = useState(0);
  const [metal, setMetal] = useState('gold');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Get the amount and metal from the location state if available
  useEffect(() => {
    if (location.state) {
      if (location.state.amount && location.state.amount > 0) {
        setAmount(location.state.amount);
      }
      
      if (location.state.metal) {
        setMetal(location.state.metal);
      }
    }
  }, [location]);
  
  const handleBuy = async () => {
    if (!user || amount <= 0) {
      toast.error('Please enter a valid amount');
              return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate order ID that includes user ID and metal type
      const userId = user.id;
      const orderId = generateOrderId(userId, metal);
      
      const customerName = user.fullName || '';
      const customerEmail = user.primaryEmailAddress?.emailAddress || '';
      const customerPhone = user.primaryPhoneNumber?.toString() || '9999999999';
      
      console.log(`Initiating UPI payment: ${metal} worth ₹${amount}, Order ID: ${orderId}`);
      
      // Store transaction in local storage for recovery
      localStorage.setItem('pendingTransaction', JSON.stringify({
        orderId,
        amount,
        type: metal,
        timestamp: new Date().toISOString(),
        paymentMethod: 'UPI',
        userId: userId
      }));
      
      // Initiate UPI Intent payment
      await initiateUpiIntentPayment({
        orderId,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        vpa: "aczentechnologiesp.cf@axisbank", // Merchant VPA
        description: `Payment for ${metal} worth ₹${amount}`,
        userId: userId,
        metalType: metal
      });
      
    } catch (error) {
      console.error('Error initiating UPI payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-xl font-bold">Buy Gold</h1>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <div className="mb-4">
          <Label htmlFor="amount" className="text-white">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="bg-gray-800 border-gray-700 text-white mt-2"
          />
        </div>
        
        <div className="mb-4">
          <Label className="text-white mb-2 block">Asset Type</Label>
          <RadioGroup 
            value={metal}
            onValueChange={setMetal}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg flex-1 cursor-pointer">
              <RadioGroupItem value="gold" id="gold" />
              <Label htmlFor="gold" className="cursor-pointer">Gold</Label>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg flex-1 cursor-pointer">
              <RadioGroupItem value="silver" id="silver" />
              <Label htmlFor="silver" className="cursor-pointer">Silver</Label>
                </div>
          </RadioGroup>
                </div>
              
              <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
          onClick={handleBuy}
          disabled={amount <= 0 || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Buy"
          )}
              </Button>
            </div>
    </div>
  );
};

export default UpiCheckout; 