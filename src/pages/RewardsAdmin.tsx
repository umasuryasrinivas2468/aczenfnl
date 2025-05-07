import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, RefreshCw, Calendar, Link as LinkIcon, FileEdit } from 'lucide-react';
import { RewardLinksService, RewardLink } from '@/lib/services/reward-links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RewardsAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rewardLinks, setRewardLinks] = useState<RewardLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [newLink, setNewLink] = useState({
    title: '',
    description: '',
    imageUrl: '/images/gift-icon.png',
    externalUrl: '',
    category: 'shopping',
    brand: '',
    validUntil: new Date(Date.now() + 86400000 * 3) // 3 days from now
  });

  useEffect(() => {
    loadRewardLinks();
  }, []);

  const loadRewardLinks = () => {
    setIsLoading(true);
    try {
      const links = RewardLinksService.getAvailableRewardLinks();
      setRewardLinks(links);
    } catch (error) {
      console.error('Error loading deals:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load today's deals."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDailyLinks = () => {
    try {
      RewardLinksService.resetDailyLinks();
      loadRewardLinks();
      toast({
        title: "Success",
        description: "Today's deals have been reset."
      });
    } catch (error) {
      console.error('Error resetting deals:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset today's deals."
      });
    }
  };

  const handleAddRewardLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLink.title || !newLink.description || !newLink.externalUrl || !newLink.brand) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    try {
      const createdLink = RewardLinksService.addRewardLink({
        ...newLink,
        validUntil: new Date(newLink.validUntil)
      });
      
      setRewardLinks(prev => [...prev, createdLink]);
      setIsAdding(false);
      setNewLink({
        title: '',
        description: '',
        imageUrl: '/images/gift-icon.png',
        externalUrl: '',
        category: 'shopping',
        brand: '',
        validUntil: new Date(Date.now() + 86400000 * 3)
      });
      
      toast({
        title: "Success",
        description: "New deal added successfully."
      });
    } catch (error) {
      console.error('Error adding deal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new deal."
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewLink(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Today's Deals Admin</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDailyLinks}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Deals</span>
          </Button>
          
          <Button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Deal</span>
          </Button>
        </div>
      </div>
      
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Deal</CardTitle>
            <CardDescription>Create a new deal for users to claim</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddRewardLink}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title*</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newLink.title}
                    onChange={handleChange}
                    placeholder="e.g. 20% Off on Amazon"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="brand">Brand*</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={newLink.brand}
                    onChange={handleChange}
                    placeholder="e.g. Amazon"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="description">Description*</Label>
                <Input
                  id="description"
                  name="description"
                  value={newLink.description}
                  onChange={handleChange}
                  placeholder="e.g. Get 20% off on your next purchase"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="externalUrl">External URL*</Label>
                  <Input
                    id="externalUrl"
                    name="externalUrl"
                    value={newLink.externalUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://amazon.in/offers"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={newLink.imageUrl}
                    onChange={handleChange}
                    placeholder="e.g. /images/amazon.png"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={newLink.category} 
                    onValueChange={(value) => setNewLink(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="validUntil">Valid Until*</Label>
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    value={new Date(newLink.validUntil).toISOString().split('T')[0]}
                    onChange={(e) => setNewLink(prev => ({ 
                      ...prev, 
                      validUntil: new Date(e.target.value) 
                    }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Deal</Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Current Deals</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRewardLinks}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : rewardLinks.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimed</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewardLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded object-cover"
                            src={link.imageUrl} 
                            alt={link.brand}
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.src = '/images/gift-icon.png';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{link.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">{link.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {link.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(new Date(link.validUntil))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.claimedBy.length} users</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => window.open(link.externalUrl, '_blank', 'noopener,noreferrer')}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <LinkIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No deals found</h3>
            <p className="text-gray-500 mb-4">Add new deals for users to claim</p>
            <Button onClick={() => setIsAdding(true)}>Add Deal</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsAdmin; 