import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Lock, PhoneCall, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useChatThread, usePhoneReveal } from "@/hooks/use-chat";

interface ChatProps {
  listingId: string;
  /** The other party in the conversation (listing agent/seller). */
  partnerId: string;
  partnerName?: string;
}

/**
 * Real-time buyer <-> seller chat for a single listing.
 * - Messages are only ever visible to the two participants (enforced by
 *   Supabase RLS on `messages`, not just the UI).
 * - Phone numbers are never shown directly here — the buyer can request a
 *   reveal, which an admin must approve before a number appears.
 */
export function Chat({ listingId, partnerId, partnerName = "Seller" }: ChatProps) {
  const { user, role } = useAuth();
  const { messages, isLoading, typing, send, broadcastTyping } = useChatThread(listingId, partnerId);
  const isBuyer = role !== "seller" && role !== "agent";
  const reveal = usePhoneReveal(isBuyer ? listingId : undefined, isBuyer ? partnerId : undefined);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft;
    setDraft("");
    await send(text);
  };

  return (
    <div className="flex flex-col h-[28rem] rounded-lg border overflow-hidden bg-white">
      <div className="bg-navy text-white px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{partnerName}</div>
          <div className="text-[11px] text-white/70">In-app chat &middot; phone numbers stay private</div>
        </div>
        {isBuyer && <PhoneRevealBadge status={reveal.status} phone={reveal.phone} onRequest={reveal.requestReveal} />}
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center mt-6">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Say hello — messages here stay inside New Guard and are never shared outside the app.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-navy text-white rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{m.body}</p>
                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${mine ? "text-white/70 justify-end" : "text-muted-foreground"}`}>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {mine && (m.read_at ? <CheckCheck className="w-3 h-3 text-gold" /> : <Check className="w-3 h-3" />)}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <form onSubmit={submit} className="border-t p-3 flex gap-2 items-end">
        <Textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            broadcastTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Type a message..."
          className="min-h-10 max-h-24 resize-none"
        />
        <Button type="submit" size="icon" className="bg-navy hover:bg-navy/90 shrink-0" disabled={!draft.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

function PhoneRevealBadge({
  status,
  phone,
  onRequest,
}: {
  status: "none" | "pending" | "approved" | "denied";
  phone: string | null;
  onRequest: () => void;
}) {
  if (status === "approved" && phone) {
    return (
      <Badge className="bg-gold text-navy flex items-center gap-1">
        <PhoneCall className="w-3 h-3" /> {phone}
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge variant="outline" className="border-white/40 text-white/90 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Phone request pending
      </Badge>
    );
  }
  if (status === "denied") {
    return (
      <Badge variant="outline" className="border-white/40 text-white/70 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Request denied
      </Badge>
    );
  }
  return (
    <Button size="sm" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 h-7 text-xs" onClick={onRequest}>
      <Lock className="w-3 h-3 mr-1" /> Request phone
    </Button>
  );
}
