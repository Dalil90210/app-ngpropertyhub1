import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export default defineTool({
  name: "search_properties",
  title: "Search properties",
  description:
    "Search U.S. property listings on New Guard Property Hub. Filter by city, state, price range, bedrooms, or property type. Returns up to 20 matches.",
  inputSchema: {
    city: z.string().optional().describe("City name filter (case-insensitive contains match)."),
    state: z.string().optional().describe("Two-letter U.S. state code (e.g. 'CA', 'TX')."),
    min_price: z.number().nonnegative().optional().describe("Minimum listing price in USD."),
    max_price: z.number().nonnegative().optional().describe("Maximum listing price in USD."),
    min_bedrooms: z.number().int().nonnegative().optional().describe("Minimum number of bedrooms."),
    property_type: z.string().optional().describe("Property type (e.g. 'single_family', 'condo')."),
    limit: z.number().int().min(1).max(20).optional().describe("Max results, default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    let q = supabase
      .from("properties")
      .select("id,title,address,city,state,zip,price,bedrooms,bathrooms,sqft,property_type,status,verified,trust_score")
      .limit(input.limit ?? 10);

    if (input.city) q = q.ilike("city", `%${input.city}%`);
    if (input.state) q = q.eq("state", input.state.toUpperCase());
    if (input.min_price != null) q = q.gte("price", input.min_price);
    if (input.max_price != null) q = q.lte("price", input.max_price);
    if (input.min_bedrooms != null) q = q.gte("bedrooms", input.min_bedrooms);
    if (input.property_type) q = q.eq("property_type", input.property_type);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { results: data ?? [], count: data?.length ?? 0 },
    };
  },
});
