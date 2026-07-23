
CREATE TABLE public.app_secrets (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_secrets TO authenticated;
GRANT ALL ON public.app_secrets TO service_role;

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage app secrets"
  ON public.app_secrets
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
