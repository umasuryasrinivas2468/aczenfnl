import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Timer, User, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RewardsNew: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<'main' | 'challenge'>('main');
  const [currentDealIndex, setCurrentDealIndex] = useState(0);

  // Demo deals data
  const deals = [
    {
      id: 1,
      badge: "Eat Club",
      title: "Claim 20% off on Box8, Pasta & more",
      timeLeft: "5h",
      claimed: "4K",
      image: "https://i.imgur.com/TkuRoLK.png",
      link: "https://www.box8.in"
    },
    {
      id: 2,
      badge: "Fashion",
      title: "Get 30% off on Myntra clothing",
      timeLeft: "8h",
      claimed: "2.5K",
      image: "https://i.imgur.com/vNL7loK.png",
      link: "https://www.myntra.com"
    },
    {
      id: 3,
      badge: "Electronics",
      title: "Flat ₹2000 off on Headphones",
      timeLeft: "12h",
      claimed: "1.8K",
      image: "https://i.imgur.com/RZA62Dv.png",
      link: "https://www.amazon.in"
    }
  ];

  // Function to handle slider navigation
  const nextDeal = () => {
    setCurrentDealIndex((prevIndex) => (prevIndex + 1) % deals.length);
  };

  const prevDeal = () => {
    setCurrentDealIndex((prevIndex) => (prevIndex - 1 + deals.length) % deals.length);
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextDeal();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Navigation links
  const navigateToExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto bg-[#2a0a50] min-h-screen text-white">
      {currentPage === 'main' ? (
        <>
          {/* Today's Deal Section */}
          <div className="p-4 pt-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-pink-300 drop-shadow-lg">Today's Deal</h2>
              <p className="text-white text-xs mt-1">Claim and Earn</p>
            </div>

            {/* Slider controls */}
            <div className="relative">
              <Card className="bg-[#ffb07c] text-black rounded-xl overflow-hidden border-0 shadow-lg mb-6">
                <div className="relative">
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-pink-500 text-white font-bold uppercase px-3 py-1 text-xs">
                      {deals[currentDealIndex].badge}
                    </Badge>
                  </div>
                  <div className="pt-12 px-4 pb-5 flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{deals[currentDealIndex].title}</h3>
                      <div className="flex items-center mt-3 text-sm">
                        <Timer className="w-4 h-4 mr-1" />
                        <span>Ends in: {deals[currentDealIndex].timeLeft}</span>
                        <div className="mx-3 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{deals[currentDealIndex].claimed} claimed</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <img 
                        src={deals[currentDealIndex].image}
                        alt={deals[currentDealIndex].title} 
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  </div>
                  <div className="pb-2 flex justify-center">
                    <Button 
                      className="bg-pink-500 text-white hover:bg-pink-600 rounded-xl font-medium py-1 px-6 h-auto relative bottom-3 shadow-xl"
                      onClick={() => navigateToExternalLink(deals[currentDealIndex].link)}
                    >
                      Claim Now
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Slider dots and arrows */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 hover:bg-black/50 text-white h-8 w-8"
                  onClick={prevDeal}
                >
                  <ChevronLeft size={18} />
                </Button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 hover:bg-black/50 text-white h-8 w-8"
                  onClick={nextDeal}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
              <div className="flex justify-center gap-1 mt-1 mb-3">
                {deals.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${index === currentDealIndex ? 'w-4 bg-pink-500' : 'w-1.5 bg-gray-400'}`}
                    onClick={() => setCurrentDealIndex(index)}
                  ></div>
                ))}
              </div>
            </div>

            {/* Milestone Challenges Section */}
            <div className="bg-[#4b1a93] rounded-xl p-4 mb-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Milestone </h2>
                <p className="text-white/80 text-sm uppercase">Challenges</p>
                <p className="text-white/60 text-xs mt-2">Unlock Challenges to Earn Rewards</p>
              </div>

              <div className="flex flex-wrap gap-4 justify-between">
                <div className="w-[calc(50%-8px)]" onClick={() => navigateToExternalLink("https://www.boult.com/headphones")}>
                  <div className="bg-[#1d0a42] rounded-xl p-3 flex flex-col items-center cursor-pointer">
                    <div className="w-20 h-20 mb-3">
                      <img 
                        src="https://i.imgur.com/RZA62Dv.png" 
                        alt="Headphones" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium mb-2">Headphones</p>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold mr-1">×6</span>
                        <div className="w-5 h-5 bg-[#5ec9f2] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[calc(50%-8px)]" onClick={() => navigateToExternalLink("https://www.apple.com/in/watch")}>
                  <div className="bg-[#1d0a42] rounded-xl p-3 flex flex-col items-center cursor-pointer">
                    <div className="w-20 h-20 mb-3">
                      <img 
                        src="https://i.imgur.com/UtR7EKl.png" 
                        alt="Apple Watch" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium mb-2">Apple Watch</p>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold mr-1">×8</span>
                        <div className="w-5 h-5 bg-[#5ec9f2] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                

                

                <div className="w-[calc(50%-8px)]" onClick={() => navigateToExternalLink("https://www.amazon.in/kindle")}>
                  <div className="bg-[#1d0a42] rounded-xl p-3 flex flex-col items-center cursor-pointer">
                    <div className="w-20 h-20 mb-3">
                      <img 
                        src="https://media.licdn.com/dms/image/v2/D5603AQFinllH_1XyQQ/profile-displayphoto-shrink_400_400/B56ZXQlhVrHQAo-/0/1742961252824?e=1752105600&v=beta&t=BjrJdsGpy1bEC8YOMo1kR1YLPDKYrwHIfp1C6ee0EH8" 
                        alt="Kindle" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium mb-2">Kindle</p>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold mr-1">×12</span>
                        <div className="w-5 h-5 bg-[#5ec9f2] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

 
               
              <div className="flex items-center justify-center mt-4 text-xs text-pink-300">
                <div className="w-3 h-3 bg-pink-600 rounded-full mr-2"></div>
                <span>New reward cards in 4hrs</span>
              </div>
            </div>

            {/* Daily Rewards Section */}
            <div className="mt-8 bg-black rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-300">win rewards</h2>
                  <h3 className="text-2xl font-bold text-yellow-300">everyday</h3>
                </div>
                <div className="bg-purple-900/50 px-4 py-1 rounded-full text-purple-300">
                  25 Apr
                </div>
              </div>

              <div className="bg-blue-600 p-2 rounded-xl">
                <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center">
                  {/* Replaced text with image */}
                  <img 
                    src="https://i.imgur.com/FJfQDLN.png" 
                    alt="Apple AirPods" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button 
                  className="bg-yellow-400 hover:bg-yellow-500 text-black w-full py-6 rounded-xl font-bold text-lg"
                  onClick={() => navigateToExternalLink("https://www.apple.com/in/airpods-pro")}
                >
                  Claim now <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Guaranteed Steals Section */}
            <div className="mt-6 bg-[#260a4a] text-center py-6 rounded-t-3xl">
              <h2 className="text-4xl font-bold text-gray-300">Guaranteed</h2>
              <h2 className="text-4xl font-bold text-gray-300">Steals</h2>
              <p className="text-gray-400 mt-1">Rewards That Always Deliver</p>
              
              {/* Image below Guaranteed Steals */}
              <div className="flex justify-center mt-6">
                <div className="relative w-64 h-64">
                  <img 
                    src="https://media-hosting.imagekit.io/a94dcd3809d140e0/screenshot_1746542339101.png?Expires=1841150341&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=iG-yqenPDa22w5lxeCAUzeEAyn1wG~KUORN8bTNBM8S73wjhMRsh3GylbmD0TD~iudIgb62LziByNVR8Im5wkFXZaesj907QvRafaEEHPaFoovp9UYVYczhlAUawcYGGfQYp9eKuzCBV-yh8tPhAozgo5IcWfDf2yrMDHgLXKxfEA-BVEuMQQ2Zn~z~bv9Zy8Lj-swMw8XYruLCHHzPP3CqXauAQxOx4qdgddYmUQZsr2UgvxwaTr6DgifQhv26v2WXjsyTL5~K51hnP1slWRkqxW~o5yZgnlRgkhbs5AmzgvKfGtCX6wCTnZ4YdvNo2dxx7udzJZVjBemglo13LWg__" 
                    alt="Claim Now" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Button below the image */}
              <div className="mt-4 px-6 pb-8">
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg"
                  onClick={() => navigateToExternalLink("https://www.amazon.in/giftcards")}
                >
                  Claim Now
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Headphones Challenge Page
        <div className="flex flex-col min-h-screen">
          <div className="p-4 flex items-center">
            <button 
              onClick={() => setCurrentPage('main')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-900/50"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="px-4 pb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Headphones Challenge</h2>
              <div className="flex justify-center gap-3 mt-2 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-pink-400 mr-1" />
                  <span className="text-pink-200">Ends in 4hrs</span>
                </div>
                <div className="flex items-center">
                  <span className="text-pink-200">2.4K Members Joined</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0e0823] flex-1 p-6">
            <div className="flex justify-center mb-8">
              <div className="relative w-52 h-52">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                <img 
                  src="https://i.imgur.com/RZA62Dv.png" 
                  alt="Headphones" 
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-300">MEMBERS IN LEAD</h3>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-700 mb-2 overflow-hidden">
                  <img 
                    src="https://i.imgur.com/W41Jdzg.png" 
                    alt="Arjun Mehra" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Arjun</p>
                <p className="text-sm font-medium">Mehra</p>
                <p className="text-xs font-bold mt-1">1,890 pts</p>
                <Button className="mt-2 bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 h-auto rounded-xl">
                  Vote Now
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-700 mb-2 overflow-hidden">
                  <img 
                    src="https://i.imgur.com/dkBwCkT.png" 
                    alt="Pooja Batra" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Pooja</p>
                <p className="text-sm font-medium">Batra</p>
                <p className="text-xs font-bold mt-1">1,450 pts</p>
                <Button className="mt-2 bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 h-auto rounded-xl">
                  Vote Now
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-700 mb-2 overflow-hidden">
                  <img 
                    src="https://i.imgur.com/Y5PgRNQ.png" 
                    alt="Amisha D." 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Amisha</p>
                <p className="text-sm font-medium">D.</p>
                <p className="text-xs font-bold mt-1">1,342 pts</p>
                <Button className="mt-2 bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 h-auto rounded-xl">
                  Vote Now
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-700 mb-2 overflow-hidden">
                  <img 
                    src="https://i.imgur.com/UgsCMgT.png" 
                    alt="Vaibh Gup" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Vaibh</p>
                <p className="text-sm font-medium">Gup</p>
                <p className="text-xs font-bold mt-1">1,200 pts</p>
                <Button className="mt-2 bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 h-auto rounded-xl">
                  Vote Now
                </Button>
              </div>
            </div>

            <div className="text-center mt-4">
              <Button variant="link" className="text-pink-400">
                See all members
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsNew; 