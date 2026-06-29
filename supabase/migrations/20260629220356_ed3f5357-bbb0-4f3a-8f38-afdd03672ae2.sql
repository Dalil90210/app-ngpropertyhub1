DROP POLICY IF EXISTS properties_update_own ON public.properties;
CREATE POLICY properties_update_own ON public.properties
FOR UPDATE
USING ((auth.uid() = agent_id) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() = agent_id AND agent_id = (SELECT p.agent_id FROM public.properties p WHERE p.id = public.properties.id))
);