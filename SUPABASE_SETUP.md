# Supabase Setup Guide

This guide will help you set up the necessary tables and security policies in your Supabase project for the UPI payment application.

## Required Tables

You need to create two tables:
1. `investments` - to store all user investment transactions
2. `user_profiles` - to store user profile information

## Setup Instructions

### Method 1: Using the Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: "uefazowluutcrvmkuonl"
3. Go to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the contents of the `supabase_tables.sql` file into the SQL Editor
6. Click "Run" to execute the SQL and create your tables

### Method 2: Using the Supabase CLI

If you prefer using the CLI:

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Log in to Supabase:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref uefazowluutcrvmkuonl
   ```

4. Apply the SQL migration:
   ```
   supabase db execute --file ./supabase/migrations/create_tables.sql
   ```

## Verifying Your Setup

After creating the tables, you can verify they exist by:

1. Going to the "Table Editor" in the Supabase dashboard
2. You should see both `investments` and `user_profiles` tables listed
3. Click on each table to view its structure and ensure all columns are present

## Troubleshooting

If you encounter any errors:

1. Make sure you have admin privileges in your Supabase project
2. Check if the tables already exist before creating them again
3. If policies fail to create, ensure the tables exist first

## Table Structures

### investments
- `id`: UUID (primary key)
- `user_id`: TEXT (user identifier from Clerk)
- `amount`: DECIMAL (investment amount)
- `metal_type`: TEXT (gold, silver, etc.)
- `mobile_number`: TEXT (optional)
- `pan_number`: TEXT (optional)
- `dob`: TEXT (optional)
- `state`: TEXT (optional)
- `created_at`: TIMESTAMP

### user_profiles
- `id`: UUID (primary key)
- `user_id`: TEXT (user identifier from Clerk)
- `mobile_number`: TEXT
- `pan_number`: TEXT
- `dob`: TEXT
- `state`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Security Policies

Row Level Security (RLS) policies have been set up to ensure users can only:
- View their own investments and profile
- Insert their own investments and profile information
- Update their own profile 