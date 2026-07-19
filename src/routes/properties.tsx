import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Filters = {
  q: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  baths: string;
  type: string;
};

export const Route = createFileRoute("/properties")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "U.S. Properties for Sale — New Guard Property Hub" },
      { name: "description", content: "Browse verified U.S. real estate listings. Filter by price, beds, baths, and property type." },
      { property: "og:title", content: "U.S. Properties for Sale — New Guard Property Hub" },
      { property: "og:description", content: "Browse verified U.S. real estate listings. Filter by price, beds, baths, and property type." },
      { property: "og:url", content: "https://app.ngpropertyhub.com/properties" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://app.ngpropertyhub.com/properties" }],
  }),
  component: Properties,
});

function Properties() {
  const { q: qParam } = Route.useSearch();
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    q: qParam ?? "",
    minPrice: "", maxPrice: "", beds: "any", baths: "any", type: "any",
  });
  const [sort, setSort] = useState("newest");
  const [saveName, setSaveName] = useState("");

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [k]: v }));

  const { data: props = [], isLoading } = useQuery({
    queryKey: ["properties", filters, sort],
    queryFn: async () => {
      let query = supabase.from("properties").select("*").limit(60);
      if (filters.q) query = query.or(`title.ilike.%${filters.q}%,city.ilike.%${filters.q}%,state.ilike.%${filters.q}%,address.ilike.%${filters.q}%`);
      if (filters.minPrice) query = query.gte("price", Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte("price", Number(filters.maxPrice));
      if (filters.beds !== "any") query = query.gte("bedrooms", Number(filters.beds));
      if (filters.baths !== "any") query = query.gte("bathrooms", Number(filters.baths));
      if (filters.type !== "any") query = query.eq("property_type", filters.type);
      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else if (sort === "sqft_desc") query = query.order("sqft", { ascending: false, nullsFirst: false });
      else query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveSearch = async () => {
    if (!user) return toast.error("Sign in to save searches");
    if (!saveName.trim()) return toast.error("Give your search a name");
    const { error } = await db.from("saved_searches").insert({
      user_id: user.id, name: saveName.trim(), filters,
    });
    if (error) return toast.error(error.message);
    toast.success("Search saved");
    setSaveName("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">Properties</h1>
          <p className="text-muted-foreground">{props.length} listings</p>
        </div>
        <div className="flex gap-2">
          <Link to="/saved"><Button variant="outline"><Bookmark className="w-4 h-4 mr-2" />Saved</Button></Link>
          <Link to="/list-property"><Button className="bg-gold text-navy hover:bg-gold/90">List your property</Button></Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4 mb-6 shadow-elegant space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 border rounded-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input value={filters.q} onChange={(e) => set("q", e.target.value)} placeholder="City, state, keyword..." className="border-0 focus-visible:ring-0 px-0" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="sqft_desc">Largest sqft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Input placeholder="Min price" type="number" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
          <Input placeholder="Max price" type="number" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} />
          <Select value={filters.beds} onValueChange={(v) => set("beds", v)}>
            <SelectTrigger><SelectValue placeholder="Beds" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any beds</SelectItem>
              {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}+ beds</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.baths} onValueChange={(v) => set("baths", v)}>
            <SelectTrigger><SelectValue placeholder="Baths" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any baths</SelectItem>
              {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}+ baths</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="multi">Multi-family</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {user && (
          <div className="flex gap-2 pt-2 border-t">
            <Input placeholder="Save this search as..." value={saveName} onChange={(e) => setSaveName(e.target.value)} className="max-w-xs" />
            <Button variant="outline" onClick={saveSearch}><Bookmark className="w-4 h-4 mr-2" />Save search</Button>
            <Link to="/saved-searches" className="ml-auto text-sm text-muted-foreground hover:text-gold self-center">My saved searches →</Link>
          </div>
        )}
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
          <h3 className="text-xl font-semibold mt-4 text-navy">No properties match</h3>
          <p className="text-muted-foreground mt-1">Try broadening your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {props.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
