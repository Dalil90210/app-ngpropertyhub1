
-- 1. Inquiries: require verified property on INSERT
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
CREATE POLICY inquiries_public_insert ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = inquiries.property_id AND p.verified = true)
    AND char_length(buyer_name) BETWEEN 1 AND 120
    AND char_length(buyer_email) BETWEEN 3 AND 255
    AND (buyer_phone IS NULL OR char_length(buyer_phone) <= 40)
    AND (message IS NULL OR char_length(message) <= 2000)
  );

-- 2. Properties: only agents or admins may insert
DROP POLICY IF EXISTS properties_insert_own ON public.properties;
CREATE POLICY properties_insert_own ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = agent_id
    AND (public.has_role(auth.uid(), 'agent'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

-- 3. Offers: allow buyer or admin to delete
CREATE POLICY offers_delete_involved ON public.offers
  FOR DELETE TO authenticated
  USING (auth.uid() = buyer_id OR public.has_role(auth.uid(), 'admin'::app_role));
