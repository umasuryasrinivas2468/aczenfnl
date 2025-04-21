
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import InvestmentSummary from '../components/InvestmentSummary';
import InvestmentTabs from '../components/InvestmentTabs';
import MainActions from '../components/MainActions';
import FeatureIcons from '../components/FeatureIcons';
import InviteEarn from '../components/InviteEarn';
import Illustration from '../components/Illustration';
import { usePreciousMetalPrices } from '../hooks/usePreciousMetalPrices';

// Real user investment data
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
  
  // Prepare data for InvestmentTabs with live prices
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
  
  // Generate realistic price chart data based on current prices
  const generateChartData = (type: 'gold' | 'silver', currentPrice: number) => {
    const today = new Date();
    const priceData = [];
    
    // Create data for the last 6 months with slight variations
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(today.getMonth() - i);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Calculate a price with some random variation (lower in the past)
      const variation = (5 - i) * 0.02; // Gradually increases as we approach current date
      let price;
      
      if (type === 'gold') {
        price = currentPrice * (1 - variation + (Math.random() * 0.04 - 0.02));
      } else {
        price = currentPrice * (1 - variation + (Math.random() * 0.04 - 0.02));
      }
      
      priceData.push({
        date: monthName,
        price: Number(price.toFixed(2))
      });
    }
    
    return priceData;
  };
  
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Generate chart data based on current prices
  const chartData = {
    gold: generateChartData('gold', goldPrice),
    silver: generateChartData('silver', silverPrice),
  };

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
