import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleUserClick = () => {
    navigate('/profile');
  };

  return (
    <div className="flex justify-between items-center py-4 px-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Aczen</h1>
      </div>
      <div className="flex items-center space-x-2">
        <div 
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity active:scale-95 border-2 border-blue-500 shadow-md"
          onClick={handleUserClick}
        >
          {user && user.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user ? (user.firstName?.charAt(0) || user.username?.charAt(0) || 'U') : <User className="w-5 h-5" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
