import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Code, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { openUpiIntentUrl } from '@/components/UpiIntentWebViewBridge';
import { Capacitor } from '@capacitor/core';

const ReactNativeWebViewDemo: React.FC = () => {
  const webViewRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAndroid = Capacitor.getPlatform() === 'android';

  const handleUpiIntentDetected = (upiUrl: string) => {
    toast({
      title: "UPI Intent URL Detected",
      description: `Opening UPI app with URL: ${upiUrl.substring(0, 30)}...`
    });
    
    // In a real React Native app, this would open the UPI app
    openUpiIntentUrl(upiUrl);
  };

  const simulateUpiIntent = () => {
    setIsLoading(true);
    
    // Simulate a UPI Intent URL detection
    setTimeout(() => {
      const demoUpiUrl = "upi://pay?pa=example@ybl&pn=Example%20Merchant&am=100.00&tr=ABC123&cu=INR";
      handleUpiIntentDetected(demoUpiUrl);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">React Native WebView UPI Intent</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>WebView UPI Intent Bridge</CardTitle>
          <CardDescription>
            Intercept UPI Intent URLs from WebView and handle them natively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              This approach uses a JavaScript bridge to intercept UPI Intent URLs in a WebView
              and handle them natively in React Native, as recommended by Cashfree's documentation.
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> This is a simulation. In a real React Native app, this would
                inject JavaScript into a WebView to intercept UPI Intent URLs.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={simulateUpiIntent} 
            disabled={isLoading || !isAndroid}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Simulate UPI Intent"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">WebView UPI Intent Bridge</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <p>This approach is based on Cashfree's documentation for handling UPI Intent URLs in WebViews:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Inject a JavaScript bridge into the WebView</li>
              <li>Intercept UPI Intent URLs (upi://, gpay://, phonepe://, etc.)</li>
              <li>Send the URLs to the native layer via the bridge</li>
              <li>Open the appropriate UPI app using the device's native capabilities</li>
            </ol>
          </div>
        </TabsContent>
        
        <TabsContent value="implementation" className="bg-gray-900 rounded-lg p-4 mt-2">
          <div className="flex items-center mb-2">
            <Code className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">Implementation Details</h2>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Based on <a href="https://www.cashfree.com/docs/payments/online/mobile/misc/upi_intent_support_js_sdk#react-native" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cashfree's documentation</a>:</p>
            <pre className="text-xs bg-gray-800 p-3 rounded-md overflow-auto mt-2">
{`// React Native WebView implementation
onShouldStartLoadWithRequest={event => {
  const url = event.url;
  if (url.startsWith("upi://pay") 
      || url.startsWith("tez://")
      || url.startsWith("gpay://")
      || url.startsWith("paytmmp://")
      || url.startsWith("phonepe://")) {
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("No app can handle this URL");
      }
    });
    return false;
  }
  return true;
}}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReactNativeWebViewDemo; 