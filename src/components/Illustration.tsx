
import React from 'react';

const Illustration: React.FC = () => {
  return (
    <div className="flex justify-center mb-4 animate-fade-in">
      <div className="relative h-32 w-full max-w-sm">
        <div className="absolute w-full h-full flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 350 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            {/* Sky background */}
            <rect width="350" height="120" fill="#e6f2ff" />
            
            {/* Charminar outline - Simplified illustration */}
            <path d="M150 100H200V40C200 40 185 35 175 35C165 35 150 40 150 40V100Z" fill="#f2f2f2" stroke="#0a2463" strokeWidth="1" />
            <path d="M145 40H205V35C205 35 190 30 175 30C160 30 145 35 145 35V40Z" fill="#f2f2f2" stroke="#0a2463" strokeWidth="1" />
            
            {/* Domes */}
            <path d="M160 35C160 30 165 25 175 25C185 25 190 30 190 35" stroke="#0a2463" strokeWidth="1" />
            
            {/* Windows */}
            <rect x="160" y="50" width="10" height="15" fill="#3e92cc" stroke="#0a2463" strokeWidth="0.5" />
            <rect x="180" y="50" width="10" height="15" fill="#3e92cc" stroke="#0a2463" strokeWidth="0.5" />
            <rect x="160" y="75" width="10" height="15" fill="#3e92cc" stroke="#0a2463" strokeWidth="0.5" />
            <rect x="180" y="75" width="10" height="15" fill="#3e92cc" stroke="#0a2463" strokeWidth="0.5" />
            
            {/* Buildings */}
            <rect x="110" y="60" width="30" height="40" fill="#f2f2f2" stroke="#0a2463" strokeWidth="1" />
            <rect x="210" y="70" width="40" height="30" fill="#f2f2f2" stroke="#0a2463" strokeWidth="1" />
            
            {/* Ground */}
            <rect x="0" y="100" width="350" height="20" fill="#d8315b" opacity="0.1" />
            
            {/* Gold/Silver coins falling */}
            <circle cx="130" cy="40" r="5" fill="#FFD700" opacity="0.9" />
            <circle cx="220" cy="50" r="4" fill="#C0C0C0" opacity="0.9" />
            <circle cx="180" cy="30" r="3" fill="#FFD700" opacity="0.8" />
            <circle cx="250" cy="40" r="4" fill="#C0C0C0" opacity="0.7" />
            <circle cx="100" cy="60" r="3" fill="#FFD700" opacity="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Illustration;
