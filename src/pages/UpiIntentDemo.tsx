import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Smartphone, Check, AlertCircle, Info, Code, Settings, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from '@capacitor/core';
import CashfreeMobileCheckout from '@/components/CashfreeMobileCheckout';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UpiIntentDemo: React.FC = () => {
  const [amount, setAmount] = useState<string>("100");
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const [appScheme, setAppScheme] = useState<string>("yourappscheme");
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isNativeApp = Capacitor.isNativePlatform();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAppSchemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppScheme(e.target.value);
  };

  const createOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to continue"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive", 
        title: "Invalid amount",
        description: "Please enter a valid amount"
      });
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Prepare user data for the order
      const userData = {
        customerId: user.id,
        customerName: user.fullName || "User",
        customerEmail: user.primaryEmailAddress?.emailAddress || "",
        customerPhone: user.primaryPhoneNumber?.phoneNumber || ""
      };

      // Create order via your backend
      const response = await fetch("https://backend-36le.onrender.com/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          metal: "gold", // Default to gold, you can make this dynamic
          userData
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create order");
      }

      const orderData = result.data;
      console.log("Order created successfully:", orderData);

      // Set the order ID and payment session ID
      setOrderId(orderData.order_id);
      
      // Use the payment session ID from the backend response
      if (orderData.payment_session_id) {
        setPaymentSessionId(orderData.payment_session_id);
      } else {
        console.warn("No payment session ID received from backend");
        toast({
          variant: "destructive",
          title: "Missing session ID",
          description: "Backend did not return a payment session ID"
        });
      }
      
      toast({
        title: "Order Created",
        description: `Order ${orderData.order_id} created successfully`
      });
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create order"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    toast({
      title: "Payment Successful",
      description: "Your payment was processed successfully"
    });
    
    // Navigate to success page
    navigate('/payment-success', {
      state: {
        orderId: orderId,
        amount: parseFloat(amount),
        metalType: 'gold',
        timestamp: new Date().toISOString(),
        verified: true
      }
    });
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error?.message || "Payment could not be processed"
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">UPI Intent Checkout</h1>
      </div>
      
      {/* Native app detection */}
      <Alert className={`mb-4 ${isNativeApp ? 'bg-green-900/20 border-green-800' : 'bg-yellow-900/20 border-yellow-800'}`}>
        <div className="flex items-center">
          {isNativeApp ? (
            <>
              <Check className="h-4 w-4 text-green-400 mr-2" />
              <AlertDescription className="text-green-100 text-sm">
                Running in Capacitor native app environment
              </AlertDescription>
            </>
          ) : (
            <>
              <Info className="h-4 w-4 text-yellow-400 mr-2" />
              <AlertDescription className="text-yellow-100 text-sm">
                Running in web environment. For best UPI Intent experience, use a native app.
              </AlertDescription>
            </>
          )}
        </div>
      </Alert>
      
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-white mb-2 block">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={handleAmountChange}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          {isNativeApp && (
            <div>
              <Label htmlFor="appScheme" className="text-white mb-2 block">App URL Scheme</Label>
              <Input
                id="appScheme"
                type="text"
                value={appScheme}
                onChange={handleAppSchemeChange}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="yourappscheme"
              />
              <p className="text-xs text-gray-400 mt-1">
                This should match your app's URL scheme in Capacitor config
              </p>
            </div>
          )}

          {!orderId ? (
            <Button 
              className="w-full mt-4" 
              onClick={createOrder}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? 'Processing...' : 'Create Order'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm text-gray-400">Order ID: <span className="text-white">{orderId}</span></p>
                <p className="text-sm text-gray-400 mt-1">Amount: <span className="text-white">₹{amount}</span></p>
                <p className="text-sm text-gray-400 mt-1">Session ID: <span className="text-white">{paymentSessionId.substring(0, 20)}...</span></p>
              </div>
              
              <CashfreeMobileCheckout
                paymentSessionId={paymentSessionId}
                orderId={orderId}
                amount={parseFloat(amount)}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                buttonText="Pay with UPI Intent"
                className="w-full bg-green-600 hover:bg-green-700"
                autoInitiate={false}
                appScheme={appScheme}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabbed information */}
      <Tabs defaultValue="about" className="mb-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="about" className="flex-1">About UPI Intent</TabsTrigger>
          <TabsTrigger value="implementation" className="flex-1">Implementation</TabsTrigger>
          <TabsTrigger value="capacitor" className="flex-1">Capacitor Setup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Smartphone className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">About UPI Intent</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
            <li>UPI Intent directly opens installed UPI apps on your device</li>
            <li>Faster and more reliable than web-based UPI flows</li>
            <li>Works with popular apps like Google Pay, PhonePe, Paytm</li>
            <li>In Capacitor apps, deep linking handles payment callbacks</li>
            <li>Requires proper app URL scheme configuration</li>
            <li>Provides better conversion rates than web UPI methods</li>
          </ul>
        </TabsContent>
        
        <TabsContent value="implementation" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Code className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">Implementation Details</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• Uses <code>paymentMethod: "upi"</code> to specify UPI payment</p>
            <p>• Sets <code>upiMode: "intent"</code> to force UPI Intent flow</p>
            <p>• Uses <code>redirectTarget: "mobile"</code> for native apps</p>
            <p>• Configures app scheme for deep linking callbacks</p>
            <p>• Handles payment status through URL parameters</p>
            <p>• Based on <a href="https://www.cashfree.com/docs/payments/online/mobile/react-native#upi-intent-checkout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cashfree's official documentation</a></p>
          </div>
        </TabsContent>
        
        <TabsContent value="capacitor" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Settings className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">Capacitor Configuration</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-3">
            <div>
              <h3 className="font-medium text-white mb-1">1. Configure App URL Scheme</h3>
              <p>Add your app's URL scheme in <code>capacitor.config.ts</code>:</p>
              <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
{`{
  appId: 'com.yourapp.id',
  appName: 'Your App',
  webDir: 'dist',
  server: {
    androidScheme: '${appScheme}'
  }
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-1">2. Configure Deep Links</h3>
              <p>Add deep linking configuration for Android in <code>AndroidManifest.xml</code>:</p>
              <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
{`<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="${appScheme}" android:host="cashfree-callback" />
</intent-filter>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-1">3. iOS Configuration</h3>
              <p>Add to <code>Info.plist</code> to support UPI apps:</p>
              <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
{`<key>LSApplicationQueriesSchemes</key>
<array>
  <string>phonepe</string>
  <string>tez</string>
  <string>paytmmp</string>
  <string>bhim</string>
  <string>credpay</string>
</array>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>${appScheme}</string>
    </array>
  </dict>
</array>`}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Additional resources */}
      <div className="bg-gray-900 rounded-lg p-4 mt-4">
        <div className="flex items-center mb-2">
          <Link2 className="h-5 w-5 text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold">Resources</h2>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
          <li><a href="https://www.cashfree.com/docs/payments/online/mobile/react-native#upi-intent-checkout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cashfree React Native UPI Intent Documentation</a></li>
          <li><a href="https://capacitorjs.com/docs/apis/app#handling-deep-links" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Capacitor Deep Linking Documentation</a></li>
          <li><a href="https://www.cashfree.com/docs/payments/online/mobile/misc/upi_intent_support_js_sdk" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cashfree UPI Intent Support for JS SDK</a></li>
        </ul>
      </div>
    </div>
  );
};

export default UpiIntentDemo; 