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
import { Coins } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useUser } from "@clerk/clerk-react"
import { createOrder } from "@/services/paymentService"

// Define the type for window with Cashfree
declare global {
  interface Window {
    Cashfree: any;
  }
}

const BuyDialog = () => {
  const { toast } = useToast()
  const { user } = useUser()
  const [amount, setAmount] = useState("")
  const [metal, setMetal] = useState("gold")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState(1) // 1: Metal & Amount, 2: Customer Details
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
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
  }, [user])

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

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSecondStep()) {
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
      
      // Initialize Cashfree checkout
      const cashfree = window.Cashfree({
        mode: "production"
      })
      
      const checkoutOptions = {
        paymentSessionId: orderResponse.payment_session_id,
        redirectTarget: "_self",
      }
      
      await cashfree.checkout(checkoutOptions)
      
      // Close dialog
      setIsOpen(false)
    } catch (error) {
      console.error("Payment Error:", error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setStep(1)
    setAmount("")
    setMetal("gold")
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex-1 h-14 bg-dark-blue hover:bg-dark-blue/90 text-white rounded-lg">
          <Coins className="mr-2" size={18} />
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Precious Metal</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Select metal type and enter amount (₹1 - ₹5000)"
              : "Please provide your contact information"
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <form className="space-y-4">
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
            <Button type="button" className="w-full" onClick={handleNextStep}>
              Next
            </Button>
          </form>
        ) : (
          <form onSubmit={handleBuy} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your 10-digit phone number"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BuyDialog
