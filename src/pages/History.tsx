import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TransactionHistory from '@/components/TransactionHistory';
import { useUser } from '@clerk/clerk-react';

const History = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <div className="container mx-auto max-w-md px-4 py-6">
      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-lg shadow-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
      </div>

      {isSignedIn ? (
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-lg overflow-hidden p-4">
          <TransactionHistory />
        </div>
      ) : (
        <div className="text-center py-10 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-lg">
          <p className="text-gray-400 mb-4">Please sign in to view your transaction history</p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          >
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
