import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Calendar, CreditCard, Tag } from 'lucide-react';

interface PaymentReceiptProps {
    orderId: string;
    amount: number;
  date: string;
    paymentMethod: string;
  transactionId: string;
  metalType: 'gold' | 'silver';
    customerName?: string;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  orderId,
  amount,
  date,
  paymentMethod,
  transactionId,
  metalType,
  customerName
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-white rounded-full p-2 mb-4"
        >
          <Check className="h-10 w-10 text-green-500" />
        </motion.div>
        <h1 className="text-xl font-bold text-white">Payment Successful!</h1>
        <p className="text-white/80 text-sm mt-1">
          Your {metalType} investment has been processed
        </p>
      </div>
      
      {/* Receipt Content */}
      <div className="p-6">
        <div className="flex flex-col gap-4">
          {/* Amount */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount</span>
            <span className="text-xl font-bold">₹{formatCurrency(amount)}</span>
          </div>
          
          {/* Asset Type */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Asset</span>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1 text-gray-400" />
              <span className="capitalize">{metalType}</span>
              </div>
            </div>
            
          {/* Payment Method */}
          <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Method</span>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
              <span>{paymentMethod}</span>
              </div>
              </div>
          
          {/* Date & Time */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Date & Time</span>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              <span className="text-sm">{new Date(date).toLocaleString()}</span>
            </div>
            </div>
            
          {/* Customer Name (if provided) */}
          {customerName && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Customer</span>
              <span>{customerName}</span>
            </div>
          )}
          
          {/* Transaction ID */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction ID</span>
            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{transactionId}</span>
          </div>
          
          {/* Order ID */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Order ID</span>
            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{orderId}</span>
          </div>
        </div>
        </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <p className="text-center text-xs text-gray-400">
          Thank you for investing with us. Your investment is now active.
        </p>
    </div>
    </motion.div>
  );
};

export default PaymentReceipt; 