
import React from 'react';

interface SplashScreenProps {
  isVisible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-dark-blue flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 animate-pulse-soft">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 12L38 22H22L30 12Z" fill="#d8315b" />
            <circle cx="30" cy="34" r="14" stroke="#3e92cc" strokeWidth="4" fill="none" />
            <path d="M30 20V48" stroke="#0a2463" strokeWidth="3" />
            <path d="M22 34H38" stroke="#0a2463" strokeWidth="3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Jar Finance</h1>
        <p className="text-white/70 text-sm mt-2">Invest & Grow</p>
      </div>
    </div>
  );
};

export default SplashScreen;
