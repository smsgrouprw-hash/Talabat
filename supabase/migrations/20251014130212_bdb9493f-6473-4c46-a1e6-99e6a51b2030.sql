-- Add some sample products with discounts for Hot Deals section
-- First, get a random supplier ID for demo purposes
DO $$
DECLARE
  sample_supplier_id uuid;
BEGIN
  -- Get a random active supplier
  SELECT id INTO sample_supplier_id 
  FROM suppliers 
  WHERE is_active = true AND is_verified = true 
  LIMIT 1;
  
  -- Only insert if we have a supplier
  IF sample_supplier_id IS NOT NULL THEN
    -- Insert sample products with discounts
    INSERT INTO products (
      name,
      name_en,
      name_ar,
      price,
      discounted_price,
      supplier_id,
      is_available,
      is_featured,
      image_url,
      description,
      description_en,
      description_ar
    ) VALUES
    (
      'Special Burger Combo',
      'Special Burger Combo', 
      'كومبو برجر خاص',
      15000,
      12000,
      sample_supplier_id,
      true,
      true,
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
      'Delicious burger with fries and drink',
      'Delicious burger with fries and drink',
      'برجر لذيذ مع بطاطس ومشروب'
    ),
    (
      'Pizza Family Deal',
      'Pizza Family Deal',
      'عرض بيتزا عائلي', 
      25000,
      19000,
      sample_supplier_id,
      true,
      true,
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
      'Large pizza with 2 sides',
      'Large pizza with 2 sides',
      'بيتزا كبيرة مع طبقين جانبيين'
    ),
    (
      'Sushi Platter',
      'Sushi Platter',
      'صحن سوشي',
      30000,
      24000,
      sample_supplier_id,
      true,
      true,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&auto=format&fit=crop',
      'Fresh sushi selection',
      'Fresh sushi selection',
      'تشكيلة سوشي طازجة'
    );
  END IF;
END $$;