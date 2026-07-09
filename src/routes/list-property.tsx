import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PropertyForm } from "@/components/PropertyForm";
import { emptyForm, type PropertyForm as PF } from "@/lib/property-schema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/list-property")({ component: Page });

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

function Page() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  const submit = async (values: PF, status: "draft" | "active") => {
    if (!user) return;
    const { error } = await supabase.from("properties").insert({
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
      agent_id: user.id,
      verified: false,
      status,
      features: values.features.split(",").map((x) => x.trim()).filter(Boolean),
      images: values.images.length > 0 ? values.images : [DEFAULT_IMAGE],
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "active" ? "Listing published!" : "Draft saved");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-navy mb-2">List Your Property</h1>
      <PropertyForm initial={emptyForm} onSubmit={submit} submitLabel="Publish Listing" />
    </div>
  );
}
