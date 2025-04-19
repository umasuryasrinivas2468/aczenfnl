
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Shield, CreditCard, PiggyBank } from 'lucide-react';

const FeatureIcons: React.FC = () => {
  const features = [
    {
      title: 'Insurance',
      icon: Shield,
      color: 'bg-dark-blue/10 text-dark-blue',
    },
    {
      title: 'Loans',
      icon: ArrowTrendingUp,
      color: 'bg-light-blue/10 text-light-blue',
    },
    {
      title: 'Savings',
      icon: PiggyBank,
      color: 'bg-vibrant-red/10 text-vibrant-red',
    },
    {
      title: 'Credit',
      icon: CreditCard,
      color: 'bg-dark-blue/10 text-dark-blue',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in">
      {features.map((feature, index) => (
        <Card key={index} className="border-none shadow-sm overflow-hidden group">
          <CardContent className="p-0">
            <button className="w-full h-full flex flex-col items-center justify-center py-4 px-2 transition-all hover:bg-gray-50">
              <div className={`rounded-full p-3 ${feature.color} mb-2 transition-transform group-hover:scale-110`}>
                <feature.icon size={18} />
              </div>
              <span className="text-xs text-charcoal-black">{feature.title}</span>
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Custom icon for Loans since it's not in the Lucide set
const ArrowTrendingUp = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 7L7 17"/>
    <path d="M17 17V7H7"/>
  </svg>
);

export default FeatureIcons;
