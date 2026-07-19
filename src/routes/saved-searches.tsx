import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, string>;
  created_at: string;
};

export const Route = createFileRoute("/saved-searches")({
  head: () => ({ meta: [{ title: "Saved Searches — New Guard Property Hub" }] }),
  component: SavedSearches,
});

function SavedSearches() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth", search: { next: "/saved-searches" } });
  }, [loading, user, nav]);

  const { data: searches = [] } = useQuery({
    queryKey: ["saved-searches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db
        .from("saved_searches").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedSearch[];
    },
  });

  const remove = async (id: string) => {
    const { error } = await db.from("saved_searches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved-searches"] });
    toast.success("Removed");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-navy mb-6">Saved Searches</h1>
      {searches.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No saved searches yet.</p>
          <Link to="/properties"><Button className="mt-4 bg-navy hover:bg-navy/90">Browse Properties</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Object.entries(s.filters).filter(([, v]) => v && v !== "any").map(([k, v]) => `${k}: ${v}`).join(" · ") || "All properties"}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/properties" search={{ q: s.filters.q || undefined }}>
                  <Button size="sm" variant="outline">Run</Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
