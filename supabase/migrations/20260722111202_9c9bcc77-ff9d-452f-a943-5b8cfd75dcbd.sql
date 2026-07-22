
-- Restrict license_number and license_state from public/anon exposure on agent_profiles
REVOKE SELECT ON public.agent_profiles FROM anon;
REVOKE SELECT ON public.agent_profiles FROM authenticated;

GRANT SELECT (user_id, brokerage_name, bio, photo_url, verified_at, created_at, updated_at)
  ON public.agent_profiles TO anon;

GRANT SELECT (user_id, brokerage_name, bio, photo_url, verified_at, created_at, updated_at, license_state)
  ON public.agent_profiles TO authenticated;

GRANT SELECT ON public.agent_profiles TO service_role;

-- Revoke EXECUTE on SECURITY DEFINER trigger-only helper functions from signed-in users.
-- These run inside triggers regardless of grants; no user should call them directly.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.offers_buyer_field_guard() FROM PUBLIC, anon, authenticated;
