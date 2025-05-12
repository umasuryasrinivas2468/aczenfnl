import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, Lock } from 'lucide-react';
import { RewardLinksService, type RewardLink } from '@/lib/services/reward-links';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TodaysDealsProps {
  userId: string; // Pass the user ID to track claims
}

export const TodaysDeals: React.FC<TodaysDealsProps> = ({ userId }) => {
  const [rewardLinks, setRewardLinks] = useState<RewardLink[]>([]);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [claimedLinkId, setClaimedLinkId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load available reward links
    const links = RewardLinksService.getAvailableRewardLinks();
    setRewardLinks(links);
    
    // Check if user has claimed a reward today
    const hasClaimed = RewardLinksService.hasUserClaimedToday(userId);
    setClaimedToday(hasClaimed);
    
    if (hasClaimed) {
      const linkId = RewardLinksService.getUserClaimedTodayLinkId(userId);
      setClaimedLinkId(linkId);
    }
  }, [userId]);

  const handleClaimReward = (linkId: string) => {
    if (claimedToday) {
      toast({
        variant: "destructive",
        title: "Already Claimed",
        description: "You've already claimed a deal today. Come back tomorrow!"
      });
      return;
    }

    const externalUrl = RewardLinksService.claimRewardLink(linkId, userId);
    
    if (externalUrl) {
      toast({
        title: "Deal Claimed!",
        description: "You'll be redirected to claim your deal."
      });
      
      // Update local state
      setClaimedToday(true);
      setClaimedLinkId(linkId);
      
      // Update the links to reflect the claim
      const updatedLinks = rewardLinks.map(link => {
        if (link.id === linkId) {
          return {
            ...link,
            claimedBy: [...link.claimedBy, userId]
          };
        }
        return link;
      });
      setRewardLinks(updatedLinks);
      
      // Open the external link in a new tab
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: "Unable to claim this deal. It may no longer be available."
      });
    }
  };

  // Format remaining time
  const formatRemainingTime = (validUntil: Date) => {
    const now = new Date();
    const diff = validUntil.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  // Check if user has already claimed this specific link
  const isLinkClaimedByUser = (link: RewardLink) => {
    return link.claimedBy.includes(userId);
  };

  // Based on the image, create a Box8-style deal card
  const renderFeaturedDeal = () => {
    const featuredDeal = rewardLinks[0]; // Use the first deal as featured
    
    if (!featuredDeal) return null;
    
    return (
      <div className="bg-gradient-to-r from-purple-900 to-amber-400 rounded-lg p-4 mb-4">
        <div className="flex flex-col">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-amber-200">TODAY'S DEAL</h2>
            <p className="text-white text-sm">CLAIM AND EARN</p>
          </div>
          
          <div className="bg-amber-100 rounded-lg p-4">
            <div className="mb-2">
              <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded">
                {featuredDeal.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {featuredDeal.title}
            </h3>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-600" />
                <span className="text-sm text-gray-600">Ends in: {formatRemainingTime(new Date(featuredDeal.validUntil))}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span>{featuredDeal.claimedBy.length}K claimed</span>
              </div>
            </div>
            
            <button 
              onClick={() => handleClaimReward(featuredDeal.id)}
              disabled={claimedToday && claimedLinkId !== featuredDeal.id}
              className={cn(
                "w-full mt-4 py-2 rounded text-sm font-medium",
                (isLinkClaimedByUser(featuredDeal) || claimedLinkId === featuredDeal.id) 
                  ? "bg-green-600 text-white" 
                  : claimedToday 
                    ? "bg-gray-400 text-gray-700"
                    : "bg-pink-600 hover:bg-pink-700 text-white"
              )}
            >
              {(isLinkClaimedByUser(featuredDeal) || claimedLinkId === featuredDeal.id) ? (
                <span className="flex items-center justify-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  <span>Claimed</span>
                </span>
              ) : (
                <span>Claim Now</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderFeaturedDeal()}
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">More Deals</h3>
        {claimedToday && (
          <div className="text-xs text-purple-200 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Next deal available tomorrow</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {rewardLinks.slice(1, 3).map((link) => (
          <div 
            key={link.id} 
            className={cn(
              "bg-[#12052e] border border-purple-500/30 rounded-lg p-3 flex items-center",
              (claimedToday && claimedLinkId !== link.id) && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 rounded overflow-hidden bg-[#0c0121] flex items-center justify-center border border-purple-500/20">
                <img 
                  src={link.imageUrl} 
                  alt={link.brand} 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/images/gift-icon.png'; // Fallback image
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm">{link.title}</h4>
              <p className="text-purple-200 text-xs truncate">{link.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-xs text-purple-300">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Expires in: {formatRemainingTime(new Date(link.validUntil))}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleClaimReward(link.id)}
              disabled={claimedToday && claimedLinkId !== link.id}
              className={cn(
                "ml-2 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1",
                (isLinkClaimedByUser(link) || claimedLinkId === link.id) 
                  ? "bg-green-600 text-white" 
                  : claimedToday 
                    ? "bg-gray-700 text-gray-300"
                    : "bg-pink-600 hover:bg-pink-700 text-white"
              )}
            >
              {(isLinkClaimedByUser(link) || claimedLinkId === link.id) ? (
                <>
                  <ExternalLink className="w-3 h-3" />
                  <span>Claimed</span>
                </>
              ) : (
                <span>Claim</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 