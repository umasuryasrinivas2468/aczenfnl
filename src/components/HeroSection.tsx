import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      imageUrl: 'https://cdn.grabon.in/gograbon/images/banners/banner-1746691998256/Offer%20Code.jpg',
      link: 'https://www.grabon.in/'
    },
    {
      imageUrl: 'https://cdn.grabon.in/gograbon/images/banners/banner-1746437011695/Bajaj%20Finserv%20Markets%20Offers.jpg',
      link: 'https://www.bajajfinservmarkets.in/'
    },
    {
      imageUrl: 'https://i.pinimg.com/736x/e1/b2/c8/e1b2c832004912c7c5f11c3089604b27.jpg',
      link: 'https://www.amazon.in/'
    },
    {
      imageUrl: 'https://images-static.nykaa.com/uploads/5a8e0ecc-9e0c-4aa4-9fa7-df1700b2f3b5.jpg?tr=cm-pad_resize,w-600',
      link: 'https://www.nykaa.com/'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <div className="relative h-48 rounded-xl overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleImageClick(slide.link)}
            />
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection; 