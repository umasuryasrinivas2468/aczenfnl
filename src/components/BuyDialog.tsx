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
import { Coins, Info, Copy, LayoutList } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUser } from "@clerk/clerk-react"
import { initiateUpiIntentPayment, generateOrderId } from "@/services/upiIntentService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

// Debug helper - adds a global function to enable UPI intent testing mode
if (typeof window !== 'undefined') {
  (window as any).enableUpiIntent = () => {
    localStorage.setItem('force_upi_intent', 'true');
    console.log("UPI Intent testing mode ENABLED");
    alert("UPI Intent testing mode enabled. Reload the page for changes to take effect.");
  };
  
  (window as any).disableUpiIntent = () => {
    localStorage.removeItem('force_upi_intent');
    console.log("UPI Intent testing mode DISABLED");
    alert("UPI Intent testing mode disabled. Reload the page for changes to take effect.");
  };

  (window as any).enableDirectUpi = () => {
    localStorage.setItem('use_direct_upi', 'true');
    console.log("Direct UPI mode ENABLED");
    alert("Direct UPI mode enabled. Reload the page for changes to take effect.");
  };
  
  (window as any).disableDirectUpi = () => {
    localStorage.removeItem('use_direct_upi');
    console.log("Direct UPI mode DISABLED");
    alert("Direct UPI mode disabled. Reload the page for changes to take effect.");
  };

  // Add function to manually open UPI
  (window as any).openUPI = (url) => {
    if (!url) {
      const lastUrl = localStorage.getItem('last_upi_url');
      if (lastUrl) {
        window.location.href = lastUrl;
        return true;
      }
      return false;
    }
    window.location.href = url;
    return true;
  };

  // Debug function to check Supabase connection
  (window as any).testSupabase = async () => {
    try {
      const { data, error } = await supabase.from('transactions').select('*').limit(1);
      console.log('Supabase test result:', { data, error });
      if (error) {
        alert(`Supabase connection error: ${error.message}`);
      } else {
        alert(`Supabase connection successful! Found ${data?.length || 0} records.`);
      }
    } catch (err) {
      console.error('Supabase test error:', err);
      alert(`Supabase connection error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
}

const BuyDialog = () => {
  const { toast } = useToast()
  const { user } = useUser()
  const navigate = useNavigate()
  const [amount, setAmount] = useState("")
  const [metal, setMetal] = useState("gold")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [forceUpiEnabled, setForceUpiEnabled] = useState(false)
  const [directUpiEnabled, setDirectUpiEnabled] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{ orderId?: string, url?: string } | null>(null)

  // Debug log when component mounts
  useEffect(() => {
    console.log("BuyDialog component mounted")
    console.log("initiateUpiIntentPayment imported:", typeof initiateUpiIntentPayment)
    console.log("generateOrderId imported:", typeof generateOrderId)
    
    // Check if force UPI intent is enabled
    const forceUpi = localStorage.getItem('force_upi_intent') === 'true'
    setForceUpiEnabled(forceUpi)
    console.log("Force UPI Intent mode:", forceUpi ? "ENABLED" : "DISABLED")

    // Check if direct UPI mode is enabled
    const directUpi = localStorage.getItem('use_direct_upi') === 'true'
    setDirectUpiEnabled(directUpi)
    console.log("Direct UPI mode:", directUpi ? "ENABLED" : "DISABLED")

    // Test Supabase connection on component mount
    const testSupabaseConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('transactions').select('count').single();
        console.log('Supabase connection test result:', { data, error });
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };
    
    testSupabaseConnection();
  }, [])

  const validateInput = () => {
    console.log("Validating input:", { amount, metal })
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

  const openDialog = () => {
    console.log("Opening dialog")
    setIsOpen(true)
  }

  const closeDialog = () => {
    console.log("Closing dialog")
    setIsOpen(false)
    setPaymentStatus(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "UPI URL copied successfully"
        })
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Failed to copy to clipboard"
        })
      })
  }

  const handleRetryUPI = () => {
    if (paymentStatus?.url) {
      window.location.href = paymentStatus.url
    } else {
      const lastUrl = localStorage.getItem('last_upi_url')
      if (lastUrl) {
        window.location.href = lastUrl
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No UPI URL found to retry"
        })
      }
    }
  }

  const handleTryBasicUPI = () => {
    const basicUrl = localStorage.getItem('basic_upi_url')
    if (basicUrl) {
      window.location.href = basicUrl
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No basic UPI URL found"
      })
    }
  }

  const viewTransactionHistory = () => {
    navigate('/history')
  }

  // Manual transaction recording as a fallback
  const manuallyRecordTransaction = async (orderId: string, userId: string, amountValue: number, metalType: string) => {
    try {
      console.log('Manually recording transaction in Supabase...');
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            order_id: orderId,
            user_id: userId,
            amount: amountValue,
            metal_type: metalType,
            status: 'PENDING',
            payment_method: 'UPI',
            created_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) {
        console.error('Manual transaction recording failed:', error);
      } else {
        console.log('Manual transaction recording succeeded:', data);
      }
    } catch (err) {
      console.error('Error in manual transaction recording:', err);
    }
  };

  const handleBuy = async () => {
    console.log("Buy button clicked", { amount, metal, user })
    
    if (!validateInput()) {
      console.log("Input validation failed")
      return
    }
    
    if (!user) {
      console.log("No user found")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to continue",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Generate order ID that includes user ID and metal type
      console.log("Generating order ID with user:", user.id, "metal:", metal)
      const userId = user.id
      const orderId = generateOrderId(userId, metal)
      console.log("Generated order ID:", orderId)
      
      const customerName = user.fullName || ''
      const customerEmail = user.primaryEmailAddress?.emailAddress || ''
      const customerPhone = user.primaryPhoneNumber?.toString() || '9999999999'
      
      console.log(`Initiating UPI payment: ${metal} worth ₹${parseFloat(amount)}, Order ID: ${orderId}`)
      
      // Store transaction in local storage for recovery
      const transactionData = {
        orderId,
        amount: parseFloat(amount),
        type: metal,
        timestamp: new Date().toISOString(),
        paymentMethod: 'UPI',
        userId: userId
      }
      console.log("Storing transaction data:", transactionData)
      localStorage.setItem('pendingTransaction', JSON.stringify(transactionData))
      
      // Set the payment status to show in the UI
      setPaymentStatus({ orderId })

      // Try to manually record the transaction first for better reliability
      await manuallyRecordTransaction(orderId, userId, parseFloat(amount), metal);
      
      // Initiate UPI Intent payment
      console.log("Calling initiateUpiIntentPayment with params:", {
        orderId,
        amount: parseFloat(amount),
        customerName,
        customerEmail,
        customerPhone,
        metalType: metal,
        directUpi: directUpiEnabled
      })
      
      await initiateUpiIntentPayment({
        orderId,
        amount: parseFloat(amount),
        customerName,
        customerEmail,
        customerPhone,
        vpa: "aczentechnologiesp.cf@axisbank", // Merchant VPA
        description: `Payment for ${metal} worth ₹${parseFloat(amount)}`,
        userId: userId,
        metalType: metal
      })
      
      // Capture the UPI URL for retry options
      const lastUrl = localStorage.getItem('last_upi_url')
      if (lastUrl) {
        setPaymentStatus(prev => ({ ...prev, url: lastUrl }))
      }
      
      // Don't close dialog after initiating payment so user can see options
      // closeDialog()
    } catch (error) {
      console.error('Error initiating UPI payment:', error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg"
        onClick={openDialog}
      >
        <Coins className="mr-2" size={16} />
        Buy
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-[425px]">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl">
              Buy Digital Assets
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter amount and select asset type
            </DialogDescription>
          </DialogHeader>
          
          {paymentStatus ? (
            <div className="space-y-4 py-4">
              <Alert className="bg-blue-900/20 border-blue-800">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-100 text-sm">
                  UPI payment initiated. If UPI apps haven't opened automatically, please try the options below.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">Order ID: <span className="text-white">{paymentStatus.orderId}</span></p>
                <p className="text-gray-400">Amount: <span className="text-white">₹{amount}</span></p>
                <p className="text-gray-400">Asset: <span className="text-white capitalize">{metal}</span></p>
              </div>
              
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleRetryUPI}
                >
                  Retry Opening UPI Apps
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTryBasicUPI}
                >
                  Try Simplified UPI Format
                </Button>
                {paymentStatus.url && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => copyToClipboard(paymentStatus.url!)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy UPI URL
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={viewTransactionHistory}
                >
                  <LayoutList className="h-4 w-4 mr-2" />
                  View Transaction History
                </Button>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full text-red-400 border-red-900 hover:bg-red-900/20"
                  onClick={() => setPaymentStatus(null)}
                >
                  Start Over
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={amount}
                  onChange={(e) => {
                    console.log("Amount changed:", e.target.value)
                    setAmount(e.target.value)
                  }}
                />
                <p className="text-xs text-gray-400">Min: ₹1, Max: ₹5,000</p>
              </div>
              
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <RadioGroup 
                  defaultValue="gold" 
                  value={metal}
                  onValueChange={(value) => {
                    console.log("Metal changed:", value)
                    setMetal(value)
                  }}
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
                onClick={handleBuy} 
                className="w-full"
                disabled={isLoading}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BuyDialog
