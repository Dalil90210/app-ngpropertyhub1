import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Phone, MessageSquare, Inbox as InboxIcon, Send } from "lucide-react";

type Inquiry = {
  id: string;
  property_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  properties?: { title: string | null } | null;
};

const STATUSES = ["new", "in_progress", "responded", "closed"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  in_progress: "In Progress",
  responded: "Responded",
  closed: "Closed",
};

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "outline"> = {
  new: "default",
  in_progress: "secondary",
  responded: "outline",
  closed: "outline",
};

export function SellerInbox({ sellerId }: { sellerId: string }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["seller-inquiries", sellerId],
    queryFn: async (): Promise<Inquiry[]> => {
      // Fetch seller's properties then inquiries on them (avoids inner-join RLS quirks)
      const { data: props } = await supabase
        .from("properties")
        .select("id, title")
        .eq("agent_id", sellerId);
      const ids = (props ?? []).map((p) => p.id);
      if (ids.length === 0) return [];
      const titleMap = new Map((props ?? []).map((p) => [p.id, p.title]));
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .in("property_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((i) => ({
        ...i,
        properties: { title: titleMap.get(i.property_id) ?? null },
      })) as Inquiry[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["seller-inquiries", sellerId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update status"),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: inquiries.length };
    for (const s of STATUSES) c[s] = 0;
    for (const i of inquiries) {
      const s = (i.status ?? "new") as Status;
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [inquiries]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? inquiries
        : inquiries.filter((i) => (i.status ?? "new") === filter),
    [inquiries, filter],
  );

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <InboxIcon className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">Inquiries Inbox</h2>
          <Badge variant="secondary">{inquiries.length}</Badge>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", ...STATUSES] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
              className={filter === s ? "bg-navy" : ""}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
              <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <InboxIcon className="w-10 h-10 mx-auto opacity-40" />
          <p className="mt-2 text-sm">No inquiries in this view.</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((i) => {
            const status = (i.status ?? "new") as Status;
            return (
              <div key={i.id} className="py-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-medium text-navy">{i.buyer_name}</div>
                    <div className="text-xs text-muted-foreground">
                      on{" "}
                      <span className="font-medium">
                        {i.properties?.title ?? "Listing"}
                      </span>{" "}
                      · {new Date(i.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[status]} className="capitalize">
                    {STATUS_LABEL[status]}
                  </Badge>
                </div>

                {i.message && (
                  <p className="text-sm bg-muted/40 rounded p-3 whitespace-pre-wrap">
                    {i.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                  <a
                    href={`mailto:${i.buyer_email}`}
                    className="inline-flex items-center gap-1 hover:text-gold"
                  >
                    <Mail className="w-3 h-3" /> {i.buyer_email}
                  </a>
                  {i.buyer_phone && (
                    <a
                      href={`tel:${i.buyer_phone}`}
                      className="inline-flex items-center gap-1 hover:text-gold"
                    >
                      <Phone className="w-3 h-3" /> {i.buyer_phone}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center pt-1">
                  <ReplyModal
                    inquiry={i}
                    onSent={() => {
                      if (status !== "responded" && status !== "closed") {
                        updateStatus.mutate({ id: i.id, status: "responded" });
                      }
                    }}
                  />

                  <Select
                    value={status}
                    onValueChange={(v) =>
                      updateStatus.mutate({ id: i.id, status: v as Status })
                    }
                  >
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
