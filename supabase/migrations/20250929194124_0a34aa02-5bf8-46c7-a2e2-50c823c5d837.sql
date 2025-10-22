-- Fix admin user creation with proper auth fields
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Update existing admin user with proper fields
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('admin123', gen_salt('bf')),
            confirmation_token = '',
            recovery_token = '',
            email_change_token_new = '',
            email_change_token_current = ''
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user password updated to admin123';
    END IF;
END
$$;