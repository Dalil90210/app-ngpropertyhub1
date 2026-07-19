import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// types.ts is auto-generated and lags behind the migration; cast where needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useSavedListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db
        .from("saved_listings")
        .select("listing_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r: { listing_id: string }) => r.listing_id) as string[];
    },
  });
}

export function useToggleSaved() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, saved }: { listingId: string; saved: boolean }) => {
      if (!user) throw new Error("Sign in to save listings");
      if (saved) {
        const { error } = await db
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);
        if (error) throw error;
      } else {
        const { error } = await db
          .from("saved_listings")
          .insert({ user_id: user.id, listing_id: listingId });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["saved-listings"] });
      toast.success(vars.saved ? "Removed from saved" : "Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
