import React from 'react';
import BuyDialog from './BuyDialog';
import OrderDialog from './OrderDialog';
import { Button } from './ui/button';
import { History, Award, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';

const MainActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      <div className="flex gap-3">
        <BuyDialog />
        <OrderDialog />
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-12 border-gray-700 text-white bg-gray-900 hover:bg-gray-800 rounded-lg"
          onClick={() => navigate('/history')}
        >
          <History className="mr-2" size={16} />
          History
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 h-12 border-gray-700 text-white bg-gray-900 hover:bg-gray-800 rounded-lg"
          onClick={() => navigate('/rewards-new')}
        >
          <Award className="mr-2" size={16} />
          Rewards
        </Button>
      </div>
      
      <Button 
        variant="default" 
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        onClick={() => navigate('/payment')}
      >
        <CreditCard className="mr-2" size={16} />
        Make a Payment
      </Button>
      
      <HeroSection />
    </div>
  );
};

export default MainActions;
