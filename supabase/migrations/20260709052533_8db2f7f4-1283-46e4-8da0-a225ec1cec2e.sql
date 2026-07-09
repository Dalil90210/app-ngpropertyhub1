
-- Allow sellers to see inquiries on all their listings (not only verified) and update status
DROP POLICY IF EXISTS inquiries_agent_read ON public.inquiries;
CREATE POLICY inquiries_agent_read ON public.inquiries
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() IN (SELECT p.agent_id FROM public.properties p WHERE p.id = inquiries.property_id)
  );

CREATE POLICY inquiries_agent_update ON public.inquiries
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() IN (SELECT p.agent_id FROM public.properties p WHERE p.id = inquiries.property_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() IN (SELECT p.agent_id FROM public.properties p WHERE p.id = inquiries.property_id)
  );
