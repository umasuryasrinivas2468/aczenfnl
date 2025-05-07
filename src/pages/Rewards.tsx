import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Trophy, Tag, Package, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Rewards: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jackpot');

  const handleClaimClick = () => {
    window.location.href = 'https://aczen.in';
  };

  const handleImageClick = () => {
    window.location.href = 'https://aczen.in';
  };

  const coinOptions = [
    {
      value: 100,
      cashValue: 'Get flat ₹100',
      coinsRequired: 10000,
      color: 'bg-gradient-to-br from-amber-500 to-yellow-600'
    },
    {
      value: 25,
      cashValue: 'Get flat ₹25',
      coinsRequired: 5000,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600'
    }
  ];

  const discountOptions = [
    {
      title: 'JioHotstar',
      discount: '5% back',
      logo: '/images/jio-hotstar.png',
      color: 'bg-purple-900'
    },
    {
      title: 'VALORANT',
      action: 'Win 1x',
      logo: '/images/valorant.png',
      color: 'bg-blue-900'
    },
    {
      title: 'Apple',
      action: 'Win 1x',
      logo: '/images/apple.png',
      color: 'bg-blue-800'
    },
    {
      title: 'Play Store',
      action: 'Win 1x',
      logo: '/images/playstore.png',
      color: 'bg-blue-900'
    },
    {
      title: 'PlayStation',
      action: 'Win 2x',
      logo: '/images/playstation.png',
      color: 'bg-blue-700'
    },
    {
      title: 'Game Pass',
      action: 'Win 1x',
      logo: '/images/gamepass.png',
      color: 'bg-green-900'
    }
  ];

  const rewardCategories = [
    {
      id: 'jackpot',
      title: 'JACKPOT',
      gradient: 'from-purple-600 to-blue-600',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 'bigwins',
      title: 'BIG WINS',
      gradient: 'from-pink-600 to-purple-600',
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 'exclusive',
      title: 'EXCLUSIVE',
      gradient: 'from-blue-600 to-cyan-600',
      icon: <Package className="w-5 h-5" />
    }
  ];

  const exclusiveRewards = [
    { 
      title: 'Jio', 
      description: 'Get 20% cashback on recharges'
    },
    { 
      title: 'Disney+', 
      description: 'Free 1-month subscription' 
    },
    { 
      title: 'Flipkart', 
      description: 'Flat ₹500 off on purchases over ₹2000' 
    }
  ];

  // Currency display at top
 // Product cards for big wins
  const bigWins = [
    {
      product: "smartwatch",
      price: "₹4,999",
      sponsor: "BELLAVITA",
      image: "/images/rewards/products/smartwatch.png",
      borderColor: "border-yellow-500",
      bgColor: "bg-yellow-500"
    },
    {
      product: "Sony headphones",
      price: "₹5,990",
      sponsor: "BoldCare",
      image: "/images/rewards/products/headphones.png",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-500"
    },
    {
      product: "Apple Airpods (2nd gen)",
      price: "₹12,990",
      sponsor: "BOMBAY SHAVING COMPANY",
      src: "https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__",
      borderColor: "border-blue-600",
      bgColor: "bg-blue-600"
    },
    {
      product: "Apple Airpods (2nd gen)",
      price: "₹12,990",
      sponsor: "BOMBAY SHAVING COMPANY",
      src: "https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__",
      borderColor: "border-blue-600",
      bgColor: "bg-blue-600"
    },  
    {
      product: "Apple Airpods (2nd gen)",
      price: "₹12,990",
      sponsor: "BOMBAY SHAVING COMPANY",
      src: "https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__",
      borderColor: "border-blue-600",
      bgColor: "bg-blue-600"
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-black text-white min-h-screen">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-lg max-w-md mx-auto">
        <div className="flex justify-between items-center p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/50"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-medium text-white">Rewards</h1>
          <div className="w-10"></div>
        </div>

        {/* Banner Image */}
        <div className="px-4 pb-4">
          <img 
            src="https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__"
            alt="Rewards Banner"
            className="w-full h-32 object-cover rounded-xl cursor-pointer"
            onClick={handleImageClick}
          />
        </div>

        {/* Categories tabs */}
        <div className="px-4 pb-2 flex justify-between">
          {rewardCategories.map((category) => (
            <button
              key={category.id}
              className={`flex-1 mx-1 py-2 rounded-xl ${
                activeTab === category.id 
                  ? `bg-gradient-to-r ${category.gradient} shadow-lg` 
                  : 'bg-gray-800/50'
              }`}
              onClick={() => setActiveTab(category.id)}
            >
              <div className="flex flex-col items-center">
                <span>{category.icon}</span>
                <span className="text-xs mt-1 font-medium">{category.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content with padding for fixed header */}
      <div className="pt-64 px-4">
        {/* Currency Display like in the image */}
        <div className="flex justify-between mb-4">
          <div className="flex items-center bg-zinc-900 px-4 py-2 rounded-full">
            <img src="https://i.imgur.com/CTwpLo8.png" alt="Coin" className="w-6 h-6 mr-2" />
            <span className="text-white font-medium">3,64,357</span>
          </div>
          <div className="flex items-center bg-zinc-900 px-4 py-2 rounded-full">
            <img src="https://i.imgur.com/UHSHoI5.png" alt="Cash" className="w-6 h-6 mr-2" />
            <span className="text-white font-medium">₹243</span>
          </div>
          <div className="flex items-center bg-zinc-900 px-4 py-2 rounded-full">
            <img src="https://i.imgur.com/2sWBiZ6.png" alt="Ticket" className="w-6 h-6 mr-2" />
            <span className="text-white font-medium">0</span>
          </div>
        </div>

        {/* Main content section */}
        <div className="grid grid-cols-2 gap-4">
          {/* JACKPOT TAB */}
          {activeTab === 'jackpot' && (
            <>
              <Card className="overflow-hidden border-none bg-zinc-900 rounded-xl relative">
                <div className="p-0">
                  {/* Discount bubble */}
                  <div className="absolute top-2 left-2 bg-white rounded-full p-2 w-14 h-14 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-black font-semibold">DISCOUNT</span>
                    <span className="text-black font-bold text-lg leading-none">50%</span>
                  </div>
                  
                  <img 
                    src="https://i.imgur.com/UHSHoI5.png" 
                    alt="Watch"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2 flex justify-center items-center">
                    <button
                      className="bg-gray-800 px-3 py-1 rounded-lg text-white text-xs"
                    >
                      SHOP NOW
                    </button>
                  </div>
                  <div className="bg-yellow-400 p-3">
                    <button
                      onClick={handleClaimClick}
                      className="w-full flex justify-center items-center text-black font-medium"
                    >
                      <span>Claim now</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden border-none bg-zinc-900 rounded-xl relative">
                <div className="p-0">
                  {/* Discount bubble */}
                  <div className="absolute top-2 left-2 bg-white rounded-full p-2 w-14 h-14 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-black font-semibold">DISCOUNT</span>
                    <span className="text-black font-bold text-lg leading-none">50%</span>
                  </div>
                  
                  <img 
                    src="https://i.imgur.com/UHSHoI5.png" 
                    alt="Watch"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2 flex justify-center items-center">
                    <button
                      className="bg-gray-800 px-3 py-1 rounded-lg text-white text-xs"
                    >
                      SHOP NOW
                    </button>
                  </div>
                  <div className="bg-yellow-400 p-3">
                    <button
                      onClick={handleClaimClick}
                      className="w-full flex justify-center items-center text-black font-medium"
                    >
                      <span>Claim now</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Progress indicator */}
              <div className="col-span-2 flex items-center justify-center mt-2 mb-6">
                <div className="h-1.5 w-full max-w-xs bg-gray-800 rounded-full overflow-hidden">
                  <div className="w-1/6 h-full bg-white"></div>
                </div>
                <span className="ml-3 text-sm text-gray-300">6 rewards to claim</span>
              </div>
            </>
          )}

          {/* BIG WINS TAB */}
          {activeTab === 'bigwins' && (
            <>
              <div className="col-span-2 mb-4">
                <h2 className="text-xl font-bold text-white">Cosmetics</h2>
              </div>
              
              <Card className="overflow-hidden border-none bg-zinc-900 rounded-xl">
                <div className="p-0">
                  <img 
                    src="https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__" 
                    alt="Reward"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="bg-yellow-400 p-3">
                    <button
                      onClick={handleClaimClick}
                      className="w-full flex justify-center items-center text-black font-medium"
                    >
                      <span>Claim now</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden border-none bg-zinc-900 rounded-xl">
                <div className="p-0">
                  <img 
                    src="https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__" 
                    alt="Reward"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="bg-yellow-400 p-3">
                    <button
                      onClick={handleClaimClick}
                      className="w-full flex justify-center items-center text-black font-medium"
                    >
                      <span>Claim now</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* EXCLUSIVE TAB */}
          {activeTab === 'exclusive' && (
            <>
              {exclusiveRewards.map((reward, index) => (
                <Card key={index} className="col-span-2 overflow-hidden border-none bg-zinc-900 rounded-xl mb-3">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{reward.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{reward.description}</p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <img 
                          src="https://i.imgur.com/CTwpLo8.png" 
                          alt={reward.title} 
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-400 p-3">
                    <button
                      onClick={handleClaimClick}
                      className="w-full flex justify-center items-center text-black font-medium"
                    >
                      <span>Claim now</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* Credit card image - shown at bottom on all tabs */}
          <div className="col-span-2 mt-6">
            <img 
              src="https://media-hosting.imagekit.io/a4e606404ad942fc/Screenshot%202025-04-29%20150918.png?Expires=1840527619&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=YebbAb5IkuyAB1GaK5qn3KYKpdUaBX00dg1D9YJlgrGBaz9IEVD8jZihyIrVA8uxlBXY14mUMOoCSsN4z6VtY5eDYpFx0vbBM5H6DrC-YdQuno9TAm5v873rbQrXb5Zsl8QRf3stdByKLdZjqOjWZA4r9J94eRO5qq25ZF~LpiL8eHNdHW~tb8kD~fvbh-hllJuF4T2qX85S0N2H8kehGG47muHP7lR-B1dyq8xCDxxWPbhkvO2bUFObg~fLKs7dyYTIQBhkWjNSycjGszgtdtlsAmPXqUv7LS4sdh5ex6xzTFEBro2wRgmEwGiC37HSK1~WJekp8Nhd4JpqyR-cgg__" 
              alt="Credit Card"
              className="w-full rounded-xl cursor-pointer mb-20"
              onClick={handleImageClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards; 