import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bug, CheckCircle, Code, CreditCard, Info, RefreshCw, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CashfreeUpiIntentNative from '@/components/CashfreeUpiIntentNative';
import { Capacitor } from '@capacitor/core';
import { createCashfreeOrder, verifyPaymentStatus } from '@/services/cashfreeBackendService';

const UpiIntentDebugDemo: React.FC = () => {
  const [amount, setAmount] = useState<string>("100");
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const [appId, setAppId] = useState<string>("TEST123456789ABCDEFGHIJKL");
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState<string>("Test User");
  const [customerEmail, setCustomerEmail] = useState<string>("test@example.com");
  const [customerPhone, setCustomerPhone] = useState<string>("9876543210");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Collect device information
    collectDeviceInfo();
    
    // Add initial log
    addLog("Debug page initialized");
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const collectDeviceInfo = () => {
    const info: any = {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    setDeviceInfo(info);
    addLog(`Device info collected: ${info.platform}, Native: ${info.isNative}`);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAppIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppId(e.target.value);
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
  };

  const handleCustomerEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerEmail(e.target.value);
  };

  const handleCustomerPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerPhone(e.target.value);
  };

  const toggleEnvironment = () => {
    setEnvironment(prev => prev === 'PRODUCTION' ? 'SANDBOX' : 'PRODUCTION');
    addLog(`Environment switched to ${environment === 'PRODUCTION' ? 'SANDBOX' : 'PRODUCTION'}`);
  };

  const createOrder = async () => {
    if (isCreatingOrder) return;

    setIsCreatingOrder(true);
    addLog(`Creating order for amount ${amount}`);
    
    try {
      // Generate a unique order ID
      const newOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      setOrderId(newOrderId);
      addLog(`Order ID generated: ${newOrderId}`);
      
      // Create order using the backend service
      const orderResult = await createCashfreeOrder({
        orderId: newOrderId,
        amount: Number(amount),
        customerName,
        customerEmail,
        customerPhone
      }, environment);
      
      if (orderResult.success && orderResult.paymentSessionId) {
        setPaymentSessionId(orderResult.paymentSessionId);
        addLog(`Payment session ID received: ${orderResult.paymentSessionId}`);
        
        toast({
          title: "Order Created",
          description: `Order ID: ${newOrderId}`
        });
      } else {
        addLog(`Order creation failed: ${orderResult.error || 'Unknown error'}`);
        toast({
          variant: "destructive",
          title: "Order Creation Failed",
          description: orderResult.error || "Failed to create order"
        });
      }
    } catch (error) {
      console.error("Order creation error:", error);
      addLog(`Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        variant: "destructive",
        title: "Order Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create order"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const verifyPayment = async () => {
    if (!orderId || isVerifying) return;
    
    setIsVerifying(true);
    addLog(`Verifying payment status for order: ${orderId}`);
    
    try {
      const result = await verifyPaymentStatus({
        orderId,
        environment
      });
      
      setPaymentStatus(result);
      
      if (result.success) {
        addLog(`Payment status: ${result.status}`);
        toast({
          title: "Payment Status",
          description: `Status: ${result.status}`
        });
      } else {
        addLog(`Payment verification failed: ${result.error || 'Unknown error'}`);
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error || "Failed to verify payment"
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      addLog(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify payment"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    addLog(`Payment successful: ${JSON.stringify(data)}`);
    
    // Verify payment status automatically
    verifyPayment();
    
    toast({
      title: "Payment Successful",
      description: `Order ${data.orderId} paid successfully`
    });
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    addLog(`Payment failed: ${JSON.stringify(error)}`);
    
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error?.message || "Payment could not be processed"
    });
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Logs cleared");
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">UPI Intent Debug Demo</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bug className="h-5 w-5 mr-2 text-yellow-500" />
            Cashfree UPI Intent Debugging
          </CardTitle>
          <CardDescription>
            Debug and troubleshoot UPI Intent payment issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="1"
                  max="100000"
                />
              </div>
              <div>
                <Label htmlFor="appId">App ID</Label>
                <Input
                  id="appId"
                  type="text"
                  value={appId}
                  onChange={handleAppIdChange}
                  placeholder="Your Cashfree App ID"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={handleCustomerNameChange}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={handleCustomerEmailChange}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={handleCustomerPhoneChange}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Environment</Label>
                <div className="flex items-center mt-1">
                  <div className={`px-3 py-1 text-xs rounded-md ${environment === 'SANDBOX' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {environment}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleEnvironment} 
                    className="ml-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Toggle
                  </Button>
                </div>
              </div>
              
              <Button onClick={createOrder} disabled={isCreatingOrder}>
                {isCreatingOrder ? (
                  <div className="flex items-center">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Order"
                )}
              </Button>
            </div>
            
            {orderId && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-sm font-medium">Order ID: <span className="font-mono">{orderId}</span></p>
                {paymentSessionId && (
                  <p className="text-sm font-medium mt-1">Session ID: <span className="font-mono text-xs">{paymentSessionId}</span></p>
                )}
                
                {orderId && (
                  <div className="mt-2 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={verifyPayment}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <div className="flex items-center">
                          <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Verify Payment
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {paymentStatus && paymentStatus.success && (
              <div className={`p-3 rounded-md ${
                paymentStatus.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                paymentStatus.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                <div className="flex items-center">
                  {paymentStatus.status === 'PAID' && <CheckCircle className="h-4 w-4 mr-2" />}
                  <p className="font-medium">Payment Status: {paymentStatus.status}</p>
                </div>
                {paymentStatus.paymentDetails && (
                  <div className="mt-2 text-xs">
                    <p>Payment Mode: {paymentStatus.paymentDetails.paymentMode}</p>
                    <p>Transaction Time: {new Date(paymentStatus.paymentDetails.txTime).toLocaleString()}</p>
                    {paymentStatus.paymentDetails.paymentInstrument?.utr && (
                      <p>UTR: {paymentStatus.paymentDetails.paymentInstrument.utr}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <CashfreeUpiIntentNative
            orderId={orderId}
            amount={Number(amount)}
            paymentSessionId={paymentSessionId}
            appId={appId}
            environment={environment}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            className="w-full"
            buttonText="Pay with UPI"
            debug={true}
          />
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="logs">Debug Logs</TabsTrigger>
          <TabsTrigger value="device">Device Info</TabsTrigger>
          <TabsTrigger value="help">Troubleshooting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Code className="h-5 w-5 text-blue-400 mr-2" />
              Debug Logs
            </h2>
            <Button variant="ghost" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
          <div className="text-xs text-gray-300 bg-gray-800 p-3 rounded-md h-60 overflow-auto font-mono">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-700 last:border-0">
                  {log}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No logs yet</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="device" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Device Information</h2>
          </div>
          <div className="text-xs text-gray-300 bg-gray-800 p-3 rounded-md overflow-auto">
            <pre>{JSON.stringify(deviceInfo, null, 2)}</pre>
          </div>
          <Button variant="ghost" size="sm" onClick={collectDeviceInfo} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Info
          </Button>
        </TabsContent>
        
        <TabsContent value="help" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Shield className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Troubleshooting</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-3">
            <div>
              <h3 className="font-medium text-white">Common Issues:</h3>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>"Payment Gateway not installed in mobile" - Check if UPI apps are installed on the device</li>
                <li>"SDK Error" - Ensure Cashfree SDK is properly initialized</li>
                <li>"Missing Session ID" - Backend must generate a valid payment session ID</li>
                <li>No UPI apps opening - Check AndroidManifest.xml for proper permissions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Required in AndroidManifest.xml:</h3>
              <pre className="text-xs bg-gray-800 p-2 rounded-md overflow-auto mt-1">
{`<queries>
  <package android:name="com.google.android.apps.nbu.paisa.user" /> <!-- Google Pay -->
  <package android:name="net.one97.paytm" /> <!-- Paytm -->
  <package android:name="com.phonepe.app" /> <!-- PhonePe -->
  <!-- Add other UPI apps as needed -->
</queries>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Check UPI App Installation:</h3>
              <p>Use the "Check UPI Apps" button in the debug section to verify if UPI apps are installed and accessible.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Backend Requirements:</h3>
              <p>Your backend must create an order with Cashfree and return a valid payment session ID.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UpiIntentDebugDemo; 