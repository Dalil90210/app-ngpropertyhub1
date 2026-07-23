import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `You are the New Guard Property Hub AI Assistant, powered by Grok (xAI) — a knowledgeable, professional real estate expert helping U.S. users with property valuations, market trends, the escrow process, fractional investing, and general home-buying and selling questions.

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
    const { callGrok } = await import("./grok.server");
    const res = await callGrok(
      [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      { temperature: 0.5 },
    );
    if (!res.ok) {
      if (res.status === 429) return { reply: "I'm getting a lot of requests right now. Please try again in a moment.", error: true };
      if (res.status === 401) return { reply: "AI service is not configured. Please contact support.", error: true };
      return { reply: "I couldn't process that right now. Please try again.", error: true };
    }
    return { reply: res.content || "I don't have an answer for that right now.", error: false };
  });
