import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Hash, FileCheck } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify — NGPropertyHub" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <ShieldCheck className="w-12 h-12 mx-auto text-gold" />
        <h1 className="text-4xl font-bold text-navy mt-4">Verification & TrustScore</h1>
        <p className="mt-3 text-muted-foreground">Every listing is verified through documents, title checks, and blockchain anchoring.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: FileCheck, t: "Document audit", d: "Title deed, tax records, ID verification." },
          { icon: Hash, t: "Blockchain anchor", d: "Immutable hash of verification artifacts." },
          { icon: Lock, t: "TrustScore", d: "0-100 trust rating shown on every card." },
        ].map((x) => (
          <Card key={x.t} className="p-5">
            <x.icon className="w-6 h-6 text-gold mb-2" />
            <h3 className="font-semibold text-navy">{x.t}</h3>
            <p className="text-sm text-muted-foreground">{x.d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
