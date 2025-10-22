-- Add detailed logging to the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RAISE LOG 'handle_new_user: Function triggered for user %', NEW.id;
  RAISE LOG 'handle_new_user: User email: %', NEW.email;
  RAISE LOG 'handle_new_user: Raw metadata: %', NEW.raw_user_meta_data;
  
  -- Get the role from metadata, default to 'customer' if not specified
  DECLARE
    user_role app_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::app_role;
  BEGIN
    RAISE LOG 'handle_new_user: Extracted role: %', user_role;
    
    -- Insert the specified role for new users (avoid duplicates)
    RAISE LOG 'handle_new_user: Inserting user role...';
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE LOG 'handle_new_user: User role inserted successfully';
    
    -- Insert user into users table if they provided metadata (avoid duplicates)
    RAISE LOG 'handle_new_user: Inserting user record...';
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
    RAISE LOG 'handle_new_user: User record inserted successfully';
    
    -- If role is supplier, create supplier record
    IF user_role = 'supplier' THEN
      RAISE LOG 'handle_new_user: Creating supplier record...';
      
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
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'whatsapp_number', ''),
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
      
      RAISE LOG 'handle_new_user: Supplier record created successfully';
        
      -- Create default subscription for new supplier
      RAISE LOG 'handle_new_user: Creating subscription for supplier...';
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
      
      RAISE LOG 'handle_new_user: Subscription created successfully';
    END IF;
    
    RAISE LOG 'handle_new_user: Function completed successfully for user %', NEW.id;
    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: ERROR occurred: % %', SQLERRM, SQLSTATE;
    RAISE LOG 'handle_new_user: Error details: %', SQLERRM;
    -- Re-raise the error so the transaction fails
    RAISE;
  END;
END;
$function$;