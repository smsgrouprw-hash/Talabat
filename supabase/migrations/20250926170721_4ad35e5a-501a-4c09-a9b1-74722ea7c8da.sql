-- Add subscription_status column to suppliers table for approval workflow
ALTER TABLE suppliers 
ADD COLUMN subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'rejected', 'expired'));

-- Update existing suppliers to have pending status
UPDATE suppliers SET subscription_status = 'pending' WHERE subscription_status IS NULL;

-- Create admin RLS policies for suppliers table
CREATE POLICY "Admins can view all suppliers" 
ON suppliers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all suppliers" 
ON suppliers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin RLS policies for subscriptions table
CREATE POLICY "Admins can view all subscriptions" 
ON subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert subscriptions" 
ON subscriptions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all subscriptions" 
ON subscriptions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));