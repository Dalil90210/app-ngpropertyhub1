import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Inbox as InboxIcon, MessageSquare, Send, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({ component: Inbox });

type Row = {
  id: string;
  property_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  property?: {
    id: string;
    title: string | null;
    city: string | null;
    state: string | null;
    images: string[] | null;
    agent_id: string | null;
  } | null;
};

const STATUSES = ["new", "in_progress", "responded", "closed"] as const;
type Status = (typeof STATUSES)[number];
const STATUS_LABEL: Record<Status, string> = {
  new: "Awaiting reply",
  in_progress: "In progress",
  responded: "Agent replied",
  closed: "Closed",
};
const STATUS_STYLE: Record<Status, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  responded: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-muted text-muted-foreground",
};

function Inbox() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  const { data: rows = [], isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["buyer-inquiries", user?.id],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const inquiries = data ?? [];
      const propIds = Array.from(new Set(inquiries.map((i) => i.property_id)));
      if (propIds.length === 0) return inquiries as Row[];
      const { data: props } = await supabase
        .from("properties")
        .select("id, title, city, state, images, agent_id")
        .in("id", propIds);
      const map = new Map((props ?? []).map((p) => [p.id, p]));
      return inquiries.map((i) => ({ ...i, property: map.get(i.property_id) ?? null })) as Row[];
    },
  });

  const closeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").update({ status: "closed" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inquiry closed");
      qc.invalidateQueries({ queryKey: ["buyer-inquiries", user?.id] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to close inquiry"),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUSES) c[s] = 0;
    for (const r of rows) {
      const s = (r.status ?? "new") as Status;
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const grouped = useMemo(() => {
    const filtered = filter === "all" ? rows : rows.filter((r) => (r.status ?? "new") === filter);
    const g = new Map<string, Row[]>();
    for (const r of filtered) {
      const arr = g.get(r.property_id) ?? [];
      arr.push(r);
      g.set(r.property_id, arr);
    }
    return Array.from(g.entries());
  }, [rows, filter]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <InboxIcon className="w-7 h-7 text-gold" />
        <h1 className="text-3xl font-bold text-navy">My Inbox</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Track every inquiry you've sent to listing agents and follow up in one place.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", ...STATUSES] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            className={filter === s ? "bg-navy hover:bg-navy/90" : ""}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]}
            <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-10">Loading your inquiries…</p>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <InboxIcon className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">
            You haven't contacted any agents yet. Browse listings and use the "Contact Agent" form —
            your messages will show up here.
          </p>
          <Link to="/properties">
            <Button className="mt-5 bg-navy hover:bg-navy/90">Browse properties</Button>
          </Link>
        </Card>
      ) : grouped.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No inquiries match this filter.
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([propertyId, items]) => {
            const p = items[0].property;
            const location = [p?.city, p?.state].filter(Boolean).join(", ");
            const cover = p?.images?.[0];
            return (
              <Card key={propertyId} className="overflow-hidden">
                <div className="flex gap-4 p-4 border-b bg-muted/30">
                  {cover ? (
                    <img src={cover} alt="" className="w-20 h-20 rounded-md object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-muted shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/properties/$id"
                      params={{ id: propertyId }}
                      className="font-semibold text-navy hover:text-gold inline-flex items-center gap-1"
                    >
                      {p?.title ?? "Listing"} <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    {location && <div className="text-xs text-muted-foreground">{location}</div>}
                    <div className="text-xs text-muted-foreground mt-1">
                      {items.length} {items.length === 1 ? "message" : "messages"} sent
                    </div>
                  </div>
                </div>

                <div className="divide-y">
                  {items.map((r) => {
                    const status = (r.status ?? "new") as Status;
                    return (
                      <div key={r.id} className="p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="text-xs text-muted-foreground">
                            Sent {new Date(r.created_at).toLocaleString()}
                          </div>
                          <Badge variant="outline" className={`${STATUS_STYLE[status]} border`}>
                            {STATUS_LABEL[status]}
                          </Badge>
                        </div>
                        {r.message && (
                          <p className="text-sm bg-muted/40 rounded p-3 whitespace-pre-wrap">
                            {r.message}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <FollowUpDialog
                            propertyId={propertyId}
                            previousMessage={r.message ?? ""}
                            defaultName={r.buyer_name}
                            defaultEmail={r.buyer_email}
                            defaultPhone={r.buyer_phone ?? ""}
                            buyerId={user.id}
                            onSent={() => qc.invalidateQueries({ queryKey: ["buyer-inquiries", user.id] })}
                          />
                          {status !== "closed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => closeMut.mutate(r.id)}
                              disabled={closeMut.isPending}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Mark closed
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FollowUpDialog({
  propertyId,
  previousMessage,
  defaultName,
  defaultEmail,
  defaultPhone,
  buyerId,
  onSent,
}: {
  propertyId: string;
  previousMessage: string;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  buyerId: string;
  onSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setMsg(previousMessage ? `Following up on my previous message:\n\n"${previousMessage.slice(0, 200)}"\n\n` : "");
    }
  }, [open, previousMessage]);

  const send = async () => {
    const trimmed = msg.trim();
    if (!trimmed) return toast.error("Please enter a message");
    if (trimmed.length > 2000) return toast.error("Message must be under 2000 characters");
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert({
      property_id: propertyId,
      buyer_id: buyerId,
      buyer_name: defaultName,
      buyer_email: defaultEmail,
      buyer_phone: defaultPhone || null,
      message: trimmed,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Follow-up sent");
    setOpen(false);
    onSent();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-navy hover:bg-navy/90" onClick={() => setOpen(true)}>
        <MessageSquare className="w-4 h-4 mr-1" /> Follow up
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a follow-up</DialogTitle>
        </DialogHeader>
        <Textarea
          rows={6}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Add more details, ask a question, or request a callback…"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-navy hover:bg-navy/90" onClick={send} disabled={busy}>
            <Send className="w-4 h-4 mr-1" /> {busy ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
