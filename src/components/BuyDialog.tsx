
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

const BuyDialog = () => {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleBuy = (e: React.FormEvent) => {
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
    if (amountValue > 5000) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount cannot exceed ₹5000",
      })
      return
    }

    // Construct Cashfree URL with amount
    const cashfreeUrl = `https://payments.cashfree.com/forms?code=aczen&amount=${amount}`
    
    // Redirect to Cashfree
    window.location.href = cashfreeUrl
    
    // Close dialog
    setIsOpen(false)
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
          <DialogTitle>Buy Gold</DialogTitle>
          <DialogDescription>Enter an amount below ₹5000</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleBuy} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max="5000"
            />
          </div>
          <Button type="submit" className="w-full">
            Proceed to Payment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BuyDialog
