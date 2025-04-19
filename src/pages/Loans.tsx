
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, BriefcaseMedical, Loan } from 'lucide-react';

const LoanSchemes = [
  {
    title: 'Personal Loan',
    icon: Briefcase,
    description: 'Get instant personal loans up to ₹25 lakhs',
    interest: '10.49% p.a',
    timeline: '12-60 months'
  },
  {
    title: 'Business Loan',
    icon: BriefcaseMedical,
    description: 'Grow your business with loans up to ₹50 lakhs',
    interest: '12.99% p.a',
    timeline: '12-84 months'
  },
  {
    title: 'Gold Loan',
    icon: Loan,
    description: 'Get loans against your gold jewelry',
    interest: '8.99% p.a',
    timeline: '3-24 months'
  }
];

const Loans = () => {
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
        <h1 className="text-xl font-bold text-dark-blue">Loan Schemes</h1>
      </div>

      <div className="space-y-4">
        {LoanSchemes.map((scheme, index) => (
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
                    <span className="text-vibrant-red">Interest: {scheme.interest}</span>
                    <span className="text-dark-blue">Tenure: {scheme.timeline}</span>
                  </div>
                  <Button className="w-full mt-4 bg-dark-blue hover:bg-dark-blue/90">
                    Apply Now
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

export default Loans;
