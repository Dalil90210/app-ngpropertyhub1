import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PropertyForm } from "@/components/PropertyForm";
import { emptyForm, type PropertyForm as PF } from "@/lib/property-schema";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "@/lib/geocode.functions";
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

    // Geocode (non-blocking on failure)
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const full = `${values.address}, ${values.city}, ${values.state} ${values.zip}`;
      const res = await geocodeAddress({ data: { address: full } });
      if (res.ok) {
        lat = res.lat;
        lng = res.lng;
      }
    } catch (e) {
      console.warn("[list-property] geocode failed", e);
    }

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
      // owner_id: user.id, // supported by schema; types.ts lags
      verified: false,
      status,
      features: values.features.split(",").map((x) => x.trim()).filter(Boolean),
      images: values.images.length > 0 ? values.images : [DEFAULT_IMAGE],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(lat !== null ? ({ latitude: lat, longitude: lng } as any) : {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ owner_id: user.id } as any),
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
