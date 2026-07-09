-- Provide a single RPC for self-service role selection so the app does not
-- depend on client-side DELETE+INSERT permission sequencing.

CREATE OR REPLACE FUNCTION public.set_my_role(new_role public.app_role)
RETURNS public.user_roles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  selected_role public.user_roles;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF new_role = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'Only admins may assign the admin role';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = current_user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, new_role)
  RETURNING * INTO selected_role;

  RETURN selected_role;
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_role(public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_role(public.app_role) TO authenticated;
