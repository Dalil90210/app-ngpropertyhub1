import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, TrendingUp, Users, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/invest")({
  head: () => ({ meta: [{ title: "Fractional Investment — NGPropertyHub" }] }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <PieChart className="w-12 h-12 mx-auto text-gold" />
        <h1 className="text-4xl font-bold text-navy mt-4">Fractional Investment</h1>
        <p className="mt-3 text-muted-foreground">Own a slice of premium U.S. real estate from just $100. Earn rental income, share in appreciation.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: TrendingUp, t: "Passive income", d: "Monthly dividends from rental yield." },
          { icon: Users, t: "Diversification", d: "Spread risk across properties and states." },
          { icon: Shield, t: "Low entry", d: "Start investing from $100." },
        ].map((x) => (
          <Card key={x.t} className="p-5">
            <x.icon className="w-6 h-6 text-gold mb-2" />
            <h3 className="font-semibold text-navy">{x.t}</h3>
            <p className="text-sm text-muted-foreground">{x.d}</p>
          </Card>
        ))}
      </div>

      <Card className="p-10 text-center bg-secondary/30 border-dashed">
        <h2 className="text-2xl font-bold text-navy">Tokenized properties launching soon</h2>
        <p className="text-muted-foreground mt-2 mb-5">Get notified when the first investment opportunities go live.</p>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("You're on the list!"); setEmail(""); }} className="max-w-md mx-auto flex gap-2">
          <Input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="bg-gold text-navy hover:bg-gold/90 font-semibold">Notify Me</Button>
        </form>
      </Card>
    </div>
  );
}
