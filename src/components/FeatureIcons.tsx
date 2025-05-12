import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { 
  CreditCard, 
  Train, 
  Plane, 
  Bus, 
  Building2, 
  Tag, 
  Landmark,
  LightbulbIcon,
  Banknote,
  Shield,
  PiggyBank,
  TrendingUp,
  Cpu,
  SunMedium,
  Building,
  HeartPulse,
  Workflow,
  Bike,
  Car,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureIcons: React.FC = () => {
  const navigate = useNavigate();
  const [showLoans, setShowLoans] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);

  // Loan options
  const loanOptions = [
    {
      title: 'Solar Installation',
      subtitle: 'Flexible loans for solar panel installation',
      icon: SunMedium,
      color: 'bg-green-500/10 text-green-600',
      link: 'https://choiceconnect.in/solar-installation-loan/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r'
    },
    {
      title: 'MSME Loans',
      subtitle: 'Quick and easy MSME loans for business needs',
      icon: Building,
      color: 'bg-blue-500/10 text-blue-600',
      link: 'https://choiceconnect.in/msme-loan/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r'
    }
  ];

  // Insurance options
  const insuranceOptions = [
    {
      title: 'Accident Care Plus',
      subtitle: 'Protection against unforeseen accidents',
      icon: Shield,
      color: 'bg-red-500/10 text-red-600',
      link: 'https://www.symboinsurance.com/customer/lead/pa/choiceconnect?cba_code=3WfCW2u%2BkzCO25RlJX7vdbCxTOd1bu9jJRa3B55uHpE%3D'
    },
    {
      title: 'Health Insurance',
      subtitle: 'Comprehensive health coverage',
      icon: HeartPulse,
      color: 'bg-emerald-500/10 text-emerald-600',
      link: 'https://choiceconnect.in/health-insurance/QzAwNDY3NTE=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r'
    },
    {
      title: 'Bike Insurance',
      subtitle: 'Protect your two-wheeler',
      icon: Bike,
      color: 'bg-purple-500/10 text-purple-600',
      link: 'https://choiceinsurance.in/motor-insurance?type=bike&cba=QzAwNDY3NTE='
    },
    {
      title: 'Car Insurance',
      subtitle: 'Complete coverage for your car',
      icon: Car,
      color: 'bg-amber-500/10 text-amber-600',
      link: 'https://choiceinsurance.in/motor-insurance?type=car&cba=QzAwNDY3NTE='
    }
  ];

  // First row: Main financial features
  const mainFeatures = [
    {
      title: 'Loans',
      subtitle: 'Pre-Approved',
      icon: Banknote,
      color: 'bg-purple-500/10 text-purple-600',
      action: () => setShowLoans(!showLoans)
    },
    {
      title: 'Insurance',
      subtitle: 'Motor, Health and more',
      icon: Shield,
      color: 'bg-red-500/10 text-red-600',
      action: () => setShowInsurance(!showInsurance)
    },
    {
      title: 'Credit Scoree',
      subtitle: 'Check for free',
      icon: TrendingUp,
      color: 'bg-blue-500/10 text-blue-600',
      route: '/credit'
    },
    {
      title: 'Savings',
      subtitle: 'Higher returns',
      icon: PiggyBank,
      color: 'bg-green-500/10 text-green-600',
      route: '/savings'
    }
  ];

  // Travel options from the uploaded image
  const travelFeatures = [
    {
      title: 'Flightss',
      subtitle: 'Get up to 25%k off',
      route: '/flights',
      image: 'https://imagekit.io/dd468cf2-525a-4379-a3c2-4f86d9540289', // Teal/mint colored airplane
      size: 'square'
    },
    {
      title: 'Bus',
      subtitle: 'Save up to ₹300',
      route: '/bus',
      image: 'https://i.imgur.com/FBiLAHl.png' // Purple bus illustration
    },
    {
      title: 'Hotels',
      subtitle: 'Flat 50% off*',
      route: '/hotels',
      image: 'https://i.imgur.com/2sWBiZ6.png' // Blue hotel building
    },
    {
      title: 'Train',
      subtitle: 'Confirmed tickets or 3X refund',
      route: '/trains',
      image: 'https://i.imgur.com/QYWtFWS.png' // Yellow/purple train
    },
    {
      title: 'Metro',
      subtitle: 'QR tickets & card recharge',
      route: '/metro',
      image: 'https://i.imgur.com/CTwpLo8.png' // Blue metro train
    }
  ];

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleTravelClick = () => {
    window.location.href = 'https://aczen.in';
  };

  return (
    <div className="bg-black text-white">
      {/* Main financial services */}
      <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in">
        {mainFeatures.map((feature, index) => (
          <Card key={index} className="border-none shadow-sm overflow-hidden group bg-gray-900">
            <CardContent className="p-0">
              <button 
                onClick={feature.action || (() => feature.route && navigate(feature.route))}
                className="w-full h-full flex flex-col items-center justify-center py-4 px-2 transition-all hover:bg-gray-800"
              >
                <div className={`rounded-full p-3 ${feature.color} mb-2 transition-transform group-hover:scale-110`}>
                  <feature.icon size={18} />
                </div>
                <span className="text-xs font-medium text-white">{feature.title}</span>
                {feature.subtitle && (
                  <span className="text-[10px] text-gray-400 text-center mt-0.5">{feature.subtitle}</span>
                )}
                {(index === 0 || index === 1) && (
                  <ChevronDown size={14} className="mt-1 text-gray-400" />
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loans Dropdown */}
      {showLoans && (
        <div className="mb-6 animate-slideDown">
          <div className="grid grid-cols-2 gap-3">
            {loanOptions.map((loan, index) => (
              <Card key={index} className="border-none shadow-sm overflow-hidden bg-gray-800">
                <CardContent className="p-3">
                  <button 
                    onClick={() => openExternalLink(loan.link)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${loan.color}`}>
                        <loan.icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-white">{loan.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{loan.subtitle}</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Dropdown */}
      {showInsurance && (
        <div className="mb-6 animate-slideDown">
          <div className="grid grid-cols-2 gap-3">
            {insuranceOptions.map((insurance, index) => (
              <Card key={index} className="border-none shadow-sm overflow-hidden bg-gray-800">
                <CardContent className="p-3">
                  <button 
                    onClick={() => openExternalLink(insurance.link)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${insurance.color}`}>
                        <insurance.icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-white">{insurance.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{insurance.subtitle}</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Travel Section - Rearranged layout */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-white">Travel & Transit</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Hotels and Metro top row */}
          <Card className="border-none shadow-sm overflow-hidden bg-gray-800">
            <CardContent className="p-4">
              <button 
                onClick={handleTravelClick}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-white">Hotels</h3>
                    <p className="text-xs text-gray-400 mt-1">Flat 50% off*</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <img 
                      src="https://media-hosting.imagekit.io/1adfa650450c41a8/screenshot_1745939589968.png?Expires=1840547591&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=0nYA1DFJcUY58NHYVWEyBqo1yXL6i31TZT70BcFWpObpWj83kAOHWzS9oNy07Yyab-4kQ3f96HlROyUAio2wW6OX6bTTF2SY9MeYD1klQ27QDK0MuF9LEFtSqw2L3paJCsmCQgNcuqRek9gCo2v0Dl9VGgKEMuH82CMb7uAUKZzB80ZkysUwOPXlz3TfWobpLwmZODnykiLJzgvmMhmM~4o2j9NmObkBU2aK3xVrTZlAqn5DxEGj2t2xf6Q2HxLyF7ZncQG2NvKvndi~aLD5cIE-qizuW32HrygkX6T0XwaxGtyOS9XsDf9avB4LEgyzuSShoWWonfkekAbvfr5xlQ__" 
                      alt="Hotelss" 
                      className="object-contain absolute right-0 bottom-0"
                    />
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
           <Card className="border-none shadow-sm overflow-hidden bg-gray-800">
            <CardContent className="p-4">
              <button 
                onClick={handleTravelClick}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-white">Metro</h3>
                    <p className="text-xs text-gray-400 mt-1">QR tickets & card recharge</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <img 
                      src="https://media-hosting.imagekit.io/66b045248d014ca5/screenshot_1745939887797.png?Expires=1840547888&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=oFLd~O4HfvQGIxdYvDdlh4U57Hm20-e9-VSM2IriZ3SapWQuDCCG0gjIszJ97Ckr72Nls665LyqSEdX0R5Bgvw1tP26k34xAnXVuiucLbHi00X00Oe5S3TBvl3EsYBmlMKqewYfNmm~D6iEfN7Ui1U15ZHAZPzqQsySe8fdhznkcucQlXDjtDEJYGHm3GBB~F-b7ERyCvTufnYOrC19QNvgE5vm9N33saiTyuQbrOCCbJdD1778ry4boSzklnhLU7mmfzBGT92rqQjOHLvHoXeyTlsTV76rRtKTy0kaxeYMonWx6fAOawsS9OqObZ9UrO~2CZr8ptDwG9g76A303qg__" 
                      alt="Metrosss" 
                      className="object-contain absolute right-0 bottom-0"
                    />
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
          
          {/* Flights as square */}
          <Card className="border-none shadow-sm overflow-hidden bg-gray-800 row-span-2">
            <CardContent className="p-4">
              <button 
                onClick={handleTravelClick}
                className="w-full text-left h-full"
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-medium text-white">Flights</h3>
                    <p className="text-xs text-gray-400 mt-1">Get up to 25% off</p>
                  </div>
                  <div className="flex justify-center items-center mt-3">
                    <img 
                      src="https://media-hosting.imagekit.io/5bba64ef5c6f417b/screenshot_1745939868736.png?Expires=1840547869&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=J733Otsip4gpiSc~qVoQ-zJ3Hd-hsHqTLRu6ih9ghdw9fYN601JPMRaAwKLxK-HhVNto-Zuj0vQ1MAxEjYrckzo1ILC2HVtxTIK5PiWzCYyOwuE9JyIwyC2Pb-Al-zI4XM9q2B7YXnALzjB3OLKluKDTSjJWlTbFEjL6ODc32-VFOZloC~fm~t~-Gv8BFmxYL2Dx9fscI-bZU~T1XVkKtFPHPF8WQKryVCEiRrm5ZG5TxJT1vxmmac6fJIkXcptOMB-drQlPf7tTENCswIa6UEfaD3uiBxWdiQaB4CUDk7HplnQWrbbu9-u7MUjhB30bSCzoxTjEIiUcb45xW-xdfQ__" 
                      alt="Flightss" 
                      className="object-contain w-32 h-32"
                    />
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
          
          {/* Bus */}
          <Card className="border-none shadow-sm overflow-hidden bg-gray-800">
            <CardContent className="p-4">
              <button 
                onClick={handleTravelClick}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-white">Bus</h3>
                    <p className="text-xs text-gray-400 mt-1">Save up to ₹3000</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <img 
                      src="https://media-hosting.imagekit.io/3a8fb8aeec764e17/screenshot_1745939878715.png?Expires=1840547879&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=jwEPkOqheyklEyhlcLGm4W0lHs0XS0UCR4OM3OJ33OFt4CWcoRFYl56o6t8N0YQ6Ofy7X9bLZ9EfaxNsRBjvK-y~oq7s~KtkDUXkbJnS4~YkG0xua0PglHCO~duEGyViQAROGsVHrRYe1ajJLvAs43eYpMzYHs~0vyG4tf8PGj6d00X3qm2iWl~4i0C3P5-l-6rs~N0cKRxjp~c9nqivnpCUyfrBJVT8xEibLxYGcRfTF9yRi~vVabbKWEoVjs9ayDDnFMOgIW1HzS75j~2B2swHl5wgDc~vpFyW8vudlZgThMZ6Tf52TLQWfZrsECtCqjl0fAF21F6Eg7BcMyjAXQ__" 
                      alt="Bus" 
                      className="object-contain absolute right-0 bottom-0"
                    />
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
          
          {/* Train */}
          <Card className="border-none shadow-sm overflow-hidden bg-gray-800">
            <CardContent className="p-4">
              <button 
                onClick={handleTravelClick}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-white">Train</h3>
                    <p className="text-xs text-gray-400 mt-1">Confirmed tickets or 3X refund</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <img 
                      src="https://media-hosting.imagekit.io/38c22f831dcf44db/screenshot_1745939896394.png?Expires=1840547896&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Al5MSHYXOOrYk89FajqN1dsGzpfUmHUW7TlrENWLm0n7JuXtPZ5uJvjeTbmPHB9LBQP6KTANFQqONJtQnCvO1YfshZz5njjXWs4AtfXSSYJ~RXXn6BZ-~kdy58b5I~r06TpUY6BVpBrcmIzCsFNiCnnILy7SJTtKHbVL3NEBwj1sUc5xKF1RE6x4m92OUAocjsSn68tnjTsJg3yk8T4NsKA9i6hdiOypWqfCN9OtMTkmyNvBOsUfVsht5~PiLbBthx0CFbtbkxJOtjAVna7PRrsb7jlZXNDuURAmXVq2G8~0p9G1Ort99HA7Bu7qZGMmE7Voo4bCqxNYwJDx25EHaA__" 
                      alt="Train" 
                      className="object-contain absolute right-0 bottom-0"
                    />
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeatureIcons;
