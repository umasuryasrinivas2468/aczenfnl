
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
import { DollarSign } from "lucide-react"

const SellDialog = () => {
  const { toast } = useToast()
  const [amount, setAmount] = React.useState("")

  const handleSell = (e: React.FormEvent) => {
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
      description: `Sell order placed for ₹${amount}`,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 h-14 border-dark-blue text-dark-blue hover:bg-dark-blue/5 rounded-lg">
          <DollarSign className="mr-2" size={18} />
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell Gold</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSell} className="space-y-4">
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
            Confirm Sell
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SellDialog
