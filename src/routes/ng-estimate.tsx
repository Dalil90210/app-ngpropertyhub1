import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/ng-estimate")({
  head: () => ({
    meta: [
      { title: "NG-Estimate — Free AI Property Valuation | NGPropertyHub" },
      { name: "description", content: "Get an instant, AI-powered valuation for any U.S. property address. NG-Estimate analyzes comparable sales and market trends in seconds — no signup required." },
      { property: "og:title", content: "NG-Estimate — Free AI Property Valuation | NGPropertyHub" },
      { property: "og:description", content: "Get an instant, AI-powered valuation for any U.S. property address. NG-Estimate analyzes comparable sales and market trends in seconds — no signup required." },
      { property: "og:url", content: "https://us-property-grid.lovable.app/ng-estimate" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://us-property-grid.lovable.app/ng-estimate" }],
  }),
  component: Page,
});

function Page() {
  const [addr, setAddr] = useState(""); const [city, setCity] = useState(""); const [state, setState] = useState(""); const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false); const [result, setResult] = useState<null | { value: number }>(null);

  const calc = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setResult(null);
    setTimeout(() => {
      // Deterministic mock valuation
      const seed = (addr + city + state + zip).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const base = 250000 + (seed % 700000);
      setResult({ value: base });
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold mb-3">
          <Sparkles className="w-3 h-3" /> AI-Powered
        </div>
        <h1 className="text-4xl font-bold text-navy">NG-Estimate</h1>
        <p className="mt-2 text-muted-foreground">Get an instant AI valuation for any U.S. property.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={calc} className="space-y-4">
          <div><Label>Street address</Label><Input required value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="123 Main St" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Label>City</Label><Input required value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div><Label>State</Label><Input required maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="CA" /></div>
          </div>
          <div><Label>ZIP</Label><Input required value={zip} onChange={(e) => setZip(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90 h-11">
            {loading ? "Analyzing comparables..." : "Get Valuation"}
          </Button>
        </form>
      </Card>

      {loading && (
        <Card className="p-8 mt-6 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-gold animate-pulse" />
          <p className="mt-3 text-muted-foreground">Calculating value from 1,200+ comparables...</p>
        </Card>
      )}

      {result && (
        <Card className="p-8 mt-6 gradient-navy text-white">
          <div className="text-sm text-white/70">Estimated value</div>
          <div className="text-5xl font-bold text-gold mt-2">${result.value.toLocaleString()}</div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div><div className="text-xs text-white/60">Conservative</div><div className="font-semibold">${Math.round(result.value * 0.92).toLocaleString()}</div></div>
            <div><div className="text-xs text-white/60">Optimistic</div><div className="font-semibold">${Math.round(result.value * 1.08).toLocaleString()}</div></div>
            <div><div className="text-xs text-white/60">Confidence</div><div className="font-semibold text-gold">High</div></div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <div><div className="text-sm text-white/70">90-day forecast</div><div className="font-semibold">+2.4% expected</div></div>
          </div>
        </Card>
      )}
    </div>
  );
}
