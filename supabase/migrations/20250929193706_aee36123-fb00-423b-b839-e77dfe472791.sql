-- Simple admin user creation that bypasses the complex function
-- This will create a basic admin user that can log in

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
    
    IF admin_user_id IS NULL THEN
        -- Generate a new UUID for the admin user
        admin_user_id := gen_random_uuid();
        
        -- Insert into auth.users with a simple approach
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            email_change_confirm_status
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'admin@admin.com',
            crypt('admin', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"first_name": "Admin", "last_name": "User", "role": "admin"}'::jsonb,
            0
        );
        
        -- Insert into user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Insert into users table
        INSERT INTO public.users (
            id,
            email,
            first_name,
            last_name,
            is_active
        ) VALUES (
            admin_user_id,
            'admin@admin.com',
            'Admin',
            'User',
            true
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
END
$$;