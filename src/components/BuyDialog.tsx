import React, { useState } from 'react'
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
import { Coins, CreditCard } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useUser } from "@clerk/clerk-react"
import { createOrder } from "@/services/paymentService"
import { UpiPaymentButton } from './UpiPaymentButton'
import { Capacitor } from '@capacitor/core'
import { useNavigate } from 'react-router-dom'

// Define the type for window with Cashfree
declare global {
  interface Window {
    Cashfree: any;
  }
}

const BuyDialog = () => {
  const { toast } = useToast()
  const { user } = useUser()
  const navigate = useNavigate()
  const [amount, setAmount] = useState("")
  const [metal, setMetal] = useState("gold")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState(1) // 1: Metal & Amount, 2: Customer Details
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("standard") // "standard" or "upi"
  const isMobileDevice = Capacitor.isNativePlatform()
  const isAndroid = isMobileDevice && Capacitor.getPlatform() === 'android'
  
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

  // Pre-fill user information if available
  React.useEffect(() => {
    if (user) {
      if (user.fullName) setName(user.fullName)
      if (user.primaryEmailAddress) setEmail(user.primaryEmailAddress.emailAddress)
      if (user.primaryPhoneNumber) setPhone(user.primaryPhoneNumber.phoneNumber)
    }
    
    // Set UPI as default payment method on Android devices
    if (isAndroid) {
      setPaymentMethod("upi")
    }
  }, [user, isAndroid])

  const validateFirstStep = () => {
    if (!amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an amount",
      })
      return false
    }

    const amountValue = parseFloat(amount)
    if (amountValue < 1 || amountValue > 5000) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount must be between ₹1 and ₹5000",
      })
      return false
    }

    return true
  }

  const validateSecondStep = () => {
    if (!name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name",
      })
      return false
    }

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email",
      })
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      })
      return false
    }

    if (!phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your phone number",
      })
      return false
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(phone)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
      })
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (validateFirstStep()) {
      setStep(2)
    }
  }

  const handleUpiSuccess = (data: any) => {
    // Record successful transaction
    const amountValue = parseFloat(amount)
    const transactionData = {
      id: data.orderId,
      type: metal,
      amount: amountValue,
      date: new Date().toISOString(),
      status: 'completed'
    }
    
    // Update investments
    const updatedInvestments = { ...userInvestments }
    updatedInvestments.totalInvestment += amountValue
    updatedInvestments.investments[metal].amount += amountValue
    
    // Calculate weight based on current metal price (simplified for example)
    const metalPrice = metal === 'gold' ? 5500 : 70 // Sample rates per gram
    const weightInGrams = amountValue / metalPrice
    updatedInvestments.investments[metal].weight += weightInGrams
    
    // Add transaction to history
    updatedInvestments.transactions.push(transactionData)
    
    // Save updated investments
    setUserInvestments(updatedInvestments)
    
    // Close dialog
    setIsOpen(false)
    
    // Show success message
    toast({
      title: "Purchase Successful",
      description: `Successfully purchased ${metal} worth ₹${amountValue}`,
    })
  }

  const handleGoToUpiCheckout = () => {
    setIsOpen(false)
    navigate('/upi-checkout')
  }

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSecondStep()) {
      return
    }

    // If UPI payment is selected on Android, redirect to UPI Intent page
    if (paymentMethod === "upi" && isAndroid) {
      setIsOpen(false)
      navigate('/upi-checkout', { 
        state: { 
          amount: parseFloat(amount),
          metal 
        } 
      })
      return
    }

    setIsLoading(true)

    try {
      const amountValue = parseFloat(amount)
      const customerId = user?.id || "guest_user"
      const orderNote = metal // Set order note as "gold" or "silver"
      
      // Create order using the payment service
      const orderResponse = await createOrder(
        amountValue, 
        {
          customerId: customerId,
          customerPhone: phone,
          customerName: name,
          customerEmail: email
        },
        orderNote
      )
      
      // Store transaction details in localStorage to retrieve after payment
      const transactionData = {
        id: orderResponse.order_id,
        type: metal,
        amount: amountValue,
        date: new Date().toISOString(),
        status: 'pending'
      }
      
      localStorage.setItem('pendingTransaction', JSON.stringify(transactionData))
      
      // Check if this is a demo session
      const isDemoSession = orderResponse.payment_session_id.startsWith('demo_session_');
      
      if (isDemoSession && process.env.NODE_ENV !== 'production') {
        // For demo purposes, show a success message and close dialog
        toast({
          title: "Demo Payment",
          description: "This is a demo payment flow. In production, this would open the Cashfree checkout.",
        });
        
        setTimeout(() => {
          // Simulate redirect to success page
          window.location.href = '/payment-success';
        }, 1500);
        
        setIsLoading(false);
        return;
      }
      
      // Initialize Cashfree checkout
      const cashfree = window.Cashfree({
        mode: "production",
      });
      
      const checkoutOptions = {
        paymentSessionId: orderResponse.payment_session_id,
        redirectTarget: "_self", // Redirect in the same tab
      };
      
      await cashfree.checkout(checkoutOptions);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setStep(1)
    setAmount("")
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button 
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg"
        >
          <Coins className="mr-2" size={16} />
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">
            {step === 1 ? "Buy Digital Assets" : "Complete Your Purchase"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 1 
              ? "Enter amount and select asset type" 
              : "Enter your details to complete the purchase"
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                className="bg-gray-800 border-gray-700 text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-gray-400">Min: ₹1, Max: ₹5,000</p>
            </div>
            
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <RadioGroup 
                defaultValue="gold" 
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
            
            {isAndroid && (
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup 
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg flex-1 cursor-pointer">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="cursor-pointer flex items-center">
                      <CreditCard size={16} className="mr-2" />
                      Card/NetBanking
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg flex-1 cursor-pointer">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="cursor-pointer">UPI</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            <Button 
              onClick={handleNextStep} 
              className="w-full"
            >
              Continue
            </Button>
            
            {isAndroid && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full text-blue-400 border-blue-800"
                  onClick={handleGoToUpiCheckout}
                >
                  Quick UPI Payment
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleBuy} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                className="bg-gray-800 border-gray-700 text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-gray-800 border-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="10-digit number"
                className="bg-gray-800 border-gray-700 text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span>₹{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Asset:</span>
                <span className="capitalize">{metal}</span>
              </div>
              {paymentMethod === "upi" && isAndroid && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span>UPI</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-gray-700"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BuyDialog
