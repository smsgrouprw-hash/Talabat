-- Create function to approve suppliers
CREATE OR REPLACE FUNCTION approve_supplier(supplier_id UUID)
RETURNS TEXT AS $$
BEGIN
  UPDATE suppliers 
  SET 
    is_active = true,
    is_verified = true,
    subscription_status = 'active',
    updated_at = now()
  WHERE id = supplier_id;
  
  IF FOUND THEN
    RETURN 'Supplier approved successfully';
  ELSE
    RETURN 'Supplier not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject suppliers
CREATE OR REPLACE FUNCTION reject_supplier(supplier_id UUID, reason TEXT DEFAULT 'Application rejected')
RETURNS TEXT AS $$
BEGIN
  UPDATE suppliers 
  SET 
    is_active = false,
    is_verified = false,
    subscription_status = 'suspended',
    updated_at = now()
  WHERE id = supplier_id;
  
  IF FOUND THEN
    RETURN 'Supplier rejected: ' || reason;
  ELSE
    RETURN 'Supplier not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;