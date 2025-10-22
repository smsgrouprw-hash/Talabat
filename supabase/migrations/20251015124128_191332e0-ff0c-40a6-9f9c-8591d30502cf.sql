-- Increase phone column length to accommodate international phone numbers
ALTER TABLE public.users 
ALTER COLUMN phone TYPE varchar(50);

ALTER TABLE public.suppliers 
ALTER COLUMN phone TYPE varchar(50);