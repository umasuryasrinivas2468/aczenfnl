// Test script for Supabase connection and transactions
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmF6b3dsdXV0Y3J2bWt1b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzc0NzksImV4cCI6MjA2Mjk1MzQ3OX0.rbYjUaoFbAzsPYkMmEzK3gdUXiIRhauhtqfFA5iSHQs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check if transactions table exists
    console.log('\nChecking transactions table...');
    const { data: tableData, error: tableError } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing transactions table:', tableError);
      if (tableError.message.includes('does not exist')) {
        console.log('The transactions table does not exist. Please run the SQL script to create it.');
      }
      return;
    }
    
    console.log('Transactions table exists!');
    
    // Insert a test transaction
    console.log('\nInserting test transaction...');
    const testTransaction = {
      user_id: 'test_user_' + Date.now(),
      order_id: 'TEST_ORDER_' + Date.now(),
      amount: 100.00,
      metal_type: 'gold',
      status: 'pending',
      payment_method: 'UPI',
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('transactions')
      .insert([testTransaction])
      .select();
    
    if (insertError) {
      console.error('Error inserting test transaction:', insertError);
      return;
    }
    
    console.log('Test transaction inserted successfully!');
    console.log('Transaction data:', insertData[0]);
    
    // Fetch all transactions
    console.log('\nFetching all transactions...');
    const { data: allTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error('Error fetching transactions:', fetchError);
      return;
    }
    
    console.log(`Found ${allTransactions.length} transactions:`);
    allTransactions.forEach(tx => {
      console.log(`- ${tx.order_id}: ${tx.amount} ${tx.metal_type} (${tx.status})`);
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSupabaseConnection(); 