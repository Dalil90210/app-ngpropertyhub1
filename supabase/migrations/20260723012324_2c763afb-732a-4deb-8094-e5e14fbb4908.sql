DROP POLICY IF EXISTS user_roles_insert_own_basic ON public.user_roles;
CREATE POLICY user_roles_insert_own_basic ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = ANY (ARRAY['buyer'::public.app_role, 'investor'::public.app_role, 'seller'::public.app_role, 'agent'::public.app_role])
  );