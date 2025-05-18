// Script to add test investments to Supabase
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase credentials from the application
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmF6b3dsdXV0Y3J2bWt1b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzc0NzksImV4cCI6MjA2Mjk1MzQ3OX0.rbYjUaoFbAzsPYkMmEzK3gdUXiIRhauhtqfFA5iSHQs';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addTestInvestments() {
  console.log('Adding test investments to Supabase...');
  
  try {
    // First, check if the investments table exists
    const { data: existingInvestments, error: checkError } = await supabase
      .from('investments')
      .select('count');
    
    if (checkError) {
      console.log('Error checking investments table:', checkError.message);
      
      // Table might not exist, try to create it
      console.log('Attempting to create investments table...');
      
      const { error: createError } = await supabase.rpc('create_investments_table');
      
      if (createError) {
        console.error('Failed to create investments table:', createError);
        console.log('Creating table via SQL query...');
        
        // Try direct SQL (requires more permissions)
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS investments (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id TEXT NOT NULL,
              metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
              amount NUMERIC(10,2) NOT NULL DEFAULT 0,
              weight_in_grams NUMERIC(10,4) NOT NULL DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
        
        if (sqlError) {
          console.error('Failed to create table via SQL:', sqlError);
          console.log('Please create the investments table manually in the Supabase dashboard');
          return;
        }
      }
    }
    
    // Add test investment data
    const testInvestments = [
      {
        user_id: 'test_user_1',
        metal_type: 'gold',
        amount: 25000,
        weight_in_grams: 4.545,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: 'test_user_1',
        metal_type: 'silver',
        amount: 10000,
        weight_in_grams: 142.857,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const { data, error } = await supabase
      .from('investments')
      .insert(testInvestments)
      .select();
    
    if (error) {
      console.error('Error inserting test investments:', error);
      return;
    }
    
    console.log('Successfully added test investments:', data);
    
    // Add test transaction data
    const testTransactions = [
      {
        order_id: 'order_' + Date.now() + '_1',
        user_id: 'test_user_1',
        amount: 25000,
        metal_type: 'gold',
        status: 'completed',
        payment_method: 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        order_id: 'order_' + Date.now() + '_2',
        user_id: 'test_user_1',
        amount: 10000,
        metal_type: 'silver',
        status: 'completed',
        payment_method: 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Check if transactions table exists
    const { error: checkTxError } = await supabase
      .from('transactions')
      .select('count');
    
    if (checkTxError) {
      console.log('Error checking transactions table:', checkTxError.message);
      console.log('Attempting to create transactions table...');
      
      // Try direct SQL (requires more permissions)
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id TEXT NOT NULL UNIQUE,
            user_id TEXT NOT NULL,
            amount NUMERIC(10,2) NOT NULL,
            metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
            status TEXT NOT NULL,
            payment_method TEXT,
            payment_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.error('Failed to create transactions table via SQL:', sqlError);
        console.log('Please create the transactions table manually in the Supabase dashboard');
        return;
      }
    }
    
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert(testTransactions)
      .select();
    
    if (txError) {
      console.error('Error inserting test transactions:', txError);
      return;
    }
    
    console.log('Successfully added test transactions:', txData);
    
    // Verify the data was inserted
    const { data: verifyData, error: verifyError } = await supabase
      .from('investments')
      .select('*');
    
    if (verifyError) {
      console.error('Error verifying investments:', verifyError);
      return;
    }
    
    console.log('Current investments in database:', verifyData);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
addTestInvestments(); 