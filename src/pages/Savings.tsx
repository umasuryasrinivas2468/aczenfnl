
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PiggyBank } from 'lucide-react';

const SavingsSchemes = [
  {
    title: 'Fixed Deposit',
    description: 'Earn up to 7.5% interest with secure fixed deposits',
    duration: '6 months - 5 years',
    minAmount: '₹10,000'
  },
  {
    title: 'Recurring Deposit',
    description: 'Build your savings with monthly deposits',
    duration: '12 - 60 months',
    minAmount: '₹1,000/month'
  },
  {
    title: 'Tax Saver Account',
    description: 'Save tax under Section 80C with high returns',
    duration: '5 years lock-in',
    minAmount: '₹500'
  }
];

const Savings = () => {
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
        <h1 className="text-xl font-bold text-dark-blue">Savings Plans</h1>
      </div>

      <div className="space-y-4">
        {SavingsSchemes.map((scheme, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="bg-vibrant-red/10 p-3 rounded-lg">
                  <PiggyBank className="text-vibrant-red" size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-lg text-dark-blue">{scheme.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{scheme.description}</p>
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-vibrant-red">Duration: {scheme.duration}</span>
                    <span className="text-dark-blue">Min: {scheme.minAmount}</span>
                  </div>
                  <Button className="w-full mt-4 bg-vibrant-red hover:bg-vibrant-red/90">
                    Open Account
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

export default Savings;
