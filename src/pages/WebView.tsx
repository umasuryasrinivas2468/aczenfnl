import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ExternalLink, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebViewProps {
  url?: string;
  title?: string;
}

const WebView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('Web View');
  
  // Define service URLs
  const serviceUrls: Record<string, { url: string, title: string }> = {
    flights: {
      url: 'https://www.makemytrip.com/flights/',
      title: 'Book Flights'
    },
    bus: {
      url: 'https://www.redbus.in/',
      title: 'Book Bus Tickets'
    },
    hotels: {
      url: 'https://www.booking.com/index.html',
      title: 'Book Hotels'
    },
    trains: {
      url: 'https://www.irctc.co.in/nget/train-search',
      title: 'Book Train Tickets'
    }
  };

  useEffect(() => {
    // Get service type from URL params or state
    const searchParams = new URLSearchParams(location.search);
    const serviceType = searchParams.get('service') || '';
    
    // If service info is in location state, use that
    if (location.state && location.state.url) {
      setUrl(location.state.url);
      setTitle(location.state.title || 'Web View');
      setLoading(false);
      return;
    }
    
    // If service type is provided and exists in our mapping
    if (serviceType && serviceUrls[serviceType]) {
      setUrl(serviceUrls[serviceType].url);
      setTitle(serviceUrls[serviceType].title);
    } else {
      // Default to a generic URL if service not found
      setUrl('https://aczen.in');
      setTitle('Aczen Services');
    }
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [location]);

  const handleRefresh = () => {
    setLoading(true);
    // Force iframe to reload by temporarily clearing the URL
    setUrl('');
    setTimeout(() => {
      setUrl(url);
      setTimeout(() => setLoading(false), 1000);
    }, 100);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">Loading {title}...</p>
          </div>
        ) : (
          <iframe 
            src={url} 
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

export default WebView; 