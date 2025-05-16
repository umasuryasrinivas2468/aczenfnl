import React from 'react';
import { Button } from '@/components/ui/button';

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
    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount.toString()).toFixed(2);
    
    // Create the UPI deep link with required parameters
    const upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${formattedAmount}&tn=${encodeURIComponent(description)}&cu=INR`;
    
    return upiUrl;
  };

  // Handle button click
  const handleUpiClick = () => {
    const upiUrl = generateUpiUrl();
    console.log('Opening UPI URL:', upiUrl);
    
    // Try to open the UPI URL directly
    window.location.href = upiUrl;
  };

  if (!showButton) return null;

  return (
    <div className="mt-4">
      <Button 
        variant="default" 
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        onClick={handleUpiClick}
      >
        Pay with UPI App
      </Button>
      <p className="text-xs text-center mt-2 text-gray-400">
        This will open your UPI payment app directly
      </p>
    </div>
  );
};

export default UpiDeepLink; 