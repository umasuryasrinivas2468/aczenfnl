import React from 'react';

const Illustration: React.FC = () => {
  return (
    <div className="flex justify-center mb-4 animate-fade-in w-full">
      <div className="relative w-full h-auto max-w-full sm:max-w-lg">
        <img 
          src="https://media-hosting.imagekit.io/03cdaa93cecd497d/screenshot_1746877505451.png?Expires=1841485508&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=gzUt-eqn10Q82pY1XsbehhBLkKXbD9gBOMYt9UCw8m9sllIvA5TL2IybhqPyiVZyd7TOSlDpNEkfo2WMEayLBJMzqa7LMNCvHYp9psT~hooFD4q3OhsRcGMUJSzhUP-oXoFEiUHBXBTWkimkqwabUjpehuB1XkjzE2GuPwXruEMXpuqkYxEZQlvEwP5m-AEk6L0XDnaB1a5KCAhkO2r6OCTqbeIvj-K9t4tEJxPRopMfA4sgJSaTW5rqnDY8w7bhKJA8kANKWlQ4D-6jLqxVJEqvbRGUTaPox9-QD9bQPXNW3-DbBEl2EQFEAcj-JNMIFX6bAEhiaeY2U3bUeUWTmg__" 
          alt="App Illustration" 
          className="w-full h-auto object-contain max-h-[70vh]"
        />
      </div>
    </div>
  );
};

export default Illustration;
