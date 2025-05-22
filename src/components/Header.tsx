import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const displayName = user?.firstName || user?.username || 'User';

  return (
    <div className="flex justify-between items-center py-4 px-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Hello {displayName} 👋 </h1>
      </div>
      <div className="flex items-center space-x-2">
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')}
            className="text-white hover:text-gray-300 hover:bg-gray-800 transition-colors"
            aria-label="Profile"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
