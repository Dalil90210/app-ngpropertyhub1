import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const { user, role, loading, signOut } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold text-navy">Settings</h1>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Profile</h2>
        <div className="text-sm space-y-2">
          <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Role:</span> <Badge className="bg-gold text-navy capitalize">{role || "none"}</Badge></div>
        </div>
        <Link to="/role-select"><Button variant="outline" className="mt-4">Switch Role</Button></Link>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Notifications</h2>
        {["New offers", "Showing requests", "Price alerts", "Market updates"].map((l) => (
          <div key={l} className="flex items-center justify-between py-2"><span>{l}</span><Switch defaultChecked /></div>
        ))}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Account</h2>
        <Button variant="outline" onClick={async () => { await signOut(); nav({ to: "/" }); }}>Sign Out</Button>
      </Card>
    </div>
  );
}
