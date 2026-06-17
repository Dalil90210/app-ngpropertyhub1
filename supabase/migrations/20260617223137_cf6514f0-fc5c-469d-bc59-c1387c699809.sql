-- 1) profiles_update_own → scope to authenticated role explicitly
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2) Tighten offers buyer guard: buyer may only withdraw a pending offer,
--    cannot modify amount/financing_type/closing_date/message.
CREATE OR REPLACE FUNCTION public.offers_buyer_field_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_listing_agent boolean;
BEGIN
  is_listing_agent := EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = OLD.property_id AND p.agent_id = auth.uid()
  );

  IF auth.uid() = OLD.buyer_id AND NOT is_listing_agent THEN
    -- Identity columns never change
    IF NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
       OR NEW.property_id IS DISTINCT FROM OLD.property_id THEN
      RAISE EXCEPTION 'Buyers may not reassign offer buyer/property';
    END IF;

    -- Lock down offer terms after submission
    IF NEW.amount IS DISTINCT FROM OLD.amount
       OR NEW.financing_type IS DISTINCT FROM OLD.financing_type
       OR NEW.closing_date IS DISTINCT FROM OLD.closing_date
       OR NEW.message IS DISTINCT FROM OLD.message THEN
      RAISE EXCEPTION 'Buyers may not modify offer terms after submission';
    END IF;

    -- Status may only transition pending → withdrawn
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF OLD.status <> 'pending' OR NEW.status <> 'withdrawn' THEN
        RAISE EXCEPTION 'Buyers may only withdraw a pending offer';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
