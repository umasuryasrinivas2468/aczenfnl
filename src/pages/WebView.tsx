import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';

const WebView: React.FC = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('WebView');
  const [loading, setLoading] = useState<boolean>(true);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    // Get the URL and title from localStorage
    const storedUrl = localStorage.getItem('webViewUrl');
    const storedTitle = localStorage.getItem('webViewTitle');
    
    if (storedUrl) {
      // Append user authentication parameters if user is signed in
      if (isSignedIn && user) {
        const userEmail = user.primaryEmailAddress?.emailAddress;
        const userName = user.fullName;
        const userId = user.id;
        
        // Create a URL object to easily manipulate the URL
        const urlObj = new URL(storedUrl);
        
        // Add authentication parameters
        if (userEmail) urlObj.searchParams.append('email', userEmail);
        if (userName) urlObj.searchParams.append('name', userName);
        if (userId) urlObj.searchParams.append('user_id', userId);
        
        // Set the modified URL
        setUrl(urlObj.toString());
      } else {
        setUrl(storedUrl);
      }
    } else {
      // If no URL is found, go back to the previous page
      navigate(-1);
    }
    
    if (storedTitle) {
      setTitle(storedTitle);
    }
    
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      // Clean up localStorage when component unmounts
      localStorage.removeItem('webViewUrl');
      localStorage.removeItem('webViewTitle');
    };
  }, [navigate, isSignedIn, user]);

  const handleRefresh = () => {
    setLoading(true);
    const iframe = document.getElementById('webview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = url;
    }
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-gray-900">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 text-white" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">{title}</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={() => navigate(-1)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-t-pink-500 border-gray-700 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* WebView iframe */}
      <div className={`flex-1 ${loading ? 'hidden' : 'block'}`}>
        <iframe
          id="webview-iframe"
          src={url}
          className="w-full h-full border-none"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
          referrerPolicy="origin"
        />
      </div>
    </div>
  );
};

export default WebView; 