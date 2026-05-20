import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/escrow")({
  head: () => ({ meta: [{ title: "Smart Escrow — NGPropertyHub" }] }),
  component: Page,
});

const stages = ["Initiated", "Funds Deposited", "Docs Submitted", "Title Validating", "Contract Executing", "Funds Released"];

function Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-navy">Smart Escrow</h1>
        <p className="mt-3 text-muted-foreground">Six automated stages protect every dollar from offer to ownership.</p>
      </div>

      <Card className="p-8">
        <h2 className="font-semibold text-navy mb-6">Transaction Pipeline</h2>
        <div className="grid md:grid-cols-6 gap-3">
          {stages.map((s, i) => (
            <div key={s} className="flex md:flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-gold text-navy flex items-center justify-center font-bold shrink-0">{i + 1}</div>
              <div className="text-sm font-medium">{s}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {[
          { icon: ShieldCheck, t: "Secure", d: "Funds held by FDIC-insured trust" },
          { icon: Clock, t: "Fast", d: "Average close: 14 days vs 45 industry" },
          { icon: Lock, t: "Protected", d: "Multi-sig releases, dispute resolution" },
        ].map((x) => (
          <Card key={x.t} className="p-5">
            <x.icon className="w-6 h-6 text-gold mb-2" />
            <h3 className="font-semibold text-navy">{x.t}</h3>
            <p className="text-sm text-muted-foreground">{x.d}</p>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/auth"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-semibold">Start Escrow</Button></Link>
      </div>
    </div>
  );
}
