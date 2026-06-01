import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ShieldCheck, Sparkles, Coins, PieChart, ArrowRight, Building2, Bitcoin, Scale, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NGPropertyHub — Secure U.S. Real Estate Transactions" },
      { name: "description", content: "Browse verified listings, get AI valuations, and close securely across all 50 US states." },
    ],
  }),
  component: Home,
});

const stats = [
  { v: "$2.3T", l: "Market covered" },
  { v: "50", l: "US states" },
  { v: "25+", l: "Platform features" },
  { v: "99.9%", l: "Secure escrow" },
];

const features = [
  { icon: ShieldCheck, title: "Blockchain Verified", desc: "Every listing carries a TrustScore backed by immutable verification." },
  { icon: Coins, title: "Smart Escrow", desc: "Multi-stage escrow protects buyers and sellers end-to-end." },
  { icon: Sparkles, title: "AI Valuations", desc: "Get NG-Estimate for any U.S. address in seconds." },
  { icon: Bitcoin, title: "Crypto Payments", desc: "Pay in BTC, ETH, USDC, USDT — settled instantly." },
  { icon: PieChart, title: "Fractional Investing", desc: "Invest in real estate from $100 with tokenized ownership." },
  { icon: Scale, title: "50-State Legal Engine", desc: "AI-powered guides for every state's property law." },
];

function Home() {
  return (
    <>
      {/* Trust ticker */}
      <div className="bg-navy text-white/80 text-xs overflow-hidden border-b border-white/10">
        <div className="container mx-auto px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 justify-center">
          {stats.map((s) => (
            <span key={s.l}><span className="text-gold font-semibold">{s.v}</span> {s.l}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative gradient-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" /> The #1 U.S. Real Estate Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              The Future of <span className="text-gold">Secure</span> Property Transactions
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
              Browse verified homes, get AI valuations, send offers, and close with smart escrow — all in one place.
            </p>

            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl p-2 flex items-center shadow-elegant">
              <Search className="w-5 h-5 ml-3 text-muted-foreground" />
              <Input className="border-0 focus-visible:ring-0 text-base text-foreground" placeholder="Search any property in the US..." />
              <Link to="/properties">
                <Button className="bg-navy hover:bg-navy/90 rounded-xl">Search</Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/properties"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-semibold">Browse Properties <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
              <Link to="/ng-estimate"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">Get NG-Estimate</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">Everything you need to transact with confidence</h2>
          <p className="mt-3 text-muted-foreground">From discovery to closing — one secure ecosystem.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-6 hover:shadow-elegant transition-all border-border">
              <div className="w-11 h-11 rounded-lg gradient-navy text-gold flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10 max-w-4xl mx-auto">
            {[
              { n: "01", t: "Discover", d: "Search verified listings or get an instant AI valuation." },
              { n: "02", t: "Transact", d: "Make offers, book showings, and connect with agents." },
              { n: "03", t: "Close securely", d: "Smart escrow handles funds, docs, and title in one flow." },
            ].map((s) => (
              <div key={s.n}>
                <div className="text-5xl font-bold text-gold">{s.n}</div>
                <h3 className="font-semibold text-xl mt-2 text-navy">{s.t}</h3>
                <p className="text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl gradient-navy text-white p-10 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to make your next move?</h2>
          <p className="mt-3 text-white/80">Join thousands of buyers, sellers, agents and investors on NGPropertyHub.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/auth"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-semibold">Get Started</Button></Link>
            <Link to="/list-property"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">List Your Property</Button></Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
            {["Verified listings", "Secure escrow", "AI insights", "All 50 states"].map((x) => (
              <span key={x} className="flex items-center gap-1.5 text-white/80"><CheckCircle2 className="w-4 h-4 text-gold" />{x}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
