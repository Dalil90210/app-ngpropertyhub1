import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Response("Forbidden", { status: 403 });
}

export const getXaiKeyStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_secrets")
      .select("value, updated_at")
      .eq("name", "XAI_API_KEY")
      .maybeSingle();
    const dbVal = (data?.value ?? "").trim();
    const envVal = (process.env.XAI_API_KEY ?? "").trim();
    const active = dbVal || envVal;
    return {
      source: dbVal ? ("database" as const) : envVal ? ("env" as const) : ("none" as const),
      length: active.length,
      prefix: active ? active.slice(0, 4) : "",
      updatedAt: data?.updated_at ?? null,
    };
  });

export const saveXaiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ key: z.string().trim().min(10).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("app_secrets").upsert(
      {
        name: "XAI_API_KEY",
        value: data.key,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      },
      { onConflict: "name" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const clearXaiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("app_secrets").delete().eq("name", "XAI_API_KEY");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const testGrok = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { callGrok, GROK_MODEL } = await import("@/lib/grok.server");
    const started = Date.now();
    const result = await callGrok([
      { role: "system", content: "Reply with the single word: pong." },
      { role: "user", content: "ping" },
    ], { temperature: 0 });
    return {
      model: GROK_MODEL,
      elapsedMs: Date.now() - started,
      ...result,
    };
  });
