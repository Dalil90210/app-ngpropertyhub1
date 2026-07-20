
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS inquiries_buyer_id_idx ON public.inquiries(buyer_id);

-- Replace insert policy to allow buyer_id to be null or match the caller
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
CREATE POLICY inquiries_public_insert ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (buyer_id IS NULL OR buyer_id = auth.uid())
    AND (char_length(buyer_name) BETWEEN 1 AND 120)
    AND (char_length(buyer_email) BETWEEN 3 AND 255)
    AND (buyer_phone IS NULL OR char_length(buyer_phone) <= 40)
    AND (message IS NULL OR char_length(message) <= 2000)
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id
    )
  );

-- Buyers can read their own inquiries
CREATE POLICY inquiries_buyer_read ON public.inquiries
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid());

-- Buyers can close their own inquiries (status transitions to 'closed' only)
CREATE POLICY inquiries_buyer_close ON public.inquiries
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() AND status = 'closed');
