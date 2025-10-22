-- First, let me check the current RLS policies for suppliers table and fix any issues

-- Test if we can insert into suppliers table with proper user_id
-- This should work for authenticated users creating their own supplier record

-- Let's also ensure the subscription foreign key is working properly
-- Check if there's a foreign key constraint we need to add

-- Add missing foreign key constraint for subscription.supplier_id -> suppliers.id if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_supplier_id_fkey' 
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_supplier_id_fkey 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure RLS policies are correct for suppliers table
-- The suppliers_insert_own_data policy should allow users to insert records with their own user_id

-- Test data insertion to verify everything works
-- This is just a test comment, we won't actually insert test data in migration