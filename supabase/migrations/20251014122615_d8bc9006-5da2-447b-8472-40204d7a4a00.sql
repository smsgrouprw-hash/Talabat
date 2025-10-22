-- Remove the old business_type check constraint
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_business_type_check;

-- Change business_type column from VARCHAR to UUID to match categories.id
-- First, we need to clear any existing data that doesn't match UUID format
UPDATE suppliers SET business_type = NULL WHERE business_type IS NOT NULL AND business_type !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Now change the column type
ALTER TABLE suppliers ALTER COLUMN business_type TYPE UUID USING business_type::UUID;

-- Add foreign key constraint
ALTER TABLE suppliers 
ADD CONSTRAINT suppliers_business_type_fkey 
FOREIGN KEY (business_type) 
REFERENCES categories(id);