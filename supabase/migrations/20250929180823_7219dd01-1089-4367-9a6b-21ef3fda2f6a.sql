-- Recreate the handle_new_user function to fix the enum type access issue
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    user_metadata jsonb;
    user_role public.app_role;
BEGIN
    RAISE LOG 'Trigger started for user: %', NEW.id;
    
    user_metadata := NEW.raw_user_meta_data;
    user_role := COALESCE((user_metadata->>'role')::public.app_role, 'customer'::public.app_role);
    
    RAISE LOG 'Inserting into user_roles for user: %, role: %', NEW.id, user_role;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role);
    
    RAISE LOG 'user_roles insert complete';
    RAISE LOG 'Inserting into users table';
    
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        phone,
        address,
        city,
        latitude,
        longitude
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(user_metadata->>'first_name', 'User'),
        COALESCE(user_metadata->>'last_name', ''),
        COALESCE(user_metadata->>'phone', NEW.phone),
        user_metadata->>'address',
        user_metadata->>'city',
        CAST(COALESCE(user_metadata->>'latitude', '-1.9441') AS NUMERIC),
        CAST(COALESCE(user_metadata->>'longitude', '30.0619') AS NUMERIC)
    );
    
    RAISE LOG 'users insert complete';
    
    IF user_role = 'supplier'::public.app_role THEN
        RAISE LOG 'Inserting into suppliers table';
        
        INSERT INTO public.suppliers (
            id,
            user_id,
            business_name,
            business_type,
            description,
            address,
            city,
            latitude,
            longitude,
            phone,
            email,
            google_business_url,
            youtube_url,
            facebook_url,
            instagram_url
        )
        VALUES (
            gen_random_uuid(),
            NEW.id,
            COALESCE(user_metadata->>'business_name', 'My Business'),
            user_metadata->>'business_type',
            user_metadata->>'description',
            COALESCE(user_metadata->>'address', ''),
            COALESCE(user_metadata->>'city', ''),
            CAST(COALESCE(user_metadata->>'latitude', '-1.9441') AS NUMERIC),
            CAST(COALESCE(user_metadata->>'longitude', '30.0619') AS NUMERIC),
            COALESCE(user_metadata->>'phone', NEW.phone, '+250000000000'),
            NEW.email,
            user_metadata->>'google_business_url',
            user_metadata->>'youtube_url',
            user_metadata->>'facebook_url',
            user_metadata->>'instagram_url'
        );
        
        RAISE LOG 'suppliers insert complete';
    END IF;
    
    RAISE LOG 'Trigger completed successfully for user: %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'ERROR in handle_new_user for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
        RAISE;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();