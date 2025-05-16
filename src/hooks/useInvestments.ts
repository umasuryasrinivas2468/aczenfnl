import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Investment, getUserInvestments, getUserTotalInvestment, getUserInvestmentsByType } from '@/services/investmentService';

// Custom hook to fetch and manage user investments
export const useInvestments = () => {
  const { user, isSignedIn } = useUser();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goldInvestments, setGoldInvestments] = useState<Investment[]>([]);
  const [silverInvestments, setSilverInvestments] = useState<Investment[]>([]);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = async () => {
    if (!isSignedIn || !user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      // Fetch all investments
      const { data, error: investmentsError } = await getUserInvestments(user.id);
      
      if (investmentsError) {
        setError('Failed to fetch investments.');
        console.error(investmentsError);
      } else if (data) {
        setInvestments(data);
      }

      // Fetch gold investments
      const { data: goldData, error: goldError } = await getUserInvestmentsByType(user.id, 'gold');
      
      if (goldError) {
        console.error(goldError);
      } else if (goldData) {
        setGoldInvestments(goldData);
      }

      // Fetch silver investments
      const { data: silverData, error: silverError } = await getUserInvestmentsByType(user.id, 'silver');
      
      if (silverError) {
        console.error(silverError);
      } else if (silverData) {
        setSilverInvestments(silverData);
      }

      // Fetch total investment amount
      const { total, error: totalError } = await getUserTotalInvestment(user.id);
      
      if (totalError) {
        console.error(totalError);
      } else {
        setTotalInvestment(total);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch investments when the user changes
  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchInvestments();
    } else {
      // Reset state when user is not signed in
      setInvestments([]);
      setGoldInvestments([]);
      setSilverInvestments([]);
      setTotalInvestment(0);
      setLoading(false);
      setError(null);
    }
  }, [isSignedIn, user?.id]);

  return {
    investments,
    goldInvestments,
    silverInvestments,
    totalInvestment,
    loading,
    error,
    refreshInvestments: fetchInvestments
  };
}; 