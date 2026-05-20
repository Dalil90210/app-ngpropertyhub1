import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2 } from "lucide-react";

export const Route = createFileRoute("/properties")({
  head: () => ({ meta: [{ title: "Properties — NGPropertyHub" }, { name: "description", content: "Browse verified U.S. properties." }] }),
  component: Properties,
});

function Properties() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const { data: props = [], isLoading } = useQuery({
    queryKey: ["properties", q, sort],
    queryFn: async () => {
      let query = supabase.from("properties").select("*").limit(60);
      if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%,address.ilike.%${q}%`);
      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">Properties</h1>
          <p className="text-muted-foreground">All 50 states · {props.length} listings</p>
        </div>
        <Link to="/list-property"><Button className="bg-gold text-navy hover:bg-gold/90">List your property</Button></Link>
      </div>

      <div className="bg-card rounded-xl border p-3 flex flex-wrap gap-2 mb-6 shadow-elegant">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="City, state, or keyword..." className="border-0 focus-visible:ring-0 px-0" />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low → High</SelectItem>
            <SelectItem value="price_desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : props.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4 text-navy">No properties yet</h3>
          <p className="text-muted-foreground mt-1">Be the first to list a property on NGPropertyHub.</p>
          <Link to="/list-property"><Button className="mt-5 bg-navy hover:bg-navy/90">List Your Property</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {props.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
