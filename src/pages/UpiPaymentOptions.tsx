import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UpiPaymentOptions: React.FC = () => {
  const navigate = useNavigate();

  const paymentOptions = [
    {
      title: "UPI Intent Demo",
      description: "Direct UPI Intent implementation using Capacitor",
      route: "/upi-intent",
      primary: true
    },
    {
      title: "React Native UPI SDK",
      description: "UPI Intent using Cashfree's React Native SDK",
      route: "/react-native-upi",
      primary: false
    },
    {
      title: "WebView UPI Bridge",
      description: "UPI Intent using WebView with JavaScript bridge",
      route: "/react-native-webview",
      primary: false
    },
    {
      title: "Mobile Checkout",
      description: "Cashfree Mobile Checkout with UPI Intent",
      route: "/mobile-checkout",
      primary: false
    },
    {
      title: "Debug UPI Intent",
      description: "Troubleshoot UPI Intent issues with detailed logging",
      route: "/upi-intent-debug",
      primary: false,
      icon: <Bug className="h-4 w-4 mr-1" />
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">UPI Payment Options</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentOptions.map((option, index) => (
          <Card key={index} className={option.primary ? "border-blue-500 border-2" : ""}>
            <CardHeader>
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={() => navigate(option.route)}
                variant={option.primary ? "default" : "outline"}
                className="w-full"
              >
                {option.icon}
                View Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">About UPI Intent</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          UPI Intent is a payment flow that allows users to make payments directly through UPI apps 
          installed on their device. This provides a seamless payment experience without requiring 
          users to enter UPI details manually.
        </p>
        <div className="mt-4">
          <Button variant="link" onClick={() => window.open("https://www.cashfree.com/docs/payments/online/mobile/misc/upi_intent_support_js_sdk", "_blank")}>
            View Cashfree Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentOptions; 