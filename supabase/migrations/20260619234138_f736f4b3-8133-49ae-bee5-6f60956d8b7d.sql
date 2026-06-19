DROP POLICY IF EXISTS properties_update_own ON public.properties;
CREATE POLICY properties_update_own ON public.properties
FOR UPDATE TO authenticated
USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'::app_role))
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR agent_id = (SELECT agent_id FROM public.properties WHERE id = properties.id)
  )
);