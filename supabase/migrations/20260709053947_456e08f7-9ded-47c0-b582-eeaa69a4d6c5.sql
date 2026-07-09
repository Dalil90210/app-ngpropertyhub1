
-- Fix: MALFORMED_RLS_CHECK on properties_update_own
DROP POLICY IF EXISTS properties_update_own ON public.properties;
CREATE POLICY properties_update_own ON public.properties
  FOR UPDATE TO authenticated
  USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Fix: WEAK_STORAGE_POLICY on storage.objects for property-images bucket.
-- Public gallery viewers use long-lived signed URLs (not RLS-gated), so we can
-- safely tighten authenticated direct reads to the file owner's own folder.
DROP POLICY IF EXISTS property_images_read_authenticated ON storage.objects;
CREATE POLICY property_images_read_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
