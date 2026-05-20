import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, MessageSquare, TrendingUp, Building2, DollarSign, Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
    if (!loading && user && !role) nav({ to: "/role-select" });
  }, [loading, user, role, nav]);

  if (!user || !role) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Welcome back</h1>
          <p className="text-muted-foreground capitalize">{role} dashboard · {user.email}</p>
        </div>
        <Badge className="bg-gold text-navy capitalize text-sm">{role}</Badge>
      </div>

      {role === "buyer" && <BuyerView />}
      {role === "seller" && <SellerView />}
      {role === "agent" && <AgentView />}
      {role === "investor" && <InvestorView />}
      {role === "admin" && (
        <Card className="p-6 text-center">
          <p className="mb-3">You have admin access.</p>
          <Link to="/admin"><Button className="bg-navy">Open Admin Console</Button></Link>
        </Card>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <Card className="p-5">
      <Icon className="w-5 h-5 text-gold" />
      <div className="text-2xl font-bold mt-2 text-navy">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

function BuyerView() {
  const { user } = useAuth();
  const { data: offers = [] } = useQuery({
    queryKey: ["my-offers", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*, properties(title)").eq("buyer_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={Heart} label="Saved" value="0" />
        <Stat icon={MessageSquare} label="Offers" value={offers.length} />
        <Stat icon={Calendar} label="Showings" value="0" />
        <Stat icon={Eye} label="Recent searches" value="0" />
      </div>
      <Card className="p-6">
        <h2 className="font-semibold mb-3">Your Offers</h2>
        {offers.length === 0
          ? <p className="text-muted-foreground text-sm">No offers yet. <Link to="/properties" className="text-gold underline">Browse properties</Link>.</p>
          : offers.map((o: any) => (
              <div key={o.id} className="py-2 border-b last:border-0 flex justify-between">
                <span>{o.properties?.title}</span>
                <span className="font-semibold">${Number(o.amount).toLocaleString()} · <Badge variant="secondary">{o.status}</Badge></span>
              </div>
            ))}
      </Card>
    </>
  );
}

function SellerView() {
  const { user } = useAuth();
  const { data: listings = [] } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("agent_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={Building2} label="Listings" value={listings.length} />
        <Stat icon={Eye} label="Views" value="0" />
        <Stat icon={MessageSquare} label="Inquiries" value="0" />
        <Stat icon={DollarSign} label="Active offers" value="0" />
      </div>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">My Listings</h2>
          <Link to="/list-property"><Button className="bg-gold text-navy hover:bg-gold/90 font-semibold">+ Add Listing</Button></Link>
        </div>
        {listings.length === 0
          ? <p className="text-muted-foreground text-sm">No listings yet.</p>
          : listings.map((l) => (
              <Link key={l.id} to="/properties/$id" params={{ id: l.id }} className="block py-3 border-b last:border-0 flex justify-between">
                <span>{l.title}</span>
                <span>${Number(l.price).toLocaleString()} · <Badge variant={l.verified ? "default" : "secondary"}>{l.verified ? "Verified" : "Pending"}</Badge></span>
              </Link>
            ))}
      </Card>
    </>
  );
}

function AgentView() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={Building2} label="Active Listings" value="0" />
        <Stat icon={Users} label="Leads" value="0" />
        <Stat icon={DollarSign} label="Commission YTD" value="$0" />
        <Stat icon={TrendingUp} label="Conversion" value="0%" />
      </div>
      <Card className="p-6">
        <h2 className="font-semibold mb-2">Lead Pipeline</h2>
        <p className="text-muted-foreground text-sm">No leads yet. Inquiries from your listings will appear here.</p>
      </Card>
    </>
  );
}

function InvestorView() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={DollarSign} label="Portfolio value" value="$0" />
        <Stat icon={TrendingUp} label="Total return" value="0%" />
        <Stat icon={Building2} label="Holdings" value="0" />
        <Stat icon={Calendar} label="Next dividend" value="—" />
      </div>
      <Card className="p-6 text-center">
        <h2 className="font-semibold mb-2">No holdings yet</h2>
        <p className="text-muted-foreground text-sm mb-4">Tokenized investments launching soon.</p>
        <Link to="/invest"><Button className="bg-navy">Browse Opportunities</Button></Link>
      </Card>
    </>
  );
}
