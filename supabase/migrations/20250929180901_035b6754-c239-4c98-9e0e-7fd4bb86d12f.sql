-- Enable RLS on all tables that need it
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for the system tables
CREATE POLICY "Admin full access permissions" ON public.permissions
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin full access roles" ON public.roles
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin full access role_permissions" ON public.role_permissions
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read subscription_plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access subscription_plans" ON public.subscription_plans
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Fix function search paths for security functions
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS TABLE(permission_name character varying, resource character varying, action character varying, from_role character varying)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    p.name as permission_name, 
    p.resource, 
    p.action,
    r.name as from_role
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id uuid, p_permission_name character varying, p_organization_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND p.name = p_permission_name
    AND (
      p_organization_id IS NULL 
      OR ur.organization_id = p_organization_id 
      OR ur.organization_id IS NULL
      OR r.name = 'admin'  -- Admins have access everywhere
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id uuid)
RETURNS TABLE(role_name character varying, role_description text, organization_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.name,
    r.description,
    ur.organization_id
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id;
END;
$function$;