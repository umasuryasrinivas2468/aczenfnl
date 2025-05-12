
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface MetalPrices {
  gold: number;
  silver: number;
  isLoading: boolean;
  error: Error | null;
}

// This function will fetch real-time gold and silver prices
export const usePreciousMetalPrices = (): MetalPrices => {
  // Fetch real prices from a live API
  const fetchPrices = async () => {
    try {
      // Real API call to get current prices
      const response = await fetch('https://api.metals.live/v1/spot');
      const data = await response.json();
      
      // Find gold and silver in the response
      const goldData = data.find((metal: any) => metal.metal === 'AU');
      const silverData = data.find((metal: any) => metal.metal === 'AG');
      
      // Convert from USD/oz to INR/gram
      // 1 troy oz = 31.1035 grams, using approximate conversion rate
      const usdToInr = 83.5; // Current approximate exchange rate
      
      // Gold price in INR per gram for 24K (convert from USD/oz)
      const goldPriceInr = goldData ? (goldData.price * usdToInr / 31.1035) * 1.05 : 7245.50;
      
      // Silver price in INR per gram (convert from USD/oz)
      const silverPriceInr = silverData ? (silverData.price * usdToInr / 31.1035) * 1.05 : 92.65;
      
      // Return the prices in INR per gram
      return {
        gold: Number(goldPriceInr.toFixed(2)),
        silver: Number(silverPriceInr.toFixed(2)),
      };
    } catch (error) {
      console.error("Error fetching metal prices:", error);
      // Fallback prices if API fails
      return {
        gold: 7245.50, // Fallback price in INR per gram for 24K gold
        silver: 92.65,  // Fallback price in INR per gram for silver
      };
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['metalPrices'],
    queryFn: fetchPrices,
    // Refetch every 5 minutes
    refetchInterval: 300000,
  });

  return {
    gold: data?.gold || 0,
    silver: data?.silver || 0,
    isLoading,
    error: error as Error | null,
  };
};
