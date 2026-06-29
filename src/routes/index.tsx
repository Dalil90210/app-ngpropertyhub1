import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search, ShieldCheck, Sparkles, Coins, PieChart, ArrowRight,
  Bitcoin, Scale, CheckCircle2, Lock, BadgeCheck, MapPin,
  Star, MessageSquare, FileSearch, Handshake,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Guard Property Hub — Secure U.S. Real Estate Transactions" },
      { name: "description", content: "Browse verified listings, get AI valuations, and close securely across all 50 US states with smart escrow, in-house chat, and crypto payments." },
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

const trustBadges = [
  { icon: Lock, label: "SECURE ESCROW" },
  { icon: BadgeCheck, label: "VERIFIED LISTINGS" },
  { icon: MapPin, label: "ALL 50 STATES" },
  { icon: ShieldCheck, label: "BANK-GRADE ENCRYPTION" },
];

const features = [
  { icon: ShieldCheck, title: "Blockchain Verified", desc: "Every listing carries a TrustScore backed by immutable verification." },
  { icon: Coins, title: "Smart Escrow", desc: "Multi-stage escrow protects buyers and sellers end-to-end." },
  { icon: Sparkles, title: "AI Valuations", desc: "Get NG-Estimate for any U.S. address in seconds." },
  { icon: Bitcoin, title: "Crypto Payments", desc: "Pay in BTC, ETH, USDC, USDT — settled instantly." },
  { icon: PieChart, title: "Fractional Investing", desc: "Invest in real estate from $100 with tokenized ownership." },
  { icon: Scale, title: "50-State Legal Engine", desc: "AI-powered guides for every state's property law." },
];

const steps = [
  { n: "01", icon: FileSearch, t: "Discover", d: "Search verified listings or get an instant AI valuation for any U.S. address." },
  { n: "02", icon: MessageSquare, t: "Transact", d: "Message agents in-house, make offers, and book showings — all in one secure inbox." },
  { n: "03", icon: Handshake, t: "Close securely", d: "Smart escrow handles funds, docs, and title transfer end-to-end." },
];

const testimonials = [
  { name: "Marcus T.", role: "Buyer · Austin, TX", quote: "The escrow flow was the smoothest closing I've ever had. Funds released the day title cleared — no chasing anyone." },
  { name: "Jenna R.", role: "Investor · Miami, FL", quote: "Fractional ownership starting at $100 actually works. I built a 5-property portfolio in a weekend." },
  { name: "David K.", role: "Agent · Seattle, WA", quote: "Verified listings cut my wasted showings in half. Clients trust the TrustScore before I even pitch." },
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
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" /> The #1 U.S. Real Estate Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Buy, Sell & Invest in U.S. Real Estate — <span className="text-gold">Securely</span>.
            </h1>
            <p className="mt-6 text-base md:text-xl text-white/80 max-w-2xl mx-auto">
              Verified listings. AI valuations. Smart escrow. Close 3× faster across all 50 states — without the middleman markup.
            </p>

            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl p-2 flex items-center shadow-elegant">
              <Search className="w-5 h-5 ml-3 text-muted-foreground shrink-0" />
              <Input className="border-0 focus-visible:ring-0 text-base text-foreground" placeholder="Search city, ZIP, or address..." />
              <Link to="/properties">
                <Button className="bg-navy hover:bg-navy/90 rounded-xl">Search</Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/ng-estimate"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-semibold shadow-gold"><Sparkles className="mr-2 w-4 h-4" /> Get AI Valuation</Button></Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {trustBadges.map((b) => (
                <div key={b.label} className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 text-[11px] md:text-xs font-semibold tracking-wider text-white/90">
                  <b.icon className="w-4 h-4 text-gold shrink-0" />
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">Everything you need to transact with confidence</h2>
          <p className="mt-3 text-muted-foreground">From discovery to closing — one secure ecosystem.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all border-border">
              <div className="w-12 h-12 rounded-xl gradient-navy text-gold flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps from search to signed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((s) => (
              <Card key={s.n} className="p-7 text-center border-border hover:shadow-elegant transition-all">
                <div className="w-14 h-14 rounded-2xl gradient-gold text-navy flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-gold tracking-widest">{s.n}</div>
                <h3 className="font-semibold text-xl mt-1 text-navy">{s.t}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">Trusted by buyers, sellers & investors</h2>
          <p className="mt-3 text-muted-foreground">Real users. Real closings. Across all 50 states.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6 border-border hover:shadow-elegant transition-all">
              <div className="flex gap-0.5 text-gold mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-foreground/90 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 pt-4 border-t border-border">
                <div className="font-semibold text-navy text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl gradient-navy text-white p-10 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to make your next move?</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">Join thousands of buyers, sellers, agents and investors on New Guard Property Hub.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/auth"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-semibold shadow-gold">Launch App</Button></Link>
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
