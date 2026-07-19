
-- Extend properties with geocode + marketplace fields
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS lot_size numeric,
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- ============================================================
-- agent_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text NOT NULL,
  license_state text NOT NULL,
  brokerage_name text,
  bio text,
  photo_url text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agent_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.agent_profiles TO authenticated;
GRANT ALL ON public.agent_profiles TO service_role;

ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_profiles_public_read" ON public.agent_profiles
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "agent_profiles_self_insert" ON public.agent_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND verified_at IS NULL);

CREATE POLICY "agent_profiles_self_update" ON public.agent_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND verified_at IS NOT DISTINCT FROM (SELECT verified_at FROM public.agent_profiles WHERE user_id = auth.uid()));

CREATE POLICY "agent_profiles_admin_all" ON public.agent_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER agent_profiles_set_updated_at
  BEFORE UPDATE ON public.agent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- listing_photos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS listing_photos_listing_idx ON public.listing_photos(listing_id, sort_order);

GRANT SELECT ON public.listing_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listing_photos TO authenticated;
GRANT ALL ON public.listing_photos TO service_role;

ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_photos_public_read" ON public.listing_photos
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "listing_photos_owner_write" ON public.listing_photos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = listing_id AND (p.agent_id = auth.uid() OR p.owner_id = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = listing_id AND (p.agent_id = auth.uid() OR p.owner_id = auth.uid())));

-- ============================================================
-- saved_searches
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled search',
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_searches_owner_all" ON public.saved_searches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- saved_listings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_listings TO authenticated;
GRANT ALL ON public.saved_listings TO service_role;

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_listings_owner_all" ON public.saved_listings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS messages_thread_idx ON public.messages(listing_id, sender_id, recipient_id, created_at);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id, created_at);

GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_participant_read" ON public.messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "messages_sender_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND sender_id <> recipient_id);

CREATE POLICY "messages_recipient_mark_read" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- ============================================================
-- reviews (only reviewers who have messaged the agent)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text CHECK (body IS NULL OR char_length(body) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, reviewer_id)
);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "reviews_reviewer_insert" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id <> agent_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE (m.sender_id = auth.uid() AND m.recipient_id = agent_id)
         OR (m.recipient_id = auth.uid() AND m.sender_id = agent_id)
    )
  );

CREATE POLICY "reviews_reviewer_update" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "reviews_reviewer_delete" ON public.reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'admin'));
