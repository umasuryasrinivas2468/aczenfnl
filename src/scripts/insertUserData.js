// Script to insert investment data for the current user
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase credentials from the application
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmF6b3dsdXV0Y3J2bWt1b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzc0NzksImV4cCI6MjA2Mjk1MzQ3OX0.rbYjUaoFbAzsPYkMmEzK3gdUXiIRhauhtqfFA5iSHQs';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUserData(userId) {
  console.log('Inserting investment data for user:', userId);
  
  if (!userId) {
    console.error('Error: No user ID provided');
    return;
  }
  
  try {
    // Create investment records
    const investments = [
      {
        user_id: userId,
        metal_type: 'gold',
        amount: 5000,
        weight_in_grams: 0.909, // Assuming gold price of 5500/gram
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: userId,
        metal_type: 'silver',
        amount: 2000,
        weight_in_grams: 28.571, // Assuming silver price of 70/gram
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('Inserting investments:', investments);
    
    // Insert investments
    const { data: investmentData, error: investmentError } = await supabase
      .from('investments')
      .insert(investments)
      .select();
    
    if (investmentError) {
      console.error('Error inserting investments:', investmentError);
    } else {
      console.log('Successfully inserted investments:', investmentData);
    }
    
    // Create transaction records
    const transactions = [
      {
        order_id: `order_${Date.now()}_1`,
        user_id: userId,
        amount: 5000,
        metal_type: 'gold',
        status: 'completed',
        payment_method: 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        order_id: `order_${Date.now()}_2`,
        user_id: userId,
        amount: 2000,
        metal_type: 'silver',
        status: 'completed',
        payment_method: 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('Inserting transactions:', transactions);
    
    // Insert transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();
    
    if (transactionError) {
      console.error('Error inserting transactions:', transactionError);
    } else {
      console.log('Successfully inserted transactions:', transactionData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get user ID from command line argument or use a default
const userId = process.argv[2] || 'current_user';
insertUserData(userId);

console.log('\nAfter running this script, you should see your investments in the app.');
console.log('If you still don\'t see them, check the browser console for any errors.'); 