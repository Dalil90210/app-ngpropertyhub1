import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Star, MapPin } from "lucide-react";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Find a Real Estate Agent — NGPropertyHub" },
      { name: "description", content: "Browse top-rated, verified U.S. real estate agents across all 50 states. Search by city or specialty to find an expert for your next transaction." },
      { property: "og:title", content: "Find a Real Estate Agent — NGPropertyHub" },
      { property: "og:description", content: "Browse top-rated, verified U.S. real estate agents across all 50 states. Search by city or specialty to find an expert for your next transaction." },
      { property: "og:url", content: "https://us-property-grid.lovable.app/agents" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://us-property-grid.lovable.app/agents" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">Find an Agent</h1>
          <p className="text-muted-foreground">Top-rated, verified real estate professionals.</p>
        </div>
        <Link to="/auth"><Button className="bg-gold text-navy hover:bg-gold/90">Apply as Agent</Button></Link>
      </div>

      <Card className="p-3 mb-6">
        <Input placeholder="Search agents by city or specialty..." className="border-0 focus-visible:ring-0" aria-label="Search agents" />
      </Card>

      <section aria-labelledby="agents-directory">
        <h2 id="agents-directory" className="sr-only">Agent directory</h2>
        <Card className="p-10 text-center border-dashed">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto" aria-hidden="true" />
          <h3 className="text-xl font-semibold mt-4 text-navy">Agent directory growing</h3>
          <p className="text-muted-foreground mt-1">We're onboarding top agents across all 50 states.</p>
          <Link to="/auth"><Button className="mt-4 bg-navy">Become an Agent</Button></Link>
        </Card>
      </section>
    </div>
  );
}
