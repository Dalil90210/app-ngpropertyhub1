import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { PropertyForm } from "@/components/PropertyForm";
import { type PropertyForm as PF } from "@/lib/property-schema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/list-property/$id")({ component: EditPage });

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

function EditPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (error || !property) return <div className="p-8 text-center text-destructive">Listing not found.</div>;
  if (user && property.agent_id !== user.id) {
    return <div className="p-8 text-center text-destructive">You don't have permission to edit this listing.</div>;
  }

  const initial: PF = {
    title: property.title ?? "",
    description: property.description ?? "",
    price: Number(property.price ?? 0),
    address: property.address ?? "",
    city: property.city ?? "",
    state: property.state ?? "",
    zip: property.zip ?? "",
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    sqft: property.sqft ?? 0,
    property_type: (property.property_type as PF["property_type"]) ?? "house",
    features: (property.features ?? []).join(", "),
    images: (property.images ?? []).filter(Boolean),
  };

  const submit = async (values: PF, status: "draft" | "active") => {
    const { error } = await supabase
      .from("properties")
      .update({
        title: values.title,
        description: values.description,
        price: values.price,
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        sqft: values.sqft,
        property_type: values.property_type,
        status,
        features: values.features.split(",").map((x) => x.trim()).filter(Boolean),
        images: values.images.length > 0 ? values.images : [DEFAULT_IMAGE],
      })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "active" ? "Listing published!" : "Draft saved");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-navy mb-2">Edit Listing</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Status: <span className="capitalize font-medium">{property.status ?? "draft"}</span>
      </p>
      <PropertyForm initial={initial} onSubmit={submit} submitLabel="Publish Changes" />
    </div>
  );
}
