-- ============================================================
-- Feature: In-House Chat (real-time) + admin-mediated phone reveal
-- ============================================================
-- The `messages` table already exists (see 20260719231331_...sql) with
-- correct participant-based RLS. This migration only ADDS:
--   1. Realtime publication for `messages` (chat) so buyer/seller get
--      live updates without polling.
--   2. A new `phone_reveal_requests` table so a buyer can ask an admin
--      to reveal the seller/agent's phone number for a specific listing.
--   3. A SECURITY DEFINER function that is the ONLY way the app ever
--      resolves a phone number for the reveal flow — it independently
--      re-checks for an approved request before returning anything,
--      regardless of what any other profiles policy allows.
-- No existing table, column, or policy is modified or removed.

-- Ensure UPDATE payloads on messages carry full old/new row data so
-- realtime read-receipt updates are reliable.
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Enable Postgres Realtime broadcasts for the chat table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- ============================================================
-- phone_reveal_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.phone_reveal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (listing_id, buyer_id)
);
CREATE INDEX IF NOT EXISTS phone_reveal_requests_status_idx ON public.phone_reveal_requests(status);

GRANT SELECT, INSERT ON public.phone_reveal_requests TO authenticated;
GRANT UPDATE ON public.phone_reveal_requests TO authenticated;
GRANT ALL ON public.phone_reveal_requests TO service_role;

ALTER TABLE public.phone_reveal_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can see + create their own requests.
CREATE POLICY "phone_reveal_buyer_read" ON public.phone_reveal_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "phone_reveal_buyer_insert" ON public.phone_reveal_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND buyer_id <> seller_id);

-- Only admins may decide (approve/deny) a request.
CREATE POLICY "phone_reveal_admin_update" ON public.phone_reveal_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'phone_reveal_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.phone_reveal_requests;
  END IF;
END $$;

-- ============================================================
-- get_revealed_seller_phone
-- Returns the seller's phone number ONLY if the calling user (auth.uid())
-- has an approved phone_reveal_requests row for that listing. This is
-- independent of the broader `profiles` SELECT policy, so tightening or
-- loosening that policy later cannot accidentally break (or bypass) this
-- privacy gate.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_revealed_seller_phone(p_listing_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
BEGIN
  SELECT pr.phone INTO v_phone
  FROM public.phone_reveal_requests r
  JOIN public.profiles pr ON pr.id = r.seller_id
  WHERE r.listing_id = p_listing_id
    AND r.buyer_id = auth.uid()
    AND r.status = 'approved';

  RETURN v_phone;
END;
$$;

REVOKE ALL ON FUNCTION public.get_revealed_seller_phone(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_revealed_seller_phone(uuid) TO authenticated;
