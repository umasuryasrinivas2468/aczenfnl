import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface UpiDeepLinkProps {
  vpa: string;
  amount: number;
  description: string;
  name: string;
  showButton?: boolean;
}

const UpiDeepLink: React.FC<UpiDeepLinkProps> = ({
  vpa,
  amount,
  description,
  name,
  showButton = true
}) => {
  // Generate UPI deep link URL
  const generateUpiUrl = () => {
    const formattedAmount = parseFloat(amount.toString()).toFixed(2);
    return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${formattedAmount}&tn=${encodeURIComponent(description)}&cu=INR`;
  };

  // Handle button click
  const handleUpiClick = () => {
    try {
      const upiUrl = generateUpiUrl();
      console.log('Opening UPI deep link:', upiUrl);
      
      // Check if we already have a pending transaction in progress
      const pendingTxJson = localStorage.getItem('pendingTransaction');
      let orderId = `direct_upi_${Date.now()}`;
      
      if (pendingTxJson) {
        try {
          const pendingTx = JSON.parse(pendingTxJson);
          // Use the existing order ID if we have one
          if (pendingTx.orderId) {
            orderId = pendingTx.orderId;
            console.log(`Using existing order ID ${orderId} for UPI deep link`);
          }
        } catch (e) {
          console.error('Error parsing pendingTransaction:', e);
        }
      }
      
      // Store the payment attempt in localStorage
      localStorage.setItem('last_upi_attempt', JSON.stringify({
        orderId,
        vpa,
        amount,
        description,
        timestamp: new Date().toISOString()
      }));
      
      // Set a timeout to show a message if the UPI app doesn't open
      const timeout = setTimeout(() => {
        toast("If your UPI app didn't open, you may need to install a UPI app like Google Pay, PhonePe, or BHIM", {
          duration: 5000
        });
      }, 3000);
      
      // Navigate to UPI URL
      window.location.href = upiUrl;
      
      // Clear the timeout if the page is still active after navigation
      return () => clearTimeout(timeout);
    } catch (error) {
      console.error('Error opening UPI app:', error);
      toast.error('Failed to open UPI app. Try the payment button instead.');
    }
  };

  if (!showButton) return null;

  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 border-green-600 text-green-500"
      onClick={handleUpiClick}
    >
      <Smartphone size={18} />
      Open UPI App Directly
    </Button>
  );
};

export default UpiDeepLink; 