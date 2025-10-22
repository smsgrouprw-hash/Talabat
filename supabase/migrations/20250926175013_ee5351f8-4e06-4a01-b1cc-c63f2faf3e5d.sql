-- Add database indexes for production performance optimization
-- Note: Creating indexes without CONCURRENTLY to avoid transaction issues

-- Suppliers performance indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_active_location 
ON suppliers (is_active, latitude, longitude) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_suppliers_search 
ON suppliers USING GIN (to_tsvector('english', business_name || ' ' || COALESCE(description, '') || ' ' || COALESCE(cuisine_type, '')));

-- Products performance indexes  
CREATE INDEX IF NOT EXISTS idx_products_supplier_available 
ON products (supplier_id, is_available, sort_order) 
WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_products_category_available 
ON products (category_id, is_available) 
WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(ingredients, '')));

-- Orders performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_status_date 
ON orders (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_supplier_status_date 
ON orders (supplier_id, status, created_at DESC);

-- User roles optimization
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON user_roles (user_id, role);

-- Categories hierarchy optimization
CREATE INDEX IF NOT EXISTS idx_categories_parent_active 
ON categories (parent_category_id, is_active) 
WHERE is_active = true;

-- Featured slots optimization
CREATE INDEX IF NOT EXISTS idx_featured_slots_active_dates 
ON featured_slots (is_active, start_date, end_date, position) 
WHERE is_active = true;