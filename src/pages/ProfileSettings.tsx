
import React from 'react';
import { ArrowLeft, User, Bell, Shield, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();

  const settingsItems = [
    { icon: User, title: 'Personal Information', description: 'Name, Email, Phone, Address' },
    { icon: Bell, title: 'Notifications', description: 'Investment alerts, App updates' },
    { icon: Shield, title: 'Security', description: 'Password, PIN, Biometrics' },
    { icon: CreditCard, title: 'Payment Methods', description: 'Bank accounts, Cards, UPI' },
    { icon: HelpCircle, title: 'Help & Support', description: 'FAQs, Contact Us' },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-off-white">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="text-dark-blue" size={24} />
          </Button>
          <h1 className="text-xl font-bold text-dark-blue">Profile & Settings</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-light-blue/10 flex items-center justify-center">
              <User className="text-dark-blue" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-blue">John Doe</h2>
              <p className="text-gray-500 text-sm">+91 98765 43210</p>
              <p className="text-gray-500 text-sm">johndoe@example.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-dark-blue">Dark Mode</h3>
            <Switch />
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-dark-blue">Notifications</h3>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm divide-y animate-fade-in">
          {settingsItems.map((item, index) => (
            <button 
              key={index}
              className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-light-blue/10 flex items-center justify-center mr-3">
                <item.icon className="text-dark-blue" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-dark-blue">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-6 border-vibrant-red text-vibrant-red hover:bg-vibrant-red/5 animate-fade-in"
        >
          <LogOut className="mr-2" size={18} />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
