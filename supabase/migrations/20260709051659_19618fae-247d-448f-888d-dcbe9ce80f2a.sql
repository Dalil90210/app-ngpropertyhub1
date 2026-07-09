GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;