
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

INSERT INTO public.properties (title, description, price, address, city, state, zip, bedrooms, bathrooms, sqft, property_type, status, verified, trust_score, images) VALUES
('Modern Hillside Retreat', 'Sun-drenched 4-bed with canyon views, chef''s kitchen, and infinity pool.', 1875000, '412 Skyline Ridge', 'Los Angeles', 'CA', '90210', 4, 3.5, 3200, 'single_family', 'active', true, 97, ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=70']),
('Downtown Loft with Skyline Views', 'Two-bed corner loft, floor-to-ceiling windows, doorman building.', 985000, '88 W Adams St #2201', 'Chicago', 'IL', '60603', 2, 2, 1650, 'condo', 'active', true, 95, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=70']),
('Waterfront Craftsman', 'Restored 3-bed on Lake Union with private dock and mountain views.', 2450000, '2210 Fairview Ave E', 'Seattle', 'WA', '98102', 3, 2.5, 2400, 'single_family', 'active', true, 96, ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=70']),
('Brooklyn Brownstone', 'Classic 4-story brownstone, garden, original details throughout.', 3200000, '145 Berkeley Pl', 'Brooklyn', 'NY', '11217', 5, 3.5, 3800, 'single_family', 'active', true, 98, ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=70']),
('South Beach Condo', 'Oceanfront 2-bed, resort amenities, walk to Lincoln Rd.', 1275000, '1500 Ocean Dr #904', 'Miami Beach', 'FL', '33139', 2, 2, 1420, 'condo', 'active', true, 94, ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=70']),
('Austin Hill Country Estate', '5-bed on 3 acres, pool, casita, and vineyard views.', 2150000, '9800 Cuernavaca Dr', 'Austin', 'TX', '78733', 5, 4.5, 4600, 'single_family', 'active', true, 96, ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=70']);
