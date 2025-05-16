import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Train, Bus, PlaneTakeoff, Train as Metro, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

const Travel: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const openWebView = (url: string, label: string) => {
    // Store the URL in localStorage for the WebView component to use
    localStorage.setItem('webViewUrl', url);
    localStorage.setItem('webViewTitle', label);
    
    if (!isSignedIn) {
      toast("Please sign in to use this feature");
      return;
    }
    
    toast(`Opening ${label} with auto-login`);
    navigate('/webview');
  };

  const handleMetroClick = () => {
    toast("Metro booking will be available soon!");
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="p-0 mr-3" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Travel & Transit</h1>
        </div>

        <div className="mb-4 bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-300">
            Your Clerk account details will be used for auto-login on these travel sites when available.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Hotels */}
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-full h-auto p-4 border-gray-700 hover:bg-gray-800 text-left"
            onClick={() => openWebView("https://www.goibibo.com/offers/sterling-group/?utm_source=Grabon&utm_medium=DisplayAffiliate&utm_campaign=Hotels_Grabon", "Hotels")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center mr-3">
                <Building2 size={20} className="text-purple-200" />
              </div>
              <span className="text-lg font-medium">Hotels</span>
            </div>
            <ExternalLink size={18} className="text-gray-400" />
          </Button>

          {/* Trains */}
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-full h-auto p-4 border-gray-700 hover:bg-gray-800 text-left"
            onClick={() => openWebView("https://www.railyatri.in/train-ticket?utm_source=icubes_affiliate_leads?utm_medium=204_{aff_sub}&aff_sub1=3167_1_204102_cc_c_802032_0&aff_sub2=802032", "Trains")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                <Train size={20} className="text-blue-200" />
              </div>
              <span className="text-lg font-medium">Trains</span>
            </div>
            <ExternalLink size={18} className="text-gray-400" />
          </Button>

          {/* Bus */}
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-full h-auto p-4 border-gray-700 hover:bg-gray-800 text-left"
            onClick={() => openWebView("https://www.redbus.in/?_branch_match_id=1300502505759436573&utm_source=grabon&utm_campaign=India-Bus-GrabOn-Branding&utm_medium=marketing&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXzzUrSNVLLCjQy8nMy9YP8QwvzsqI9An1SbKvK0pNSy0qysxLj08qyi8vTi2ydc4oys9NBQD4tQ4POwAAAA%3D%3D", "Bus")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center mr-3">
                <Bus size={20} className="text-red-200" />
              </div>
              <span className="text-lg font-medium">Bus</span>
            </div>
            <ExternalLink size={18} className="text-gray-400" />
          </Button>

          {/* Flights */}
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-full h-auto p-4 border-gray-700 hover:bg-gray-800 text-left"
            onClick={() => openWebView("https://www.airindia.com/en-in/book-flights/?em_dc=GRABAIR&utm_source=GrabOn&utm_medium=affiliate&utm_campaign=AirIndia_Direct_Banner", "Flights")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center mr-3">
                <PlaneTakeoff size={20} className="text-cyan-200" />
              </div>
              <span className="text-lg font-medium">Flights</span>
            </div>
            <ExternalLink size={18} className="text-gray-400" />
          </Button>

          {/* Metro (Coming Soon) */}
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-full h-auto p-4 border-gray-700 hover:bg-gray-800 text-left"
            onClick={handleMetroClick}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center mr-3">
                <Metro size={20} className="text-green-200" />
              </div>
              <span className="text-lg font-medium">Metro</span>
            </div>
            <div className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-300 text-xs">
              Coming Soon
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Travel; 