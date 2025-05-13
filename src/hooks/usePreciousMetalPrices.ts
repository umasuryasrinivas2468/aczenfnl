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
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiOTUwMDk3ZjdlOWZlMDg4NTE4ODU0YjdmZmU3NDE3Mjc3ODVjODdhNDg2OWVlMjhhMTRlODcxYmQ3YTJhYjI0ODY5ZjEwODlmOGZhYWUxYTEiLCJpYXQiOjE3NDcwNTU4NjgsIm5iZiI6MTc0NzA1NTg2OCwiZXhwIjoxNzQ5NjQ3ODY4LCJzdWIiOiI1MDAwMTY0MiIsInNjb3BlcyI6W119.d9Vh6lAxfbyQY2ofao1Otemh2kKclQYLdruR_4gB7fMuiuq6N7F5Kg6TkSRudtR8GXpTVjSgsAziqfMwge3_BnjVkUdUAaMmcXIlFHkwc2iULbpqFX9u2BCfHsi4nE6k1_hjUEWf3iNlAa4BMU9q3QJPOKKXsRLZIfMKH9qqvRrG6DP8BmE0QP9JwIy_CS-DEr1Q2oQjxl9u_dNlvvmpwe5nHUVdnCMJ5uf5L5pYpZ6gqK00J_02MGE8lQqIAadfNOWwfjUpMnkng4kOkNUUFLAyKqhYBTSt4VQJRoYEkszUNr8v0sxKVuThD3rUJWczBadKzK_d345pQWH8ArFaWk6fEBXv1AfSQj5krCUWb2GyhRJatGH4ciHkZSrWhj6LFRVjhbECEPDInq_pG4Ms-TcEO2G8cIs5iK28-YE41D6odkAJBDDpkrdghbuFn5KA1DnoC1hiQpMnXK1Llr6fHhDdUyA3fAuli6cVniTKvKo9iCR73O7g2oojlBsCpSZ-DksVVKCBuu9e_NdzGqkT15whNVqmImbZSk1olcW07L0yaC_8yGEjwOUJ-Rw75GEf1yn2iYFmEzhLoxse-9bBQeVcMFZzF7ui_zOJsYi6Au9IcBcSWZaubrrGT_UQ2YlF3fUQYu9wps8jkDubtTl0RzETCsf7C8cIrnUaOlKTY38'
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
