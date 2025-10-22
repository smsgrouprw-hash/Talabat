-- Add business categories
INSERT INTO public.categories (name, name_en, description, is_active, sort_order) VALUES
  ('Restaurant/Food Service', 'Restaurant/Food Service', 'Restaurants, cafes, and food service businesses', true, 1),
  ('Grocery Store', 'Grocery Store', 'Supermarkets and grocery stores', true, 2),
  ('Bakery', 'Bakery', 'Bakeries and pastry shops', true, 3),
  ('Pharmacy', 'Pharmacy', 'Pharmacies and medical supplies', true, 4),
  ('Electronics', 'Electronics', 'Electronics and technology products', true, 5),
  ('Clothing/Fashion', 'Clothing/Fashion', 'Clothing, shoes, and fashion accessories', true, 6),
  ('Home & Garden', 'Home & Garden', 'Home improvement and garden supplies', true, 7),
  ('Beauty & Personal Care', 'Beauty & Personal Care', 'Cosmetics, skincare, and personal care', true, 8),
  ('Sports & Recreation', 'Sports & Recreation', 'Sports equipment and recreational activities', true, 9),
  ('Books & Stationery', 'Books & Stationery', 'Books, office supplies, and stationery', true, 10),
  ('Automotive', 'Automotive', 'Car parts, accessories, and automotive services', true, 11),
  ('Hardware/Tools', 'Hardware/Tools', 'Hardware, tools, and construction supplies', true, 12),
  ('Pet Supplies', 'Pet Supplies', 'Pet food, toys, and pet care products', true, 13),
  ('Jewelry', 'Jewelry', 'Jewelry, watches, and accessories', true, 14),
  ('Toys & Games', 'Toys & Games', 'Toys, games, and children products', true, 15),
  ('Health & Wellness', 'Health & Wellness', 'Health products and wellness services', true, 16),
  ('Art & Crafts', 'Art & Crafts', 'Art supplies and craft materials', true, 17),
  ('Music & Entertainment', 'Music & Entertainment', 'Musical instruments and entertainment', true, 18),
  ('Travel & Tourism', 'Travel & Tourism', 'Travel services and tourism', true, 19),
  ('Professional Services', 'Professional Services', 'Professional and business services', true, 20)
ON CONFLICT (name) DO NOTHING;

-- Update handle_new_user function to create supplier records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Get the role from metadata, default to 'customer' if not specified
  DECLARE
    user_role app_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::app_role;
  BEGIN
    -- Insert the specified role for new users (avoid duplicates)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Insert user into users table if they provided metadata (avoid duplicates)
    INSERT INTO public.users (
      id, 
      email, 
      first_name, 
      last_name, 
      phone
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone = EXCLUDED.phone,
      updated_at = now();
    
    -- If role is supplier, create supplier record
    IF user_role = 'supplier' THEN
      INSERT INTO public.suppliers (
        user_id,
        business_name,
        business_type,
        phone,
        email,
        latitude,
        longitude,
        address,
        city,
        description,
        cuisine_type,
        is_active,
        subscription_status
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'business_name', 'New Business'),
        COALESCE(NEW.raw_user_meta_data->>'business_type', 'General'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'phone_number', ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'latitude')::numeric, -1.9441),  -- Default to Kigali
        COALESCE((NEW.raw_user_meta_data->>'longitude')::numeric, 30.0619), -- Default to Kigali
        COALESCE(NEW.raw_user_meta_data->>'address', 'Kigali, Rwanda'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Kigali'),
        COALESCE(NEW.raw_user_meta_data->>'description', 'Welcome to our business!'),
        COALESCE(NEW.raw_user_meta_data->>'cuisine_type', NULL),
        true,
        'pending'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        business_type = EXCLUDED.business_type,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        description = EXCLUDED.description,
        cuisine_type = EXCLUDED.cuisine_type,
        updated_at = now();
        
      -- Create default subscription for new supplier
      INSERT INTO public.subscriptions (
        supplier_id,
        plan_type,
        status,
        payment_status,
        start_date,
        end_date,
        monthly_fee,
        commission_rate
      )
      SELECT 
        s.id,
        'basic',
        'active',
        'pending',
        now(),
        now() + interval '30 days',
        25000, -- 25,000 RWF per month
        0.05   -- 5% commission
      FROM public.suppliers s 
      WHERE s.user_id = NEW.id
      ON CONFLICT (supplier_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
  END;
END;
$function$;