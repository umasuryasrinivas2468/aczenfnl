import { supabase } from '@/lib/supabase';

// Define the investment data type
export interface Investment {
  id?: string;
  user_id: string;
  amount: number;
  metal_type: 'gold' | 'silver' | string;
  mobile_number?: string;
  pan_number?: string;
  dob?: string;
  state?: string;
  created_at?: string;
}

// Function to insert a new investment
export const createInvestment = async (investment: Investment): Promise<{ data: any; error: any }> => {
  try {
    // Include timestamp
    const investmentWithTimestamp = {
      ...investment,
      created_at: new Date().toISOString()
    };

    // Insert the investment into Supabase
    const { data, error } = await supabase
      .from('investments')
      .insert([investmentWithTimestamp])
      .select();

    if (error) {
      console.error('Error creating investment:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Failed to create investment:', error);
    return { data: null, error };
  }
};

// Function to get investments for a user
export const getUserInvestments = async (userId: string): Promise<{ data: Investment[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investments:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Failed to fetch investments:', error);
    return { data: null, error };
  }
};

// Function to get the total investment amount for a user
export const getUserTotalInvestment = async (userId: string): Promise<{ total: number; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('amount')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching total investment:', error);
      return { total: 0, error };
    }

    // Calculate the total amount
    const total = data.reduce((sum, investment) => sum + investment.amount, 0);
    return { total, error: null };
  } catch (error) {
    console.error('Failed to calculate total investment:', error);
    return { total: 0, error };
  }
};

// Function to get investments by metal type for a user
export const getUserInvestmentsByType = async (
  userId: string,
  metalType: string
): Promise<{ data: Investment[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .eq('metal_type', metalType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${metalType} investments:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Failed to fetch ${metalType} investments:`, error);
    return { data: null, error };
  }
};

// Function to update user profile information
export const updateUserProfile = async (
  userId: string,
  profileData: {
    mobile_number?: string;
    pan_number?: string;
    dob?: string;
    state?: string;
  }
): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert([
        {
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return { success: false, error };
  }
}; 