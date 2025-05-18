// Script to insert test data into Supabase
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase credentials from the application
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmF6b3dsdXV0Y3J2bWt1b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzc0NzksImV4cCI6MjA2Mjk1MzQ3OX0.rbYjUaoFbAzsPYkMmEzK3gdUXiIRhauhtqfFA5iSHQs';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertTestData() {
  console.log('Inserting test data into Supabase...');
  
  try {
    // Create test user (if using auth)
    const testUserId = 'user_' + Date.now();
    
    // Add test investment data
    const testInvestments = [
      {
        user_id: testUserId,
        metal_type: 'gold',
        amount: 25000,
        weight_in_grams: 4.545,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: testUserId,
        metal_type: 'silver',
        amount: 10000,
        weight_in_grams: 142.857,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('Inserting investments:', testInvestments);
    
    const { data: investmentData, error: investmentError } = await supabase
      .from('investments')
      .insert(testInvestments)
      .select();
    
    if (investmentError) {
      console.error('Error inserting investments:', investmentError);
    } else {
      console.log('Successfully inserted investments:', investmentData);
    }
    
    // Add test transaction data
    const testTransactions = [
      {
        order_id: 'order_' + Date.now() + '_1',
        user_id: testUserId,
        amount: 25000,
        metal_type: 'gold',
        status: 'completed',
        payment_method: 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        order_id: 'order_' + Date.now() + '_2',
        user_id: testUserId,
        amount: 10000,
        metal_type: 'silver',
        status: 'completed',
        payment_method: 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('Inserting transactions:', testTransactions);
    
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert(testTransactions)
      .select();
    
    if (transactionError) {
      console.error('Error inserting transactions:', transactionError);
    } else {
      console.log('Successfully inserted transactions:', transactionData);
    }
    
    // Verify data
    const { data: verifyInvestments, error: verifyInvestmentsError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', testUserId);
    
    if (verifyInvestmentsError) {
      console.error('Error verifying investments:', verifyInvestmentsError);
    } else {
      console.log('Investments in database for user:', verifyInvestments);
    }
    
    const { data: verifyTransactions, error: verifyTransactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId);
    
    if (verifyTransactionsError) {
      console.error('Error verifying transactions:', verifyTransactionsError);
    } else {
      console.log('Transactions in database for user:', verifyTransactions);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
insertTestData(); 