-- Add multilingual support to categories table
ALTER TABLE categories 
ADD COLUMN name_en TEXT,
ADD COLUMN name_ar TEXT;

-- Update existing categories to use name_en from name field
UPDATE categories SET name_en = name WHERE name_en IS NULL;

-- Make name_en required
ALTER TABLE categories ALTER COLUMN name_en SET NOT NULL;

-- Create admin RLS policies for categories
CREATE POLICY "Admins can view all categories" 
ON categories 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert categories" 
ON categories 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories" 
ON categories 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories" 
ON categories 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to check for circular references in category hierarchy
CREATE OR REPLACE FUNCTION check_category_circular_reference(category_id uuid, parent_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_parent uuid;
    max_depth integer := 10; -- Prevent infinite loops
    depth integer := 0;
BEGIN
    -- If parent_id is null, no circular reference possible
    IF parent_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- If trying to set parent to self, that's circular
    IF category_id = parent_id THEN
        RETURN true;
    END IF;
    
    -- Walk up the parent chain to check for the category_id
    current_parent := parent_id;
    
    WHILE current_parent IS NOT NULL AND depth < max_depth LOOP
        -- Check if we've found our category in the parent chain
        IF current_parent = category_id THEN
            RETURN true;
        END IF;
        
        -- Get the parent of the current parent
        SELECT parent_category_id INTO current_parent
        FROM categories
        WHERE id = current_parent;
        
        depth := depth + 1;
    END LOOP;
    
    RETURN false;
END;
$$;