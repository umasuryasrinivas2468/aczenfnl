import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Coins, CreditCard, QrCode } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { PaymentService } from '@/lib/services/payment'

// API URL - hardcode to use port 5004 always
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004';

// Customer info interface
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

// Payment method options
type PaymentMethod = 'card' | 'upi';

const BuyDialog = () => {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [metal, setMetal] = useState("gold")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  
  const [customerInfo, setCustomerInfo] = useLocalStorage<CustomerInfo>('customerInfo', {
    name: '',
    email: '',
    phone: ''
  })
  
  // Get and update user investments from local storage
  const [userInvestments, setUserInvestments] = useLocalStorage('userInvestments', {
    totalInvestment: 0,
    investments: {
      gold: {
        type: 'gold',
        amount: 0,
        weight: 0,
        weightUnit: 'grams',
      },
      silver: {
        type: 'silver',
        amount: 0,
        weight: 0,
        weightUnit: 'grams',
      }
    },
    transactions: []
  })
  
  // Check if customer info is complete on first render
  useEffect(() => {
    // Check if customer info is complete
    const isInfoComplete = 
      customerInfo.name && 
      customerInfo.email && 
      customerInfo.phone;
    
    setShowCustomerInfo(!isInfoComplete);
  }, [customerInfo]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an amount",
      })
      return
    }

    const amountValue = parseFloat(amount)
    if (amountValue < 1 || amountValue > 5000) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount must be between ₹1 and ₹5000",
      })
      return
    }
    
    // Validate customer info if being shown
    if (showCustomerInfo) {
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all customer information",
        })
        return
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerInfo.email)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid email address",
        })
        return
      }
      
      // Basic phone validation (10 digits)
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(customerInfo.phone)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid 10-digit phone number",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      console.log("Initiating payment process with server:", API_URL);
      
      // Direct API calls to ensure consistent behavior
      // Step 1: Create order
      const createOrderResponse = await fetch(`${API_URL}/api/create-cashfree-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderAmount: amountValue,
          orderId: `order_${Date.now()}`,
          customerDetails: {
            customerId: `customer_${Date.now()}`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone
          }
        })
      });
      
      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${createOrderResponse.status}`);
      }
      
      const orderData = await createOrderResponse.json();
      console.log('Order created:', orderData);
      
      // Step 2: Get payment link directly
      const paymentLinkResponse = await fetch(`${API_URL}/api/create-payment-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.order_id
        })
      });
      
      if (!paymentLinkResponse.ok) {
        const errorData = await paymentLinkResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Payment link error: ${paymentLinkResponse.status}`);
      }
      
      const paymentData = await paymentLinkResponse.json();
      console.log('Payment link generated:', paymentData);
      
      // Step 3: Redirect to the payment page
      if (paymentData.payment_link) {
        toast({
          title: "Payment Initiated",
          description: `Redirecting to payment gateway...`,
        });
        
        // Close dialog and redirect
        setIsOpen(false);
        window.location.href = paymentData.payment_link;
      } else {
        throw new Error('No payment link received from server');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // More specific error message based on error type
      let errorMessage = "Failed to initiate payment. Please try again.";
      
      if (error.message?.includes('fetch') || error.message?.includes('Network')) {
        errorMessage = `Network error: Unable to connect to payment server at ${API_URL}. Please make sure the server is running.`;
      } else if (error.message?.includes('return_url')) {
        errorMessage = "Configuration error: The return URL must use HTTPS for Cashfree integration.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex-1 h-14 bg-dark-blue hover:bg-dark-blue/90 text-white rounded-lg"
          onClick={() => setIsOpen(true)}
        >
          <Coins className="mr-2" size={18} />
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Precious Metal</DialogTitle>
          <DialogDescription>Select metal type and enter amount (₹1 - ₹5000)</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleBuy} className="space-y-4">
          <div>
            <Label>Select Metal</Label>
            <RadioGroup
              value={metal}
              onValueChange={setMetal}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gold" id="gold" />
                <Label htmlFor="gold">Gold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="silver" id="silver" />
                <Label htmlFor="silver">Silver</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max="5000"
            />
          </div>
          
          {/* Payment method selection */}
          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center">
                  <QrCode className="w-4 h-4 mr-1" />
                  UPI
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {!showCustomerInfo && (
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCustomerInfo(true)}
            >
              Update Customer Information
            </Button>
          )}
          
          {showCustomerInfo && (
            <div className="space-y-3 border p-3 rounded-md">
              <h3 className="font-medium">Customer Information</h3>
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => updateCustomerInfo('name', e.target.value)}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => updateCustomerInfo('email', e.target.value)}
                  placeholder="Email Address"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => updateCustomerInfo('phone', e.target.value)}
                  placeholder="10-digit Phone Number"
                  maxLength={10}
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BuyDialog