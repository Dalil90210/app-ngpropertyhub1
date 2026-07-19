import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved Listings — New Guard Property Hub" }] }),
  component: Saved,
});

function Saved() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth", search: { next: "/saved" } });
  }, [loading, user, nav]);

  const { data: listings = [] } = useQuery({
    queryKey: ["saved-listings-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: ids } = await db
        .from("saved_listings")
        .select("listing_id")
        .eq("user_id", user!.id);
      const listingIds = (ids ?? []).map((r: { listing_id: string }) => r.listing_id);
      if (listingIds.length === 0) return [];
      const { data } = await supabase.from("properties").select("*").in("id", listingIds);
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy mb-2">Saved Listings</h1>
      <p className="text-muted-foreground mb-6">{listings.length} saved</p>
      {listings.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No saved listings yet.</p>
          <Link to="/properties"><Button className="mt-4 bg-navy hover:bg-navy/90">Browse Properties</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
