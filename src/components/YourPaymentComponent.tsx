import { Cashfree, isAndroidDevice } from '../capacitor/cashfree';
import { useToast } from "@/hooks/use-toast";

const YourPaymentComponent = () => {
  const { toast } = useToast();
  
  const handlePayment = async () => {
    // Only proceed if we're on Android
    if (!isAndroidDevice()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This payment method is only available on Android devices",
      });
      return;
    }
    
    try {
      // Generate order ID (or get it from your backend)
      const orderId = `order_${Date.now()}`;
      
      // In a real implementation, you would call your backend to create a payment session
      // For example:
      // const response = await fetch('http://localhost:5000/api/create-cashfree-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId, amount: 100 })
      // });
      // const { paymentSessionId } = await response.json();
      
      // For testing, you can use a dummy session ID
      const paymentSessionId = "test_session_id";
      
      // Call the native Android plugin
      const result = await Cashfree.doWebPayment({
        paymentSessionId: paymentSessionId,
        orderId: orderId,
        environment: 'PRODUCTION' // Use 'SANDBOX' for testing
      });
      
      console.log('Payment result:', result);
      toast({
        title: "Payment Successful",
        description: `Order ID: ${result.orderId}`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
      });
    }
  };
  
  return (
    <Button 
      onClick={handlePayment}
      className="w-full"
    >
      Pay with Cashfree
    </Button>
  );
};