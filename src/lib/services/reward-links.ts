import { v4 as uuidv4 } from 'uuid';

export interface RewardLink {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
  category: string;
  brand: string;
  validUntil: Date;
  createdAt: Date;
  isActive: boolean;
  claimedBy: string[];
}

// Mock data for today's deals (in a real app, this would come from a backend)
const MOCK_REWARD_LINKS: RewardLink[] = [
  {
    id: "1",
    title: "20% off on Box8, Pasta & more",
    description: "Claim special discount on Box8, Pasta & more",
    imageUrl: "/images/swiggy.png",
    externalUrl: "https://www.box8.in/offers",
    category: "EAT CLUB",
    brand: "Box8",
    validUntil: new Date(Date.now() + 86400000 * 1), // 1 day
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "2",
    title: "15% Off at Amazon Fashion",
    description: "Get 15% off on fashion items on Amazon",
    imageUrl: "/images/amazon.png",
    externalUrl: "https://www.amazon.in/fashion",
    category: "shopping",
    brand: "Amazon",
    validUntil: new Date(Date.now() + 86400000 * 2), // 2 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "3",
    title: "Free Movie Ticket on BookMyShow",
    description: "Buy one ticket, get one free on BookMyShow",
    imageUrl: "/images/bookmyshow.png",
    externalUrl: "https://in.bookmyshow.com/offers",
    category: "entertainment",
    brand: "BookMyShow",
    validUntil: new Date(Date.now() + 86400000 * 4), // 4 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "4",
    title: "₹500 Cashback on MakeMyTrip",
    description: "Book a hotel and get ₹500 cashback",
    imageUrl: "/images/makemytrip.png",
    externalUrl: "https://www.makemytrip.com/hotels/",
    category: "travel",
    brand: "MakeMyTrip",
    validUntil: new Date(Date.now() + 86400000 * 5), // 5 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "5",
    title: "50% Off on Myntra",
    description: "Get 50% off on your first purchase on Myntra",
    imageUrl: "/images/flipkart.png", // Use similar image for now
    externalUrl: "https://www.myntra.com/offers",
    category: "shopping",
    brand: "Myntra",
    validUntil: new Date(Date.now() + 86400000 * 2), // 2 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "6",
    title: "₹100 Cashback on Zomato",
    description: "Order food worth ₹300 and get ₹100 cashback",
    imageUrl: "/images/zomato.png",
    externalUrl: "https://www.zomato.com/offers",
    category: "food",
    brand: "Zomato",
    validUntil: new Date(Date.now() + 86400000 * 3), // 3 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "7",
    title: "Free Gold Coin on Purchase",
    description: "Buy gold worth ₹50,000 and get a free gold coin",
    imageUrl: "/images/gold-coin.png",
    externalUrl: "https://www.tanishq.co.in/offers",
    category: "investment",
    brand: "Tanishq",
    validUntil: new Date(Date.now() + 86400000 * 7), // 7 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "8",
    title: "20% Off on Flipkart Electronics",
    description: "Get 20% off on electronics on Flipkart",
    imageUrl: "/images/flipkart.png",
    externalUrl: "https://www.flipkart.com/offers",
    category: "shopping",
    brand: "Flipkart",
    validUntil: new Date(Date.now() + 86400000 * 4), // 4 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "9",
    title: "Free Uber Ride",
    description: "Get a free ride up to ₹150 on Uber",
    imageUrl: "/images/flight.png", // Use similar image for now
    externalUrl: "https://www.uber.com/in/en/ride/",
    category: "travel",
    brand: "Uber",
    validUntil: new Date(Date.now() + 86400000 * 2), // 2 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  },
  {
    id: "10",
    title: "25% Off on Netflix Subscription",
    description: "Get 25% off on your annual Netflix subscription",
    imageUrl: "/images/bookmyshow.png", // Use similar image for now
    externalUrl: "https://www.netflix.com/in/",
    category: "entertainment",
    brand: "Netflix",
    validUntil: new Date(Date.now() + 86400000 * 5), // 5 days
    createdAt: new Date(),
    isActive: true,
    claimedBy: []
  }
];

export class RewardLinksService {
  private static STORAGE_KEY = 'todaysDeals';
  private static USER_CLAIMED_KEY = 'userClaimedDeals';
  private static UPDATE_DATE_KEY = 'dealsLastUpdated';
  
  /**
   * Get all available deals for today
   * In a real implementation, this would fetch from a backend API
   */
  static getAvailableRewardLinks(): RewardLink[] {
    // Check if we have stored deals
    const storedLinks = localStorage.getItem(this.STORAGE_KEY);
    const lastUpdated = localStorage.getItem(this.UPDATE_DATE_KEY);
    
    // Check if we need to refresh the deals (daily)
    const needsRefresh = !lastUpdated || 
      new Date(JSON.parse(lastUpdated)).getDate() !== new Date().getDate();
    
    if (storedLinks && !needsRefresh) {
      return JSON.parse(storedLinks) as RewardLink[];
    }
    
    // Reset the deals for a new day
    this.resetDailyLinks();
    return MOCK_REWARD_LINKS;
  }
  
  /**
   * Reset daily deals (would be done by admin in a real app)
   */
  static resetDailyLinks() {
    // In a real app, you would fetch new deals from an API
    // For this demo, we'll just reset the mock data
    const resetLinks = MOCK_REWARD_LINKS.map(link => ({
      ...link,
      isActive: true,
      claimedBy: []
    }));
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(resetLinks));
    localStorage.setItem(this.UPDATE_DATE_KEY, JSON.stringify(new Date()));
  }
  
  /**
   * Claim a deal for a user
   * @param linkId The ID of the deal to claim
   * @param userId The ID of the user claiming the deal
   * @returns The external URL to redirect to, or null if claiming failed
   */
  static claimRewardLink(linkId: string, userId: string): string | null {
    // Check if user has already claimed a deal today
    const userClaimed = localStorage.getItem(this.USER_CLAIMED_KEY);
    const claimedDeals = userClaimed ? JSON.parse(userClaimed) : {};
    
    // Create a key for today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already claimed a deal today
    if (claimedDeals[userId] && claimedDeals[userId][today]) {
      console.log('User already claimed a deal today');
      return null;
    }
    
    // Get stored deals
    const storedLinks = localStorage.getItem(this.STORAGE_KEY);
    if (!storedLinks) {
      return null;
    }
    
    const links = JSON.parse(storedLinks) as RewardLink[];
    const linkIndex = links.findIndex(link => link.id === linkId);
    
    if (linkIndex === -1 || !links[linkIndex].isActive) {
      return null;
    }
    
    // Mark as claimed by this user
    links[linkIndex].claimedBy.push(userId);
    
    // Record that user claimed a deal today
    claimedDeals[userId] = claimedDeals[userId] || {};
    claimedDeals[userId][today] = linkId;
    
    // Save updates
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
    localStorage.setItem(this.USER_CLAIMED_KEY, JSON.stringify(claimedDeals));
    
    // Return the external URL
    return links[linkIndex].externalUrl;
  }
  
  /**
   * Check if a user has already claimed a deal today
   * @param userId The user ID to check
   * @returns True if the user has claimed a deal today
   */
  static hasUserClaimedToday(userId: string): boolean {
    const userClaimed = localStorage.getItem(this.USER_CLAIMED_KEY);
    if (!userClaimed) {
      return false;
    }
    
    const claimedDeals = JSON.parse(userClaimed);
    const today = new Date().toISOString().split('T')[0];
    
    return !!(claimedDeals[userId] && claimedDeals[userId][today]);
  }
  
  /**
   * Get what deal a user claimed today
   * @param userId The user ID to check
   * @returns The deal ID claimed today, or null if none
   */
  static getUserClaimedTodayLinkId(userId: string): string | null {
    const userClaimed = localStorage.getItem(this.USER_CLAIMED_KEY);
    if (!userClaimed) {
      return null;
    }
    
    const claimedDeals = JSON.parse(userClaimed);
    const today = new Date().toISOString().split('T')[0];
    
    if (claimedDeals[userId] && claimedDeals[userId][today]) {
      return claimedDeals[userId][today];
    }
    
    return null;
  }
  
  /**
   * Admin function to add a new deal
   * In a real app, this would be a backend API call
   */
  static addRewardLink(link: Omit<RewardLink, 'id' | 'createdAt' | 'claimedBy'>): RewardLink {
    const storedLinks = localStorage.getItem(this.STORAGE_KEY);
    const links = storedLinks ? JSON.parse(storedLinks) as RewardLink[] : MOCK_REWARD_LINKS;
    
    const newLink: RewardLink = {
      ...link,
      id: uuidv4(),
      createdAt: new Date(),
      claimedBy: []
    };
    
    links.push(newLink);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
    
    return newLink;
  }
} 