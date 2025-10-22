-- Add secondary phone number field to suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN phone_secondary varchar(50);