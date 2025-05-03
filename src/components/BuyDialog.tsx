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

// API URL - adjust if needed for different environments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

declare global {
  interface Window {
    Cashfree: any;
  }
}

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
      // Generate order ID
      const orderId = `order_${Date.now()}`
      
      // Store pending transaction in local storage
      const transactionData = {
        id: orderId,
        type: metal,
        amount: amountValue,
        date: new Date().toISOString(),
        status: 'pending'
      }
      
      localStorage.setItem('pendingTransaction', JSON.stringify(transactionData))
      
      // DIRECT APPROACH - Use URL parameters directly
      // Format: https://payments.cashfree.com/order/#/{appId}/{orderId}/{amount}
      const appId = "850529145692c9f93773ed2c0a925058"
      const checkoutUrl = `https://payments.cashfree.com/order/#/${appId}/${orderId}/${amountValue}`
      
      // Close dialog before redirect
      setIsOpen(false)
      setIsLoading(false)
      
      // Redirect to Cashfree checkout
      window.location.href = checkoutUrl
      
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
      })
      setIsLoading(false)
    }
  }

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