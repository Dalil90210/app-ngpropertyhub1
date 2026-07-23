import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  addr: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zip: z.string().min(1).max(20),
  type: z.string().min(1).max(50),
  sqft: z.string().max(20),
  beds: z.string().max(10),
  baths: z.string().max(10),
  year: z.string().max(10),
  condition: z.string().max(30),
});

const SYSTEM = `You are a senior U.S. real estate valuation analyst powered by Grok (xAI). Given property details, produce a realistic reference valuation using typical market comps, price-per-sqft ranges, condition adjustments, and depreciation. Be conservative and consistent. Always respond with STRICT JSON only, matching this TypeScript type:

{
  "value": number,          // point estimate in USD
  "low": number,            // low end of range in USD (roughly value * 0.92)
  "high": number,           // high end of range in USD (roughly value * 1.08)
  "confidence": number,     // integer 60-95
  "factors": [ { "label": string, "impact": "positive"|"neutral"|"negative", "note": string } ],  // 3-5 factors
  "comps": [ { "addr": string, "price": number, "sqft": number, "sold": string } ]                // 3 recent comps
}

Rules:
- Use realistic price-per-sqft for the given city/state.
- comps addresses should be plausible nearby street names.
- Never wrap the JSON in markdown, code fences, or prose. Output JSON only.`;

export const grokValuation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const { callGrok } = await import("./grok.server");
    const user = `Property:
- Address: ${data.addr}, ${data.city}, ${data.state} ${data.zip}
- Type: ${data.type}
- Bedrooms: ${data.beds}, Bathrooms: ${data.baths}
- Living area: ${data.sqft} sqft
- Year built: ${data.year}
- Condition: ${data.condition}

Return the JSON valuation now.`;

    const res = await callGrok(
      [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
      { temperature: 0.3, response_format: { type: "json_object" } },
    );
    if (!res.ok) {
      return { ok: false as const, error: res.status === 429 ? "Rate limited — try again shortly." : "AI valuation failed. Please try again." };
    }
    try {
      const cleaned = res.content.replace(/^```json\s*|\s*```$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return { ok: true as const, result: parsed };
    } catch {
      return { ok: false as const, error: "Received an invalid response. Please try again." };
    }
  });
