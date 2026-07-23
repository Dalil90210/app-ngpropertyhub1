
CREATE TABLE public.role_assignment_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  attempted_role public.app_role NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('success','failure')),
  error_code text,
  error_message text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.role_assignment_audit TO authenticated;
GRANT ALL ON public.role_assignment_audit TO service_role;

ALTER TABLE public.role_assignment_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_own"
  ON public.role_assignment_audit FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "audit_admin_all"
  ON public.role_assignment_audit FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX role_assignment_audit_user_id_created_at_idx
  ON public.role_assignment_audit (user_id, created_at DESC);

-- SECURITY DEFINER RPC so authenticated users can log their own attempts
-- (including failures) without needing direct INSERT on the audit table.
CREATE OR REPLACE FUNCTION public.log_role_assignment_attempt(
  _attempted_role public.app_role,
  _outcome text,
  _error_code text DEFAULT NULL,
  _error_message text DEFAULT NULL,
  _context jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _outcome NOT IN ('success','failure') THEN
    RAISE EXCEPTION 'Invalid outcome: %', _outcome;
  END IF;

  INSERT INTO public.role_assignment_audit
    (user_id, attempted_role, outcome, error_code, error_message, context)
  VALUES
    (_uid, _attempted_role, _outcome, _error_code, left(_error_message, 1000), COALESCE(_context, '{}'::jsonb))
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_role_assignment_attempt(public.app_role, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_role_assignment_attempt(public.app_role, text, text, text, jsonb) TO authenticated;
