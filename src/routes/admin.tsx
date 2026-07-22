import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, DollarSign, Activity, ShieldCheck, Phone } from "lucide-react";
import { toast } from "sonner";

// types.ts can lag a hand-written migration; cast for the newly added table.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, role, loading, signOut } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (!user) nav({ to: "/admin-login" });
      else if (role !== "admin") nav({ to: "/admin-login" });
    }
  }, [user, role, loading, nav]);

  const { data: props = [], refetch } = useQuery({
    queryKey: ["admin-props"],
    queryFn: async () => (await supabase.from("properties").select("*").order("created_at", { ascending: false })).data ?? [],
    enabled: role === "admin",
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
    enabled: role === "admin",
  });

  const { data: phoneRequests = [], refetch: refetchPhoneRequests } = useQuery({
    queryKey: ["admin-phone-requests"],
    queryFn: async () =>
      (
        await db
          .from("phone_reveal_requests")
          .select("*")
          .eq("status", "pending")
          .order("requested_at", { ascending: false })
      ).data ?? [],
    enabled: role === "admin",
  });

  const decidePhoneRequest = async (id: string, status: "approved" | "denied") => {
    const { error } = await db
      .from("phone_reveal_requests")
      .update({ status, decided_at: new Date().toISOString(), decided_by: user?.id })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Phone number approved for buyer" : "Request denied");
    refetchPhoneRequests();
  };

  const approve = async (id: string) => {
    const { error } = await supabase.from("properties").update({ verified: true, trust_score: 95 }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Approved");
    refetch();
  };
  const reject = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    refetch();
  };

  if (role !== "admin") return null;
  const pending = props.filter((p) => !p.verified);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-gold" />
            <h1 className="font-bold">New Guard Property Hub Admin</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">View site</Button></Link>
            <Button onClick={async () => { await signOut(); nav({ to: "/admin-login" }); }} variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">Sign out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { i: Users, l: "Users", v: profiles.length },
            { i: Building2, l: "Listings", v: props.length },
            { i: DollarSign, l: "Pending verification", v: pending.length },
            { i: Phone, l: "Phone reveal requests", v: phoneRequests.length },
            { i: Activity, l: "System health", v: "OK" },
          ].map((s) => (
            <Card key={s.l} className="p-5">
              <s.i className="w-5 h-5 text-gold" />
              <div className="text-2xl font-bold mt-2 text-navy">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Listing Verification Queue</h2>
          {pending.length === 0
            ? <p className="text-muted-foreground text-sm">All caught up.</p>
            : pending.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.city}, {p.state} · ${Number(p.price).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(p.id)} className="bg-success">Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(p.id)}>Reject</Button>
                  </div>
                </div>
              ))}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-gold" />Phone Reveal Requests</h2>
          {phoneRequests.length === 0
            ? <p className="text-muted-foreground text-sm">No pending requests.</p>
            : phoneRequests.map((r: { id: string; listing_id: string; buyer_id: string; requested_at: string }) => (
                <div key={r.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div className="text-sm">
                    <div className="font-medium">Buyer requested seller phone</div>
                    <div className="text-xs text-muted-foreground">Listing {r.listing_id.slice(0, 8)}... · Buyer {r.buyer_id.slice(0, 8)}...</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decidePhoneRequest(r.id, "approved")} className="bg-success">Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => decidePhoneRequest(r.id, "denied")}>Deny</Button>
                  </div>
                </div>
              ))}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Recent Users</h2>
          {profiles.slice(0, 10).map((u) => (
            <div key={u.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{u.full_name || u.email}</span>
              <span className="text-muted-foreground">{u.email}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
