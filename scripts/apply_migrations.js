// Script to apply database migrations to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment or directly
const supabaseUrl = 'https://uefazowluutcrvmkuonl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is not set');
  console.error('Please set it before running this script:');
  console.error('  Windows PowerShell: $env:SUPABASE_SERVICE_KEY="your-service-key"');
  console.error('  Windows CMD: set SUPABASE_SERVICE_KEY=your-service-key');
  process.exit(1);
}

// Create Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  try {
    console.log('Reading migration SQL file...');
    const sqlContent = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', 'create_tables.sql'),
      'utf8'
    );

    console.log('Applying migrations to database...');
    const { data, error } = await supabase.rpc('pg_execute_sql', { query: sqlContent });

    if (error) {
      console.error('Error applying migrations:', error);
      return;
    }

    console.log('Migrations applied successfully!');
    console.log('The following tables have been created:');
    console.log('- investments');
    console.log('- user_profiles');
    console.log('\nThese tables are now ready to be used with your application.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyMigrations(); 