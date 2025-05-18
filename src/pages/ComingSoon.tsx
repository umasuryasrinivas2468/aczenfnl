import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ComingSoon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  
  // Get service details from location state or default to generic
  const service = location.state?.service || {
    title: 'This Service',
    image: 'https://i.imgur.com/CTwpLo8.png',
    description: 'We\'re working hard to bring this service to you soon.'
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    // Store notification request
    try {
      // Save to localStorage for demo purposes
      const notifyList = JSON.parse(localStorage.getItem('notifyList') || '[]');
      notifyList.push({
        email,
        service: service.title,
        date: new Date().toISOString()
      });
      localStorage.setItem('notifyList', JSON.stringify(notifyList));
      
      // Show success message
      toast.success(`We'll notify you when ${service.title} launches!`);
      setEmail('');
    } catch (error) {
      console.error('Error saving notification request:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{service.title}</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Coming Soon Content */}
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Service Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <img 
              src={service.image} 
              alt={service.title}
              className="w-40 h-40 object-contain"
            />
          </motion.div>
          
          {/* Coming Soon Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-2">Coming Soon</h2>
            <p className="text-gray-400 mb-8">{service.description}</p>
          </motion.div>
          
          {/* Notification Form */}
          <motion.form 
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onSubmit={handleSubmit}
          >
            <p className="text-sm text-gray-400 mb-4">
              Get notified when we launch this service
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button type="submit">
                Notify Me
              </Button>
            </div>
          </motion.form>
          
          {/* Features Preview */}
          <motion.div 
            className="mt-12 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-left">Coming Features</h3>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              {service.title === 'Metro' ? (
                <>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>QR ticket generation for quick entry</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Metro card recharge with UPI</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Real-time train schedules and alerts</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Multi-city metro support</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Seamless booking experience</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Special discounts and cashbacks</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Integrated with your investments</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon; 