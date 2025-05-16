import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Check, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

interface PaymentReceiptProps {
  data: {
    orderId: string;
    amount: number;
    status: string;
    timestamp: string;
    paymentMethod: string;
    customerName?: string;
  };
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ data }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          backgroundColor: '#121212',
          logging: false
        });
        
        const imageData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `payment-receipt-${data.orderId}.png`;
        link.click();
      } catch (error) {
        console.error('Error generating receipt:', error);
      }
    }
  };

  const handleShare = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          backgroundColor: '#121212',
          logging: false
        });
        
        const imageData = canvas.toDataURL('image/png');
        
        // If Web Share API is available
        if (navigator.share) {
          const blob = await (await fetch(imageData)).blob();
          const file = new File([blob], `payment-receipt-${data.orderId}.png`, { type: 'image/png' });
          
          await navigator.share({
            title: 'Payment Receipt',
            text: `Payment Receipt for order ${data.orderId}`,
            files: [file]
          });
        } else {
          // Fallback to clipboard copy
          const link = document.createElement('a');
          link.href = imageData;
          link.download = `payment-receipt-${data.orderId}.png`;
          link.click();
        }
      } catch (error) {
        console.error('Error sharing receipt:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-center flex justify-center items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Payment Receipt
          </CardTitle>
        </CardHeader>
        
        <div ref={receiptRef}>
          <CardContent className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <h3 className="text-center text-lg font-bold mb-1">Payment Successful</h3>
            <p className="text-center text-gray-400 text-sm mb-4">
              Your payment has been processed successfully
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount</span>
                <span className="font-semibold">₹{data.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Payment Method</span>
                <span>{data.paymentMethod}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Date</span>
                <span>{format(new Date(data.timestamp), 'dd MMM yyyy, hh:mm a')}</span>
              </div>
              <Separator className="my-2 bg-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID</span>
                <span className="text-xs text-gray-300">{data.orderId}</span>
              </div>
            </div>
            
            <div className="text-center pt-2 pb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                {data.status === 'PAID' ? 'PAID' : 'COMPLETED'}
              </div>
            </div>
          </CardContent>
        </div>

        <CardFooter className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex gap-1 items-center w-full"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentReceipt; 