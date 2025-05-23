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
import { useUser, useAuth } from "@clerk/clerk-react"
import { initiateUpiIntentPayment } from "@/services/upiIntentService"
import { generateOrderId } from "@/services/paymentService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import CashfreeCheckout from './CashfreeCheckout'
import CashfreeUpiIntent from './CashfreeUpiIntent'
import { loadCashfreeSDK } from '@/utils/cashfreeLoader'

// Define global type for Cashfree in window object
declare global {
  interface Window {
    Cashfree?: any;
    enableUpiIntent?: () => void;
    disableUpiIntent?: () => void;
    enableDirectUpi?: () => void;
    disableDirectUpi?: () => void;
    openUPI?: (url?: string) => boolean;
    testSupabase?: () => Promise<void>;
    testCashfreeSDK?: () => boolean;
  }
}

// Debug helper - adds a global function to enable UPI intent testing mode
if (typeof window !== 'undefined') {
  window.enableUpiIntent = () => {
    localStorage.setItem('force_upi_intent', 'true');
    console.log("UPI Intent testing mode ENABLED");
    alert("UPI Intent testing mode enabled. Reload the page for changes to take effect.");
  };
  
  window.disableUpiIntent = () => {
    localStorage.removeItem('force_upi_intent');
    console.log("UPI Intent testing mode DISABLED");
    alert("UPI Intent testing mode disabled. Reload the page for changes to take effect.");
  };

  window.enableDirectUpi = () => {
    localStorage.setItem('use_direct_upi', 'true');
    console.log("Direct UPI mode ENABLED");
    alert("Direct UPI mode enabled. Reload the page for changes to take effect.");
  };
  
  window.disableDirectUpi = () => {
    localStorage.removeItem('use_direct_upi');
    console.log("Direct UPI mode DISABLED");
    alert("Direct UPI mode disabled. Reload the page for changes to take effect.");
  };

  // Add function to manually open UPI
  window.openUPI = (url) => {
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
  window.testSupabase = async () => {
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
  
  // Add a function to test Cashfree SDK initialization
  window.testCashfreeSDK = () => {
    if (window.Cashfree) {
      try {
        window.Cashfree.initialiseApp({ mode: "production" });
        console.log("Cashfree SDK initialized successfully");
        alert("Cashfree SDK is properly initialized");
        return true;
      } catch (error) {
        console.error("Error initializing Cashfree SDK:", error);
        alert(`Cashfree SDK initialization error: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      }
    } else {
      console.error("Cashfree SDK not found");
      alert("Cashfree SDK not found on window object");
      return false;
    }
  };
}

const BuyDialog = () => {
  const { toast } = useToast()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [amount, setAmount] = useState("")
  const [metal, setMetal] = useState("gold")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [forceUpiEnabled, setForceUpiEnabled] = useState(false)
  const [directUpiEnabled, setDirectUpiEnabled] = useState(false)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const [paymentStatus, setPaymentStatus] = useState<{ 
    orderId?: string, 
    upiLink?: string,
    paymentSessionId?: string
  } | null>(null)
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null)

  // Load Cashfree SDK on component mount
  useEffect(() => {
    const initSDK = async () => {
      try {
        console.log("Initializing Cashfree SDK");
        await loadCashfreeSDK();
        console.log("Cashfree SDK initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
      }
    };
    
    initSDK();
  }, []);

  // Fetch user details from Clerk when component mounts or user changes
  useEffect(() => {
    if (user) {
      const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      const email = user.primaryEmailAddress?.emailAddress || '';
      const phone = user.primaryPhoneNumber?.phoneNumber || '';
      
      console.log("Fetched user details from Clerk:", { fullName, email, phone });
      
      setUserDetails({
        name: fullName,
        email: email,
        phone: phone
      });
    }
  }, [user]);

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
    if (paymentStatus?.upiLink) {
      window.location.href = paymentStatus.upiLink
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

  // Helper function to test the Cashfree SDK initialization
  const testCashfreeSDK = () => {
    if (window.Cashfree) {
      try {
        // Use the constructor pattern for v3 SDK
        const cashfreeInstance = window.Cashfree({
          mode: "production"
        });
        toast({
          title: "SDK Test Success",
          description: "Cashfree SDK is properly initialized"
        });
        return true;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "SDK Test Failed",
          description: `Error: ${error instanceof Error ? error.message : String(error)}`
        });
        return false;
      }
    } else {
      toast({
        variant: "destructive",
        title: "SDK Test Failed",
        description: "Cashfree SDK not found on window object"
      });
      return false;
    }
  };

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

  // Function to store transaction in Supabase
  const storeTransactionInSupabase = async (transactionData) => {
    try {
      console.log('Storing transaction in Supabase:', transactionData);
      
      // First check if the transaction already exists
      const { data: existingData, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('order_id', transactionData.orderId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing transaction:', checkError);
      }
      
      // If transaction already exists, don't duplicate it
      if (existingData?.id) {
        console.log('Transaction already exists in Supabase, skipping insertion');
        return true;
      }
      
      // Create transaction object with only the fields we know exist in the database
      const transactionRecord = {
        order_id: transactionData.orderId,
        user_id: transactionData.userId,
        amount: transactionData.amount,
        metal_type: transactionData.type,
        status: 'pending', // Initial status is pending
        payment_method: 'UPI',
        created_at: new Date().toISOString()
      };
      
      // Don't include payment_session_id unless we have a value for it
      if (transactionData.upiLink) {
        // Try to add payment_session_id only if needed
        try {
          const { data, error } = await supabase
            .from('transactions')
            .insert([{
              ...transactionRecord,
              payment_session_id: transactionData.upiLink
            }])
            .select();
            
          if (error) {
            // If error includes missing column, continue without that field
            if (error.message?.includes("column") && error.message?.includes("payment_session_id")) {
              console.log('payment_session_id column does not exist, trying without it');
              throw new Error('column_missing');
            } else {
              console.error('Failed to store transaction in Supabase:', error);
              throw error;
            }
          } else {
            console.log('Transaction stored in Supabase with payment_session_id:', data);
            return true;
          }
        } catch (innerError) {
          // Only retry without payment_session_id if that was the issue
          if (innerError.message === 'column_missing') {
            const { error: insertError } = await supabase
              .from('transactions')
              .insert([transactionRecord]);
              
            if (insertError) {
              console.error('Fallback insert also failed:', insertError);
              return false;
            } else {
              console.log('Fallback transaction insert succeeded (without payment_session_id)');
              return true;
            }
          } else {
            throw innerError;
          }
        }
      } else {
        // If no upiLink/payment_session_id, just insert the basic record
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([transactionRecord]);
          
        if (insertError) {
          console.error('Insert failed:', insertError);
          return false;
        } else {
          console.log('Transaction insert succeeded');
          return true;
        }
      }
    } catch (err) {
      console.error('Error storing transaction in Supabase:', err);
      
      // Final fallback - try a minimal insert with only essential fields
      try {
        const { error: finalError } = await supabase
          .from('transactions')
          .insert([{
            order_id: transactionData.orderId,
            user_id: transactionData.userId,
            amount: transactionData.amount,
            metal_type: transactionData.type,
            status: 'pending',
            payment_method: 'UPI',
            created_at: new Date().toISOString()
          }]);
          
        if (!finalError) {
          console.log('Final fallback transaction insert succeeded');
          return true;
        }
      } catch (_) {
        // Ignore errors in the final fallback
      }
      
      return false;
    }
  };

  const handlePaymentSuccess = async (data: any) => {
    console.log("Payment successful:", data);
    
    // First verify the payment status with backend before proceeding
    try {
      // Use the backend API to verify payment is actually successful
      const API_URL = 'https://backend-36le.onrender.com';
      const response = await fetch(`${API_URL}/api/verify-payment/${paymentStatus?.orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error("Payment verification failed:", response.statusText);
        throw new Error("Payment verification failed");
      }
      
      const result = await response.json();
      console.log("Payment verification result:", result);
      
      // Only proceed if backend confirms payment is successful
      if (!result.success || result.status !== "SUCCESS") {
        console.error("Payment not confirmed by backend:", result);
        toast({
          variant: "destructive",
          title: "Payment Verification Failed",
          description: "Your payment could not be verified. Please contact support."
        });
        return;
      }
      
      // Update transaction status in Supabase
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed', 
          updated_at: new Date().toISOString(),
          payment_id: data?.paymentId || result?.transactions?.[0]?.cf_payment_id || null
        })
        .eq('order_id', paymentStatus?.orderId);
        
      if (error) {
        console.error('Failed to update transaction status:', error);
      }
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed and verified successfully."
      });
      
      // Close dialog and navigate to payment success page
      closeDialog();
      navigate('/payment-success', { 
        state: { 
          orderId: paymentStatus?.orderId,
          amount: parseFloat(amount),
          metal: metal,
          timestamp: new Date().toISOString(),
          verified: true // Add a flag to indicate the payment was verified
        }
      });
      
    } catch (err) {
      console.error('Error verifying payment:', err);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Could not verify your payment. Please check your payment status in history."
      });
    }
  };

  const handlePaymentFailure = async (error: any) => {
    console.error("Payment failed:", error);
    
    // Update transaction status in Supabase
    try {
      const { error: dbError } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed', 
          updated_at: new Date().toISOString(),
          failure_reason: error?.message || 'Unknown error'
        })
        .eq('order_id', paymentStatus?.orderId);
        
      if (dbError) {
        console.error('Failed to update transaction status:', dbError);
      }
    } catch (err) {
      console.error('Error updating transaction status:', err);
    }
    
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error?.message || "Payment could not be processed. Please try again.",
    });
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
      // Get Clerk session token using the useAuth hook
      let token;
      try {
        token = await getToken();
        console.log("Got auth token:", token ? "Token received" : "No token");
      } catch (tokenError) {
        console.error("Error getting auth token:", tokenError);
        // Continue without token as fallback
      }
      
      // Prepare user data from Clerk
      const userData = {
        customerId: user.id,
        customerName: userDetails?.name || user.fullName || 'User',
        customerEmail: userDetails?.email || user.primaryEmailAddress?.emailAddress || 'user@example.com',
        customerPhone: userDetails?.phone || user.primaryPhoneNumber?.phoneNumber || '9999999999'
      };
      
      console.log("Sending user data to backend:", userData);
      
      // Use the correct API URL (backend is running on port 3001)
      const API_URL = 'https://backend-36le.onrender.com';
      
      const response = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          metal,
          userData // Always send user data from frontend
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error("JSON parsing error:", jsonErr);
        throw new Error('Server error: Invalid response from backend.');
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create order');
      }
      
      const orderData = result.data;
      console.log("Order created successfully:", orderData);
      
      // Store transaction in local storage for recovery
      const transactionData = {
        orderId: orderData.order_id,
        amount: parseFloat(amount),
        type: metal,
        timestamp: new Date().toISOString(),
        paymentMethod: 'UPI',
        userId: user.id,
        userName: userData.customerName,
        userEmail: userData.customerEmail,
        userPhone: userData.customerPhone,
        upiLink: orderData.upi_link || ""
      };
      localStorage.setItem('pendingTransaction', JSON.stringify(transactionData));
      
      // Store transaction in Supabase
      await storeTransactionInSupabase(transactionData);
      
      // Set the payment status to show in the UI
      setPaymentStatus({ 
        orderId: orderData.order_id,
        upiLink: orderData.upi_link || "",
        paymentSessionId: orderData.payment_session_id || ""
      });
      
      // Check if on mobile device to auto-trigger UPI intent
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && (orderData.payment_session_id || orderData.upi_link)) {
        console.log("Mobile device detected, auto-triggering UPI");
        // The CashfreeCheckout component will auto-trigger UPI on mobile
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : 'Failed to create order. Please try again.'
      });
    } finally {
      setIsLoading(false);
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
                  Payment initiated for {userDetails?.name || 'you'}. {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'UPI app should open automatically.' : 'Click the button below to proceed with payment.'}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">Order ID: <span className="text-white">{paymentStatus.orderId}</span></p>
                <p className="text-gray-400">Amount: <span className="text-white">₹{amount}</span></p>
                <p className="text-gray-400">Asset: <span className="text-white capitalize">{metal}</span></p>
                {userDetails && (
                  <>
                    <p className="text-gray-400">Name: <span className="text-white">{userDetails.name}</span></p>
                    <p className="text-gray-400">Email: <span className="text-white">{userDetails.email}</span></p>
                    <p className="text-gray-400">Phone: <span className="text-white">{userDetails.phone}</span></p>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                {isMobile && paymentStatus.paymentSessionId ? (
                  // On mobile devices, use UPI Intent for faster payment
                  <CashfreeUpiIntent
                    orderId={paymentStatus.orderId!}
                    amount={parseFloat(amount)}
                    paymentSessionId={paymentStatus.paymentSessionId}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                    buttonText="Pay Now"
                    autoInitiate={true}
                    className="w-full bg-green-600 hover:bg-green-700"
                  />
                ) : (
                  // On desktop or fallback, use the standard checkout
                  <CashfreeCheckout
                    orderId={paymentStatus.orderId!}
                    amount={parseFloat(amount)}
                    upiLink={paymentStatus.upiLink}
                    paymentSessionId={paymentStatus.paymentSessionId}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                    buttonText="Pay Now"
                    className="w-full bg-green-600 hover:bg-green-700"
                  />
                )}
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
              
              {/* Show user details if available */}
              {userDetails && (
                <div className="space-y-2 border border-gray-800 p-3 rounded-lg bg-gray-800/50">
                  <h3 className="text-sm font-medium text-gray-300">User Details (from Clerk)</h3>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <p className="text-gray-400">Name:</p>
                    <p className="text-gray-200">{userDetails.name}</p>
                    <p className="text-gray-400">Email:</p>
                    <p className="text-gray-200">{userDetails.email}</p>
                    <p className="text-gray-400">Phone:</p>
                    <p className="text-gray-200">{userDetails.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
              
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
