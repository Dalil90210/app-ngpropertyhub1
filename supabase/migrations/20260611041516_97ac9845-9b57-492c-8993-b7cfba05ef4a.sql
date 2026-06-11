
-- 1. Escrow: require accepted offer from this buyer for this property
DROP POLICY IF EXISTS escrow_buyer_insert ON public.escrow_transactions;

CREATE POLICY escrow_buyer_insert ON public.escrow_transactions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = buyer_id
  AND EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND p.agent_id = seller_id
      AND p.verified = true
  )
  AND EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.property_id = escrow_transactions.property_id
      AND o.buyer_id = auth.uid()
      AND o.status = 'accepted'
  )
);

-- 2. Showings: add WITH CHECK so buyers/agents can't reassign rows
DROP POLICY IF EXISTS showings_involved_update ON public.showings;

CREATE POLICY showings_involved_update ON public.showings
FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = agent_id)
WITH CHECK (
  -- Cannot reassign ownership
  buyer_id = (SELECT buyer_id FROM public.showings s WHERE s.id = showings.id)
  AND property_id = (SELECT property_id FROM public.showings s WHERE s.id = showings.id)
  AND agent_id IS NOT DISTINCT FROM (SELECT agent_id FROM public.showings s WHERE s.id = showings.id)
  AND (auth.uid() = buyer_id OR auth.uid() = agent_id)
  AND status IN ('pending','confirmed','completed','cancelled','rescheduled')
);
