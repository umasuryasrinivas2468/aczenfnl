import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Credit = () => {
  const [score, setScore] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    creditUtilization: '',
    paymentHistory: '',
    creditHistory: '',
    newCredit: '',
    creditMix: ''
  });

  const calculateCreditScore = () => {
    // Simple credit score calculation (for demonstration)
    const utilization = Math.min(parseInt(formData.creditUtilization) || 0, 100);
    const payments = Math.min(parseInt(formData.paymentHistory) || 0, 100);
    const history = Math.min(parseInt(formData.creditHistory) || 0, 100);
    const newCredit = Math.min(parseInt(formData.newCredit) || 0, 100);
    const mix = Math.min(parseInt(formData.creditMix) || 0, 100);

    const weightedScore = 
      (utilization * 0.3) + 
      (payments * 0.35) + 
      (history * 0.15) + 
      (newCredit * 0.1) + 
      (mix * 0.1);

    setScore(Math.round(weightedScore * 8.5)); // Scale to 850
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
        <h1 className="text-xl font-bold text-dark-blue">Credit Score Calculator</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Credit Utilization (%)</label>
              <Input 
                type="number"
                name="creditUtilization"
                placeholder="Enter 0-100"
                value={formData.creditUtilization}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Payment History (%)</label>
              <Input 
                type="number"
                name="paymentHistory"
                placeholder="Enter 0-100"
                value={formData.paymentHistory}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Length of Credit History (%)</label>
              <Input 
                type="number"
                name="creditHistory"
                placeholder="Enter 0-100"
                value={formData.creditHistory}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Credit (%)</label>
              <Input 
                type="number"
                name="newCredit"
                placeholder="Enter 0-100"
                value={formData.newCredit}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Credit Mix (%)</label>
              <Input 
                type="number"
                name="creditMix"
                placeholder="Enter 0-100"
                value={formData.creditMix}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <Button 
              className="w-full bg-dark-blue hover:bg-dark-blue/90"
              onClick={calculateCreditScore}
            >
              Calculate Score
            </Button>

            {score !== null && (
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-dark-blue">Your Credit Score</h3>
                <p className="text-3xl font-bold text-vibrant-red mt-2">{score}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {score >= 750 ? 'Excellent' : 
                   score >= 650 ? 'Good' : 
                   score >= 550 ? 'Fair' : 'Needs Improvement'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Credit;
