import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Transaction {
  id: string;
  type: 'gold' | 'silver';
  amount: number;
  date: string;
  status: string;
  transactionId?: string;
}

interface UserInvestments {
  totalInvestment: number;
  investments: any;
  transactions: Transaction[];
}

const defaultInvestments: UserInvestments = {
  totalInvestment: 0,
  investments: {
    gold: {
      type: 'gold',
      amount: 0,
      weight: 0,
      weightUnit: 'grams',
    },
    silver: {
      type: 'silver',
      amount: 0,
      weight: 0,
      weightUnit: 'grams',
    }
  },
  transactions: []
};

const History = () => {
  const navigate = useNavigate();
  const [userInvestments] = useLocalStorage<UserInvestments>('userInvestments', defaultInvestments);

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
          <h1 className="text-xl font-bold">Transaction History</h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          {userInvestments.transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userInvestments.transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id} className="border-gray-800">
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>₹{transaction.amount}</TableCell>
                    <TableCell>
                      <span className={transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transaction history available
            </div>
          )}
        </div>
        
        {userInvestments.transactions.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Transaction Details</h2>
            {userInvestments.transactions.map((transaction: Transaction) => (
              <div key={transaction.id} className="mb-4 p-3 border border-gray-800 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Transaction ID</span>
                  <span>{transaction.transactionId || transaction.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Date</span>
                  <span>{new Date(transaction.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Type</span>
                  <span className="capitalize">{transaction.type} purchase</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount</span>
                  <span>₹{transaction.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
