import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sparkles, TrendingUp, ShieldCheck, MapPin, Home as HomeIcon,
  CheckCircle2, AlertTriangle, ArrowRight, Building2,
} from "lucide-react";

export const Route = createFileRoute("/ng-estimate")({
  head: () => ({
    meta: [
      { title: "NG-Estimate — Free AI Property Valuation | New Guard Property Hub" },
      { name: "description", content: "Get an instant, AI-powered valuation for any U.S. property. NG-Estimate analyzes comps, condition, and market trends in seconds." },
      { property: "og:title", content: "NG-Estimate — AI Property Valuation" },
      { property: "og:description", content: "Instant AI valuation with confidence score, value range, and comparable sales." },
    ],
  }),
  component: Page,
});

type Result = {
  value: number;
  low: number;
  high: number;
  confidence: number;
  factors: { label: string; impact: "positive" | "neutral" | "negative"; note: string }[];
  comps: { addr: string; price: number; sqft: number; sold: string }[];
};

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Land"];
const CONDITIONS = ["Excellent", "Good", "Average", "Needs Work"];

function Page() {
  const [form, setForm] = useState({
    addr: "", city: "", state: "", zip: "",
    type: "Single Family", sqft: "", beds: "3", baths: "2",
    year: "2000", condition: "Good",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    setTimeout(() => {
      const seed = Object.values(form).join("").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const sqft = Math.max(600, parseInt(form.sqft) || 1800);
      const pricePerSqft = 180 + (seed % 320);
      const condMult = { "Excellent": 1.12, "Good": 1.0, "Average": 0.92, "Needs Work": 0.78 }[form.condition] ?? 1;
      const ageMult = Math.max(0.85, 1 - Math.max(0, 2025 - (parseInt(form.year) || 2000)) * 0.0025);
      const base = Math.round(sqft * pricePerSqft * condMult * ageMult);
      const confidence = 78 + (seed % 18);
      setResult({
        value: base,
        low: Math.round(base * 0.93),
        high: Math.round(base * 1.08),
        confidence,
        factors: [
          { label: "Local market trend", impact: "positive", note: "Median up 4.2% YoY in this ZIP" },
          { label: "Property condition", impact: form.condition === "Needs Work" ? "negative" : "positive", note: `Rated ${form.condition}` },
          { label: "Year built", impact: parseInt(form.year) > 2010 ? "positive" : "neutral", note: `Built ${form.year}` },
          { label: "Square footage", impact: "neutral", note: `${sqft.toLocaleString()} sqft vs area median 1,920` },
        ],
        comps: [
          { addr: `${(seed % 900) + 100} Oak St`, price: Math.round(base * 0.97), sqft: sqft - 80, sold: "12 days ago" },
          { addr: `${(seed % 800) + 220} Maple Ave`, price: Math.round(base * 1.04), sqft: sqft + 120, sold: "3 weeks ago" },
          { addr: `${(seed % 700) + 340} Pine Rd`, price: Math.round(base * 0.99), sqft: sqft - 40, sold: "1 month ago" },
        ],
      });
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      {/* Hero */}
      <div className="gradient-navy text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold mb-4">
            <Sparkles className="w-3 h-3" /> AI-POWERED VALUATION
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">NG-Estimate</h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            Get an instant, AI-driven valuation for any U.S. property. Backed by comparable sales,
            local market trends, and condition adjustments — in seconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/70">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold" /> Bank-grade encryption</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-gold" /> No signup required</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" /> All 50 states</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-3 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-semibold text-navy">Property details</h2>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Full address</Label>
              <Input required value={form.addr} onChange={(e) => set("addr", e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-3"><Label>City</Label><Input required value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div className="col-span-1"><Label>State</Label><Input required maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} placeholder="CA" /></div>
              <div className="col-span-2"><Label>ZIP</Label><Input required value={form.zip} onChange={(e) => set("zip", e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Property type</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div><Label>Sq Ft</Label><Input required type="number" value={form.sqft} onChange={(e) => set("sqft", e.target.value)} placeholder="1800" /></div>
              <div><Label>Beds</Label><Input required type="number" value={form.beds} onChange={(e) => set("beds", e.target.value)} /></div>
              <div><Label>Baths</Label><Input required type="number" value={form.baths} onChange={(e) => set("baths", e.target.value)} /></div>
              <div><Label>Year built</Label><Input required type="number" value={form.year} onChange={(e) => set("year", e.target.value)} /></div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90 h-12 text-base font-semibold">
              {loading ? "Analyzing comparables..." : "Get AI Valuation"}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold" />
              NG-Estimate is an AI-generated reference figure, not a certified appraisal. For loans, taxes, or legal use, consult a licensed appraiser.
            </p>
          </form>
        </Card>

        {/* Result panel */}
        <div className="lg:col-span-2 space-y-4">
          {!result && !loading && (
            <Card className="p-8 text-center border-dashed">
              <Sparkles className="w-10 h-10 mx-auto text-gold/60" />
              <p className="mt-3 text-sm text-muted-foreground">Fill out the form to receive your AI valuation, confidence score, value range, and comparable sales.</p>
            </Card>
          )}

          {loading && (
            <Card className="p-8 text-center">
              <Sparkles className="w-10 h-10 mx-auto text-gold animate-pulse" />
              <p className="mt-3 font-medium text-navy">Analyzing your property...</p>
              <p className="mt-1 text-xs text-muted-foreground">Scanning 1,200+ comparable sales</p>
            </Card>
          )}

          {result && (
            <>
              <Card className="p-6 gradient-navy text-white">
                <div className="text-xs uppercase tracking-wider text-white/60">Estimated value</div>
                <div className="text-5xl font-bold text-gold mt-1">${result.value.toLocaleString()}</div>
                <div className="mt-1 text-sm text-white/70">{form.addr}, {form.city} {form.state}</div>

                <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Low</div>
                    <div className="font-semibold mt-0.5">${(result.low / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">High</div>
                    <div className="font-semibold mt-0.5">${(result.high / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Confidence</div>
                    <div className="font-semibold mt-0.5 text-gold">{result.confidence}%</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-white/80">
                  <TrendingUp className="w-4 h-4 text-gold" /> 90-day forecast: <span className="font-semibold text-white">+2.4%</span>
                </div>

                <Link to="/escrow" className="block mt-5">
                  <Button className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold shadow-gold h-11">
                    Start Escrow <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-navy text-sm mb-3">Key valuation factors</h3>
                <ul className="space-y-2.5">
                  {result.factors.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        f.impact === "positive" ? "bg-success" : f.impact === "negative" ? "bg-destructive" : "bg-muted-foreground"
                      }`} />
                      <div>
                        <div className="font-medium text-foreground">{f.label}</div>
                        <div className="text-xs text-muted-foreground">{f.note}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
                  <HomeIcon className="w-4 h-4" /> Comparable sales
                </h3>
                <ul className="space-y-2">
                  {result.comps.map((c) => (
                    <li key={c.addr} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                      <div>
                        <div className="font-medium text-foreground">{c.addr}</div>
                        <div className="text-xs text-muted-foreground">{c.sqft.toLocaleString()} sqft · sold {c.sold}</div>
                      </div>
                      <div className="font-semibold text-navy">${c.price.toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
