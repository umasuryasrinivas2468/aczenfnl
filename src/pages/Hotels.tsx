import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Building2, Calendar as CalendarIcon, MapPin, Star, Users } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import Header from '@/components/Header';

const Hotels: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guests, setGuests] = useState('2');

  // Sample hotel data
  const hotels = [
    {
      id: 1,
      name: 'Luxury Horizon Hotel',
      location: 'Mumbai, India',
      price: 3200,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      amenities: ['Free WiFi', 'Swimming pool', 'Spa', 'Restaurant']
    },
    {
      id: 2,
      name: 'Green Valley Resort',
      location: 'Bengaluru, India',
      price: 2800,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      amenities: ['Free WiFi', 'Swimming pool', 'Fitness center']
    },
    {
      id: 3,
      name: 'Coastal Paradise Inn',
      location: 'Goa, India',
      price: 4500,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      amenities: ['Beach access', 'Free WiFi', 'Bar', 'Pool']
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search for hotels
    console.log({
      location,
      checkInDate,
      checkOutDate,
      guests
    });
  };

  const handleBookHotel = (hotelId: number) => {
    // In a real app, this would navigate to a details page
    // and ultimately to the Cashfree payment gateway
    const selectedHotel = hotels.find(hotel => hotel.id === hotelId);
    if (selectedHotel) {
      const amount = selectedHotel.price;
      if (amount <= 5000) {
        // Construct Cashfree URL with amount
        const cashfreeUrl = `https://payments.cashfree.com/forms?code=aczen&amount=${amount}`;
        
        // Redirect to Cashfree
        window.location.href = cashfreeUrl;
      } else {
        alert("Payment amount exceeds ₹5000 limit.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-off-white">
      <div className="p-4">
        <Header />
        
        <div className="mt-4 mb-6">
          <div className="flex items-center mb-4">
            <Building2 className="text-purple-500 mr-2" size={24} />
            <h1 className="text-2xl font-bold">Hotels</h1>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-500" />
                    <Input 
                      placeholder="Where are you going?" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Check-in</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Check-out</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Guests</label>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-500" />
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="Number of guests" 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
                  Search Hotels
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mb-4">Popular Hotels</h2>
          
          <div className="space-y-4">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video w-full">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{hotel.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin size={14} className="mr-1" />
                          <span>{hotel.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md">
                        <Star size={14} className="mr-1 fill-current" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hotel.amenities.map((amenity, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <span className="text-lg font-bold">₹{hotel.price}</span>
                        <span className="text-sm text-gray-500">/night</span>
                      </div>
                      <Button 
                        onClick={() => handleBookHotel(hotel.id)}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotels; 