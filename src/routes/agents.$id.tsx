import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/PropertyCard";
import { Star, BadgeCheck, MapPin } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Agent = {
  user_id: string;
  license_state: string;
  brokerage_name: string | null;
  bio: string | null;
  photo_url: string | null;
  verified_at: string | null;
};

export const Route = createFileRoute("/agents/$id")({
  head: () => ({ meta: [{ title: "Agent Profile — New Guard Property Hub" }] }),
  component: AgentPage,
});

function AgentPage() {
  const { id } = useParams({ from: "/agents/$id" });

  const { data: agent } = useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const { data } = await db
        .from("agent_profiles")
        .select("user_id, license_state, brokerage_name, bio, photo_url, verified_at")
        .eq("user_id", id)
        .maybeSingle();
      return data as Agent | null;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["agent-profile", id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["agent-listings", id],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("agent_id", id).eq("status", "active").limit(24);
      return data ?? [];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["agent-reviews", id],
    queryFn: async () => {
      const { data } = await db.from("reviews").select("id, rating, body, created_at, reviewer_id").eq("agent_id", id).order("created_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; rating: number; body: string | null; created_at: string; reviewer_id: string }>;
    },
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (!agent && !profile) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Agent not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-24 h-24 rounded-full bg-muted overflow-hidden shrink-0">
            {(agent?.photo_url || profile?.avatar_url) ? (
              <img src={agent?.photo_url || profile?.avatar_url || ""} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-navy/10 flex items-center justify-center text-2xl font-bold text-navy">
                {(profile?.full_name || "A").charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-navy">{profile?.full_name || "Real Estate Agent"}</h1>
              {agent?.verified_at && (
                <Badge className="bg-gold text-navy hover:bg-gold gap-1">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </Badge>
              )}
            </div>
            {agent?.brokerage_name && (
              <p className="text-muted-foreground mt-1">{agent.brokerage_name}</p>
            )}
            {agent && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Licensed in {agent.license_state}
              </p>
            )}
            {avgRating && (
              <div className="flex items-center gap-1 mt-2 text-sm">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="font-semibold">{avgRating}</span>
                <span className="text-muted-foreground">({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>
              </div>
            )}
            {agent?.bio && <p className="text-sm mt-3">{agent.bio}</p>}
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-semibold text-navy mb-3">Active Listings ({listings.length})</h2>
      {listings.length === 0 ? (
        <p className="text-muted-foreground mb-8">No active listings.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {listings.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}

      <h2 className="text-xl font-semibold text-navy mb-3">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{r.body || "(No comment)"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
