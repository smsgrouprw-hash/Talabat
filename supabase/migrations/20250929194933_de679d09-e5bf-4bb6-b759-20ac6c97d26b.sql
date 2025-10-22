-- Fix admin user auth fields to prevent database query errors
UPDATE auth.users 
SET 
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  email_change = '',
  phone_change = ''
WHERE email = 'admin@admin.com' AND (
  confirmation_token IS NULL OR
  recovery_token IS NULL OR  
  email_change_token_new IS NULL OR
  email_change_token_current IS NULL OR
  email_change IS NULL OR
  phone_change IS NULL
);