-- Fix the duplicate phone key constraint issue by making phone field nullable and updating trigger
-- Remove unique constraint on phone since it's causing registration failures
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Make phone field nullable to avoid conflicts
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

-- Update the handle_new_user trigger to better handle potential duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default customer role for new users (avoid duplicates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
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
$$;