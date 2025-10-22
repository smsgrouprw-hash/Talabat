-- First, set all invalid category_id values to NULL
UPDATE products 
SET category_id = NULL 
WHERE category_id NOT IN (SELECT id FROM product_categories);

-- Drop the incorrect foreign key constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Add the correct foreign key constraint pointing to product_categories table
ALTER TABLE products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES product_categories(id) 
ON DELETE SET NULL;