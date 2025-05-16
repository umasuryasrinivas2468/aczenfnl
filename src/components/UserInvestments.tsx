import React from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Coins, Info } from 'lucide-react';
import { format } from 'date-fns';

const UserInvestments: React.FC = () => {
  const { 
    investments, 
    goldInvestments, 
    silverInvestments, 
    totalInvestment, 
    loading, 
    error, 
    refreshInvestments 
  } = useInvestments();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Investments</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshInvestments}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle>Investment Summary</CardTitle>
          <CardDescription>Overview of your precious metal investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Total Investment</span>
              <span className="font-bold">₹{totalInvestment.toFixed(2)}</span>
            </div>
            <Separator className="bg-gray-800" />
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Gold Investment</span>
              <span>₹{goldInvestments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Silver Investment</span>
              <span>₹{silverInvestments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}</span>
            </div>
            <Separator className="bg-gray-800" />
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Total Transactions</span>
              <span>{investments.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
            <p className="text-gray-400">Loading your investments...</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <Coins className="h-10 w-10 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">You haven't made any investments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.slice(0, 5).map((investment) => (
              <Card key={investment.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{investment.metal_type}</p>
                      <p className="text-xs text-gray-400">
                        {investment.created_at ? formatDate(investment.created_at) : 'Unknown date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{investment.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {investments.length > 5 && (
              <div className="text-center">
                <Button variant="ghost" size="sm" className="text-blue-400">
                  View All Transactions
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 bg-blue-900/20 p-4 rounded-lg flex gap-2">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          Your investment data is securely stored and synced across all your devices.
        </p>
      </div>
    </div>
  );
};

export default UserInvestments; 