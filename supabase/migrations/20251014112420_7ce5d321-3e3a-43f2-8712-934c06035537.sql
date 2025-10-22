-- Add supplier_id column to promotional_slides table
ALTER TABLE promotional_slides ADD COLUMN supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_promotional_slides_supplier_id ON promotional_slides(supplier_id);

-- Update button_url to be nullable since we'll use supplier_id instead
ALTER TABLE promotional_slides ALTER COLUMN button_url DROP NOT NULL;