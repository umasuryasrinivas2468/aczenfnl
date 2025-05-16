import React from 'react';
import { ArrowUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface InvestmentSummaryProps {
  totalAmount: number;
  gainPercentage: number;
  gainAmount: number;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  totalAmount,
  gainPercentage,
  gainAmount
}) => {
  const isPositive = gainPercentage > 0;

  return (
    <Card className="w-full border-none shadow-sm bg-[#202938] animate-fade-in">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-gray-300">Total Invested Amount</p>
          <div className="flex items-end">
            <h2 className="text-3xl font-bold text-white">₹{totalAmount.toLocaleString()}</h2>
            <div className={`flex items-center ml-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <ArrowUp size={16} className={`${!isPositive && 'rotate-180'}`} />
              <span className="text-sm font-medium">{Math.abs(gainPercentage).toFixed(2)}%</span>
            </div>
          </div>
          <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : '-'}₹{Math.abs(gainAmount).toLocaleString()} today
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummary;
