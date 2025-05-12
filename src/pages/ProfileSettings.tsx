import React from 'react';
import { ArrowLeft, User, Shield, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser, useClerk } from '@clerk/clerk-react';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const settingsItems = [
    { icon: User, title: 'Personal Information', description: 'Name, Email, Phone, Address' },
    { icon: Shield, title: 'Security', description: 'Password, PIN, Biometrics' },
    { icon: CreditCard, title: 'Payment Methods', description: 'Bank accounts, Cards, UPI' },
    { icon: HelpCircle, title: 'Help & Support', description: 'FAQs, Contact Us' },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="text-white" size={24} />
          </Button>
          <h1 className="text-xl font-bold">Profile & Settings</h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-4 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="text-blue-500" size={28} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.fullName || 'User'}</h2>
              <p className="text-gray-400 text-sm">{user?.primaryPhoneNumber?.toString() || 'No phone number'}</p>
              <p className="text-gray-400 text-sm">{user?.primaryEmailAddress?.emailAddress || 'No email'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-sm divide-y divide-gray-800 animate-fade-in">
          {settingsItems.map((item, index) => (
            <button 
              key={index}
              className="w-full flex items-center p-4 hover:bg-gray-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center mr-3">
                <item.icon className="text-blue-500" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-6 border-red-900 text-red-500 hover:bg-red-900/10 animate-fade-in"
          onClick={() => {
            signOut().then(() => {
              navigate('/sign-in');
            });
          }}
        >
          <LogOut className="mr-2" size={18} />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;

