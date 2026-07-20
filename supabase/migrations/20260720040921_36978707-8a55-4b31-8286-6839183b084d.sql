REVOKE SELECT (license_number) ON public.agent_profiles FROM anon, authenticated;
GRANT SELECT (license_number) ON public.agent_profiles TO service_role;