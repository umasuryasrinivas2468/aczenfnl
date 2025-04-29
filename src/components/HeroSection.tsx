import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { 
  Building2, 
  Plane, 
  Train, 
  Bus
} from 'lucide-react';

const HeroSection: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const slides = [
    {
      title: '',
      description: '',
      icon: Building2,
      color: 'bg-purple-500',
      imageUrl: 'https://i.imgur.com/CTwpLo8.png'
    },
    {
      title: 'Flights',
      description: 'Explore the world with affordable flights',
      icon: Plane,
      color: 'bg-blue-500',
      imageUrl: 'https://i.imgur.com/UHSHoI5.png'
    },
    {
      title: 'Trains',
      description: 'Hassle-free train tickets at best prices',
      icon: Train,
      color: 'bg-green-500',
      imageUrl: 'https://i.imgur.com/CTwpLo8.png'
    },
    {
      title: 'Bus',
      description: 'Comfortable bus journeys across cities',
      icon: Bus,
      color: 'bg-orange-500',
      imageUrl: 'https://i.imgur.com/UHSHoI5.png'
    }
  ];
  
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
          >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className={`${slide.color} p-6 text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{slide.title}</h3>
                      <p className="text-sm opacity-80 mt-1">{slide.description}</p>
                    </div>
                    <slide.icon size={28} />
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="w-full h-32 object-contain"
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