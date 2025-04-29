import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import InvestmentSummary from '../components/InvestmentSummary';
import InvestmentTabs from '../components/InvestmentTabs';
import MainActions from '../components/MainActions';
import FeatureIcons from '../components/FeatureIcons';
import InviteEarn from '../components/InviteEarn';
import Illustration from '../components/Illustration';
import { usePreciousMetalPrices } from '../hooks/usePreciousMetalPrices';
import { User, Tag, Trophy, Package } from 'lucide-react';

// Define types for investments
type MetalType = 'gold' | 'silver';

interface Investment {
  type: MetalType;
  amount: number;      // Amount in INR
  weight: number;      // Weight in grams
  weightUnit: string;
}

interface UserInvestments {
  totalInvestment: number;
  investments: {
    gold: Investment;
    silver: Investment;
  };
}

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [pageLoaded, setPageLoaded] = useState(false);
  const { gold: goldPrice, silver: silverPrice, isLoading } = usePreciousMetalPrices();
  
  // Dynamic user investment data based on live prices
  const [userInvestments, setUserInvestments] = useState<UserInvestments>({
    totalInvestment: 0,
    investments: {
      gold: {
        type: 'gold',
        amount: 0,
        weight: 0,      // Starting with 0 weight (no investment)
        weightUnit: 'grams',
      },
      silver: {
        type: 'silver',
        amount: 0,
        weight: 0,      // Starting with 0 weight (no investment)
        weightUnit: 'grams',
      }
    },
  });
  
  // Update investment amounts when prices change
  useEffect(() => {
    if (!isLoading) {
      const goldAmount = userInvestments.investments.gold.weight * goldPrice;
      const silverAmount = userInvestments.investments.silver.weight * silverPrice;
      const totalInvestment = goldAmount + silverAmount;
      
      setUserInvestments({
        totalInvestment,
        investments: {
          gold: {
            ...userInvestments.investments.gold,
            amount: goldAmount
          },
          silver: {
            ...userInvestments.investments.silver,
            amount: silverAmount
          }
        }
      });
    }
  }, [goldPrice, silverPrice, isLoading]);
  
  // Calculate current value and gains based on live prices
  const calculateCurrentValue = () => {
    if (isLoading) return { currentValue: 0, gainAmount: 0, gainPercentage: 0 };
    
    const goldValue = userInvestments.investments.gold.weight * goldPrice;
    const silverValue = userInvestments.investments.silver.weight * silverPrice;
    const currentValue = goldValue + silverValue;
    
    // If no investments yet, return zeros
    if (currentValue === 0 || userInvestments.totalInvestment === 0) {
      return { currentValue: 0, gainAmount: 0, gainPercentage: 0 };
    }
    
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
    <div className={`max-w-md mx-auto min-h-screen bg-black text-white ${pageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 pb-16`}>
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
