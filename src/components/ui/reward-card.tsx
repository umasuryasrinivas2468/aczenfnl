import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Reward } from '@/lib/services/rewards';
import { Copy, Gift, Clock, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RewardCardProps {
  reward: Reward;
  className?: string;
}

export function RewardCard({ reward, className }: RewardCardProps) {
  const { toast } = useToast();
  
  // Format the expiry date
  const formatExpiryDate = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  // Copy coupon code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(reward.code);
    toast({
      title: "Code copied!",
      description: "Coupon code has been copied to clipboard.",
    });
  };
  
  // Format discount display based on type
  const formatDiscount = (discount: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${discount}% OFF`;
      case 'fixed':
        return `₹${discount} OFF`;
      case 'cashback':
        return `₹${discount} CASHBACK`;
      default:
        return `${discount}% OFF`;
    }
  };
  
  // Get the appropriate background color class based on the category
  const getCategoryBgClass = (category?: string) => {
    switch (category) {
      case 'shopping':
        return 'bg-[#12052e] border-emerald-400/30';
      case 'travel':
        return 'bg-[#12052e] border-blue-400/30';
      case 'food':
        return 'bg-[#12052e] border-orange-400/30';
      case 'entertainment':
        return 'bg-[#12052e] border-purple-400/30';
      case 'investment':
        return 'bg-[#12052e] border-amber-400/30';
      default:
        return 'bg-[#12052e] border-slate-400/30';
    }
  };
  
  // Generate a fallback icon based on reward type/category
  const getIconByCategory = (category?: string) => {
    switch (category) {
      case 'shopping':
        return '🛍️';
      case 'travel':
        return '✈️';
      case 'food':
        return '🍔';
      case 'entertainment':
        return '🎬';
      case 'investment':
        return '💰';
      default:
        return '🎁';
    }
  };
  
  return (
    <Card className={cn(
      "overflow-hidden border-2 text-white",
      getCategoryBgClass(reward.category),
      className,
      reward.isNew ? "ring-2 ring-pink-500" : ""
    )}>
      <div className="flex items-start">
        <div className="flex-1">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold line-clamp-2 text-white">
                {reward.title}
              </CardTitle>
              
              {reward.brand && (
                <Badge variant="outline" className="uppercase text-xs font-medium ml-2 whitespace-nowrap border-purple-500 text-purple-200">
                  {reward.brand}
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm mt-1 line-clamp-2 text-purple-200">{reward.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 pt-2 pb-0">
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="text-sm flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1 text-purple-300" />
                  <span className={cn(
                    "text-purple-300",
                    reward.isExpiring ? "text-pink-400 font-medium" : ""
                  )}>
                    Expires: {formatExpiryDate(reward.expiresAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1">
                {reward.isNew && (
                  <Badge className="bg-pink-600 hover:bg-pink-700 text-white">
                    New
                  </Badge>
                )}
                
                {reward.isExpiring && !reward.isNew && (
                  <Badge variant="destructive">
                    Expiring Soon
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </div>
        
        <div className="p-4 flex-shrink-0 hidden md:block">
          {reward.imageUrl ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#0c0121] flex items-center justify-center border border-purple-500/30">
              <img 
                src={reward.imageUrl} 
                alt={reward.title}
                className="w-full h-full object-contain p-1" 
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const fallbackDiv = e.currentTarget.nextElementSibling as HTMLDivElement;
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              />
              <div 
                className="w-full h-full items-center justify-center text-3xl hidden"
                style={{ display: 'none' }}
              >
                {getIconByCategory(reward.category)}
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[#0c0121] flex items-center justify-center text-3xl border border-purple-500/30">
              {getIconByCategory(reward.category)}
            </div>
          )}
        </div>
      </div>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="w-full p-2 bg-[#0c0121] rounded-md flex items-center justify-between">
          <Badge variant="outline" className="bg-[#20103e] text-purple-200 px-2 font-mono border-purple-500/50">
            {reward.code}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-purple-200 hover:text-white hover:bg-purple-900/50" onClick={copyCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between w-full">
          <Badge variant="secondary" className="text-sm py-1.5 px-3 bg-purple-900/80 text-purple-200 border-purple-500/20">
            {formatDiscount(reward.discount, reward.type)}
          </Badge>
          <Button variant="default" size="sm" className="gap-1.5 bg-pink-600 hover:bg-pink-700 text-white">
            <Gift className="h-4 w-4" />
            <span>Use Reward</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 