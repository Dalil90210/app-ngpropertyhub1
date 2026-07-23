import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X, Send, Calculator, TrendingUp, Lightbulb, Bot, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiChat } from "@/lib/ai-chat.functions";

type Msg = { role: "user" | "assistant"; content: string };

const HIDE_ON = ["/splash", "/auth", "/role-select", "/admin-login", "/admin", "/ng-estimate"];

const QUICK_TOOLS = [
  { icon: Calculator, label: "Estimate Value", to: "/ng-estimate", desc: "Get an AI valuation" },
  { icon: TrendingUp, label: "Market Analysis", prompt: "Give me a quick U.S. real estate market analysis for this month — major trends and what they mean for buyers and sellers." },
  { icon: Lightbulb, label: "Investment Insights", prompt: "Share 3 actionable real estate investment insights for someone looking to start with fractional ownership." },
];

const GREETING: Msg = {
  role: "assistant",
  content: "Hi, I'm your Property Expert. Ask me about valuations, escrow, market trends, or investing. For a specific property, try the **Estimate Value** quick tool.",
};

export function AIAssistant() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chat = useServerFn(aiChat);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next.filter((m) => m !== GREETING).slice(-20) } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gold/40 blur-lg animate-pulse" />
            <div className="relative w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-gold border-2 border-white/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-navy" />
            </div>
          </div>
        </button>
      )}

      {/* Panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed z-50 bg-background border border-border shadow-2xl flex flex-col
                          inset-x-2 bottom-20 top-16 rounded-2xl
                          lg:inset-auto lg:bottom-6 lg:right-6 lg:top-auto lg:w-[400px] lg:h-[600px]">
            {/* Header */}
            <div className="gradient-navy text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center">
                  <Bot className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Property Expert</div>
                  <div className="text-[11px] text-white/90 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Powered by Grok · Online
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick tools */}
            <div className="p-3 border-b border-border bg-secondary/40">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Quick AI Tools</div>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_TOOLS.map((t) => {
                  const inner = (
                    <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-border bg-background hover:border-gold hover:shadow-sm transition-all text-center h-full">
                      <t.icon className="w-4 h-4 text-gold" />
                      <span className="text-[10px] font-medium text-navy leading-tight">{t.label}</span>
                    </div>
                  );
                  return t.to ? (
                    <Link key={t.label} to={t.to} onClick={() => setOpen(false)}>{inner}</Link>
                  ) : (
                    <button key={t.label} onClick={() => send(t.prompt!)} disabled={loading}>{inner}</button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-navy text-white rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy/60 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-navy/60 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-navy/60 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-border p-3 bg-background rounded-b-2xl"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about valuations, escrow, markets..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !input.trim()} size="icon" className="bg-navy hover:bg-navy/90 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-gold" /> AI responses are informational, not legal or financial advice.
              </p>
            </form>
          </div>
        </>
      )}
    </>
  );
}
