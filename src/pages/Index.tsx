
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import InvestmentSummary from '../components/InvestmentSummary';
import InvestmentTabs from '../components/InvestmentTabs';
import MainActions from '../components/MainActions';
import FeatureIcons from '../components/FeatureIcons';
import InviteEarn from '../components/InviteEarn';
import Illustration from '../components/Illustration';
import { usePreciousMetalPrices } from '../hooks/usePreciousMetalPrices';

// Sample data for demonstration - in production, this would come from an API
const userInvestments = {
  totalInvestment: 11000, // Total amount the user has invested
  investments: {
    gold: {
      type: 'gold' as const,
      amount: 8000,      // Amount in INR
      weight: 1.35,      // Weight in grams
      weightUnit: 'grams',
    },
    silver: {
      type: 'silver' as const,
      amount: 3000,      // Amount in INR
      weight: 35,        // Weight in grams
      weightUnit: 'grams',
    }
  },
};

const Index: React.FC = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const { gold: goldPrice, silver: silverPrice, isLoading } = usePreciousMetalPrices();
  
  // Calculate current value and gains based on live prices
  const calculateCurrentValue = () => {
    if (isLoading) return { currentValue: 0, gainAmount: 0, gainPercentage: 0 };
    
    const goldValue = userInvestments.investments.gold.weight * goldPrice;
    const silverValue = userInvestments.investments.silver.weight * silverPrice;
    const currentValue = goldValue + silverValue;
    const gainAmount = currentValue - userInvestments.totalInvestment;
    const gainPercentage = (gainAmount / userInvestments.totalInvestment) * 100;
    
    return {
      currentValue,
      gainAmount,
      gainPercentage,
    };
  };
  
  const { currentValue, gainAmount, gainPercentage } = calculateCurrentValue();
  
  // Prepare data for InvestmentTabs
  const investmentsWithPrices = {
    gold: {
      ...userInvestments.investments.gold,
      currentPrice: goldPrice,
      priceChange: 1.23, // This would come from API in production
    },
    silver: {
      ...userInvestments.investments.silver,
      currentPrice: silverPrice,
      priceChange: -0.45, // This would come from API in production
    }
  };
  
  // Sample chart data - in production, this would come from an API
  const chartData = {
    gold: [
      { date: 'Jan', price: 5400 },
      { date: 'Feb', price: 5600 },
      { date: 'Mar', price: 5500 },
      { date: 'Apr', price: 5800 },
      { date: 'May', price: 5750 },
      { date: 'Jun', price: goldPrice - 100 },
    ],
    silver: [
      { date: 'Jan', price: 71 },
      { date: 'Feb', price: 73 },
      { date: 'Mar', price: 76 },
      { date: 'Apr', price: 72 },
      { date: 'May', price: 74 },
      { date: 'Jun', price: silverPrice - 5 },
    ]
  };
  
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-off-white ${pageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className="p-4">
        <Header />
        
        <div className="space-y-6 mt-2 pb-6">
          <InvestmentSummary 
            totalAmount={userInvestments.totalInvestment} 
            gainPercentage={gainPercentage} 
            gainAmount={gainAmount} 
          />
          
          <InvestmentTabs 
            investments={investmentsWithPrices} 
            chartData={chartData} 
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
