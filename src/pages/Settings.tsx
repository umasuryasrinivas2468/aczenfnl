import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  FileText, 
  Phone, 
  Mail, 
  ChevronRight,
  Smartphone,
  MessageSquare,
  LogOut
} from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { name: 'Profile Information', icon: User, route: '/profile' },
        { name: 'Notifications', icon: Bell, route: '/notifications' },
        { name: 'Privacy & Security', icon: Shield, route: '/privacy' }
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Help Center', icon: HelpCircle, route: '/help' },
        { name: 'Contact Us', icon: Phone, route: '/contact' },
        { name: 'Report an Issue', icon: MessageSquare, route: '/report' }
      ]
    },
    {
      title: 'Legal',
      items: [
        { name: 'Terms of Service', icon: FileText, route: '/terms' },
        { name: 'Privacy Policy', icon: Shield, route: '/privacy-policy' },
        { name: 'About Us', icon: Mail, route: '/about' }
      ]
    }
  ];

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
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700">
          <img src="/images/profile.jpg" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold">User Name</h2>
          <p className="text-sm text-gray-400">user@example.com</p>
        </div>
        <button className="ml-auto p-2 rounded-full bg-gray-800 hover:bg-gray-700">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Sections */}
      <div className="p-4">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{section.title}</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button 
                  key={itemIndex} 
                  className="w-full flex items-center p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
                  onClick={() => navigate(item.route)}
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800">
                    <item.icon className="w-4 h-4" />
                  </span>
                  <span className="ml-3 flex-1 text-left">{item.name}</span>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="p-4 border-t border-gray-800">
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
        <button 
          className="w-full py-3 flex items-center justify-center bg-red-900 hover:bg-red-800 rounded-lg"
          onClick={() => {
            // Use Clerk's signOut method
            import('@clerk/clerk-react').then(({ useAuth }) => {
              const { signOut } = useAuth();
              signOut().then(() => {
                navigate('/sign-in');
              });
            });
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Settings; 