-- Update admin user password to meet 6 character requirement
UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf'))
WHERE email = 'admin@admin.com';