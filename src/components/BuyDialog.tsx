
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Coins } from "lucide-react"

const BuyDialog = () => {
  const { toast } = useToast()
  const [amount, setAmount] = React.useState("")

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
    toast({
      title: "Success",
      description: `Buy order placed for ₹${amount}`,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex-1 h-14 bg-dark-blue hover:bg-dark-blue/90 text-white rounded-lg">
          <Coins className="mr-2" size={18} />
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Gold</DialogTitle>
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
            />
          </div>
          <Button type="submit" className="w-full">
            Confirm Buy
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BuyDialog
