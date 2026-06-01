import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `You are the New Guard Property Hub AI Assistant — a knowledgeable, professional real estate expert helping U.S. users with property valuations, market trends, the escrow process, fractional investing, and general home-buying and selling questions.

Tone: trustworthy, concise, premium. Use short paragraphs and bullet points when helpful.

Rules:
- Never give legal, tax, or binding financial advice. Recommend a licensed attorney, CPA, or appraiser for those.
- Make clear that AI valuations and market figures are estimates for reference only.
- If asked about a specific property's value, point users to the NG-Estimate tool.
- If asked to start a transaction, point them to Smart Escrow.
- Decline anything off-topic from real estate, the New Guard platform, or related finance topics — politely redirect.`;

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { reply: "AI service is not configured. Please contact support.", error: true };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...data.messages,
          ],
        }),
      });

      if (res.status === 429) {
        return { reply: "I'm getting a lot of requests right now. Please try again in a moment.", error: true };
      }
      if (res.status === 402) {
        return { reply: "AI usage limit reached. Please contact the workspace admin.", error: true };
      }
      if (!res.ok) {
        return { reply: "I couldn't process that right now. Please try again.", error: true };
      }

      const json = await res.json() as { choices?: { message?: { content?: string } }[] };
      const reply = json.choices?.[0]?.message?.content?.trim() || "I don't have an answer for that right now.";
      return { reply, error: false };
    } catch {
      return { reply: "Network error. Please try again.", error: true };
    }
  });
