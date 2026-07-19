import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export const geocodeAddress = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        address: z.string().trim().min(4).max(300),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !gmapsKey) {
      return { ok: false as const, error: "Geocoding not configured" };
    }
    const url = `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(
      data.address,
    )}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmapsKey,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[geocode] gateway error", res.status, body);
      return { ok: false as const, error: `Geocode failed (${res.status})` };
    }
    const json = (await res.json()) as {
      status: string;
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
    };
    const loc = json.results?.[0]?.geometry?.location;
    if (json.status !== "OK" || !loc) {
      return { ok: false as const, error: `No result (${json.status})` };
    }
    return { ok: true as const, lat: loc.lat, lng: loc.lng };
  });
