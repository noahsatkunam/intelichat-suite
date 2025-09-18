-- Create helper functions for the new role hierarchy
-- Create function to check if user is global admin
CREATE OR REPLACE FUNCTION public.is_global_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'global_admin'
  );
$function$;

-- Update the get_user_tenant_id function to handle global admins
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'global_admin' THEN NULL
    ELSE (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  END;
$function$;