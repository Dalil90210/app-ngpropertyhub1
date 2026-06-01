import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ShieldCheck, Sparkles, Coins, PieChart, ArrowRight, Bitcoin, Scale, CheckCircle2 } from "lucide-react";

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

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Home() {
  const rootRef = useScrollReveal();

  return (
    <div ref={rootRef}>
      {/* Trust ticker */}
      <div className="bg-navy text-white/80 text-xs overflow-hidden border-b border-white/10">
        <div className="container mx-auto px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 justify-center">
          {stats.map((s) => (
            <span key={s.l}><span className="text-gold font-semibold">{s.v}</span> {s.l}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative gradient-hero-animated text-white overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-60" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,oklch(0.65_0.18_155_/_0.35),transparent_55%)]" />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_70%,oklch(0.55_0.17_155_/_0.30),transparent_50%)]" />

        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs mb-7 border border-emerald-glow">
              <span className="w-2 h-2 rounded-full bg-emerald-glow shadow-emerald-glow animate-pulse" />
              The #1 U.S. Real Estate Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
              The Future of <span className="text-emerald-glow">Secure</span>
              <br />
              <span className="relative inline-block">
                Property Transactions
                <span className="block mx-auto mt-3 h-[3px] w-44 rounded-full accent-line-glow" />
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              Browse verified homes, get AI valuations, send offers, and close with smart escrow — all in one place.
            </p>

            <div className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl p-2 flex items-center shadow-2xl shadow-emerald-glow ring-1 ring-emerald-glow">
              <Search className="w-5 h-5 ml-3 text-muted-foreground" />
              <Input className="border-0 focus-visible:ring-0 text-base text-foreground" placeholder="Search any property in the US..." />
              <Link to="/properties">
                <Button className="gradient-emerald hover:opacity-95 text-white rounded-xl font-semibold shadow-emerald-glow">Search</Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/properties">
                <Button size="lg" className="gradient-emerald text-white hover:opacity-95 font-semibold shadow-emerald-glow">
                  Browse Properties <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/ng-estimate">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                  Get NG-Estimate
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto reveal-on-scroll">
            {stats.map((s) => (
              <div
                key={s.l}
                className="relative rounded-2xl p-5 text-center bg-white/[0.04] backdrop-blur-sm border border-emerald-glow card-premium"
              >
                <div className="absolute inset-0 rounded-2xl shadow-emerald-glow opacity-40 pointer-events-none" />
                <div className="relative text-3xl md:text-4xl font-bold text-emerald-glow animate-stat-pulse">{s.v}</div>
                <div className="relative mt-1 text-xs md:text-sm text-white/70 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="absolute inset-0 bg-dot-pattern-light opacity-60 pointer-events-none" />
        <div className="relative text-center max-w-2xl mx-auto mb-14 reveal-on-scroll">
          <h2 className="text-3xl md:text-5xl font-bold text-navy tracking-tight">
            Everything you need to transact <span className="text-emerald-glow">with confidence</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">From discovery to closing — one secure ecosystem.</p>
        </div>
        <div className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="card-premium reveal-on-scroll p-7 rounded-2xl border-border bg-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl gradient-navy text-emerald-glow flex items-center justify-center mb-5 shadow-emerald-glow">
                <f.icon className="!w-7 !h-7" />
              </div>
              <h3 className="font-semibold text-xl text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern-light opacity-50" />
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl md:text-5xl font-bold text-navy text-center tracking-tight reveal-on-scroll">How it works</h2>
          <div className="grid md:grid-cols-3 gap-10 mt-14 max-w-5xl mx-auto">
            {[
              { n: "01", t: "Discover", d: "Search verified listings or get an instant AI valuation." },
              { n: "02", t: "Transact", d: "Make offers, book showings, and connect with agents." },
              { n: "03", t: "Close securely", d: "Smart escrow handles funds, docs, and title in one flow." },
            ].map((s) => (
              <div key={s.n} className="reveal-on-scroll">
                <div className="text-6xl font-bold text-emerald-glow drop-shadow-[0_0_18px_oklch(0.65_0.18_155_/_0.35)]">{s.n}</div>
                <h3 className="font-semibold text-2xl mt-3 text-navy">{s.t}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative rounded-3xl gradient-hero-animated text-white p-12 md:p-20 text-center overflow-hidden reveal-on-scroll">
          <div className="absolute inset-0 bg-dot-pattern opacity-60" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to make your next move?</h2>
            <p className="mt-4 text-white/75 text-lg">Join thousands of buyers, sellers, agents and investors on NGPropertyHub.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gradient-emerald text-white hover:opacity-95 font-semibold shadow-emerald-glow">
                  Get Started
                </Button>
              </Link>
              <Link to="/list-property">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                  List Your Property
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 justify-center text-sm">
              {["Verified listings", "Secure escrow", "AI insights", "All 50 states"].map((x) => (
                <span key={x} className="flex items-center gap-1.5 text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-glow" />{x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
