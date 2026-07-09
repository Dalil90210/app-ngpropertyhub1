CREATE POLICY "property_images_read_authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "property_images_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "property_images_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "property_images_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);