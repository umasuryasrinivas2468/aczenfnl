
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ArrowUp } from 'lucide-react';
import PriceChart from './PriceChart';

interface InvestmentType {
  type: 'gold' | 'silver';
  amount: number;
  weight: number;
  weightUnit: string;
  currentPrice: number;
  priceChange: number;
}

interface InvestmentTabsProps {
  investments: {
    gold: InvestmentType;
    silver: InvestmentType;
  };
  chartData: {
    gold: { date: string; price: number }[];
    silver: { date: string; price: number }[];
  };
}

const InvestmentTabs: React.FC<InvestmentTabsProps> = ({ investments, chartData }) => {
  const [activeTab, setActiveTab] = useState<'gold' | 'silver'>('gold');

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'gold' | 'silver');
  };

  return (
    <Tabs defaultValue="gold" className="w-full animate-fade-in" onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-2 h-12 mb-4">
        <TabsTrigger
          value="gold"
          className="data-[state=active]:bg-dark-blue data-[state=active]:text-white"
        >
          Gold
        </TabsTrigger>
        <TabsTrigger
          value="silver"
          className="data-[state=active]:bg-dark-blue data-[state=active]:text-white"
        >
          Silver
        </TabsTrigger>
      </TabsList>

      {['gold', 'silver'].map((type) => (
        <TabsContent 
          key={type} 
          value={type}
          className={`${activeTab === type ? 'animate-fade-in' : ''}`}
        >
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 capitalize">{type} Investment</p>
                <p className="text-xl font-bold text-dark-blue">
                  ₹{investments[type as 'gold' | 'silver'].amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {investments[type as 'gold' | 'silver'].weight} {investments[type as 'gold' | 'silver'].weightUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Market Price</p>
                <p className="text-xl font-bold text-dark-blue">
                  ₹{investments[type as 'gold' | 'silver'].currentPrice.toLocaleString()}
                </p>
                <div className="flex items-center">
                  <ArrowUp
                    size={12}
                    className={`${
                      investments[type as 'gold' | 'silver'].priceChange < 0 ? 'rotate-180 text-red-500' : 'text-green-500'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      investments[type as 'gold' | 'silver'].priceChange < 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {Math.abs(investments[type as 'gold' | 'silver'].priceChange).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <PriceChart 
              data={chartData[type as 'gold' | 'silver']} 
              color={type === 'gold' ? '#0a2463' : '#3e92cc'} 
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default InvestmentTabs;
