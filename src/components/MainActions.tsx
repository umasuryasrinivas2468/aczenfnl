
import React from 'react';
import BuyDialog from './BuyDialog';
import SellDialog from './SellDialog';

const MainActions: React.FC = () => {
  return (
    <div className="flex gap-3 mb-6 animate-fade-in">
      <BuyDialog />
      <SellDialog />
    </div>
  );
};

export default MainActions;
