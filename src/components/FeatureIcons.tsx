
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Shield, CreditCard, PiggyBank, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureIcons: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Insurance',
      icon: Shield,
      color: 'bg-dark-blue/10 text-dark-blue',
      route: '/insurance'
    },
    {
      title: 'Loans',
      icon: Briefcase,  // Replaced 'Loan' with 'Briefcase'
      color: 'bg-light-blue/10 text-light-blue',
      route: '/loans'
    },
    {
      title: 'Savings',
      icon: PiggyBank,
      color: 'bg-vibrant-red/10 text-vibrant-red',
      route: '/savings'
    },
    {
      title: 'Credit',
      icon: CreditCard,
      color: 'bg-dark-blue/10 text-dark-blue',
      route: '/credit'
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in">
      {features.map((feature, index) => (
        <Card key={index} className="border-none shadow-sm overflow-hidden group">
          <CardContent className="p-0">
            <button 
              onClick={() => navigate(feature.route)}
              className="w-full h-full flex flex-col items-center justify-center py-4 px-2 transition-all hover:bg-gray-50"
            >
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

export default FeatureIcons;
