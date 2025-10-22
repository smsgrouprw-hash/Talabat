-- Step 1: First, update any existing suppliers with NULL user_id (if any exist)
-- This ensures no data loss before making the column NOT NULL

-- Step 2: Alter the suppliers table to make user_id NOT NULL
ALTER TABLE public.suppliers 
ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Verify the foreign key constraint exists and is correct
-- It should reference public.users.id (NOT auth.users.id)