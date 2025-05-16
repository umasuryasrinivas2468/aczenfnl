import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  initiateUpiIntentPayment, 
  generateOrderId, 
  checkPaymentStatus
} from '@/services/upiIntentService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type AmountInputProps = {
  amount: number;
  setAmount: (amount: number) => void;
  metal: string;
  setMetal: (metal: string) => void;
  onProceed: () => void;
};

const AmountInput: React.FC<AmountInputProps> = ({ amount, setAmount, metal, setMetal, onProceed }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-6 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold mb-4">UPI Payment</h2>
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
        onClick={onProceed}
        disabled={amount <= 0}
      >
        Continue
      </Button>
    </div>
  );
};

const UpiCheckout: React.FC = () => {
  const location = useLocation();
  const [amount, setAmount] = useState(0);
  const [metal, setMetal] = useState('gold');
  const [isLoading, setIsLoading] = useState(false);
  const [showAmountInput, setShowAmountInput] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [pollingCount, setPollingCount] = useState(0);
  const { user } = useUser();
  const navigate = useNavigate();

  // Check if device supports UPI Intent
  const isUpiSupported = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  
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
  
  // Handle UPI app return and polling for payment status
  useEffect(() => {
    // Poll for payment status if we have an orderId and payment is pending
    let interval: number | null = null;
    
    if (orderId && paymentStatus === 'pending') {
      interval = window.setInterval(async () => {
        try {
          // Check payment status from Cashfree API
          const status = await checkPaymentStatus(orderId);
          
          // Increment polling count to track how long we've been waiting
          setPollingCount(prev => prev + 1);
          
          // If payment is verified as successful, navigate to success page
          if (status === 'PAID') {
            handlePaymentSuccess();
          } 
          // If payment failed, show failure message
          else if (status === 'FAILED') {
            handlePaymentFailure();
          } 
          // If still pending after 30 seconds (10 attempts), show a timeout message
          else if (pollingCount > 10) {
            handlePaymentTimeout();
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, paymentStatus, pollingCount]);

  // Handle successful payment
  const handlePaymentSuccess = async () => {
    setPaymentStatus('success');
    
    // Navigate to receipt page with all needed information
    navigate('/payment-success', { 
      state: { 
        orderId, 
        amount,
        paymentMethod: 'UPI',
        timestamp: new Date().toISOString(),
        status: 'PAID',
        type: metal // Pass the metal type for investment tracking
      } 
    });
  };

  // Handle failed payment
  const handlePaymentFailure = () => {
    setPaymentStatus('failed');
    toast.error('Payment failed. Please try again.');
  };

  // Add a payment timeout handler
  const handlePaymentTimeout = () => {
    setPaymentStatus('failed');
    toast.error('Payment verification timed out. If you completed the payment, please contact support.');
  };

  const handleProceed = async () => {
    if (!user || amount <= 0) return;
    
    setShowAmountInput(false);
    setIsLoading(true);
    setPollingCount(0);
    
    try {
      // Generate order ID that includes user ID and metal type
      const userId = user.id;
      const newOrderId = generateOrderId(userId, metal);
      setOrderId(newOrderId);
      
      const customerName = user.fullName || '';
      const customerEmail = user.primaryEmailAddress?.emailAddress || '';
      const customerPhone = user.primaryPhoneNumber?.toString() || '9999999999';
      
      // Initiate UPI Intent payment
      await initiateUpiIntentPayment({
        orderId: newOrderId,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        vpa: "aczentechnologiesp.cf@axisbank", // Merchant VPA
        description: `Payment for ${metal} worth ₹${amount}`,
        userId: userId,
        metalType: metal
      });
      
      setPaymentStatus('pending');
    } catch (error) {
      console.error('Error initiating UPI payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setShowAmountInput(true);
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
        <h1 className="text-xl font-bold">UPI Payment</h1>
      </div>

      {!isUpiSupported && (
        <div className="bg-red-900/50 rounded-lg p-4 mb-6">
          <p className="text-red-200">
            UPI Intent is only supported on Android devices. Please use another payment method.
          </p>
        </div>
      )}

      {showAmountInput ? (
        <AmountInput 
          amount={amount} 
          setAmount={setAmount}
          metal={metal}
          setMetal={setMetal}
          onProceed={handleProceed} 
        />
      ) : (
        <div className="bg-gray-900 rounded-lg p-6 animate-in fade-in duration-300">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p>Initializing payment...</p>
            </div>
          ) : paymentStatus === 'pending' ? (
            <div className="text-center py-4">
              <h2 className="text-xl font-bold mb-4">Payment Processing</h2>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p className="text-gray-300">Verifying payment status...</p>
              <div className="bg-gray-800 p-3 rounded-lg space-y-1 mt-4 mb-4 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span>₹{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Asset:</span>
                  <span className="capitalize">{metal}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Order ID: {orderId}</p>
              
              {pollingCount > 5 && (
                <div className="mt-6 bg-blue-900/20 p-3 rounded">
                  <p className="text-blue-300 text-sm">
                    Payment verification in progress. This may take a moment.
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setShowAmountInput(true);
                  setPaymentStatus('idle');
                }}
              >
                Cancel Payment
              </Button>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="text-center py-4">
              <h2 className="text-xl font-bold mb-4 text-red-500">Payment Failed</h2>
              <p className="text-gray-300">Your payment could not be processed.</p>
              <Button 
                className="mt-4 w-full"
                onClick={() => {
                  setShowAmountInput(true);
                  setPaymentStatus('idle');
                }}
              >
                Try Again
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UpiCheckout; 