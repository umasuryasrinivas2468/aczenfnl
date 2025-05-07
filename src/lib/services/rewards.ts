import { v4 as uuidv4 } from 'uuid';

export interface Reward {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed' | 'cashback';
  expiresAt: Date;
  imageUrl?: string;
  brand?: string;
  isNew?: boolean;
  isExpiring?: boolean;
  category?: 'shopping' | 'travel' | 'food' | 'entertainment' | 'investment';
}

// Available rewards pool - you can add more rewards here
const AVAILABLE_REWARDS: Omit<Reward, 'id' | 'code' | 'expiresAt' | 'isNew' | 'isExpiring'>[] = [
  {
    title: '10% Cashback on Gold Purchase',
    description: 'Get 10% cashback on your next gold purchase up to ₹500',
    discount: 10,
    type: 'percentage',
    brand: 'Wealth Horizon',
    category: 'investment',
    imageUrl: '/images/gold-coin.png'
  },
  {
    title: '₹200 Off on Silver Purchase',
    description: 'Flat ₹200 off on any silver purchase above ₹2000',
    discount: 200,
    type: 'fixed',
    brand: 'Wealth Horizon',
    category: 'investment',
    imageUrl: '/images/silver-coin.png'
  },
  {
    title: '15% Off at Amazon',
    description: 'Get 15% off on your next Amazon purchase up to ₹500',
    discount: 15,
    type: 'percentage',
    brand: 'Amazon',
    category: 'shopping',
    imageUrl: '/images/amazon.png'
  },
  {
    title: '20% Off at Flipkart',
    description: 'Get 20% off on your next Flipkart purchase up to ₹600',
    discount: 20,
    type: 'percentage',
    brand: 'Flipkart',
    category: 'shopping',
    imageUrl: '/images/flipkart.png'
  },
  {
    title: '₹150 Off at Swiggy',
    description: 'Flat ₹150 off on your next food order above ₹300',
    discount: 150,
    type: 'fixed',
    brand: 'Swiggy',
    category: 'food',
    imageUrl: '/images/swiggy.png'
  },
  {
    title: '₹100 Cashback on Zomato',
    description: 'Get ₹100 cashback on your next Zomato order',
    discount: 100,
    type: 'cashback',
    brand: 'Zomato',
    category: 'food',
    imageUrl: '/images/zomato.png'
  },
  {
    title: '25% Off on Movie Tickets',
    description: 'Get 25% off on movie tickets up to ₹300 discount',
    discount: 25,
    type: 'percentage',
    brand: 'BookMyShow',
    category: 'entertainment',
    imageUrl: '/images/bookmyshow.png'
  },
  {
    title: '₹750 Off on Hotel Booking',
    description: 'Flat ₹750 off on your next hotel booking above ₹3000',
    discount: 750,
    type: 'fixed',
    brand: 'MakeMyTrip',
    category: 'travel',
    imageUrl: '/images/makemytrip.png'
  },
  {
    title: '5% Extra Interest on Fixed Deposit',
    description: 'Get 5% extra interest on your next fixed deposit',
    discount: 5,
    type: 'percentage',
    brand: 'Wealth Horizon',
    category: 'investment',
    imageUrl: '/images/fixed-deposit.png'
  },
  {
    title: '₹500 Cashback on Flight Booking',
    description: 'Get ₹500 cashback on your next flight booking',
    discount: 500,
    type: 'cashback',
    brand: 'Cleartrip',
    category: 'travel',
    imageUrl: '/images/flight.png'
  }
];

/**
 * Generate a random coupon code
 * @returns Random alphanumeric code
 */
const generateCouponCode = (): string => {
  return `WH${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Generate a random future date for expiry
 * @returns Future date between 7-30 days from now
 */
const generateExpiryDate = (): Date => {
  const daysToAdd = Math.floor(Math.random() * (30 - 7 + 1)) + 7; // 7-30 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysToAdd);
  return expiryDate;
};

export class RewardsService {
  /**
   * Get all rewards for the current user
   * Creates random rewards if none exist and stores them in localStorage
   * @param count Number of rewards to generate (default: 5)
   * @returns Array of rewards
   */
  static getUserRewards(count: number = 5): Reward[] {
    // Try to get existing rewards from localStorage
    const storedRewards = localStorage.getItem('userRewards');
    if (storedRewards) {
      const rewards = JSON.parse(storedRewards) as Reward[];
      
      // Check if any rewards have expired and mark rewards that will expire soon
      const now = new Date();
      const updatedRewards = rewards.map(reward => {
        const expiryDate = new Date(reward.expiresAt);
        
        // Mark rewards that will expire in the next 3 days
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...reward,
          expiresAt: expiryDate,
          isExpiring: daysUntilExpiry <= 3 && daysUntilExpiry > 0
        };
      }).filter(reward => new Date(reward.expiresAt) > now); // Filter out expired rewards
      
      // Only generate new rewards if there are less than the requested count
      if (updatedRewards.length >= count) {
        return updatedRewards;
      }
      
      // Generate additional rewards to reach the requested count
      const newRewards = this.generateRandomRewards(count - updatedRewards.length);
      const combinedRewards = [...updatedRewards, ...newRewards];
      
      // Store the updated rewards
      localStorage.setItem('userRewards', JSON.stringify(combinedRewards));
      
      return combinedRewards;
    }
    
    // Generate brand new rewards
    const rewards = this.generateRandomRewards(count);
    localStorage.setItem('userRewards', JSON.stringify(rewards));
    
    return rewards;
  }
  
  /**
   * Generate random rewards from the available rewards pool
   * @param count Number of rewards to generate
   * @returns Array of randomly generated rewards
   */
  static generateRandomRewards(count: number): Reward[] {
    const rewards: Reward[] = [];
    
    // Create a copy of available rewards to randomly select from
    const availableRewards = [...AVAILABLE_REWARDS];
    
    for (let i = 0; i < count; i++) {
      if (availableRewards.length === 0) break;
      
      // Select a random reward from the available pool
      const randomIndex = Math.floor(Math.random() * availableRewards.length);
      const rewardTemplate = availableRewards.splice(randomIndex, 1)[0];
      
      const reward: Reward = {
        id: uuidv4(),
        ...rewardTemplate,
        code: generateCouponCode(),
        expiresAt: generateExpiryDate(),
        isNew: true // Mark as new reward
      };
      
      rewards.push(reward);
    }
    
    return rewards;
  }
  
  /**
   * Add a new reward randomly from the available pool
   * @returns Newly added reward or null if no rewards could be added
   */
  static addRandomReward(): Reward | null {
    const storedRewards = localStorage.getItem('userRewards');
    const existingRewards = storedRewards ? JSON.parse(storedRewards) as Reward[] : [];
    
    // Get the IDs of existing rewards to avoid duplicates
    const existingRewardTitles = new Set(existingRewards.map(r => r.title));
    
    // Filter available rewards to ones not already in the user's rewards
    const availableNewRewards = AVAILABLE_REWARDS.filter(r => !existingRewardTitles.has(r.title));
    
    if (availableNewRewards.length === 0) return null;
    
    // Select a random reward
    const randomIndex = Math.floor(Math.random() * availableNewRewards.length);
    const rewardTemplate = availableNewRewards[randomIndex];
    
    const newReward: Reward = {
      id: uuidv4(),
      ...rewardTemplate,
      code: generateCouponCode(),
      expiresAt: generateExpiryDate(),
      isNew: true
    };
    
    // Add to existing rewards and save
    const updatedRewards = [...existingRewards, newReward];
    localStorage.setItem('userRewards', JSON.stringify(updatedRewards));
    
    return newReward;
  }
} 