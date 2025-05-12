import React from 'react';
import { Card, CardContent } from './ui/card';

const MadeInIndia: React.FC = () => {
  return (
    <Card className="border-none shadow-sm mb-6 overflow-hidden animate-fade-in">
      <CardContent className="p-0">
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 p-4 relative">
          {/* Indian flag color strip at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex animate-pulse">
            <div className="flex-1 bg-orange-500"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-green-600"></div>
          </div>
          
          <div className="flex-1 pl-1">
            <h3 className="font-bold text-xl text-orange-500 mb-1">Built in India</h3>
            <p className="text-sm text-white/90 font-medium">crafted in <span className="uppercase">Hyderabad</span></p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="https://media-hosting.imagekit.io/8a844745be634daa/screenshot_1746128923624.png?Expires=1840736926&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=U3pmoPltVVTneGSf0lyWANk4f5DzdNeuY4S-nb7O7smIdti6KMUfHLx-ZZ4Xl-BpZ7XqkHzVXGehBvxjVXKzBcFhhIQPQFaSS7asQr3zN291ofpm0l22L-waY5DZpq95pCUbozVeT39Ur7xI5EKdgcq21h0PZrw6vBuijNFwp6R21BdUN0fpJ7g4OQtFVBG80DutJELUdhRjVVB7aoR2Ilr7GPrOuTac8STt5SmV8gVaN9zHaM89TBm9w0J-J2w9vP8kC8WV3K~nUUat0fxaqWOF6e77cnGtc0n-fI81w77ZY6daPXSJ93AG44TfGLwwmgW99ZfAWmKESmf1YUVUTg__" 
              alt="Made in India" 
              className="h-16 object-contain rounded"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MadeInIndia; 