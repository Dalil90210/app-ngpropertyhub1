import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Scale, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal")({
  head: () => ({ meta: [{ title: "Legal Engine — NGPropertyHub" }] }),
  component: Page,
});

const faqs = [
  { q: "Do I need a real estate attorney?", a: "Required in some states (NY, NJ, GA) and recommended in others. Our 50-state guide details requirements." },
  { q: "What is a title search?", a: "A title search verifies the seller has clear, transferable ownership." },
  { q: "How long does closing take?", a: "Typically 30-45 days; NGPropertyHub averages 14 days with smart escrow." },
];

function Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Scale className="w-12 h-12 mx-auto text-gold" />
        <h1 className="text-4xl font-bold text-navy mt-4">50-State Legal Engine</h1>
        <p className="mt-3 text-muted-foreground">AI-powered property law guidance for every U.S. state.</p>
      </div>

      <Card className="p-4 mb-6 flex gap-2">
        <Input placeholder="Ask any property law question..." className="border-0 focus-visible:ring-0" />
        <Button className="bg-navy"><MessageSquare className="w-4 h-4 mr-1" />Ask</Button>
      </Card>

      <h2 className="font-semibold text-lg text-navy mb-3">Common Questions</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <Card key={f.q} className="p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
