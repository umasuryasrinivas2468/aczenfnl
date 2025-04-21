
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

// Empty transaction history initially
const userTransactions = [];

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
          {userTransactions.length > 0 ? (
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
                {userTransactions.map((transaction: any) => (
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
