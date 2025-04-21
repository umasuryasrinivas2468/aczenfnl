
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

// Sample transaction history data - this would typically come from an API
const sampleTransactions = [
  { id: 1, date: '2025-04-19', type: 'Buy', amount: 3000, weight: 0.51, status: 'Completed' },
  { id: 2, date: '2025-04-15', type: 'Buy', amount: 2500, weight: 0.42, status: 'Completed' },
  { id: 3, date: '2025-04-10', type: 'Buy', amount: 4000, weight: 0.68, status: 'Completed' },
  { id: 4, date: '2025-04-05', type: 'Buy', amount: 1500, weight: 0.25, status: 'Completed' },
];

const History = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-off-white">
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

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {sampleTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>₹{transaction.amount}</TableCell>
                    <TableCell>{transaction.weight}g</TableCell>
                    <TableCell>{transaction.status}</TableCell>
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
      </div>
    </div>
  );
};

export default History;
