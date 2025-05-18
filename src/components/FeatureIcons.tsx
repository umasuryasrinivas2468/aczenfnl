import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureIcons: React.FC = () => {
  const navigate = useNavigate();
  const [showLoans, setShowLoans] = useState(true);
  const [showInsurance, setShowInsurance] = useState(false);

  // Loan options
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

  // Insurance options
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

  // First row: Main financial features
  const mainFeatures = [
    {
      title: 'Loans',
      subtitle: 'Pre-Approved',
      color: 'bg-purple-500 text-white',
      route: '/loans'
    },
    {
      title: 'Insurance',
      subtitle: 'Motor, Health and more',
      color: 'bg-red-500 text-white',
      route: '/insurance'
    },
    {
      title: 'Credit Scoree',
      subtitle: 'Check for free',
      color: 'bg-blue-500 text-white',
      route: '/credit'
    },
    {
      title: 'Savings',
      subtitle: 'Higher returns',
      color: 'bg-green-500 text-white',
      route: '/savings'
    }
  ];

  // Travel features
  const travelFeatures = [
    {
      title: 'Hotels',
      subtitle: 'Flat 50% off*',
      route: '/webview',
      params: { service: 'hotels' },
      image: 'https://i.imgur.com/2sWBiZ6.png', // Blue hotel building
      size: 'normal'
    },
    {
      title: 'Metro',
      subtitle: 'QR tickets & card recharge',
      route: '/coming-soon',
      params: { 
        service: {
          title: 'Metro',
          image: 'https://i.imgur.com/CTwpLo8.png',
          description: 'Metro QR tickets and card recharge coming soon to your app!'
        }
      },
      image: 'https://i.imgur.com/CTwpLo8.png', // Blue metro train
      size: 'normal'
    },
    {
      title: 'Flights',
      subtitle: 'Get up to 25% off',
      route: '/webview',
      params: { service: 'flights' },
      image: 'https://i.imgur.com/FBiLAHl.png', // Airplane
      size: 'large'
    },
    {
      title: 'Bus',
      subtitle: 'Save up to ₹3000',
      route: '/webview',
      params: { service: 'bus' },
      image: 'https://i.imgur.com/FBiLAHl.png', // Purple bus illustration
      size: 'normal'
    },
    {
      title: 'Train',
      subtitle: 'Confirmed tickets or 3X refund',
      route: '/webview',
      params: { service: 'trains' },
      image: 'https://i.imgur.com/QYWtFWS.png', // Yellow/purple train
      size: 'normal'
    }
  ];

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleTravelClick = (feature: any) => {
    if (feature.route) {
      if (feature.params) {
        navigate(feature.route, { state: feature.params });
      } else {
        navigate(feature.route);
      }
    } else {
      window.location.href = 'https://aczen.in';
    }
  };

  const renderMainFeature = (feature: any, index: number) => {
    return (
      <div 
        key={index} 
        className="bg-gray-900 rounded-xl py-6 px-4 h-52 flex flex-col items-center"
        onClick={() => {
          if (feature.title === 'Loans') {
            setShowLoans(!showLoans);
          } else if (feature.title === 'Insurance') {
            setShowInsurance(!showInsurance);
          } else if (feature.route) {
            navigate(feature.route);
          }
        }}
      >
        <h3 className="text-xl font-medium text-center text-white mb-2">{feature.title}</h3>
        <p className="text-sm text-gray-400 text-center px-1">{feature.subtitle}</p>
        {(feature.title === 'Loans' || feature.title === 'Insurance') && (
          <ChevronDown className="h-5 w-5 mt-2 text-gray-500" />
        )}
      </div>
    );
  };
 
  const renderLoanOption = (option: any, index: number) => {
    return (
      <div 
        key={index} 
        className="bg-gray-900 rounded-xl p-4 flex items-start gap-3"
        onClick={() => openExternalLink(option.link)}
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
        }`}
        onClick={() => handleTravelClick(feature)}
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
      {/* Financial Features */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {mainFeatures.map((feature, index) => renderMainFeature(feature, index))}
      </div>
      
      {/* Loan Options (Expanded) */}
      {showLoans && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {loanOptions.map((option, index) => renderLoanOption(option, index))}
        </div>
      )}
      
      {/* Insurance Options (Expanded) */}
      {showInsurance && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {insuranceOptions.map((option, index) => renderLoanOption(option, index))}
        </div>
      )}
      
      {/* Travel & Transit Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Travel & Transit</h3>
        <div className="grid grid-cols-2 gap-3 grid-rows-3">
          {/* First row: Hotels and Metro */}
          <div 
            className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => window.open('https://www.ixigo.com/?utm_source=Brand_Ggl_Search&utm_medium=paid_search_google&utm_campaign=Ixigo_Brand&utm_source=brand_g&utm_medium=paid_search_google&utm_campaign=ixigo_brand&gad_source=1&gad_campaignid=773471927&gbraid=0AAAAAC5edWCLzbP5p3WRmA2WJne9ZYHBF&gclid=CjwKCAjw56DBBhAkEiwAaFsG-nySx1J9nSwkc7ShhIbHGJ274x5k1Vy7WP1HngxIbmrDXfYDELUo8xoCBjAQAvD_BwE', '_blank')}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-medium">Hotels</h3>
                <p className="text-xs text-gray-400">Flat 50% off*</p>
              </div>
              <div className="flex justify-end">
                <img 
                  src="https://i.imgur.com/2sWBiZ6.png" 
                  alt="Hotels" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-medium">Metro</h3>
                <p className="text-xs text-gray-400">QR tickets & card recharge</p>
              </div>
              <div className="flex justify-end">
                <img 
                  src="https://i.imgur.com/CTwpLo8.png" 
                  alt="Metro" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Second and third rows: Flights on the left, Bus and Train on the right */}
          <div 
            className="bg-gray-900 rounded-xl overflow-hidden row-span-2 cursor-pointer"
            onClick={() => window.open('https://www.airindia.com/en-in/book-flights/?em_dc=GRABAIR&utm_source=GrabOn&utm_medium=affiliate&utm_campaign=AirIndia_Direct_Banner', '_blank')}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-medium">Flights</h3>
                <p className="text-xs text-gray-400">Get up to 25% off</p>
              </div>
              <div className="flex justify-end">
                <img 
                  src="https://i.imgur.com/FBiLAHl.png" 
                  alt="Flights" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
          <div 
            className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => window.open('https://www.redbus.in/?gad_source=1&gad_campaignid=22526717912&gclid=CjwKCAjw56DBBhAkEiwAaFsG-u-17s976Ek0KMArWLjtjKslqv2tfrVmTm7hSdHQPjC0Gwe1F8eosBoCtlYQAvD_BwE', '_blank')}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-medium">Bus</h3>
                <p className="text-xs text-gray-400">Save up to ₹3000</p>
              </div>
              <div className="flex justify-end">
                <img 
                  src="https://i.imgur.com/FBiLAHl.png" 
                  alt="Bus" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
          <div 
            className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => window.open('https://www.railyatri.in/', '_blank')}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-medium">Train</h3>
                <p className="text-xs text-gray-400">Confirmed tickets or 3X refund</p>
              </div>
              <div className="flex justify-end">
                <img 
                  src="https://i.imgur.com/QYWtFWS.png" 
                  alt="Train" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureIcons;
