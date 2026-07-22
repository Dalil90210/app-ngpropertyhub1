CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Only admins may modify user roles';
  END IF;

  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Users may only assign roles to themselves';
  END IF;

  IF NEW.role NOT IN ('buyer'::public.app_role, 'investor'::public.app_role, 'seller'::public.app_role, 'agent'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins may assign privileged roles';
  END IF;

  RETURN NEW;
END;
$function$;