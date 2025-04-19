
import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, History } from 'lucide-react';

const MainActions: React.FC = () => {
  return (
    <div className="flex gap-3 mb-6 animate-fade-in">
      <Button className="flex-1 h-14 bg-dark-blue hover:bg-dark-blue/90 text-white rounded-lg">
        <ArrowRight className="mr-2" size={18} />
        Hero Section
      </Button>
      <Button variant="outline" className="flex-1 h-14 border-dark-blue text-dark-blue hover:bg-dark-blue/5 rounded-lg">
        <History className="mr-2" size={18} />
        History
      </Button>
    </div>
  );
};

export default MainActions;
