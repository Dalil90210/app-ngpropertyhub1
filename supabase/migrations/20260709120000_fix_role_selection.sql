
-- Fix role selection: allow all four non-admin roles (buyer, seller, agent, investor)
-- for authenticated users to self-assign, and enable role switching by permitting
-- users to delete their own role rows.

-- 1. Replace the INSERT policy that restricted self-assignment to only buyer/investor.
--    The new policy allows any non-admin role while still blocking admin self-assignment.
DROP POLICY IF EXISTS user_roles_insert_own_basic ON public.user_roles;
CREATE POLICY user_roles_insert_own ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role <> 'admin'::app_role
  );

-- 2. Add a DELETE policy so users can remove their own role rows when switching roles.
DROP POLICY IF EXISTS user_roles_delete_own ON public.user_roles;
CREATE POLICY user_roles_delete_own ON public.user_roles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3. Ensure authenticated users have the DELETE privilege on user_roles
--    (needed for the RLS policy above to be reachable).
GRANT DELETE ON public.user_roles TO authenticated;

-- 4. Update the defense-in-depth trigger function to reflect the new policy:
--    - Non-admins may INSERT any non-admin role for themselves.
--    - Non-admins may DELETE their own role rows (for switching roles).
--    - Non-admins cannot UPDATE role rows.
--    - No one except admins may assign the 'admin' role.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins may perform any operation on user_roles.
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  -- Non-admins may delete their own role rows (required for role switching).
  IF TG_OP = 'DELETE' THEN
    IF OLD.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Users may only delete their own roles';
    END IF;
    RETURN OLD;
  END IF;

  -- Non-admins cannot UPDATE role rows.
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Only admins may update user roles';
  END IF;

  -- INSERT: user may only assign a role to themselves.
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Users may only assign roles to themselves';
  END IF;

  -- INSERT: user may not self-assign the admin role.
  IF NEW.role = 'admin'::app_role THEN
    RAISE EXCEPTION 'Only admins may assign the admin role';
  END IF;

  RETURN NEW;
END;
$$;
