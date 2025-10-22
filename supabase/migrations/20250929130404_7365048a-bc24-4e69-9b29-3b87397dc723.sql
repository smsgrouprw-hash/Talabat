-- Fix user role assignment to respect metadata role
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
    
    RETURN NEW;
  END;
END;
$function$;