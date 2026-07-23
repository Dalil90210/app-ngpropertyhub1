import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-audit")({
  component: AdminAudit,
  head: () => ({
    meta: [
      { title: "Role Audit Logs · New Guard Property Hub Admin" },
      { name: "description", content: "Admin console for reviewing role assignment attempts across the platform." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type AuditRow = {
  id: string;
  user_id: string | null;
  attempted_role: string;
  outcome: string;
  error_code: string | null;
  error_message: string | null;
  context: unknown;
  created_at: string;
};

function AdminAudit() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState<"all" | "success" | "failure">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/admin-login", replace: true });
    } else if (role !== "admin") {
      toast.error("Admin access required");
      nav({ to: "/", replace: true });
    }
  }, [user, role, loading, nav]);

  const { data: rows = [], isFetching, refetch } = useQuery({
    queryKey: ["audit", outcome, roleFilter, from, to],
    enabled: role === "admin",
    queryFn: async () => {
      let query = supabase
        .from("role_assignment_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (outcome !== "all") query = query.eq("outcome", outcome);
      if (roleFilter !== "all") query = query.eq("attempted_role", roleFilter as "buyer");
      if (from) query = query.gte("created_at", new Date(from).toISOString());
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
  });

  const userIds = useMemo(
    () => Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[],
    [rows],
  );

  const { data: profileMap = {} } = useQuery({
    queryKey: ["audit-profiles", userIds.join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name")
        .in("id", userIds);
      const map: Record<string, { email: string | null; full_name: string | null }> = {};
      (data ?? []).forEach((p) => { map[p.id] = { email: p.email, full_name: p.full_name }; });
      return map;
    },
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const p = r.user_id ? profileMap[r.user_id] : undefined;
      return (
        r.user_id?.toLowerCase().includes(needle) ||
        r.error_code?.toLowerCase().includes(needle) ||
        r.error_message?.toLowerCase().includes(needle) ||
        r.attempted_role.toLowerCase().includes(needle) ||
        p?.email?.toLowerCase().includes(needle) ||
        p?.full_name?.toLowerCase().includes(needle)
      );
    });
  }, [rows, q, profileMap]);

  const exportCsv = () => {
    const header = ["created_at","user_id","email","attempted_role","outcome","error_code","error_message"];
    const lines = [header.join(",")].concat(
      filtered.map((r) => {
        const p = r.user_id ? profileMap[r.user_id] : undefined;
        return [
          r.created_at, r.user_id ?? "", p?.email ?? "",
          r.attempted_role, r.outcome, r.error_code ?? "",
          (r.error_message ?? "").replace(/"/g, '""'),
        ].map((v) => `"${String(v)}"`).join(",");
      }),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `role-audit-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-gold" />
            <h1 className="font-bold">Role Assignment Audit Logs</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-4">
        <Card className="p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Email, user id, error…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="md:col-span-6 flex gap-2">
            <Button variant="outline" onClick={() => { setQ(""); setOutcome("all"); setRoleFilter("all"); setFrom(""); setTo(""); }}>
              Reset
            </Button>
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
            <Button className="ml-auto bg-navy" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between text-sm">
            <span className="font-medium">{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span>
            {isFetching && <span className="text-muted-foreground">Loading…</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="px-4 py-2">When</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Outcome</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !isFetching && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No audit entries match your filters.</td></tr>
                )}
                {filtered.map((r) => {
                  const p = r.user_id ? profileMap[r.user_id] : undefined;
                  return (
                    <tr key={r.id} className="border-t align-top">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{p?.full_name || p?.email || "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{r.user_id ?? "anon"}</div>
                      </td>
                      <td className="px-4 py-2 capitalize">{r.attempted_role}</td>
                      <td className="px-4 py-2">
                        <Badge className={r.outcome === "success" ? "bg-success" : "bg-destructive"}>
                          {r.outcome}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {r.error_code && <div className="font-mono text-xs">{r.error_code}</div>}
                        {r.error_message && <div className="text-xs text-muted-foreground max-w-md">{r.error_message}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
