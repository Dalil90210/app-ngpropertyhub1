import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bitcoin, Zap, ShieldCheck, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/crypto")({
  head: () => ({
    meta: [
      { title: "Crypto Real Estate Payments — NGPropertyHub" },
      { name: "description", content: "Buy U.S. property with Bitcoin, Ethereum, USDC, or USDT. Instant settlement, multi-sig security, and 60%+ lower fees than wire or ACH transfers." },
      { property: "og:title", content: "Crypto Real Estate Payments — NGPropertyHub" },
      { property: "og:description", content: "Buy U.S. property with Bitcoin, Ethereum, USDC, or USDT. Instant settlement, multi-sig security, and 60%+ lower fees than wire or ACH transfers." },
      { property: "og:url", content: "https://us-property-grid.lovable.app/crypto" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://us-property-grid.lovable.app/crypto" }],
  }),
  component: Page,
});

const coins = [
  { sym: "BTC", name: "Bitcoin", rate: "$67,420" },
  { sym: "ETH", name: "Ethereum", rate: "$3,180" },
  { sym: "USDC", name: "USD Coin", rate: "$1.00" },
  { sym: "USDT", name: "Tether", rate: "$1.00" },
];

function Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Bitcoin className="w-12 h-12 mx-auto text-gold" aria-hidden="true" />
        <h1 className="text-4xl font-bold text-navy mt-4">Crypto Payments</h1>
        <p className="mt-3 text-muted-foreground">Pay for property in BTC, ETH, USDC, or USDT — settled instantly.</p>
      </div>

      <section aria-labelledby="supported-coins">
        <h2 id="supported-coins" className="sr-only">Supported cryptocurrencies</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coins.map((c) => (
            <Card key={c.sym} className="p-5 text-center">
              <div className="w-12 h-12 rounded-full gradient-gold mx-auto flex items-center justify-center text-navy font-bold">{c.sym}</div>
              <h3 className="font-semibold mt-3">{c.name}</h3>
              <div className="text-sm text-muted-foreground">{c.rate}</div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="crypto-benefits" className="mt-8">
        <h2 id="crypto-benefits" className="sr-only">Why pay in crypto</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Zap, t: "Instant settlement", d: "Funds available in minutes, not days." },
            { icon: TrendingDown, t: "Low fees", d: "Save 60%+ vs wire and ACH." },
            { icon: ShieldCheck, t: "Secure", d: "Multi-sig wallets, audited contracts." },
          ].map((x) => (
            <Card key={x.t} className="p-5">
              <x.icon className="w-6 h-6 text-gold mb-2" aria-hidden="true" />
              <h3 className="font-semibold text-navy">{x.t}</h3>
              <p className="text-sm text-muted-foreground">{x.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="text-center mt-10">
        <Button size="lg" className="bg-navy hover:bg-navy/90">Connect Wallet</Button>
      </div>
    </div>
  );
}
