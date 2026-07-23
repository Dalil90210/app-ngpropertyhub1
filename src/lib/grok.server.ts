// Server-only xAI (Grok) client. Do not import from client components.

const XAI_URL = "https://api.x.ai/v1/chat/completions";
export const GROK_MODEL = "grok-2-1212";

export type GrokMessage = { role: "system" | "user" | "assistant"; content: string };

export type GrokResult =
  | { ok: true; content: string }
  | { ok: false; status: number; message: string };

export async function callGrok(
  messages: GrokMessage[],
  opts?: { model?: string; temperature?: number; response_format?: { type: "json_object" } },
): Promise<GrokResult> {
  const key = process.env.XAI_API_KEY;
  if (!key) return { ok: false, status: 500, message: "XAI_API_KEY is not configured." };

  try {
    const res = await fetch(XAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: opts?.model ?? GROK_MODEL,
        messages,
        temperature: opts?.temperature ?? 0.4,
        ...(opts?.response_format ? { response_format: opts.response_format } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, message: text || `Grok error ${res.status}` };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { ok: true, content };
  } catch (e) {
    return { ok: false, status: 0, message: e instanceof Error ? e.message : "Network error" };
  }
}
