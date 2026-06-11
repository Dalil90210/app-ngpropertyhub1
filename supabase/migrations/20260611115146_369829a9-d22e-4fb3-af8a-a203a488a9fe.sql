DROP POLICY IF EXISTS offers_buyer_insert ON public.offers;
CREATE POLICY offers_buyer_insert ON public.offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS properties_delete_own ON public.properties;
CREATE POLICY properties_delete_own ON public.properties FOR DELETE TO authenticated USING ((auth.uid() = agent_id) OR has_role(auth.uid(), 'admin'::app_role));