import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Coins, Info, AlertTriangle, CheckCircle, Clock, Filter, Search, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/services/transactionService';
import { toast } from 'sonner';
import axios from 'axios';

const TransactionHistory: React.FC = () => {
  const { 
    transactions,
    goldTransactions,
    silverTransactions,
    totalAmount,
    goldAmount,
    silverAmount,
    loading, 
    error, 
    refreshTransactions 
  } = useTransactions();

  const [filter, setFilter] = useState<'all' | 'gold' | 'silver'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PENDING' | 'FAILED'>('all');
  const [updating, setUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get filtered transactions
  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    // Apply metal type filter
    if (filter === 'gold') {
      filtered = goldTransactions;
    } else if (filter === 'silver') {
      filtered = silverTransactions;
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-sm">{status}</Badge>;
    }
  };

  // Empty State Component
  const EmptyState = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Coins className="h-16 w-16 text-gray-700" />
          <Search className="h-8 w-8 text-blue-500 absolute -bottom-2 -right-2" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">No transactions found</h3>
      <p className="text-gray-400 mb-4">We couldn't find any transactions matching your current filters.</p>
      {(filter !== 'all' || statusFilter !== 'all') && (
        <Button 
          variant="outline" 
          className="border-blue-700 text-blue-400 hover:bg-blue-900/20"
          onClick={() => {
            setFilter('all');
            setStatusFilter('all');
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  // Function to manually check pending transactions
  const checkPendingTransactions = async () => {
    try {
      setUpdating(true);
      toast.info('Checking for pending transaction updates...');
      
      const response = await axios.get('/api/check-transactions');
      
      if (response.data && response.data.success) {
        if (response.data.updated > 0) {
          toast.success(`Updated ${response.data.updated} transaction(s)`);
          // Refresh the transaction list
          refreshTransactions();
        } else {
          toast.info('No transaction updates available');
        }
      } else {
        toast.error('Failed to check for updates');
      }
    } catch (error) {
      console.error('Error checking transactions:', error);
      toast.error('Error updating transactions');
    } finally {
      setUpdating(false);
    }
  };

  // Function to sync all transactions with notify URL
  const syncAllTransactions = async () => {
    try {
      setSyncing(true);
      toast.info('Syncing all transactions with payment provider...');
      
      const response = await axios.get('/api/sync-transactions');
      
      if (response.data && response.data.success) {
        if (response.data.updated > 0) {
          toast.success(`Updated ${response.data.updated} transaction(s)`);
        } else {
          toast.info('All transactions are already up to date');
        }
        
        // Display summary
        toast.info(`Processed ${response.data.total} transactions (${response.data.updated} updated, ${response.data.failed} failed)`);
        
        // Refresh the transaction list
        refreshTransactions();
      } else {
        toast.error('Failed to sync transactions');
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast.error('Error syncing transactions with payment provider');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Transaction Summary</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncAllTransactions}
            disabled={syncing || updating || loading}
            className="flex items-center gap-1 border-blue-700 text-blue-500 hover:bg-blue-900/20"
          >
            <Upload size={14} className={syncing ? 'animate-spin' : ''} />
            Sync All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkPendingTransactions}
            disabled={updating || syncing}
            className="flex items-center gap-1 border-yellow-700 text-yellow-500 hover:bg-yellow-900/20"
          >
            <Clock size={14} className={updating ? 'animate-spin' : ''} />
            Check Pending
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTransactions}
            disabled={loading || updating || syncing}
            className="flex items-center gap-1 border-blue-700 text-blue-500 hover:bg-blue-900/20"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Card className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border-gray-800 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Transaction Summary</CardTitle>
          <CardDescription className="text-gray-400">Overview of your purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Total Completed Purchases</span>
              <span className="font-bold text-white">₹{totalAmount.toFixed(2)}</span>
            </div>
            <Separator className="bg-gray-800" />
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Gold Purchases</span>
              <span className="text-yellow-400">₹{goldAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Silver Purchases</span>
              <span className="text-blue-400">₹{silverAmount.toFixed(2)}</span>
            </div>
            <Separator className="bg-gray-800" />
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Total Transactions</span>
              <span className="bg-blue-900/30 px-2 py-0.5 rounded-md text-blue-300">{transactions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent flex items-center">
            <Filter size={16} className="mr-2 text-blue-400" />
            Transaction List
          </h3>
          <div className="flex gap-2">
            <Select 
              value={filter} 
              onValueChange={(value) => setFilter(value as 'all' | 'gold' | 'silver')}
            >
              <SelectTrigger className="w-[120px] bg-gray-900 border-gray-700">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Metals</SelectItem>
                <SelectItem value="gold">Gold Only</SelectItem>
                <SelectItem value="silver">Silver Only</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as 'all' | 'PAID' | 'PENDING' | 'FAILED')}
            >
              <SelectTrigger className="w-[120px] bg-gray-900 border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PAID">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <Card 
                key={tx.id || tx.order_id} 
                className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border-gray-800 shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`rounded-full w-10 h-10 flex items-center justify-center mr-3 ${
                        tx.metal_type === 'gold' 
                          ? 'bg-yellow-900/30 text-yellow-500' 
                          : 'bg-blue-900/30 text-blue-500'
                      }`}>
                        <Coins size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-200 capitalize">{tx.metal_type} Purchase</h4>
                        <p className="text-xs text-gray-400">{tx.created_at ? formatDate(tx.created_at) : 'No date'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-white">₹{tx.amount.toFixed(2)}</span>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-800 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Order ID</span>
                      <span className="text-gray-300 font-mono">{tx.order_id.substring(0, 15)}...</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">Payment Method</span>
                      <span className="text-gray-300">{tx.payment_method || 'UPI'}</span>
                    </div>
                  </div>
                  {tx.status === 'PENDING' && (
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Call the API to check this specific transaction
                          checkPendingTransactions();
                        }}
                        className="text-xs border-yellow-700 text-yellow-500 hover:bg-yellow-900/20"
                      >
                        <RefreshCw size={12} className="mr-1" />
                        Check Status
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {filteredTransactions.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              className="border-blue-700 text-blue-400 hover:bg-blue-900/20"
              onClick={refreshTransactions}
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Transactions
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 p-4 rounded-lg flex gap-2">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          Your transaction history shows all purchase attempts. Use the "Check Pending" button to update status of pending transactions.
        </p>
      </div>
    </div>
  );
};

export default TransactionHistory; 