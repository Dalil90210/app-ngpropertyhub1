
-- 1. Tighten inquiries SELECT: only agents of VERIFIED properties (or admins) can view buyer contact info.
DROP POLICY IF EXISTS inquiries_agent_read ON public.inquiries;
CREATE POLICY inquiries_agent_read ON public.inquiries
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR auth.uid() IN (
    SELECT p.agent_id FROM public.properties p
    WHERE p.id = inquiries.property_id AND p.verified = true
  )
);

-- 2. Defense-in-depth trigger on user_roles to block privilege escalation.
-- Only admins may assign roles other than 'buyer' or 'investor'. Also blocks
-- any non-admin from inserting a role for another user, and blocks UPDATEs by
-- non-admins.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Only admins may modify user roles';
  END IF;

  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Users may only assign roles to themselves';
  END IF;

  IF NEW.role NOT IN ('buyer'::app_role, 'investor'::app_role) THEN
    RAISE EXCEPTION 'Only admins may assign privileged roles';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_prevent_escalation ON public.user_roles;
CREATE TRIGGER user_roles_prevent_escalation
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();
