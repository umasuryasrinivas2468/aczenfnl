import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';

const HeroSection: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const slides = [
    {
      imageUrl: 'https://i.imgur.com/CTwpLo8.png'
    },
    {
      imageUrl: 'https://i.imgur.com/UHSHoI5.png'
    },
    {
      imageUrl: 'https://i.imgur.com/CTwpLo8.png'
    },
    {
      imageUrl: 'https://i.imgur.com/UHSHoI5.png'
    }
  ];

  const handleImageClick = () => {
    window.location.href = 'https://aczen.in';
  };
  
  return (
    <div className="relative">
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory space-x-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, index) => (
          <Card 
            key={index} 
            className="flex-shrink-0 snap-center w-full rounded-xl border-none shadow-md overflow-hidden"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className="p-0 bg-white">
                  <img 
                    src={slide.imageUrl} 
                    alt="Slide image" 
                    className="w-full h-48 object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center space-x-1 mt-2">
        {slides.map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-4 bg-purple-500' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection; 