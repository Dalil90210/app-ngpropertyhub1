import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/account")({ component: Account });

type Profile = { full_name: string | null; email: string | null };
type AgentProfile = { license_state: string | null; brokerage_name: string | null; verified_at: string | null };

function Account() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setFetching(true);
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p ?? { full_name: null, email: user.email ?? null });

      if (role === "agent") {
        const { data: a } = await supabase
          .from("agent_profiles")
          .select("license_state,brokerage_name,verified_at")
          .eq("user_id", user.id)
          .maybeSingle();
        setAgent(a ?? null);
      }
      setFetching(false);
    })();
  }, [user, role]);

  if (!user) return null;

  const displayName =
    profile?.full_name ||
    (user.user_metadata as Record<string, unknown> | undefined)?.full_name as string ||
    user.email?.split("@")[0] ||
    "There";

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-navy">Account</h1>
        <p className="text-muted-foreground">Your New Guard Property Hub profile.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center">
            <UserIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-navy truncate">{displayName}</div>
            <div className="text-sm text-muted-foreground truncate">{profile?.email ?? user.email}</div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Role</span>
          {role ? (
            <Badge className="bg-gold text-navy capitalize">{role}</Badge>
          ) : (
            <Link to="/role-select" className="text-sm text-navy underline">Choose role</Link>
          )}
        </div>

        {role === "agent" && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verification</span>
              {fetching ? (
                <span className="text-sm text-muted-foreground">Loading…</span>
              ) : agent?.verified_at ? (
                <Badge className="bg-success/15 text-success hover:bg-success/15 gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-amber-400 text-amber-600">
                  <Clock className="w-3.5 h-3.5" /> Pending review
                </Badge>
              )}
            </div>
            {agent && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">License state</div>
                  <div className="font-medium">{agent.license_state || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Brokerage</div>
                  <div className="font-medium">{agent.brokerage_name || "—"}</div>
                </div>
              </div>
            )}
            {!fetching && !agent && (
              <p className="text-sm text-muted-foreground">
                No agent profile on file. Complete role selection to submit your license.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Link to="/settings"><Button variant="outline">Settings</Button></Link>
        <Link to="/dashboard"><Button className="bg-navy hover:bg-navy/90">Dashboard</Button></Link>
      </div>
    </div>
  );
}
