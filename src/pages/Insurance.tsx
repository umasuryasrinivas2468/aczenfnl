
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, ShieldCheck, ShieldPlus } from 'lucide-react';

const InsuranceSchemes = [
  {
    title: 'Health Insurance',
    icon: ShieldPlus,
    description: 'Comprehensive health coverage for you and your family',
    coverage: '₹5 Lakhs - ₹1 Crore',
    premium: 'Starting ₹499/month'
  },
  {
    title: 'Life Insurance',
    icon: Shield,
    description: "Secure your family's future with term life insurance",
    coverage: '₹50 Lakhs - ₹2 Crore',
    premium: 'Starting ₹399/month'
  },
  {
    title: 'Vehicle Insurance',
    icon: ShieldCheck,
    description: 'Protect your vehicle with comprehensive coverage',
    coverage: 'IDV based',
    premium: 'Starting ₹299/month'
  }
];

const Insurance = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-off-white p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mr-2"
        >
          <ArrowRight className="rotate-180" size={20} />
        </Button>
        <h1 className="text-xl font-bold text-dark-blue">Insurance Plans</h1>
      </div>

      <div className="space-y-4">
        {InsuranceSchemes.map((scheme, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="bg-light-blue/10 p-3 rounded-lg">
                  <scheme.icon className="text-light-blue" size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-lg text-dark-blue">{scheme.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{scheme.description}</p>
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-vibrant-red">Coverage: {scheme.coverage}</span>
                    <span className="text-dark-blue">{scheme.premium}</span>
                  </div>
                  <Button className="w-full mt-4 bg-dark-blue hover:bg-dark-blue/90">
                    Get Quote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Insurance;
