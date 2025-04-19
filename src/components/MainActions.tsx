
import React from 'react';
import { Button } from './ui/button';
import { Sell, Coins } from 'lucide-react';

const MainActions: React.FC = () => {
  return (
    <div className="flex gap-3 mb-6 animate-fade-in">
      <Button className="flex-1 h-14 bg-dark-blue hover:bg-dark-blue/90 text-white rounded-lg">
        <Coins className="mr-2" size={18} />
        Buy
      </Button>
      <Button variant="outline" className="flex-1 h-14 border-dark-blue text-dark-blue hover:bg-dark-blue/5 rounded-lg">
        <Sell className="mr-2" size={18} />
        Sell
      </Button>
    </div>
  );
};

export default MainActions;
