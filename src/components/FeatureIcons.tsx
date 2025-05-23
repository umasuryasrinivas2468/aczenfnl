import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { 
  ChevronDown,
  ChevronUp,
  Wallet,
  Shield,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureIcons: React.FC = () => {
  const navigate = useNavigate();
  const [showLoans, setShowLoans] = useState(true);
  const [showInsurance, setShowInsurance] = useState(false);

  const loanOptions = [
    {
      title: 'Solar Installation',
      subtitle: 'Flexible loans for solar panel installation',
      color: 'bg-green-500/10 text-green-600',
      link: 'https://choiceconnect.in/solar-installation-loan/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r'
    },
    {
      title: 'MSME Loans',
      subtitle: 'Quick and easy MSME loans for business needs',
      color: 'bg-blue-500/10 text-blue-600',
      link: 'https://choiceconnect.in/msme-loan/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r'
    }
  ];

  const insuranceOptions = [
    {
      title: 'Accident Care Plus',
      subtitle: 'Protection against unforeseen accidents',
      color: 'bg-red-500/10 text-red-600',
      link: 'https://www.symboinsurance.com/customer/lead/pa/choiceconnect?cba_code=3WfCW2u%2BkzCO25RlJX7vdbCxTOd1bu9jJRa3B55uHpE%3D'
    },
    {
      title: 'Health Insurance',
      subtitle: 'Comprehensive health coverage',
      color: 'bg-emerald-500/10 text-emerald-600',
      link: 'https://choiceconnect.in/health-insurance/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r'
    },
    {
      title: 'Bike Insurance',
      subtitle: 'Protect your two-wheeler',
      color: 'bg-purple-500/10 text-purple-600',
      link: 'https://choiceinsurance.in/motor-insurance?type=bike&cba=QzAwNDY3NTE='
    },
    {
      title: 'Car Insurance',
      subtitle: 'Complete coverage for your car',
      color: 'bg-amber-500/10 text-amber-600',
      link: 'https://choiceinsurance.in/motor-insurance?type=car&cba=QzAwNDY3NTE='
    }
  ];

  const mainFeatures = [
    {
      title: 'Loans',
      subtitle: 'Pre-Approved',
      color: 'bg-purple-500',
      route: '/webview',
      params: { service: 'loans', url: 'https://choiceconnect.in/loans/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r' },
      icon: Wallet
    },
    {
      title: 'Insurance',
      subtitle: 'Motor, Health and more', 
      color: 'bg-red-500',
      route: '/webview',
      params: { service: 'insurance', url: 'https://choiceconnect.in/insurance/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r' },
      icon: Shield
    },
    {
      title: 'Credit Score',
      subtitle: 'Check for free',
      color: 'bg-blue-500',
      route: '/webview',
      params: { service: 'credit', url: 'https://choiceconnect.in/credit-score/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r' },
      icon: CreditCard
    },
    {
      title: 'Savings',
      subtitle: 'Higher returns',
      color: 'bg-green-500',
      route: '/webview',
      params: { service: 'savings', url: 'https://choiceconnect.in/savings/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r' },
      icon: PiggyBank
    }
  ];

  const travelFeatures = [
    {
      title: 'Hotels',
      subtitle: 'Flat 50% off*',
      route: '/webview',
      params: { service: 'hotels', url: 'https://www.ixigo.com/?utm_source=Brand_Ggl_Search&utm_medium=paid_search_google&utm_campaign=Ixigo_Brand&utm_source=brand_g&utm_medium=paid_search_google&utm_campaign=ixigo_brand&gad_source=1&gad_campaignid=773471927&gbraid=0AAAAAC5edWCLzbP5p3WRmA2WJne9ZYHBF&gclid=CjwKCAjw56DBBhAkEiwAaFsG-nySx1J9nSwkc7ShhIbHGJ274x5k1Vy7WP1HngxIbmrDXfYDELUo8xoCBjAQAvD_BwE' },
      image: 'https://i.imgur.com/2sWBiZ6.png',
      size: 'normal'
    },
    {
      title: 'Metro',
      subtitle: 'QR tickets & card recharge',
      route: '/webview',
      params: { 
        service: 'metro',
        url: 'https://www.metro.com/'
      },
      image: 'https://i.imgur.com/CTwpLo8.png',
      size: 'normal'
    },
    {
      title: 'Flights',
      subtitle: 'Get up to 25% off',
      route: '/webview',
      params: { service: 'flights', url: 'https://www.airindia.com/en-in/book-flights/?em_dc=GRABAIR&utm_source=GrabOn&utm_medium=affiliate&utm_campaign=AirIndia_Direct_Banner' },
      image: 'https://i.imgur.com/FBiLAHl.png',
      size: 'large'
    },
    {
      title: 'Bus',
      subtitle: 'Save up to ₹3000',
      route: '/webview',
      params: { service: 'bus', url: 'https://www.redbus.in/?gad_source=1&gad_campaignid=22526717912&gclid=CjwKCAjw56DBBhAkEiwAaFsG-u-17s976Ek0KMArWLjtjKslqv2tfrVmTm7hSdHQPjC0Gwe1F8eosBoCtlYQAvD_BwE' },
      image: 'https://ibb.co/7NQzDmfC',
      size: 'normal'
    },
    {
      title: 'Train',
      subtitle: 'Confirmed tickets or 3X refund',
      route: '/webview',
      params: { service: 'trains', url: 'https://www.railyatri.in/' },
      image: 'https://i.imgur.com/QYWtFWS.png',
      size: 'normal'
    }
  ];

  const handleFeatureClick = (feature: any) => {
    if (feature.title === 'Loans') {
      setShowLoans(!showLoans);
    } else if (feature.title === 'Insurance') {
      setShowInsurance(!showInsurance);
    } else if (feature.route) {
      if (feature.params) {
        navigate(feature.route, { state: feature.params });
      } else {
        navigate(feature.route);
      }
    }
  };

  const handleOptionClick = (url: string) => {
    navigate('/webview', { state: { url } });
  };

  const renderMainFeature = (feature: any, index: number) => {
    const Icon = feature.icon;
    return (
      <div 
        key={index} 
        className={`${feature.color} rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer relative`}
        onClick={() => handleFeatureClick(feature)}
      >
        <div className="flex flex-col items-center">
          <Icon className="h-8 w-8 text-white mb-2" strokeWidth={1.5} />
          <h3 className="text-xs font-semibold text-white text-center">{feature.title}</h3>
          <p className="text-xs text-white/80 text-center">{feature.subtitle}</p>
        </div>
        {(feature.title === 'Loans' || feature.title === 'Insurance') && (
          <ChevronDown className="h-4 w-4 text-white/80 absolute bottom-1 right-1" />
        )}
      </div>
    );
  };

  const renderLoanOption = (option: any, index: number) => {
    return (
      <div 
        key={index} 
        className="bg-gray-900 rounded-xl p-4 flex items-start gap-3 cursor-pointer"
        onClick={() => handleOptionClick(option.link)}
      >
        <div>
          <h3 className="font-medium">{option.title}</h3>
          <p className="text-xs text-gray-400">{option.subtitle}</p>
        </div>
      </div>
    );
  };

  const renderTravelFeature = (feature: any, index: number) => {
    return (
      <div 
        key={index} 
        className={`bg-gray-900 rounded-xl overflow-hidden ${
          feature.size === 'large' ? 'row-span-2' : ''
        } cursor-pointer`}
        onClick={() => handleFeatureClick(feature)}
        style={{ height: feature.size === 'large' ? '100%' : 'auto' }}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <h3 className="font-medium">{feature.title}</h3>
            <p className="text-xs text-gray-400">{feature.subtitle}</p>
          </div>
          <div className="flex justify-end">
            <img 
              src={feature.image} 
              alt={feature.title} 
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white">
      <div className="grid grid-cols-4 gap-2 mb-6">
        {mainFeatures.map((feature, index) => renderMainFeature(feature, index))}
      </div>

      {showLoans && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {loanOptions.map((option, index) => renderLoanOption(option, index))}
        </div>
      )}

      {showInsurance && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {insuranceOptions.map((option, index) => renderLoanOption(option, index))}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Travel & Transit</h3>
        <div className="grid grid-cols-2 gap-3 grid-rows-3">
          {travelFeatures.map((feature, index) => renderTravelFeature(feature, index))}
        </div>
      </div>
    </div>
  );
};

export default FeatureIcons;
