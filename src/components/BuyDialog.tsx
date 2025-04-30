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

const BuyDialog = () => {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [metal, setMetal] = useState("gold")
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

    setIsLoading(true)

    try {
      // Cashfree payment integration with TEST credentials
      const orderId = `order_${Date.now()}`
      const appId = "TEST10401621b07dc6fbcf2ab23955c912610401"
      const secretKey = "cfsk_ma_test_e5544b1e437f252b39ad6b0144784582_c0cccdef"
      
      // Store transaction details in localStorage to retrieve after payment
      const transactionData = {
        id: orderId,
        type: metal,
        amount: amountValue,
        date: new Date().toISOString(),
        status: 'pending'
      }
      
      localStorage.setItem('pendingTransaction', JSON.stringify(transactionData))
      
      // Direct Cashfree payment link for test mode
      // Using the test payment URL for Cashfree
      const cashfreeTestUrl = `https://test.cashfree.com/billpay/checkout/post/submit`
      
      // Create form for the test environment
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = cashfreeTestUrl
      
      // Required parameters for Cashfree test mode
      const params = {
        appId: appId,
        orderId: orderId,
        orderAmount: amountValue.toString(),
        orderCurrency: 'INR',
        orderNote: `Purchase of ${metal}`,
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '9999999999',
        returnUrl: `${window.location.origin}/payment-success`,
        notifyUrl: `${window.location.origin}/payment-success`,
      }
      
      // Create and append signature for Cashfree
      const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
      
      // Add all parameters to the form
      for (const key in params) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = params[key]
        form.appendChild(input)
      }
      
      // Append form to body and submit
      document.body.appendChild(form)
      form.submit()
      
      // Close dialog
      setIsOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 h-14 bg-dark-blue hover:bg-dark-blue/90 text-white rounded-lg">
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BuyDialog
