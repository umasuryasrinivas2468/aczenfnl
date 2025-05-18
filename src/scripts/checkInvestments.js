// Script to check investments in Supabase
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase credentials from the application
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmF6b3dsdXV0Y3J2bWt1b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzc0NzksImV4cCI6MjA2Mjk1MzQ3OX0.rbYjUaoFbAzsPYkMmEzK3gdUXiIRhauhtqfFA5iSHQs';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInvestments() {
  console.log('Checking investments in Supabase...');
  
  try {
    // Get all investments
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*');
    
    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return;
    }
    
    console.log('Investments found:', investments ? investments.length : 0);
    console.log('Investment data:', JSON.stringify(investments, null, 2));
    
    // Get all transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return;
    }
    
    console.log('Transactions found:', transactions ? transactions.length : 0);
    console.log('Transaction data:', JSON.stringify(transactions, null, 2));
    
    // List all tables in the database
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_tables');
    
    if (tablesError) {
      console.log('Error fetching tables:', tablesError);
      
      // Try a different approach to get tables
      console.log('Trying to get table info from metadata...');
      const { data: metadata } = await supabase.from('_metadata').select('*');
      console.log('Metadata:', metadata);
    } else {
      console.log('Available tables:', tables);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkInvestments(); 