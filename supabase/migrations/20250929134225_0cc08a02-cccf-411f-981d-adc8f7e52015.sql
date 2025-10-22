-- Add unique constraints first
ALTER TABLE public.suppliers 
ADD CONSTRAINT suppliers_user_id_unique UNIQUE (user_id);

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_supplier_id_unique UNIQUE (supplier_id);

ALTER TABLE public.categories 
ADD CONSTRAINT categories_name_unique UNIQUE (name);