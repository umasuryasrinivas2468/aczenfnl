import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  HelpCircle, 
  ChevronRight,
  Smartphone,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsSections = [
    {
      title: 'Legal',
      items: [
        { 
          name: 'Privacy Policy', 
          icon: FileText, 
          link: 'https://aczen.in/privacy',
          external: true 
        },
        { 
          name: 'Terms & Conditions', 
          icon: FileText, 
          link: 'https://aczen.in/terms',
          external: true 
        },
        { 
          name: 'Refund Policy', 
          icon: FileText, 
          link: 'https://aczen.in/refund',
          external: true 
        }
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          name: 'Contact Support', 
          icon: HelpCircle, 
          link: 'https://tally.so/r/mRga8p',
          external: true 
        }
      ]
    }
  ];

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Here you would typically upload the file to your server
      // and update the user's profile photo
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black text-white min-h-screen">
      {/* Header */}
      <div className="p-4 flex items-center border-b border-gray-800">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-4">Settings</h1>
      </div>

      {/* Profile Preview */}
      <div className="p-6 flex items-center border-b border-gray-800">
        <div 
          className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 cursor-pointer relative group"
          onClick={handleProfilePhotoClick}
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-3" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white">Change Photo</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <div className="ml-4">
          <h2 className="text-lg font-semibold">{user?.fullName || 'User'}</h2>
          <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{section.title}</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <a 
                  key={itemIndex} 
                  href={item.link}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="w-full flex items-center p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800">
                    <item.icon className="w-4 h-4" />
                  </span>
                  <span className="ml-3 flex-1 text-left">{item.name}</span>
                  {item.external ? (
                    <ExternalLink className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="px-4 py-2 border-t border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">App Version</h3>
            <p className="text-xs text-gray-400">1.0.0 (Build 42)</p>
          </div>
          <Smartphone className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <Button 
          className="w-full py-3 flex items-center justify-center bg-red-900 hover:bg-red-800 rounded-lg"
          onClick={() => {
            signOut().then(() => {
              navigate('/sign-in');
            });
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span className="font-medium">Log Out</span>
        </Button>
      </div>
    </div>
  );
};

export default Settings; 