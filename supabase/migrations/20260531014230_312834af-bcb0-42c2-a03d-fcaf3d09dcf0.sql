
-- 1. Profiles: restrict SELECT to own row + admin
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2. user_roles: restrict self-insert to non-privileged roles only
DROP POLICY IF EXISTS user_roles_insert_own_nonadmin ON public.user_roles;
CREATE POLICY user_roles_insert_own_basic ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role IN ('buyer'::app_role, 'investor'::app_role)
  );

-- 3. escrow_transactions: remove broad UPDATE; only admins may update
DROP POLICY IF EXISTS escrow_update_involved ON public.escrow_transactions;
CREATE POLICY escrow_update_admin ON public.escrow_transactions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. notifications: allow users to delete their own
DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;
CREATE POLICY notifications_delete_own ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. Lock down has_role: only callable by RLS (table owner) and service_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
