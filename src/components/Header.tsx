
import React from 'react';
import { Bell, Settings, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center py-4 px-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-dark-blue">Aczen</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/login')}
          className="text-dark-blue hover:text-light-blue transition-colors"
          aria-label="Login"
        >
          <LogIn size={24} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-dark-blue hover:text-light-blue transition-colors"
          aria-label="Notifications"
        >
          <Bell size={24} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-dark-blue hover:text-light-blue transition-colors"
          aria-label="Settings"
        >
          <Settings size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Header;
