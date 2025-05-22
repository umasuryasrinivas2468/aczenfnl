import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  RefreshCw, 
  Search, 
  ArrowUpDown, 
  CreditCard, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  IndianRupee,
  Wallet,
  ShieldCheck,
  TrendingUp,
  PiggyBank
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from 'date-fns';
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  user_id: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  metal_type: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

type SortField = 'created_at' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

const TransactionHistory = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Stats
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0
  });

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching transactions from Supabase for user:', user.id);
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }
      
      const normalizedData = (supabaseData || []).map(tx => ({
        ...tx,
        // Normalize status to lowercase for consistency
        status: tx.status?.toLowerCase() === 'success' ? 'completed' : 
                tx.status?.toLowerCase() === 'failed' ? 'failed' :
                tx.status?.toLowerCase() === 'pending' ? 'pending' : tx.status?.toLowerCase()
      }));
      
      setTransactions(normalizedData);
      
      // Calculate stats
      if (normalizedData.length > 0) {
        const total = normalizedData.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const completed = normalizedData.filter(tx => tx.status === 'completed').length;
        const pending = normalizedData.filter(tx => tx.status === 'pending').length;
        const failed = normalizedData.filter(tx => tx.status === 'failed').length;
        
        setStats({
          totalTransactions: normalizedData.length,
          totalAmount: total,
          completedTransactions: completed,
          pendingTransactions: pending,
          failedTransactions: failed
        });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Sort and filter transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(tx => tx.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.order_id.toLowerCase().includes(term) || 
        tx.payment_id?.toLowerCase().includes(term) ||
        tx.metal_type.toLowerCase().includes(term) ||
        tx.payment_method.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'created_at') {
        return sortDirection === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortField === 'status') {
        const statusOrder = { completed: 0, pending: 1, failed: 2 };
        return sortDirection === 'asc'
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      }
      return 0;
    });
    
    return result;
  }, [transactions, statusFilter, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Completed</span>
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          <span>Failed</span>
        </Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Unknown</span>
        </Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        formatted: format(date, 'MMM dd, yyyy • HH:mm')
      };
    } catch (err) {
      return {
        relative: 'Invalid date',
        formatted: 'Invalid date'
      };
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Please sign in to view your transaction history</p>
        <p className="text-gray-400 mt-2">You need to be logged in to access this feature</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
          <p className="text-gray-500 mt-1">View and manage your transaction records</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchTransactions}
          disabled={loading}
          className="self-end md:self-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
    
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {loading ? <Skeleton className="h-8 w-20" /> : stats.totalTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Total value: ₹{loading ? '--' : stats.totalAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {loading ? <Skeleton className="h-8 w-20" /> : stats.completedTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {loading ? '--' : Math.round((stats.completedTransactions / stats.totalTransactions) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              {loading ? <Skeleton className="h-8 w-20" /> : stats.pendingTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {loading ? '--' : Math.round((stats.pendingTransactions / stats.totalTransactions) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              {loading ? <Skeleton className="h-8 w-20" /> : stats.failedTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {loading ? '--' : Math.round((stats.failedTransactions / stats.totalTransactions) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by order ID, metal type..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading transactions</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-gray-50">
          <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No transactions found</p>
          <p className="text-gray-400 mt-1">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Make your first purchase to see transactions here'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Order Details</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-medium flex items-center gap-1 -ml-4 h-8"
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-medium flex items-center gap-1 -ml-4 h-8"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-medium flex items-center gap-1 -ml-4 h-8"
                    onClick={() => handleSort('created_at')}
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.map((transaction) => {
                const dateInfo = formatDate(transaction.created_at);
                return (
                  <TableRow key={transaction.id} className="group">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {transaction.order_id.substring(0, 10)}...
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.payment_method}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1 text-gray-500" />
                        {transaction.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className="capitalize bg-gray-50 group-hover:bg-gray-100">
                          <Tag className="h-3 w-3 mr-1 text-gray-500" />
                          {transaction.metal_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{dateInfo.relative}</div>
                        <div className="text-xs text-gray-500">{dateInfo.formatted}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 