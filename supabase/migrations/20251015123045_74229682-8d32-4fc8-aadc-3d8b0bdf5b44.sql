-- Fix the handle_new_user trigger to handle business_type properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_metadata jsonb;
    user_role public.app_role;
    business_type_uuid uuid;
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
        
        -- Handle business_type: if it's a valid UUID string, cast it; otherwise set to NULL
        business_type_uuid := NULL;
        IF user_metadata->>'business_type' IS NOT NULL THEN
            BEGIN
                business_type_uuid := (user_metadata->>'business_type')::uuid;
            EXCEPTION
                WHEN invalid_text_representation THEN
                    RAISE LOG 'business_type is not a valid UUID, setting to NULL';
                    business_type_uuid := NULL;
            END;
        END IF;
        
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
            business_name_ar,
            description_ar,
            address_ar,
            google_business_url,
            youtube_url,
            facebook_url,
            instagram_url
        )
        VALUES (
            gen_random_uuid(),
            NEW.id,
            COALESCE(user_metadata->>'business_name', 'My Business'),
            business_type_uuid,
            user_metadata->>'description',
            COALESCE(user_metadata->>'address', ''),
            COALESCE(user_metadata->>'city', ''),
            CAST(COALESCE(user_metadata->>'latitude', '-1.9441') AS NUMERIC),
            CAST(COALESCE(user_metadata->>'longitude', '30.0619') AS NUMERIC),
            COALESCE(user_metadata->>'phone', NEW.phone, '+250000000000'),
            NEW.email,
            user_metadata->>'business_name_ar',
            user_metadata->>'description_ar',
            user_metadata->>'address_ar',
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
$$;