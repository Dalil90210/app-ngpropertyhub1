
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
CREATE POLICY inquiries_public_insert ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id)
    AND char_length(buyer_name) BETWEEN 1 AND 120
    AND char_length(buyer_email) BETWEEN 3 AND 255
    AND (buyer_phone IS NULL OR char_length(buyer_phone) <= 40)
    AND (message IS NULL OR char_length(message) <= 2000)
  );
