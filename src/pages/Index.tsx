
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import InvestmentSummary from '../components/InvestmentSummary';
import InvestmentTabs from '../components/InvestmentTabs';
import MainActions from '../components/MainActions';
import FeatureIcons from '../components/FeatureIcons';
import InviteEarn from '../components/InviteEarn';
import Illustration from '../components/Illustration';

// Sample data for demonstration
const sampleData = {
  totalInvestment: 45872.35,
  gainPercentage: 2.34,
  gainAmount: 1045.67,
  investments: {
    gold: {
      type: 'gold' as const,  // Fixed type definition
      amount: 32450.75,
      weight: 5.5,
      weightUnit: 'grams',
      currentPrice: 5900.14,
      priceChange: 1.23,
    },
    silver: {
      type: 'silver' as const,  // Fixed type definition
      amount: 13421.60,
      weight: 250,
      weightUnit: 'grams',
      currentPrice: 75.32,
      priceChange: -0.45,
    }
  },
  chartData: {
    gold: [
      { date: 'Jan', price: 5400 },
      { date: 'Feb', price: 5600 },
      { date: 'Mar', price: 5500 },
      { date: 'Apr', price: 5800 },
      { date: 'May', price: 5750 },
      { date: 'Jun', price: 5900 },
    ],
    silver: [
      { date: 'Jan', price: 71 },
      { date: 'Feb', price: 73 },
      { date: 'Mar', price: 76 },
      { date: 'Apr', price: 72 },
      { date: 'May', price: 74 },
      { date: 'Jun', price: 75 },
    ]
  }
};

const Index: React.FC = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-off-white ${pageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className="p-4">
        <Header />
        
        <div className="space-y-6 mt-2 pb-6">
          <InvestmentSummary 
            totalAmount={sampleData.totalInvestment} 
            gainPercentage={sampleData.gainPercentage} 
            gainAmount={sampleData.gainAmount} 
          />
          
          <InvestmentTabs 
            investments={sampleData.investments} 
            chartData={sampleData.chartData} 
          />
          
          <MainActions />
          
          <FeatureIcons />
          
          <InviteEarn />
          
          <Illustration />
        </div>
      </div>
    </div>
  );
};

export default Index;
