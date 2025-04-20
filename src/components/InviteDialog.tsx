
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MessageSquare, Send, WhatsApp } from "lucide-react";

const InviteDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const { toast } = useToast();

  const handleShare = (method: string) => {
    toast({
      title: "Success",
      description: `Invitation sent via ${method}`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Invitation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            variant="outline" 
            className="flex gap-2 h-12"
            onClick={() => handleShare('WhatsApp')}
          >
            <WhatsApp className="text-green-500" />
            Share via WhatsApp
          </Button>
          <Button 
            variant="outline"
            className="flex gap-2 h-12"
            onClick={() => handleShare('Email')}
          >
            <Mail className="text-blue-500" />
            Share via Email
          </Button>
          <Button 
            variant="outline"
            className="flex gap-2 h-12"
            onClick={() => handleShare('Messenger')}
          >
            <MessageSquare className="text-blue-600" />
            Share via Messenger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
