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
      const response = await fetch('https://uat-api.augmontgold.com/api/merchant/v1/rates', {
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiNWQyMzk2MmNlM2I1NmU2ZWY1ZGFiZjU0NmYxNzAxYjMwMWZjMmExZjExMDcwODM3Mjk1MzE3N2MwM2ZiZTk2Y2FiZTYyNTY3YmEyYTMwMTQiLCJpYXQiOjE3NDcyMDY5NjEsIm5iZiI6MTc0NzIwNjk2MSwiZXhwIjoxNzQ5Nzk4OTYxLCJzdWIiOiI1MDAwMTY0MiIsInNjb3BlcyI6W119.PZZm_jEMrJNcKJXQMm55UT2Z3OwaozO57IAD-p2A-_EQybwrPPX43O4HQdj8VF6mzgfSwJG9mSZzvEWYbiP18oLZLKmBh50lA1n-6S7hgOmiQA7tX54mc_y3X63-nPH-Tm3_zdC_g1WRjowLCKFxgrvKHEdispVtBclKoiP1JxkZEZEz2spQfZ78c_M9LxX1ZU-KIflRpnKU6VQYC12iir2ODW0kboIyOL3XAWNZkMOxkRe6THxqP3EEylpM8333TnNdqF7-PZIsuryC6uV-0LzKl1TxaGU_2NMKBgQfYnuP554kiKKXzw6Fo4F0p6BOCN3eZmCkQT3pH1ihWesHrrIyOuMYee1oaaK1LYAGo9lBaDFd2dVfPS5bQ5KPfBWd5Ag82k3pcjPEcpjXh9vgd3Mha83NDXKpCryQRPoVmkWaRDCpGpdRuLtc88NHBDjfNjWhZ7noqIr74qXQ6G6p-aPxWJivZwPvRnB2vzFGI-gEu-e0uCEzZQOq1XpKUOUbimOguApK2ML54T3S7qOMxjz6INt-HU3nFNzIiEYzqdHExtziF28EQN3H6a8QaouR9OCtOgs9gCLYWxZYQQ0dUpE3ts-tPxEcx1tLJLhSPs-8zWDtbxRjxq3sEpufSv6Q581Ne8ak7LpZGh15cFC4__ooLylMuAgqVT633vCpr4c'
        }
      });
      const data = await response.json();
      
      // Extract gold and silver prices from the response
      const goldPrice = data.result.data.rates.gBuy;
      const silverPrice = data.result.data.rates.sBuy;
      
      return {
        gold: Number(goldPrice),
        silver: Number(silverPrice),
      };
    } catch (error) {
      console.error("Error fetching metal prices:", error);
      // Fallback prices if API fails
      return {
        gold: 0,
        silver: 0,
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
