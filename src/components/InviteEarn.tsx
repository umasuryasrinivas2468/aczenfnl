
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import InviteDialog from './InviteDialog';

const InviteEarn: React.FC = () => {
  return (
    <Card className="border-none shadow-sm mb-6 overflow-hidden animate-fade-in">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-dark-blue to-light-blue p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg mb-1">Invite & Earn</h3>
              <p className="text-sm text-white/90 mb-3">Earn ₹100 on every friend who invests</p>
              <InviteDialog 
                trigger={
                  <Button size="sm" className="bg-white text-dark-blue hover:bg-white/90">
                    Invite Now
                  </Button>
                }
              />
            </div>
            <div className="w-20 h-20 flex items-center justify-center bg-white/20 rounded-full">
              <span className="text-xl font-bold">₹100</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteEarn;
