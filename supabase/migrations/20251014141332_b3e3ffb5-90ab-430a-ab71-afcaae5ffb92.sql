-- Add is_hot_deal column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_hot_deal boolean DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_hot_deal ON public.products(is_hot_deal) WHERE is_hot_deal = true;

-- Create function to ensure only one hot deal per supplier
CREATE OR REPLACE FUNCTION public.ensure_single_hot_deal()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a product as hot deal
  IF NEW.is_hot_deal = true THEN
    -- Unmark all other products from the same supplier as hot deals
    UPDATE public.products
    SET is_hot_deal = false
    WHERE supplier_id = NEW.supplier_id
      AND id != NEW.id
      AND is_hot_deal = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce single hot deal per supplier
DROP TRIGGER IF EXISTS enforce_single_hot_deal ON public.products;
CREATE TRIGGER enforce_single_hot_deal
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_hot_deal();

-- Create edge function to reset supplier password
CREATE OR REPLACE FUNCTION public.admin_reset_supplier_password(
  p_user_id uuid,
  p_new_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can reset passwords';
  END IF;
  
  -- Note: Actual password reset requires Supabase Admin API
  -- This function validates permissions
  -- The actual password reset will be done via edge function
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Password reset request validated',
    'user_id', p_user_id
  );
  
  RETURN result;
END;
$$;