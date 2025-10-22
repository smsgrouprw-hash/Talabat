-- Add Bookshop to categories if not exists
INSERT INTO categories (name, name_en, name_ar, is_active, sort_order)
SELECT 'Bookshop', 'Bookshop', 'مكتبة', true, 26
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name_en = 'Bookshop'
);